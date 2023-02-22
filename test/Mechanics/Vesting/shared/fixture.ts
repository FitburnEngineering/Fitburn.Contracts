import { ethers } from "hardhat";
import { Contract } from "ethers";
import { time } from "@openzeppelin/test-helpers";

import { span, tokenName, tokenSymbol } from "@gemunion/contracts-constants";

import { amount } from "../../../constants";

export async function deployVesting(name: string): Promise<Contract> {
  const [owner] = await ethers.getSigners();
  const current = await time.latest();
  const vestingFactory = await ethers.getContractFactory(name);
  const vestingInstance = await vestingFactory.deploy(owner.address, current.toNumber(), span * 4);

  await owner.sendTransaction({
    to: vestingInstance.address,
    value: amount,
  });

  return vestingInstance;
}

export async function deployERC20(contractInstance: Contract): Promise<Contract> {
  const factory = await ethers.getContractFactory("ERC20Simple");
  const instance = await factory.deploy(tokenName, tokenSymbol, amount);
  await instance.mint(contractInstance.address, amount);
  return instance;
}
