// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BattleshipStaking
 * @notice Escrow smart contract on 0G Chain for 0G Battleship multiplayer matches.
 * Holds equal native 0G token stakes from two players and releases pooled funds
 * to the winner upon valid off-chain ECDSA attestation signed by the backend game server.
 */
contract BattleshipStaking is ReentrancyGuard, Ownable {
    using ECDSA for bytes32;

    enum MatchStatus {
        None,
        Created,
        Active,
        Settled,
        Refunded
    }

    struct Match {
        bytes32 matchId;
        address player1;
        address player2;
        uint256 stakeAmount;
        MatchStatus status;
        uint256 createdAt;
    }

    address public arbiter;
    uint256 public constant TIMEOUT_DURATION = 1 hours;

    mapping(bytes32 => Match) public matches;

    // Events for frontend / backend tracking
    event MatchCreated(bytes32 indexed matchId, address indexed player1, uint256 stakeAmount);
    event MatchJoined(bytes32 indexed matchId, address indexed player2, uint256 stakeAmount);
    event WinnerDeclared(bytes32 indexed matchId, address indexed winner, uint256 totalPayout);
    event StakeClaimed(bytes32 indexed matchId, address indexed winner, uint256 amount);
    event Refunded(bytes32 indexed matchId, address indexed player, uint256 amount);
    event ArbiterUpdated(address indexed newArbiter);

    // Custom Errors
    error InvalidStakeAmount();
    error MismatchedStake();
    error MatchAlreadyExists();
    error MatchNotInState();
    error UnauthorizedPlayer();
    error InvalidSignature();
    error TimeoutNotReached();
    error TransferFailed();

    constructor(address _arbiter) Ownable(msg.sender) {
        require(_arbiter != address(0), "Invalid arbiter address");
        arbiter = _arbiter;
    }

    /**
     * @notice Updates the trusted backend arbiter address.
     */
    function setArbiter(address _arbiter) external onlyOwner {
        require(_arbiter != address(0), "Invalid arbiter address");
        arbiter = _arbiter;
        emit ArbiterUpdated(_arbiter);
    }

    /**
     * @notice Player 1 creates a match by depositing a 0G token stake into escrow.
     * @param matchId Unique 32-byte identifier for the match.
     */
    function createMatch(bytes32 matchId) external payable nonReentrant {
        if (msg.value == 0) revert InvalidStakeAmount();

        Match storage m = matches[matchId];
        if (m.status != MatchStatus.None) revert MatchAlreadyExists();

        m.matchId = matchId;
        m.player1 = msg.sender;
        m.stakeAmount = msg.value;
        m.status = MatchStatus.Created;
        m.createdAt = block.timestamp;

        emit MatchCreated(matchId, msg.sender, msg.value);
    }

    /**
     * @notice Player 2 joins an existing match by matching the exact stake amount.
     * @param matchId Unique 32-byte identifier for the match.
     */
    function joinMatch(bytes32 matchId) external payable nonReentrant {
        Match storage m = matches[matchId];
        if (m.status != MatchStatus.Created) revert MatchNotInState();
        if (msg.sender == m.player1) revert UnauthorizedPlayer();
        if (msg.value != m.stakeAmount) revert MismatchedStake();

        m.player2 = msg.sender;
        m.status = MatchStatus.Active;

        emit MatchJoined(matchId, msg.sender, msg.value);
    }

    /**
     * @notice Winner submits an off-chain ECDSA signature signed by the backend arbiter to claim the total pooled stake.
     * @param matchId Unique match identifier.
     * @param signature Backend-signed attestation signature.
     */
    function claimWinnerPayout(bytes32 matchId, bytes calldata signature) external nonReentrant {
        Match storage m = matches[matchId];
        if (m.status != MatchStatus.Active) revert MatchNotInState();
        if (msg.sender != m.player1 && msg.sender != m.player2) revert UnauthorizedPlayer();

        uint256 totalPayout = m.stakeAmount * 2;

        // Verify EIP-191 signed message hash: keccak256("WINNER_PAYOUT", matchId, winnerAddress, totalPayout)
        bytes32 messageHash = keccak256(abi.encodePacked("WINNER_PAYOUT", matchId, msg.sender, totalPayout));
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(messageHash);

        if (ethSignedHash.recover(signature) != arbiter) revert InvalidSignature();

        // Checks-Effects-Interactions: Update state before external call
        m.status = MatchStatus.Settled;

        emit WinnerDeclared(matchId, msg.sender, totalPayout);
        emit StakeClaimed(matchId, msg.sender, totalPayout);

        (bool success, ) = payable(msg.sender).call{value: totalPayout}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @notice Arbiter-authorized mutual refund for explicit ties or cancelled games.
     * @param matchId Unique match identifier.
     * @param signature Backend-signed refund attestation.
     */
    function claimRefund(bytes32 matchId, bytes calldata signature) external nonReentrant {
        Match storage m = matches[matchId];
        if (m.status != MatchStatus.Active && m.status != MatchStatus.Created) revert MatchNotInState();
        if (msg.sender != m.player1 && msg.sender != m.player2) revert UnauthorizedPlayer();

        bytes32 messageHash = keccak256(abi.encodePacked("REFUND_MATCH", matchId));
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(messageHash);

        if (ethSignedHash.recover(signature) != arbiter) revert InvalidSignature();

        _executeRefund(m);
    }

    /**
     * @notice Emergency timeout refund if a match never starts or remains un-settled after TIMEOUT_DURATION.
     * @param matchId Unique match identifier.
     */
    function claimTimeoutRefund(bytes32 matchId) external nonReentrant {
        Match storage m = matches[matchId];
        if (m.status != MatchStatus.Created && m.status != MatchStatus.Active) revert MatchNotInState();
        if (msg.sender != m.player1 && msg.sender != m.player2) revert UnauthorizedPlayer();
        if (block.timestamp < m.createdAt + TIMEOUT_DURATION) revert TimeoutNotReached();

        _executeRefund(m);
    }

    /**
     * @notice Allows Player 1 to cancel an unjoined match and withdraw their stake if Player 2 never joins.
     * @param matchId Unique match identifier.
     */
    function cancelUnjoinedMatch(bytes32 matchId) external nonReentrant {
        Match storage m = matches[matchId];
        if (m.status != MatchStatus.Created) revert MatchNotInState();
        if (msg.sender != m.player1) revert UnauthorizedPlayer();

        m.status = MatchStatus.Refunded;

        uint256 refundAmount = m.stakeAmount;
        address p1 = m.player1;

        emit Refunded(matchId, p1, refundAmount);

        (bool success, ) = payable(p1).call{value: refundAmount}("");
        if (!success) revert TransferFailed();
    }

    function _executeRefund(Match storage m) internal {
        m.status = MatchStatus.Refunded;

        uint256 refundAmount = m.stakeAmount;
        address p1 = m.player1;
        address p2 = m.player2;

        if (p1 != address(0)) {
            emit Refunded(m.matchId, p1, refundAmount);
            (bool s1, ) = payable(p1).call{value: refundAmount}("");
            if (!s1) revert TransferFailed();
        }

        if (p2 != address(0)) {
            emit Refunded(m.matchId, p2, refundAmount);
            (bool s2, ) = payable(p2).call{value: refundAmount}("");
            if (!s2) revert TransferFailed();
        }
    }
}
