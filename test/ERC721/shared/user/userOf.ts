import { expect } from "chai";
import { ethers, web3 } from "hardhat";
import { Contract } from "ethers";
import { time } from "@openzeppelin/test-helpers";

import { templateId, tokenId } from "../../../constants";

export function shouldUserOf(factory: () => Promise<Contract>) {
  describe("userOf", function () {
    it("should return 0", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);

      const current = await time.latest();
      const deadline = current.sub(web3.utils.toBN(1));

      await contractInstance.setUser(tokenId, receiver.address, deadline.toString());
      const userOf = await contractInstance.userOf(tokenId);

      expect(userOf).to.be.equal(ethers.constants.AddressZero);
    });

    it("should return 0, when time is expired", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);

      const current = await time.latest();
      const deadline = current.add(web3.utils.toBN(100));

      await contractInstance.setUser(tokenId, receiver.address, deadline.toString());

      const current1 = await time.latest();
      await time.increaseTo(current1.add(web3.utils.toBN(50)));

      const userOf1 = await contractInstance.userOf(tokenId);
      expect(userOf1).to.be.equal(receiver.address);

      const current2 = await time.latest();
      await time.increaseTo(current2.add(web3.utils.toBN(50)));

      const userOf2 = await contractInstance.userOf(tokenId);
      expect(userOf2).to.be.equal(ethers.constants.AddressZero);
    });

    it("Owner is still the owner of NFT", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);

      const current = await time.latest();
      const deadline = current.add(web3.utils.toBN(100));

      await contractInstance.setUser(tokenId, receiver.address, deadline.toString());

      const ownerOfToken = await contractInstance.ownerOf(tokenId);

      expect(ownerOfToken).to.be.equal(owner.address);
    });
  });
}
