import { ethers } from "hardhat";
import { Contract } from "ethers";

import { blockAwait } from "@gemunion/contracts-utils";

export async function deploySystem(contracts: Record<string, Contract>) {
  const vestFactory = await ethers.getContractFactory("ContractManager");
  contracts.contractManager = await vestFactory.deploy();
  await blockAwait();
  const exchangeFactory = await ethers.getContractFactory("Exchange");
  const exchangeInstance = await exchangeFactory.deploy("Exchange", [], []);
  contracts.exchange = exchangeInstance;
  await blockAwait();

  await contracts.contractManager.setFactories([exchangeInstance.address], [contracts.contractManager.address]);
  await blockAwait();
}
