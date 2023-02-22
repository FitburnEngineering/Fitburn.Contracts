import { ethers } from "hardhat";
import { Contract } from "ethers";

export async function deployContract(name: string): Promise<Contract> {
  const factory = await ethers.getContractFactory(name);
  return factory.deploy();
}
