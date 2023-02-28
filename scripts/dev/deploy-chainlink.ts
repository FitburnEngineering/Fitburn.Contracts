import { ethers } from "hardhat";
import { Contract, utils, BigNumber, constants } from "ethers";

import { blockAwait, blockAwaitMs, camelToSnakeCase } from "@gemunion/contracts-utils";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/abstract-provider";

const delay = 3; // block delay
const delayMs = 1500; // block delay ms

interface IObj {
  address?: string;
  hash?: string;
  wait: () => Promise<TransactionReceipt> | void;
}

const debug = async (obj: IObj | Record<string, Contract> | TransactionResponse, name?: string) => {
  if (obj && obj.hash) {
    console.info(`${name} tx: ${obj.hash}`);
    await blockAwaitMs(delayMs);
    const transaction: TransactionResponse = obj as TransactionResponse;
    await transaction.wait();
  } else {
    console.info(`${Object.keys(obj).pop()} deployed`);
    await blockAwait(delay, delayMs);
  }
};

const contracts: Record<string, Contract> = {};

async function main() {
  // LINK & VRF
  const linkFactory = await ethers.getContractFactory("LinkToken");
  // const linkInstance = linkFactory.attach("0x18C8044BEaf97a626E2130Fe324245b96F81A31F");
  const linkInstance = await linkFactory.deploy();
  contracts.link = linkInstance;
  await debug(contracts);
  // console.info(`LINK_ADDR=${contracts.link.address}`);
  const vrfFactory = await ethers.getContractFactory("VRFCoordinatorMock");
  const vrfInstance = await vrfFactory.deploy(contracts.link.address);
  contracts.vrf = vrfInstance;
  await debug(contracts);
  // console.info(`VRF_ADDR=${contracts.vrf.address}`);

  if (contracts.link.address !== "0x42699A7612A82f1d9C36148af9C77354759b210b") {
    console.info("LINK_ADDR address mismatch, clean BESU, then try again");
  }
  if (contracts.vrf.address !== "0xa50a51c09a5c451C52BB714527E1974b686D8e77") {
    console.info("VRF_ADDR address mismatch, clean BESU, then try again");
  }
  // BESU gemunion
  // address(0x86C86939c631D53c6D812625bD6Ccd5Bf5BEb774), // vrfCoordinator
  //   address(0x1fa66727cDD4e3e4a6debE4adF84985873F6cd8a), // LINK token
  // SETUP CHAIN_LINK VRF-V2 TO WORK
  const linkAmount = constants.WeiPerEther.mul(10);
  await debug(await vrfInstance.setConfig(3, 1000000, 1, 1, 1), "setConfig");
  await debug(await vrfInstance.createSubscription(), "createSubscription");
  // const vrfConfig = await vrfInstance.getSubscription(1);
  // console.log("vrfConfig", vrfConfig);
  const subId = utils.hexZeroPad(ethers.utils.hexlify(BigNumber.from(1)), 32);
  await debug(await linkInstance.transferAndCall(vrfInstance.address, linkAmount, subId), "transferAndCall");
  // const linkInstance = link.attach("0xa50a51c09a5c451C52BB714527E1974b686D8e77"); // localhost BESU
}

main()
  .then(() => {
    Object.entries(contracts).map(([key, value]) =>
      console.info(`${camelToSnakeCase(key).toUpperCase()}_ADDR=${value.address.toLowerCase()}`),
    );
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
