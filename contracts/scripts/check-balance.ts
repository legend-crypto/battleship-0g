import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x6114CB30740c77C37971E0468F7662E3ec52e6Cc";
  const [signer] = await ethers.getSigners();

  const contractBalance = await ethers.provider.getBalance(contractAddress);
  const signerBalance = await ethers.provider.getBalance(signer.address);

  console.log("=== 0G MAINNET BALANCE CHECK ===");
  console.log("Contract Address:", contractAddress);
  console.log("Contract 0G Balance:", ethers.formatEther(contractBalance), "0G");
  console.log("Signer Address:", signer.address);
  console.log("Signer 0G Balance:", ethers.formatEther(signerBalance), "0G");
  console.log("================================");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
