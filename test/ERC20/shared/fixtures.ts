import { ethers } from "hardhat";
import { constants } from "ethers";

import { amount, tokenName, tokenSymbol } from "@gemunion/contracts-constants";

export async function deployERC20(name = "ERC20Simple", options: any = {}) {
  const factory = await ethers.getContractFactory(name);
  const args = Object.assign({ tokenName, tokenSymbol, amount }, options);
  return factory.deploy(...Object.values(args));
}

export async function deployERC20Bl(name = "ERC20Blacklist", options: any = {}) {
  const factory = await ethers.getContractFactory(name);
  const cap = constants.WeiPerEther.mul(amount);
  const args = Object.assign({ tokenName, tokenSymbol, cap }, options);
  return factory.deploy(...Object.values(args));
}
