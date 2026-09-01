import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const CONTRACT_ADDRESS = "0x6114CB30740c77C37971E0468F7662E3ec52e6Cc";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("=== WITHDRAWING 0.01 0G ESCROW STAKE FROM CONTRACT ===");
  console.log("Target Contract Address:", CONTRACT_ADDRESS);
  console.log("Signer / Recipient Address:", signer.address);

  const BattleshipStaking = await ethers.getContractFactory("BattleshipStaking");
  const staking = BattleshipStaking.attach(CONTRACT_ADDRESS) as any;

  // Filter MatchCreated events for this signer
  const filter = staking.filters.MatchCreated(null, signer.address);
  const events = await staking.queryFilter(filter);

  console.log(`Found ${events.length} MatchCreated events for ${signer.address}`);

  let refundedCount = 0;
  for (const ev of events) {
    const logEv = ev as any;
    const matchId = logEv.args.matchId;
    const matchInfo = await staking.matches(matchId);

    // Check if status is Created (1)
    if (matchInfo.status === 1n || matchInfo.status === 1) {
      console.log(`\nFound open unjoined match: ${matchId}`);
      console.log(`  Stake Amount: ${ethers.formatEther(matchInfo.stakeAmount)} 0G`);
      console.log("  Executing cancelUnjoinedMatch to withdraw 0G to your wallet...");

      const tx = await staking.cancelUnjoinedMatch(matchId);
      console.log("  Sent TxHash:", tx.hash);
      const receipt = await tx.wait();
      console.log(`  ✅ Successfully withdrawn in Block: ${receipt.blockNumber}`);
      refundedCount++;
    }
  }

  const finalBalance = await ethers.provider.getBalance(signer.address);
  console.log("\n====================================================");
  console.log("🎉 WITHDRAWAL COMPLETE!");
  console.log("Updated Wallet 0G Balance:", ethers.formatEther(finalBalance), "0G");
  console.log("====================================================");
}

main().catch((err) => {
  console.error("Refund Error:", err);
  process.exitCode = 1;
});
