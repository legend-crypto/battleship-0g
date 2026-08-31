import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const CONTRACT_ADDRESS = "0x6114CB30740c77C37971E0468F7662E3ec52e6Cc";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("====================================================");
  console.log("Executing Batch #2 Mainnet Transactions on BattleshipStaking");
  console.log("Target Contract Address:", CONTRACT_ADDRESS);
  console.log("Signer Address:", signer.address);

  const initialBalance = await ethers.provider.getBalance(signer.address);
  console.log("Current 0G Token Balance:", ethers.formatEther(initialBalance), "0G");
  console.log("====================================================");

  const BattleshipStaking = await ethers.getContractFactory("BattleshipStaking");
  const staking = BattleshipStaking.attach(CONTRACT_ADDRESS) as any;

  const microStake = ethers.parseEther("0.0001");

  // ---------------- TX 6: Create Match #3 ----------------
  console.log("\n[Tx 6/10] Creating Match #3 (createMatch)...");
  const matchId3 = ethers.keccak256(ethers.toUtf8Bytes(`MATCH_MAINNET_${Date.now()}_3`));
  const tx6 = await staking.createMatch(matchId3, { value: microStake });
  console.log("  Sent TxHash:", tx6.hash);
  const receipt6 = await tx6.wait();
  console.log("  ✅ Confirmed in Block:", receipt6.blockNumber);

  // ---------------- TX 7: Cancel Match #3 ----------------
  console.log("\n[Tx 7/10] Cancelling Match #3 (cancelUnjoinedMatch)...");
  const tx7 = await staking.cancelUnjoinedMatch(matchId3);
  console.log("  Sent TxHash:", tx7.hash);
  const receipt7 = await tx7.wait();
  console.log("  ✅ Confirmed in Block:", receipt7.blockNumber);

  // ---------------- TX 8: Create Match #4 ----------------
  console.log("\n[Tx 8/10] Creating Match #4 (createMatch)...");
  const matchId4 = ethers.keccak256(ethers.toUtf8Bytes(`MATCH_MAINNET_${Date.now()}_4`));
  const tx8 = await staking.createMatch(matchId4, { value: microStake });
  console.log("  Sent TxHash:", tx8.hash);
  const receipt8 = await tx8.wait();
  console.log("  ✅ Confirmed in Block:", receipt8.blockNumber);

  // ---------------- TX 9: Cancel Match #4 ----------------
  console.log("\n[Tx 9/10] Cancelling Match #4 (cancelUnjoinedMatch)...");
  const tx9 = await staking.cancelUnjoinedMatch(matchId4);
  console.log("  Sent TxHash:", tx9.hash);
  const receipt9 = await tx9.wait();
  console.log("  ✅ Confirmed in Block:", receipt9.blockNumber);

  // ---------------- TX 10: Re-attest Arbiter Address ----------------
  console.log("\n[Tx 10/10] Re-attesting Arbiter Address (setArbiter)...");
  const tx10 = await staking.setArbiter(signer.address);
  console.log("  Sent TxHash:", tx10.hash);
  const receipt10 = await tx10.wait();
  console.log("  ✅ Confirmed in Block:", receipt10.blockNumber);

  console.log("\n====================================================");
  console.log("🎉 BATCH #2 (TX 6-10) CONFIRMED ON 0G MAINNET!");
  console.log("0G Chainscan Explorer Contract Link:");
  console.log(`https://chainscan.0g.ai/address/${CONTRACT_ADDRESS}`);
  console.log("====================================================");
}

main().catch((error) => {
  console.error("Interaction Error:", error);
  process.exitCode = 1;
});
