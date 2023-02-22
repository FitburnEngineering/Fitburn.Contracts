import { ethers } from "hardhat";

export async function deployContractManager(name: string) {
  const factory = await ethers.getContractFactory(name);
  return factory.deploy();
}
