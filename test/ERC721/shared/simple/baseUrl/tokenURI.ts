import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

import { baseTokenURI } from "@gemunion/contracts-constants";

import { templateId, tokenId } from "../../../../constants";

export function shouldTokenURI(factory: () => Promise<Contract>) {
  describe("tokenURI", function () {
    it("should get token uri", async function () {
      const [owner] = await ethers.getSigners();
      const contractInstance = await factory();

      await contractInstance.mintCommon(owner.address, templateId);
      const uri = await contractInstance.tokenURI(tokenId);
      expect(uri).to.equal(`${baseTokenURI}/${contractInstance.address.toLowerCase()}/${tokenId}`);
    });

    // setTokenURI is not supported

    it("should fail: URI query for nonexistent token", async function () {
      const contractInstance = await factory();

      const uri = contractInstance.tokenURI(tokenId);
      await expect(uri).to.be.revertedWith("ERC721: invalid token ID");
    });
  });
}
