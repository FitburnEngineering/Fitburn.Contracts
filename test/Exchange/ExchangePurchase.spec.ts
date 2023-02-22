import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BigNumber, constants } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { amount, decimals } from "@gemunion/contracts-constants";
import { params, tokenId } from "../constants";

import { deployErc721Base, deployExchangeFixture } from "./shared/fixture";
import { deployLinkVrfFixture } from "../shared/link";
import { LinkToken, VRFCoordinatorMock } from "../../typechain-types";
import { deployERC20Bl } from "../ERC20/shared/fixtures";
import { randomRequest } from "../shared/randomRequest";

describe("ExchangePurchase", function () {
  let linkInstance: LinkToken;
  let vrfInstance: VRFCoordinatorMock;

  before(async function () {
    await network.provider.send("hardhat_reset");

    // https://github.com/NomicFoundation/hardhat/issues/2980
    ({ linkInstance, vrfInstance } = await loadFixture(function exchange() {
      return deployLinkVrfFixture();
    }));
  });

  after(async function () {
    await network.provider.send("hardhat_reset");
  });

  describe("exchange", function () {
    describe("exchange purchase", function () {
      it("should purchase ERC721 Random for ERC20(Blacklist)", async function () {
        const [_owner, receiver] = await ethers.getSigners();
        const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
        const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);
        // const erc721Instance = await deployErc721Base("ERC721Besu", exchangeInstance);
        const erc20Instance = await deployERC20Bl("ERC20Blacklist");
        await erc20Instance.mint(receiver.address, constants.WeiPerEther.mul(amount));
        await erc20Instance.connect(receiver).approve(exchangeInstance.address, constants.WeiPerEther.mul(amount));

        await linkInstance.transfer(erc721Instance.address, BigNumber.from("1000").mul(decimals));
        const signature = await generateOneToManySignature({
          account: receiver.address,
          params,
          item: {
            tokenType: 2,
            token: erc721Instance.address,
            tokenId,
            amount: 1,
          },
          price: [
            {
              tokenType: 1,
              token: erc20Instance.address,
              tokenId: 0,
              amount: constants.WeiPerEther,
            },
          ],
        });

        const tx1 = exchangeInstance.connect(receiver).purchase(
          params,
          {
            tokenType: 2,
            token: erc721Instance.address,
            tokenId,
            amount: 1,
          },
          [
            {
              tokenType: 1,
              token: erc20Instance.address,
              tokenId: 0,
              amount: constants.WeiPerEther,
            },
          ],
          signature,
        );

        await expect(tx1).to.emit(exchangeInstance, "Purchase");

        await randomRequest(erc721Instance, vrfInstance);

        const balance = await erc721Instance.balanceOf(receiver.address);
        expect(balance).to.equal(1);
      });
    });
  });
});
