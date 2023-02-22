import { expect } from "chai";
import { ethers } from "hardhat";
import { constants, Contract } from "ethers";

import { templateId, tokenId } from "../../../../constants";

export function shouldBurn(factory: () => Promise<Contract>) {
  describe("burn", function () {
    it("should fail: not an owner", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);
      const tx = contractInstance.connect(receiver).burn(tokenId);

      await expect(tx).to.be.revertedWith(`ERC721: caller is not token owner or approved`);
    });

    it("should burn own token", async function () {
      const [owner] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);
      const tx = await contractInstance.burn(tokenId);

      await expect(tx).to.emit(contractInstance, "Transfer").withArgs(owner.address, constants.AddressZero, tokenId);

      const balanceOfOwner = await contractInstance.balanceOf(owner.address);
      expect(balanceOfOwner).to.equal(0);
    });

    it("should burn approved token", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);
      await contractInstance.approve(receiver.address, tokenId);

      const tx = await contractInstance.burn(tokenId);

      await expect(tx).to.emit(contractInstance, "Transfer").withArgs(owner.address, constants.AddressZero, tokenId);

      const balanceOfOwner = await contractInstance.balanceOf(owner.address);
      expect(balanceOfOwner).to.equal(0);
    });
  });
}
