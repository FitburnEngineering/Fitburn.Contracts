import { ethers } from "hardhat";
// import { VRFCoordinatorV2Mock } from "../../typechain-types";

export async function deployLinkVrfFixture() {
  // Deploy Chainlink & Vrf contracts
  const link = await ethers.getContractFactory("LinkToken");
  const linkInstance = await link.deploy();
  await linkInstance.deployed();
  // console.info(`LINK_ADDR=${linkInstance.address}`);
  const vrfFactory = await ethers.getContractFactory("VRFCoordinatorMock");
  const vrfInstance = await vrfFactory.deploy(linkInstance.address);
  await vrfInstance.deployed();
  // console.info(`VRF_ADDR=${vrfInstance.address}`);
  return { linkInstance, vrfInstance };
}

export async function deployLinkVrfFixtureV2() {
  // Deploy Chainlink & Vrf contracts
  const link = await ethers.getContractFactory("LinkToken");
  const linkInstance = await link.deploy();
  await linkInstance.deployed();
  // console.info(`LINK_ADDR=${linkInstance.address}`);
  const vrfFactory = await ethers.getContractFactory("VRFCoordinatorV2Mock");
  const vrfInstance = await vrfFactory.deploy(linkInstance.address);
  await vrfInstance.deployed();
  // console.info(`VRF_ADDR=${vrfInstance.address}`);
  return { linkInstance, vrfInstance };
}
