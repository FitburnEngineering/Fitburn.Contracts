import { expect } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";

import { deployERC721 } from "./shared/fixtures";
import { templateId, tokenId } from "../constants";

describe("Upgradeable", function () {
  const factory = () => deployERC721("ERC721Hardhat");

  describe("earnUpgrade", function () {
    it("earnUpgrade", async function () {
      const [owner, receiver] = await ethers.getSigners();

      const contractInstance = await factory();

      await contractInstance.mintCommon(receiver.address, templateId);

      const tx = contractInstance.earnUpgrade(tokenId);
      await expect(tx)
        .to.emit(contractInstance, "EarnUpgraded")
        .withArgs(owner.address, tokenId, 1)
        .to.emit(contractInstance, "MetadataUpdate")
        .withArgs(tokenId);

      const value = await contractInstance.getRecordFieldValue(
        tokenId,
        utils.keccak256(utils.toUtf8Bytes("EARN_UPGRADE")),
      );

      expect(value).to.equal(1);
    });
  });

  describe("timeUpgrade", function () {
    it("timeUpgrade", async function () {
      const [owner, receiver] = await ethers.getSigners();

      const contractInstance = await factory();

      await contractInstance.mintCommon(receiver.address, templateId);

      const tx = contractInstance.timeUpgrade(tokenId);
      await expect(tx)
        .to.emit(contractInstance, "TimeUpgraded")
        .withArgs(owner.address, tokenId, 1)
        .to.emit(contractInstance, "MetadataUpdate")
        .withArgs(tokenId);

      const value = await contractInstance.getRecordFieldValue(
        tokenId,
        utils.keccak256(utils.toUtf8Bytes("TIME_UPGRADE")),
      );

      expect(value).to.equal(1);
    });
  });
});
