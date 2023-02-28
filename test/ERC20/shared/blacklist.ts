import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

import { amount } from "@gemunion/contracts-constants";

export function shouldBehaveLikeERC20BlackList(factory: () => Promise<Contract>) {
  describe("Black list", function () {
    it("should fail: transfer from", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mint(owner.address, amount);
      await contractInstance.blacklist(owner.address);

      const tx1 = contractInstance.transfer(receiver.address, amount);
      await expect(tx1).to.be.revertedWith("Blacklist: sender is blacklisted");

      await contractInstance.approve(owner.address, amount);

      const tx2 = contractInstance.transferFrom(owner.address, receiver.address, amount);
      await expect(tx2).to.be.revertedWith("Blacklist: sender is blacklisted");
    });

    it("should fail: transferFrom to", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mint(owner.address, amount);
      await contractInstance.blacklist(receiver.address);

      const tx1 = contractInstance.transfer(receiver.address, amount);
      await expect(tx1).to.be.revertedWith("Blacklist: receiver is blacklisted");

      await contractInstance.approve(owner.address, amount);

      const tx2 = contractInstance.transferFrom(owner.address, receiver.address, amount);
      await expect(tx2).to.be.revertedWith("Blacklist: receiver is blacklisted");
    });

    it("should fail: transfer approved", async function () {
      const [owner, receiver, stranger] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mint(owner.address, amount);
      await contractInstance.blacklist(owner.address);
      await contractInstance.approve(stranger.address, amount);

      const tx2 = contractInstance.connect(stranger).transferFrom(owner.address, receiver.address, amount);
      await expect(tx2).to.be.revertedWith("Blacklist: sender is blacklisted");
    });

    it("should fail: mint", async function () {
      const [owner] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.blacklist(owner.address);

      const tx2 = contractInstance.mint(owner.address, amount);
      await expect(tx2).to.be.revertedWith("Blacklist: receiver is blacklisted");
    });

    it("should fail: burn", async function () {
      const [owner] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mint(owner.address, amount);
      await contractInstance.blacklist(owner.address);

      const tx2 = contractInstance.burn(amount);
      await expect(tx2).to.be.revertedWith("Blacklist: sender is blacklisted");
    });
  });
}
