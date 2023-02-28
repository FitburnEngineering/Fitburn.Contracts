import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

import { templateId, tokenId } from "../../../constants";

export function shouldBehaveLikeERC721BlacklistCommon(factory: () => Promise<Contract>) {
  describe("Black list", function () {
    it("should fail: transferFrom from", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(receiver.address, templateId);
      await contractInstance.blacklist(receiver.address);
      const tx1 = contractInstance.connect(receiver).transferFrom(receiver.address, owner.address, tokenId);
      await expect(tx1).to.be.revertedWith("Blacklist: sender is blacklisted");

      const tx2 = contractInstance
        .connect(receiver)
        ["safeTransferFrom(address,address,uint256)"](receiver.address, owner.address, tokenId);
      await expect(tx2).to.be.revertedWith("Blacklist: sender is blacklisted");
    });

    it("should fail: transferFrom to", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);
      await contractInstance.blacklist(receiver.address);
      const tx1 = contractInstance.transferFrom(owner.address, receiver.address, tokenId);
      await expect(tx1).to.be.revertedWith("Blacklist: receiver is blacklisted");

      const tx2 = contractInstance["safeTransferFrom(address,address,uint256)"](
        owner.address,
        receiver.address,
        tokenId,
      );
      await expect(tx2).to.be.revertedWith("Blacklist: receiver is blacklisted");
    });

    it("should fail: transfer approved", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(receiver.address, templateId);
      await contractInstance.blacklist(receiver.address);
      await contractInstance.connect(receiver).approve(owner.address, tokenId);

      const tx1 = contractInstance.transferFrom(receiver.address, owner.address, tokenId);
      await expect(tx1).to.be.revertedWith("Blacklist: sender is blacklisted");

      const tx2 = contractInstance["safeTransferFrom(address,address,uint256)"](
        receiver.address,
        owner.address,
        tokenId,
      );
      await expect(tx2).to.be.revertedWith("Blacklist: sender is blacklisted");
    });

    it("should fail: mintCommon", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.blacklist(receiver.address);
      const tx = contractInstance.mintCommon(receiver.address, templateId);
      await expect(tx).to.be.revertedWith(`Blacklist: receiver is blacklisted`);
    });

    it("should fail: burn", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(receiver.address, templateId);
      await contractInstance.blacklist(receiver.address);

      const tx = contractInstance.connect(receiver).burn(tokenId);
      await expect(tx).to.be.revertedWith("Blacklist: sender is blacklisted");
    });
  });
}
