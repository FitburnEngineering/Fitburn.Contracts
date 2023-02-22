import { expect } from "chai";
import { ethers, web3 } from "hardhat";
import { Contract } from "ethers";
import { time } from "@openzeppelin/test-helpers";

import { templateId, tokenId } from "../../../constants";

export function shouldSetUser(factory: () => Promise<Contract>) {
  describe("setUser", function () {
    it("should set a user to a token", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);

      const current = await time.latest();
      const deadline = current.add(web3.utils.toBN(100));

      await contractInstance.setUser(tokenId, receiver.address, deadline.toString());

      const userOf = await contractInstance.userOf(tokenId);

      expect(userOf).to.be.equal(receiver.address);
    });

    it("should fail: don't have permission to set a user", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);

      const current = await time.latest();
      const deadline = current.add(web3.utils.toBN(100));

      const tx = contractInstance.connect(receiver).setUser(tokenId, receiver.address, deadline.toString());
      await expect(tx).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
    });

    it("should set a user from approved address", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);

      const current = await time.latest();
      const deadline = current.add(web3.utils.toBN(100));

      await contractInstance.approve(receiver.address, tokenId);
      await contractInstance.setUser(tokenId, receiver.address, deadline.toString());

      const userOf = await contractInstance.userOf(tokenId);

      expect(userOf).to.be.equal(receiver.address);
    });

    it("should set a user from approvedAll address", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);

      const current = await time.latest();
      const deadline = current.add(web3.utils.toBN(100));

      await contractInstance.setApprovalForAll(receiver.address, true);
      await contractInstance.setUser(tokenId, receiver.address, deadline.toString());

      const userOf = await contractInstance.userOf(tokenId);

      expect(userOf).to.be.equal(receiver.address);
    });

    it("emits a UpdateUser event", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);

      const current = await time.latest();
      const deadline = current.add(web3.utils.toBN(100));

      const tx = contractInstance.setUser(tokenId, receiver.address, deadline.toString());

      await expect(tx).to.emit(contractInstance, "UpdateUser").withArgs(tokenId, receiver.address, deadline.toString());
    });
  });
}
