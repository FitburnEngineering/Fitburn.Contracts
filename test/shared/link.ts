import { ethers } from "hardhat";
import { constants, utils } from "ethers";
import { expect } from "chai";

import { subscriptionId } from "../constants";

export async function deployLinkVrfFixture(amount = constants.WeiPerEther) {
  // Deploy Chainlink & Vrf contracts
  const link = await ethers.getContractFactory("LinkToken");
  const linkInstance = await link.deploy();
  await linkInstance.deployed();
  // console.info(`LINK_ADDR=${linkInstance.address}`);
  const vrfFactory = await ethers.getContractFactory("VRFCoordinatorMock");
  const vrfInstance = await vrfFactory.deploy(linkInstance.address);
  await vrfInstance.deployed();
  // GET CHAIN_LINK V2 TO WORK
  await vrfInstance.setConfig(3, 1000000, 1, 1, 1);
  const tx00 = await vrfInstance.createSubscription();
  await expect(tx00).to.emit(vrfInstance, "SubscriptionCreated");
  const vrfEventFilter = vrfInstance.filters.SubscriptionCreated();
  const vrfEvents = await vrfInstance.queryFilter(vrfEventFilter);
  const { subId } = vrfEvents[0].args;
  expect(subId).to.equal(subscriptionId);

  const tx01 = linkInstance.transferAndCall(vrfInstance.address, amount, utils.hexZeroPad(utils.hexlify(subId), 32));
  await expect(tx01).to.emit(vrfInstance, "SubscriptionFunded").withArgs(subId, 0, amount);

  // console.info(`VRF_ADDR=${vrfInstance.address}`);
  return { linkInstance, vrfInstance, subId };
}
