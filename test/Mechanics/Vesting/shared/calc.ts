import { expect } from "chai";
import { time } from "@openzeppelin/test-helpers";
import { ethers, web3 } from "hardhat";

import { deployERC20, deployVesting } from "./fixture";
import { amount } from "../../../constants";

const span = 86400; // one day in seconds

export async function calc(name: string, percent: number, months: number) {
  const [owner] = await ethers.getSigners();
  const vestingInstance = await deployVesting(name);
  const erc20Instance = await deployERC20(vestingInstance);

  const dailyRelease = (amount * percent) / 10000000;
  const cliff = new Array(months * 30).fill(0);
  const whole = ~~(amount / dailyRelease);
  const rest = amount % dailyRelease;
  const body = new Array(whole).fill(dailyRelease);
  const expectedAmounts = [0, ...cliff, ...body, rest, 0];

  for (const expectedAmount of expectedAmounts) {
    const releaseable = await vestingInstance["releaseable(address)"](erc20Instance.address);
    expect(releaseable).to.be.equal(expectedAmount);

    const tx = await vestingInstance["release(address)"](erc20Instance.address);
    await expect(tx).changeTokenBalances(
      erc20Instance,
      [vestingInstance.address, owner.address],
      [releaseable.mul(-1), releaseable],
    );

    const current = await time.latest();
    await time.increaseTo(current.add(web3.utils.toBN(span)));
  }
}
