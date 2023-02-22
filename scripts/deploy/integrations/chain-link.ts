import { ethers } from "hardhat";
import { Contract } from "ethers";

import { blockAwait } from "@gemunion/contracts-utils";

export async function deployChainLink(contracts: Record<string, Contract>) {
  const linkFactory = await ethers.getContractFactory("LinkToken");
  contracts.link = await linkFactory.deploy();
  await blockAwait();
}
