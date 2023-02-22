import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

export function shouldMint(factory: () => Promise<Contract>) {
  describe("mint", function () {
    it("should fail: MethodNotSupported", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const contractInstance = await factory();
      const tx = contractInstance.connect(receiver).mint(receiver.address);
      await expect(tx).to.be.revertedWith("MethodNotSupported");
    });
  });
}
