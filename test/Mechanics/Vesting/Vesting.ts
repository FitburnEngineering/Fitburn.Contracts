import { expect } from "chai";
import { ethers } from "hardhat";

import { shouldBehaveLikeOwnable, shouldSupportsInterface } from "@gemunion/contracts-mocha";
import { InterfaceId } from "@gemunion/contracts-constants";

import { deployVesting } from "./shared/fixture";
import { amount } from "../../constants";
import { calc } from "./shared/calc";
import { deployERC20 } from "../../ERC20/shared/fixtures";

describe("Vesting", function () {
  const factory = () => deployVesting("TeamVesting");

  shouldBehaveLikeOwnable(factory);

  describe("topUp", function () {
    it("TeamVesting", async function () {
      const [owner] = await ethers.getSigners();
      const vestingInstance = await deployVesting("TeamVesting");

      const erc20Instance = await deployERC20(void 0, { amount });
      await erc20Instance.mint(owner.address, amount);

      await erc20Instance.approve(vestingInstance.address, amount);

      const tx = await vestingInstance.topUp([
        {
          tokenType: 1,
          token: erc20Instance.address,
          tokenId: 0,
          amount,
        },
      ]);

      await expect(tx)
        .to.emit(vestingInstance, "TransferReceived")
        .withArgs(vestingInstance.address, owner.address, amount, "0x");

      await expect(tx).changeTokenBalances(erc20Instance, [owner, vestingInstance], [-amount, amount]);
    });
  });

  describe("release", function () {
    it("AdvisorsVesting", async function () {
      await calc("AdvisorsVesting", 13698, 12);
    });

    it("MarketingVesting", async function () {
      await calc("MarketingVesting", 48912, 1);
    });

    it("PartnershipVesting", async function () {
      await calc("PartnershipVesting", 13679, 6);
    });

    it("PreSeedSaleVesting", async function () {
      await calc("PreSeedSaleVesting", 13337, 3);
    });

    it("PrivateSaleVesting", async function () {
      await calc("PrivateSaleVesting", 18915, 1);
    });

    it("PublicSaleVesting", async function () {
      await calc("PublicSaleVesting", 54944, 0);
    });

    it("SeedSaleVesting", async function () {
      await calc("SeedSaleVesting", 15547, 2);
    });

    it("TeamVesting", async function () {
      await calc("TeamVesting", 13698, 12);
    });
  });

  shouldSupportsInterface(factory)(InterfaceId.IERC165, InterfaceId.IERC1363Receiver);
});
