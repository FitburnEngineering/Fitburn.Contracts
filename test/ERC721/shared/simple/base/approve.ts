import { expect } from "chai";
import { ethers } from "hardhat";
import { constants, Contract } from "ethers";

import { templateId, tokenId } from "../../../../constants";

export function shouldApprove(factory: () => Promise<Contract>) {
  describe("approve", function () {
    it("should fail: not an owner", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);
      const tx = contractInstance.connect(receiver).approve(owner.address, tokenId);
      await expect(tx).to.be.revertedWith("ERC721: approval to current owner");
    });

    it("should fail: approve to self", async function () {
      const [owner] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);
      const tx = contractInstance.approve(owner.address, tokenId);
      await expect(tx).to.be.revertedWith("ERC721: approval to current owner");
    });

    it("should approve", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);

      const tx = contractInstance.approve(receiver.address, tokenId);
      await expect(tx).to.emit(contractInstance, "Approval").withArgs(owner.address, receiver.address, tokenId);

      const approved = await contractInstance.getApproved(tokenId);
      expect(approved).to.equal(receiver.address);

      const tx1 = contractInstance.connect(receiver).burn(tokenId);
      await expect(tx1).to.emit(contractInstance, "Transfer").withArgs(owner.address, constants.AddressZero, tokenId);

      const balanceOfOwner = await contractInstance.balanceOf(owner.address);
      expect(balanceOfOwner).to.equal(0);
    });
  });
}
