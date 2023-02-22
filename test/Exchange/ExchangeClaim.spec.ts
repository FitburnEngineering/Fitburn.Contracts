import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BigNumber } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { decimals } from "@gemunion/contracts-constants";
import { params, tokenId } from "../constants";

import { deployErc721Base, deployExchangeFixture } from "./shared/fixture";
import { deployLinkVrfFixture } from "../shared/link";
import { LinkToken } from "../../typechain-types";

describe("ExchangeClaim", function () {
  let linkInstance: LinkToken;

  before(async function () {
    await network.provider.send("hardhat_reset");

    // https://github.com/NomicFoundation/hardhat/issues/2980
    ({ linkInstance } = await loadFixture(function exchange() {
      return deployLinkVrfFixture();
    }));
  });

  after(async function () {
    await network.provider.send("hardhat_reset");
  });

  describe("claim", function () {
    describe("ERC721", function () {
      it("should claim", async function () {
        const [_owner, receiver] = await ethers.getSigners();
        const { contractInstance: exchangeInstance, generateManyToManySignature } = await deployExchangeFixture();
        const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

        await linkInstance.transfer(erc721Instance.address, BigNumber.from("1000").mul(decimals));

        const signature = await generateManyToManySignature({
          account: receiver.address,
          params,
          items: [
            {
              tokenType: 2,
              token: erc721Instance.address,
              tokenId,
              amount: 1,
            },
          ],
          price: [],
        });

        const tx1 = exchangeInstance.connect(receiver).claim(
          params,
          [
            {
              tokenType: 2,
              token: erc721Instance.address,
              tokenId,
              amount: 1,
            },
          ],
          signature,
        );

        await expect(tx1)
          .to.emit(exchangeInstance, "Claim")
          // .withArgs(
          //   receiver.address,
          //   [[2, erc721Instance.address, tokenId, 1]],
          //   [[0, constants.AddressZero, tokenId, amount]],
          // )
          .to.not.emit(erc721Instance, "Transfer");
      });
    });
  });
});
