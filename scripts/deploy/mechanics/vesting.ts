import { ethers } from "hardhat";
import { Contract } from "ethers";

import { blockAwait } from "@gemunion/contracts-utils";
import { wallet } from "@gemunion/constants";

export async function deployVesting(contracts: Record<string, Contract>) {
  const timestamp = Math.ceil(Date.now() / 1000);
  await blockAwait();
  const linearVestingFactory = await ethers.getContractFactory("LinearVesting");
  contracts.vestingLinear = await linearVestingFactory.deploy(wallet, timestamp, 365 * 86400);
  await blockAwait();

  const gradedVestingFactory = await ethers.getContractFactory("GradedVesting");
  contracts.vestingGraded = await gradedVestingFactory.deploy(wallet, timestamp, 365 * 86400);
  await blockAwait();

  const cliffVestingFactory = await ethers.getContractFactory("CliffVesting");
  contracts.vestingCliff = await cliffVestingFactory.deploy(wallet, timestamp, 365 * 86400);
  await blockAwait();
}
