import { expect } from "chai";

import { deployERC721 } from "./shared/fixtures";

describe("Random", function () {
  const factory = () => deployERC721("ERC721Hardhat");

  describe("_getDispersion", function () {
    it("should get dispersion (legendary)", async function () {
      const contractInstance = await factory();

      const value = await contractInstance.getDispersion(733 - 2);
      expect(value).to.equal(4);
    });

    it("should get dispersion (epic)", async function () {
      const contractInstance = await factory();

      const value = await contractInstance.getDispersion(2165 - 2);
      expect(value).to.equal(3);
    });

    it("should get dispersion (rare)", async function () {
      const contractInstance = await factory();

      const value = await contractInstance.getDispersion(4962 - 2);
      expect(value).to.equal(2);
    });

    it("should get dispersion (common)", async function () {
      const contractInstance = await factory();

      const value = await contractInstance.getDispersion(9997 + 2);
      expect(value).to.equal(1);
    });
  });
});
