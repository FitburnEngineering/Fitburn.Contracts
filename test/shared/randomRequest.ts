import { ethers } from "hardhat";
import { Contract, BigNumber, utils } from "ethers";

import { VRFCoordinatorMock } from "../../typechain-types";

export async function randomRequest(rndInstance: Contract, vrfInstance: VRFCoordinatorMock) {
  const eventFilter = vrfInstance.filters.RandomWordsRequested();
  const events = await vrfInstance.queryFilter(eventFilter);
  for (const e of events) {
    const {
      args: { keyHash, requestId, subId, callbackGasLimit, numWords, sender },
    } = e;

    const blockNum = await ethers.provider.getBlockNumber();

    await vrfInstance.fulfillRandomWords(requestId, keyHash, BigNumber.from(utils.randomBytes(32)), {
      blockNum,
      subId,
      callbackGasLimit,
      numWords,
      sender,
    });
  }
}
