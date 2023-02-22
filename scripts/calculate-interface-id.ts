import { ethers } from "hardhat";

async function main() {
  const interfaceIdCalculator = await ethers.getContractFactory("InterfaceIdCalculator");

  await interfaceIdCalculator.deploy();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
