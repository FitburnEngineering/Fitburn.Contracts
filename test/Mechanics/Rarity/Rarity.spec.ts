import { expect } from "chai";

import { deployContract } from "../../shared/fixture";

describe("Rarity", function () {
  const factory = () => deployContract("Dispersion");

  describe("_getDispersion", function () {
    it("should get dispersion (legendary)", async function () {
      const contractInstance = await factory();

      const value = await contractInstance.getDispersion(733 - 1);
      expect(value).to.equal(4);
    });

    it("should get dispersion (epic)", async function () {
      const contractInstance = await factory();

      const value = await contractInstance.getDispersion(2165 - 1);
      expect(value).to.equal(3);
    });

    it("should get dispersion (rare)", async function () {
      const contractInstance = await factory();

      const value = await contractInstance.getDispersion(4962 - 1);
      expect(value).to.equal(2);
    });

    it("should get dispersion (common)", async function () {
      const contractInstance = await factory();

      const value = await contractInstance.getDispersion(9999 - 1);
      expect(value).to.equal(1);
    });
  });
});
