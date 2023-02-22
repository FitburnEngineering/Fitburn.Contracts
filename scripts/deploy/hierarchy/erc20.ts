import { ethers } from "hardhat";
import { constants, Contract } from "ethers";

import { blockAwait } from "@gemunion/contracts-utils";

export async function deployERC20(contracts: Record<string, Contract>) {
  const [owner] = await ethers.getSigners();
  const amount = constants.WeiPerEther.mul(1e6);

  const erc20SimpleFactory = await ethers.getContractFactory("ERC20Blacklist");
  const erc20SimpleInstance = await erc20SimpleFactory.deploy("Calories", "CAL", amount);
  await blockAwait();
  await erc20SimpleInstance.mint(owner.address, amount);
  await blockAwait();
  await erc20SimpleInstance.approve(contracts.exchange.address, amount);
  await blockAwait();
  contracts.erc20Simple = erc20SimpleInstance;
}
