import { expect } from "chai";
import { ethers } from "hardhat";
import { BattleshipStaking, ReentrancyAttacker } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BattleshipStaking Escrow Smart Contract", function () {
  let staking: BattleshipStaking;
  let owner: SignerWithAddress;
  let arbiter: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;
  let stranger: SignerWithAddress;
  let matchId: string;

  const STAKE_AMOUNT = ethers.parseEther("1.0");

  beforeEach(async function () {
    [owner, arbiter, player1, player2, stranger] = await ethers.getSigners();
    matchId = ethers.keccak256(ethers.toUtf8Bytes("match-multiplayer-999"));

    const StakingFactory = await ethers.getContractFactory("BattleshipStaking");
    staking = await StakingFactory.deploy(arbiter.address);
    await staking.waitForDeployment();
  });

  describe("1. Happy Path: Match Escrow & Winner Claim", function () {
    it("should allow player1 to create a match and emit MatchCreated event", async function () {
      await expect(staking.connect(player1).createMatch(matchId, { value: STAKE_AMOUNT }))
        .to.emit(staking, "MatchCreated")
        .withArgs(matchId, player1.address, STAKE_AMOUNT);

      const m = await staking.matches(matchId);
      expect(m.player1).to.equal(player1.address);
      expect(m.stakeAmount).to.equal(STAKE_AMOUNT);
      expect(m.status).to.equal(1); // MatchStatus.Created
    });

    it("should allow player2 to join match and emit MatchJoined event", async function () {
      await staking.connect(player1).createMatch(matchId, { value: STAKE_AMOUNT });

      await expect(staking.connect(player2).joinMatch(matchId, { value: STAKE_AMOUNT }))
        .to.emit(staking, "MatchJoined")
        .withArgs(matchId, player2.address, STAKE_AMOUNT);

      const m = await staking.matches(matchId);
      expect(m.player2).to.equal(player2.address);
      expect(m.status).to.equal(2); // MatchStatus.Active
    });

    it("should allow winner to claim total 2.0 0G payout with valid arbiter ECDSA signature", async function () {
      await staking.connect(player1).createMatch(matchId, { value: STAKE_AMOUNT });
      await staking.connect(player2).joinMatch(matchId, { value: STAKE_AMOUNT });

      const totalPayout = STAKE_AMOUNT * 2n;

      // Construct message hash
      const messageHash = ethers.solidityPackedKeccak256(
        ["string", "bytes32", "address", "uint256"],
        ["WINNER_PAYOUT", matchId, player1.address, totalPayout]
      );
      const signature = await arbiter.signMessage(ethers.getBytes(messageHash));

      const initialBalance = await ethers.provider.getBalance(player1.address);

      const tx = await staking.connect(player1).claimWinnerPayout(matchId, signature);
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;

      const finalBalance = await ethers.provider.getBalance(player1.address);

      expect(finalBalance + gasCost - initialBalance).to.equal(totalPayout);

      const m = await staking.matches(matchId);
      expect(m.status).to.equal(3); // MatchStatus.Settled
    });
  });

  describe("2. Mismatched Stake Rejection & Validation", function () {
    it("should revert if player1 attempts to create match with 0 ETH", async function () {
      await expect(
        staking.connect(player1).createMatch(matchId, { value: 0 })
      ).to.be.revertedWithCustomError(staking, "InvalidStakeAmount");
    });

    it("should revert if player2 attempts to join with mismatched stake amount", async function () {
      await staking.connect(player1).createMatch(matchId, { value: STAKE_AMOUNT });

      const WRONG_STAKE = ethers.parseEther("0.5");
      await expect(
        staking.connect(player2).joinMatch(matchId, { value: WRONG_STAKE })
      ).to.be.revertedWithCustomError(staking, "MismatchedStake");
    });

    it("should revert if player1 attempts to join their own match", async function () {
      await staking.connect(player1).createMatch(matchId, { value: STAKE_AMOUNT });

      await expect(
        staking.connect(player1).joinMatch(matchId, { value: STAKE_AMOUNT })
      ).to.be.revertedWithCustomError(staking, "UnauthorizedPlayer");
    });
  });

  describe("3. Refund Path & Timed-Out Escrow", function () {
    it("should allow player1 to cancel an unjoined match and withdraw stake", async function () {
      await staking.connect(player1).createMatch(matchId, { value: STAKE_AMOUNT });

      await expect(staking.connect(player1).cancelUnjoinedMatch(matchId))
        .to.emit(staking, "Refunded")
        .withArgs(matchId, player1.address, STAKE_AMOUNT);

      const m = await staking.matches(matchId);
      expect(m.status).to.equal(4); // MatchStatus.Refunded
    });

    it("should revert claimTimeoutRefund before timeout duration expires", async function () {
      await staking.connect(player1).createMatch(matchId, { value: STAKE_AMOUNT });

      await expect(
        staking.connect(player1).claimTimeoutRefund(matchId)
      ).to.be.revertedWithCustomError(staking, "TimeoutNotReached");
    });

    it("should allow timeout refund after 1 hour lockup expires", async function () {
      await staking.connect(player1).createMatch(matchId, { value: STAKE_AMOUNT });
      await staking.connect(player2).joinMatch(matchId, { value: STAKE_AMOUNT });

      // Fast forward EVM time by 3601 seconds
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine", []);

      await expect(staking.connect(player1).claimTimeoutRefund(matchId))
        .to.emit(staking, "Refunded");

      const m = await staking.matches(matchId);
      expect(m.status).to.equal(4); // MatchStatus.Refunded
    });
  });

  describe("4. Unauthorized Winner Attempts & Invalid Signatures", function () {
    it("should revert payout claim if signature is forged by a non-arbiter key", async function () {
      await staking.connect(player1).createMatch(matchId, { value: STAKE_AMOUNT });
      await staking.connect(player2).joinMatch(matchId, { value: STAKE_AMOUNT });

      const totalPayout = STAKE_AMOUNT * 2n;

      const messageHash = ethers.solidityPackedKeccak256(
        ["string", "bytes32", "address", "uint256"],
        ["WINNER_PAYOUT", matchId, player1.address, totalPayout]
      );
      // Forged by stranger
      const forgedSignature = await stranger.signMessage(ethers.getBytes(messageHash));

      await expect(
        staking.connect(player1).claimWinnerPayout(matchId, forgedSignature)
      ).to.be.revertedWithCustomError(staking, "InvalidSignature");
    });

    it("should revert payout claim if invoked by a non-participant stranger", async function () {
      await staking.connect(player1).createMatch(matchId, { value: STAKE_AMOUNT });
      await staking.connect(player2).joinMatch(matchId, { value: STAKE_AMOUNT });

      const totalPayout = STAKE_AMOUNT * 2n;
      const messageHash = ethers.solidityPackedKeccak256(
        ["string", "bytes32", "address", "uint256"],
        ["WINNER_PAYOUT", matchId, stranger.address, totalPayout]
      );
      const signature = await arbiter.signMessage(ethers.getBytes(messageHash));

      await expect(
        staking.connect(stranger).claimWinnerPayout(matchId, signature)
      ).to.be.revertedWithCustomError(staking, "UnauthorizedPlayer");
    });
  });

  describe("5. Reentrancy Protection Test", function () {
    it("should prevent reentrancy attack during payout withdrawal", async function () {
      const AttackerFactory = await ethers.getContractFactory("ReentrancyAttacker");
      const attacker = (await AttackerFactory.deploy(await staking.getAddress())) as ReentrancyAttacker;
      await attacker.waitForDeployment();

      const attackerAddress = await attacker.getAddress();

      // Attacker creates match
      await attacker.connect(player1).createMatch(matchId, { value: STAKE_AMOUNT });
      await staking.connect(player2).joinMatch(matchId, { value: STAKE_AMOUNT });

      const totalPayout = STAKE_AMOUNT * 2n;
      const messageHash = ethers.solidityPackedKeccak256(
        ["string", "bytes32", "address", "uint256"],
        ["WINNER_PAYOUT", matchId, attackerAddress, totalPayout]
      );
      const signature = await arbiter.signMessage(ethers.getBytes(messageHash));

      // Attempt reentrancy attack
      await expect(
        attacker.connect(player1).attack(matchId, signature)
      ).to.be.revertedWithCustomError(staking, "TransferFailed");
    });
  });
});
