import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("----------------------------------------------------");
  console.log("Deploying BattleshipStaking to 0G Mainnet (Chain ID 16661)");
  console.log("Deployer Wallet Address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer 0G Token Balance:", ethers.formatEther(balance), "0G");

  // Arbiter address defaults to deployer address if ARBITER_ADDRESS is empty
  const arbiterAddress = process.env.ARBITER_ADDRESS || deployer.address;
  console.log("Trusted Arbiter Address:", arbiterAddress);

  if (balance === 0n) {
    throw new Error("Deployer wallet has 0 0G token balance. Please fund the wallet with native 0G tokens on 0G Mainnet.");
  }

  const BattleshipStaking = await ethers.getContractFactory("BattleshipStaking");
  const staking = await BattleshipStaking.deploy(arbiterAddress);

  await staking.waitForDeployment();
  const address = await staking.getAddress();

  console.log("----------------------------------------------------");
  console.log("✅ SUCCESS! BattleshipStaking deployed to 0G Mainnet");
  console.log("Contract Address:", address);
  console.log("0G Chainscan Explorer Link:", `https://chainscan.0g.ai/address/${address}`);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
