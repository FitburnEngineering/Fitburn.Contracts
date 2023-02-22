import { ethers } from "hardhat";
import { Contract } from "ethers";

import { blockAwait } from "@gemunion/contracts-utils";

export async function deployBusd(contracts: Record<string, Contract>) {
  const usdtFactory = await ethers.getContractFactory("BEP20Token");
  contracts.busd = await usdtFactory.deploy();
  await blockAwait();
}
