import { expect } from "chai";
import { ethers } from "hardhat";
import { constants, Contract } from "ethers";

export function shouldReceive(factory: () => Promise<Contract>) {
  describe("receive", function () {
    it("should fail: no reason", async function () {
      const [owner] = await ethers.getSigners();
      const contractInstance = await factory();

      const tx = owner.sendTransaction({
        to: contractInstance.address,
        value: constants.WeiPerEther,
        gasLimit: 21000 + 61, // + revert
      });

      await expect(tx).to.be.reverted;
    });
  });
}
