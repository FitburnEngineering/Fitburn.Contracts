import "@nomiclabs/hardhat-waffle";

import { ethers } from "hardhat";
import { Contract } from "ethers";

export async function deployStaking(): Promise<Contract> {
  const factory = await ethers.getContractFactory("Staking");
  return factory.deploy(1);
}
