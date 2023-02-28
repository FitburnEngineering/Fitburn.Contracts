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

export async function deployUsdt(name = "TetherToken", options: any = {}) {
  const factory = await ethers.getContractFactory(name);
  const args = Object.assign({ amount: amount * 1000000, tokenName, tokenSymbol, decimals: 6 }, options);
  return factory.deploy(...Object.values(args));
}

export async function deployBusd(name = "BEP20Token") {
  const factory = await ethers.getContractFactory(name);
  return factory.deploy();
}

export async function deployWeth(name = "WETH9") {
  const [_owner] = await ethers.getSigners();
  const factory = await ethers.getContractFactory(name);
  const weth = await factory.deploy();
  await _owner.sendTransaction({
    to: weth.address,
    value: amount,
  });
  return weth;
}
