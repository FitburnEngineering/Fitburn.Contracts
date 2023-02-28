import { expect } from "chai";
import { ethers, network } from "hardhat";
import { constants } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { amount, nonce } from "@gemunion/contracts-constants";

import { externalId, params, subscriptionId, tokenId } from "../constants";
import { deployErc1155Base, deployErc721Base, deployExchangeFixture } from "./shared/fixture";
import { deployLinkVrfFixture } from "../shared/link";
import { VRFCoordinatorMock } from "../../typechain-types";
import { randomRequest } from "../shared/randomRequest";

describe("ExchangeClaim", function () {
  let vrfInstance: VRFCoordinatorMock;

  before(async function () {
    await network.provider.send("hardhat_reset");

    // https://github.com/NomicFoundation/hardhat/issues/2980
    ({ vrfInstance } = await loadFixture(function exchange() {
      return deployLinkVrfFixture();
    }));
  });

  after(async function () {
    await network.provider.send("hardhat_reset");
  });

  describe("claim", function () {
    describe("ERC721", function () {
      it("should claim (Simple)", async function () {
        const [_owner, receiver] = await ethers.getSigners();
        const { contractInstance: exchangeInstance, generateManyToManySignature } = await deployExchangeFixture();
        const erc721Instance = await deployErc721Base("ERC721Simple", exchangeInstance);

        const signature = await generateManyToManySignature({
          account: receiver.address,
          params,
          items: [
            {
              tokenType: 2,
              token: erc721Instance.address,
              tokenId,
              amount,
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
              amount,
            },
          ],
          signature,
        );

        await expect(tx1)
          .to.emit(exchangeInstance, "Claim")
          .withNamedArgs({
            from: receiver.address,
            externalId,
            // items: [
            //   {
            //     tokenType: 2,
            //     token: erc721Instance.address,
            //     tokenId,
            //     amount,
            //   },
            // ],
          })
          .to.emit(erc721Instance, "Transfer")
          .withArgs(constants.AddressZero, receiver.address, tokenId);

        const balance = await erc721Instance.balanceOf(receiver.address);
        expect(balance).to.equal(1);
      });

      it("should claim (Random)", async function () {
        const [_owner, receiver] = await ethers.getSigners();
        const { contractInstance: exchangeInstance, generateManyToManySignature } = await deployExchangeFixture();
        const erc721Instance = await deployErc721Base("ERC721BlacklistUpgradeableRentableRandom", exchangeInstance);

        const tx02 = await vrfInstance.addConsumer(subscriptionId, erc721Instance.address);
        await expect(tx02)
          .to.emit(vrfInstance, "SubscriptionConsumerAdded")
          .withArgs(subscriptionId, erc721Instance.address);

        const signature = await generateManyToManySignature({
          account: receiver.address,
          params,
          items: [
            {
              tokenType: 2,
              token: erc721Instance.address,
              tokenId,
              amount,
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
              amount,
            },
          ],
          signature,
        );

        await expect(tx1)
          .to.emit(exchangeInstance, "Claim")
          .withNamedArgs({
            from: receiver.address,
            externalId,
            // items: [
            //   {
            //     tokenType: 2,
            //     token: erc721Instance.address,
            //     tokenId,
            //     amount,
            //   },
            // ],
          })
          .to.not.emit(erc721Instance, "Transfer");

        await randomRequest(erc721Instance, vrfInstance);

        const balance = await erc721Instance.balanceOf(receiver.address);
        expect(balance).to.equal(1);
      });

      it("should fail: Expired signature", async function () {
        const [_owner, receiver] = await ethers.getSigners();
        const { contractInstance: exchangeInstance, generateManyToManySignature } = await deployExchangeFixture();
        const erc721Instance = await deployErc721Base("ERC721Simple", exchangeInstance);

        const signature = await generateManyToManySignature({
          account: receiver.address,
          params: {
            nonce,
            externalId,
            expiresAt: 1,
            referrer: constants.AddressZero,
          },
          items: [
            {
              tokenType: 2,
              token: erc721Instance.address,
              tokenId,
              amount,
            },
          ],
          price: [],
        });

        const tx1 = exchangeInstance.connect(receiver).claim(
          {
            nonce,
            externalId,
            expiresAt: 1,
            referrer: constants.AddressZero,
          },
          [
            {
              tokenType: 2,
              token: erc721Instance.address,
              tokenId,
              amount,
            },
          ],
          signature,
        );

        await expect(tx1).to.be.revertedWith("Exchange: Expired signature");
      });
    });

    describe("ERC1155", function () {
      it("should claim", async function () {
        const [_owner, receiver] = await ethers.getSigners();
        const { contractInstance: exchangeInstance, generateManyToManySignature } = await deployExchangeFixture();
        const erc1155Instance = await deployErc1155Base("ERC1155Simple", exchangeInstance);

        const signature = await generateManyToManySignature({
          account: receiver.address,
          params,
          items: [
            {
              tokenType: 4,
              token: erc1155Instance.address,
              tokenId,
              amount,
            },
          ],
          price: [],
        });

        const tx1 = exchangeInstance.connect(receiver).claim(
          params,
          [
            {
              tokenType: 4,
              token: erc1155Instance.address,
              tokenId,
              amount,
            },
          ],
          signature,
        );

        await expect(tx1)
          .to.emit(exchangeInstance, "Claim")
          .withNamedArgs({
            from: receiver.address,
            externalId,
            // items: [
            //   {
            //     tokenType: 4,
            //     token: erc1155Instance.address,
            //     tokenId,
            //     amount,
            //   },
            // ],
          })
          .to.emit(erc1155Instance, "TransferSingle")
          .withArgs(exchangeInstance.address, constants.AddressZero, receiver.address, tokenId, amount);

        const balance = await erc1155Instance.balanceOf(receiver.address, tokenId);
        expect(balance).to.equal(amount);
      });

      it("should fail: Expired signature", async function () {
        const [_owner, receiver] = await ethers.getSigners();
        const { contractInstance: exchangeInstance, generateManyToManySignature } = await deployExchangeFixture();
        const erc1155Instance = await deployErc1155Base("ERC1155Simple", exchangeInstance);

        const signature = await generateManyToManySignature({
          account: receiver.address,
          params: {
            nonce,
            externalId,
            expiresAt: 1,
            referrer: constants.AddressZero,
          },
          items: [
            {
              tokenType: 4,
              token: erc1155Instance.address,
              tokenId,
              amount,
            },
          ],
          price: [],
        });

        const tx1 = exchangeInstance.connect(receiver).claim(
          {
            nonce,
            externalId,
            expiresAt: 1,
            referrer: constants.AddressZero,
          },
          [
            {
              tokenType: 4,
              token: erc1155Instance.address,
              tokenId,
              amount,
            },
          ],
          signature,
        );

        await expect(tx1).to.be.revertedWith("Exchange: Expired signature");
      });
    });
  });
});
