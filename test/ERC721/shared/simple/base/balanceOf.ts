import { expect } from "chai";
import { ethers } from "hardhat";
import { constants, Contract } from "ethers";

import { templateId } from "../../../../constants";

export function shouldGetBalanceOf(factory: () => Promise<Contract>) {
  describe("balanceOf", function () {
    it("should fail for zero addr", async function () {
      const contractInstance = await factory();

      const tx = contractInstance.balanceOf(constants.AddressZero);
      await expect(tx).to.be.revertedWith(`ERC721: address zero is not a valid owner`);
    });

    it("should get balance of owner", async function () {
      const [owner] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);
      const balance = await contractInstance.balanceOf(owner.address);
      expect(balance).to.equal(1);
    });

    it("should get balance of not owner", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);
      const balance = await contractInstance.balanceOf(receiver.address);
      expect(balance).to.equal(0);
    });
  });
}
