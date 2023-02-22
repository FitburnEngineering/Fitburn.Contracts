import { ethers } from "hardhat";
import { Contract } from "ethers";

import { blockAwait } from "@gemunion/contracts-utils";

export async function deployWeth(contracts: Record<string, Contract>) {
  const wethFactory = await ethers.getContractFactory("WETH9");
  contracts.weth = await wethFactory.deploy();
  await blockAwait();
}
