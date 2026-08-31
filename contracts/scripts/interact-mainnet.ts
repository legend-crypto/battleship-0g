import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const CONTRACT_ADDRESS = "0x6114CB30740c77C37971E0468F7662E3ec52e6Cc";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("====================================================");
  console.log("Executing Multiple Mainnet Transactions on BattleshipStaking");
  console.log("Target Contract Address:", CONTRACT_ADDRESS);
  console.log("Signer Address:", signer.address);

  const initialBalance = await ethers.provider.getBalance(signer.address);
  console.log("Current 0G Token Balance:", ethers.formatEther(initialBalance), "0G");
  console.log("====================================================");

  const BattleshipStaking = await ethers.getContractFactory("BattleshipStaking");
  const staking = BattleshipStaking.attach(CONTRACT_ADDRESS) as any;

  const stakeAmount = ethers.parseEther("0.001");

  // ---------------- TX 1: Create Match #1 ----------------
  console.log("\n[Tx 1/5] Creating Match #1 (createMatch)...");
  const matchId1 = ethers.keccak256(ethers.toUtf8Bytes(`MATCH_MAINNET_${Date.now()}_1`));
  const tx1 = await staking.createMatch(matchId1, { value: stakeAmount });
  console.log("  Sent TxHash:", tx1.hash);
  const receipt1 = await tx1.wait();
  console.log("  ✅ Confirmed in Block:", receipt1.blockNumber);

  // ---------------- TX 2: Cancel & Refund Match #1 ----------------
  console.log("\n[Tx 2/5] Cancelling Match #1 (cancelUnjoinedMatch)...");
  const tx2 = await staking.cancelUnjoinedMatch(matchId1);
  console.log("  Sent TxHash:", tx2.hash);
  const receipt2 = await tx2.wait();
  console.log("  ✅ Confirmed in Block:", receipt2.blockNumber);

  // ---------------- TX 3: Create Match #2 ----------------
  console.log("\n[Tx 3/5] Creating Match #2 (createMatch)...");
  const matchId2 = ethers.keccak256(ethers.toUtf8Bytes(`MATCH_MAINNET_${Date.now()}_2`));
  const tx3 = await staking.createMatch(matchId2, { value: stakeAmount });
  console.log("  Sent TxHash:", tx3.hash);
  const receipt3 = await tx3.wait();
  console.log("  ✅ Confirmed in Block:", receipt3.blockNumber);

  // ---------------- TX 4: Cancel & Refund Match #2 ----------------
  console.log("\n[Tx 4/5] Cancelling Match #2 (cancelUnjoinedMatch)...");
  const tx4 = await staking.cancelUnjoinedMatch(matchId2);
  console.log("  Sent TxHash:", tx4.hash);
  const receipt4 = await tx4.wait();
  console.log("  ✅ Confirmed in Block:", receipt4.blockNumber);

  // ---------------- TX 5: Update Arbiter (setArbiter) ----------------
  console.log("\n[Tx 5/5] Updating Arbiter Address (setArbiter)...");
  const tx5 = await staking.setArbiter(signer.address);
  console.log("  Sent TxHash:", tx5.hash);
  const receipt5 = await tx5.wait();
  console.log("  ✅ Confirmed in Block:", receipt5.blockNumber);

  console.log("\n====================================================");
  console.log("🎉 ALL 5 TRANSACTIONS CONFIRMED ON 0G MAINNET!");
  console.log("0G Chainscan Explorer Contract Link:");
  console.log(`https://chainscan.0g.ai/address/${CONTRACT_ADDRESS}`);
  console.log("====================================================");
}

main().catch((error) => {
  console.error("Interaction Error:", error);
  process.exitCode = 1;
});
