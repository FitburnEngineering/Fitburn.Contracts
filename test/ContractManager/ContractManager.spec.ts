import { expect } from "chai";
import { ethers } from "hardhat";

import { shouldBehaveLikeAccessControl } from "@gemunion/contracts-mocha";
import { DEFAULT_ADMIN_ROLE, METADATA_ROLE, MINTER_ROLE } from "@gemunion/contracts-constants";

import { deployContractManager } from "./fixture";

describe("ContractManager", function () {
  const factory = () => deployContractManager(this.title);

  shouldBehaveLikeAccessControl(factory)(DEFAULT_ADMIN_ROLE);

  describe("destroy", function () {
    it("should fail: wrong role", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();
      const tx = contractInstance.connect(receiver).destroy();
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${receiver.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
      );
    });

    it("should destroy", async function () {
      const contractInstance = await factory();
      const tx = await contractInstance.destroy();
      await expect(tx).not.to.be.reverted;
    });
  });

  describe("addFactory", function () {
    it("should fail: wrong role", async function () {
      const [_owner, receiver, stranger] = await ethers.getSigners();
      const contractInstance = await factory();
      const tx = contractInstance.connect(receiver).addFactory(stranger.address, MINTER_ROLE);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${receiver.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
      );
    });

    it("should add factory (MINTER_ROLE)", async function () {
      const [_owner, _receiver, stranger] = await ethers.getSigners();
      const contractInstance = await factory();
      const tx = contractInstance.addFactory(stranger.address, MINTER_ROLE);
      await expect(tx).not.to.be.reverted;
    });

    it("should add factory (METADATA_ROLE)", async function () {
      const [_owner, _receiver, stranger] = await ethers.getSigners();
      const contractInstance = await factory();
      const tx = contractInstance.addFactory(stranger.address, METADATA_ROLE);
      await expect(tx).not.to.be.reverted;
    });
  });

  describe("removeFactory", function () {
    it("should fail: wrong role", async function () {
      const [_owner, receiver, stranger] = await ethers.getSigners();
      const contractInstance = await factory();
      await contractInstance.addFactory(stranger.address, MINTER_ROLE);
      await contractInstance.addFactory(stranger.address, METADATA_ROLE);
      const tx = contractInstance.connect(receiver).removeFactory(stranger.address);
      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${receiver.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
      );
    });

    it("should add factory", async function () {
      const [_owner, _receiver, stranger] = await ethers.getSigners();
      const contractInstance = await factory();
      await contractInstance.addFactory(stranger.address, MINTER_ROLE);
      await contractInstance.addFactory(stranger.address, METADATA_ROLE);
      const tx = contractInstance.removeFactory(stranger.address);
      await expect(tx).not.to.be.reverted;
    });
  });
});
