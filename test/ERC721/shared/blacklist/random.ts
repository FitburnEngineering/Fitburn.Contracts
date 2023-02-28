import { expect } from "chai";
import { ethers, network } from "hardhat";
import { Contract } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { subscriptionId, templateId } from "../../../constants";
import { deployLinkVrfFixture } from "../../../shared/link";
import { VRFCoordinatorMock } from "../../../../typechain-types";
import { randomRequest } from "../../../shared/randomRequest";

export function shouldBehaveLikeERC721BlacklistRandom(factory: () => Promise<Contract>) {
  describe("Black list", function () {
    let vrfInstance: VRFCoordinatorMock;

    before(async function () {
      await network.provider.send("hardhat_reset");

      // https://github.com/NomicFoundation/hardhat/issues/2980
      ({ vrfInstance } = await loadFixture(function shouldMintRandom() {
        return deployLinkVrfFixture();
      }));
    });

    it("should fail: mintRandom", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await vrfInstance.addConsumer(subscriptionId, contractInstance.address);

      await contractInstance.blacklist(receiver.address);
      const tx = contractInstance.mintRandom(receiver.address, templateId);

      if (network.name === "hardhat") {
        await randomRequest(contractInstance, vrfInstance);
      }

      await expect(tx).to.be.revertedWith(`Blacklist: receiver is blacklisted`);
    });
  });
}
