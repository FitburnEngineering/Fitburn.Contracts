import { expect } from "chai";
import { ethers, network } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { amount } from "@gemunion/contracts-constants";
import { params, subscriptionId, tokenId } from "../constants";

import { deployErc721Base, deployExchangeFixture } from "./shared/fixture";
import { deployLinkVrfFixture } from "../shared/link";
import { VRFCoordinatorMock } from "../../typechain-types";
import { deployBusd, deployERC20Bl, deployUsdt, deployWeth } from "../ERC20/shared/fixtures";
import { randomRequest } from "../shared/randomRequest";

describe("Exchange Purchase Random ChainLink V2", function () {
  let vrfInstance: VRFCoordinatorMock;

  describe("exchange", function () {
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

    describe("exchange purchase", function () {
      it("should purchase ERC721 Simple for ERC20", async function () {
        const [_owner, receiver] = await ethers.getSigners();
        const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
        const erc721Instance = await deployErc721Base("ERC721Simple", exchangeInstance);

        const erc20Instance = await deployERC20Bl("ERC20Blacklist");
        await erc20Instance.mint(receiver.address, amount);
        await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

        const erc20Allowance = await erc20Instance.allowance(receiver.address, exchangeInstance.address);
        expect(erc20Allowance).to.equal(amount);

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
              amount,
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
              amount,
            },
          ],
          signature,
        );

        await expect(tx1).to.emit(exchangeInstance, "Purchase");

        const balance = await erc721Instance.balanceOf(receiver.address);
        expect(balance).to.equal(1);
      });

      it("should purchase ERC721 Random for ERC20", async function () {
        const [_owner, receiver] = await ethers.getSigners();
        const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
        const erc721Instance = await deployErc721Base("ERC721BlacklistUpgradeableRentableRandom", exchangeInstance);

        const erc20Instance = await deployERC20Bl("ERC20Blacklist");
        await erc20Instance.mint(receiver.address, amount);
        await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

        const erc20Allowance = await erc20Instance.allowance(receiver.address, exchangeInstance.address);
        expect(erc20Allowance).to.equal(amount);

        const tx02 = vrfInstance.addConsumer(subscriptionId, erc721Instance.address);
        await expect(tx02)
          .to.emit(vrfInstance, "SubscriptionConsumerAdded")
          .withArgs(subscriptionId, erc721Instance.address);

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
              amount,
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
              amount,
            },
          ],
          signature,
        );

        await expect(tx1).to.emit(exchangeInstance, "Purchase");

        await randomRequest(erc721Instance, vrfInstance);

        const eventFilter = vrfInstance.filters.RandomWordsFulfilled();
        const events = await vrfInstance.queryFilter(eventFilter);

        expect(events[0].args.success).to.equal(true);

        const eventRndFilter = erc721Instance.filters.MintRandom();
        const eventsRnd = await erc721Instance.queryFilter(eventRndFilter);
        // @ts-ignore
        expect(eventsRnd[0].args.to).to.equal(receiver.address);

        const balance = await erc721Instance.balanceOf(receiver.address);
        expect(balance).to.equal(1);
      });

      it("should purchase ERC721 Random for USDT", async function () {
        const [_owner, receiver] = await ethers.getSigners();
        const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
        const erc721Instance = await deployErc721Base("ERC721BlacklistUpgradeableRentableRandom", exchangeInstance);

        const usdtInstance = await deployUsdt("TetherToken");
        await usdtInstance.transfer(receiver.address, amount);
        await usdtInstance.connect(receiver).approve(exchangeInstance.address, amount);

        const usdtAllowance = await usdtInstance.allowance(receiver.address, exchangeInstance.address);
        expect(usdtAllowance).to.equal(amount);

        // ADD CONSUMER TO VRFV2
        const tx02 = vrfInstance.addConsumer(subscriptionId, erc721Instance.address);
        await expect(tx02)
          .to.emit(vrfInstance, "SubscriptionConsumerAdded")
          .withArgs(subscriptionId, erc721Instance.address);

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
              token: usdtInstance.address,
              tokenId: 0,
              amount,
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
              token: usdtInstance.address,
              tokenId: 0,
              amount,
            },
          ],
          signature,
        );

        await expect(tx1).to.emit(exchangeInstance, "Purchase");
        await randomRequest(erc721Instance, vrfInstance);

        const eventFilter = vrfInstance.filters.RandomWordsFulfilled();
        const events = await vrfInstance.queryFilter(eventFilter);

        expect(events[0].args.success).to.equal(true);

        const eventRndFilter = erc721Instance.filters.MintRandom();
        const eventsRnd = await erc721Instance.queryFilter(eventRndFilter);
        // @ts-ignore
        expect(eventsRnd[0].args.to).to.equal(receiver.address);

        const balance = await erc721Instance.balanceOf(receiver.address);
        expect(balance).to.equal(1);
      });

      it("should purchase ERC721 Random for BUSD", async function () {
        const [_owner, receiver] = await ethers.getSigners();
        const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
        const erc721Instance = await deployErc721Base("ERC721BlacklistUpgradeableRentableRandom", exchangeInstance);

        const busdInstance = await deployBusd("BEP20Token");
        await busdInstance.transfer(receiver.address, amount);
        await busdInstance.connect(receiver).approve(exchangeInstance.address, amount);

        const busdAllowance = await busdInstance.allowance(receiver.address, exchangeInstance.address);
        expect(busdAllowance).to.equal(amount);

        // ADD CONSUMER TO VRFV2
        const tx02 = vrfInstance.addConsumer(subscriptionId, erc721Instance.address);
        await expect(tx02)
          .to.emit(vrfInstance, "SubscriptionConsumerAdded")
          .withArgs(subscriptionId, erc721Instance.address);

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
              token: busdInstance.address,
              tokenId: 0,
              amount,
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
              token: busdInstance.address,
              tokenId: 0,
              amount,
            },
          ],
          signature,
        );

        await expect(tx1).to.emit(exchangeInstance, "Purchase");
        await randomRequest(erc721Instance, vrfInstance);

        const eventFilter = vrfInstance.filters.RandomWordsFulfilled();
        const events = await vrfInstance.queryFilter(eventFilter);

        expect(events[0].args.success).to.equal(true);

        const eventRndFilter = erc721Instance.filters.MintRandom();
        const eventsRnd = await erc721Instance.queryFilter(eventRndFilter);
        // @ts-ignore
        expect(eventsRnd[0].args.to).to.equal(receiver.address);

        const balance = await erc721Instance.balanceOf(receiver.address);
        expect(balance).to.equal(1);
      });

      it("should purchase ERC721 Random for WETH", async function () {
        const [_owner, receiver] = await ethers.getSigners();
        const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
        const erc721Instance = await deployErc721Base("ERC721BlacklistUpgradeableRentableRandom", exchangeInstance);

        const wethInstance = await deployWeth("WETH9");
        await wethInstance.transfer(receiver.address, amount);
        await wethInstance.connect(receiver).approve(exchangeInstance.address, amount);

        const wethAllowance = await wethInstance.allowance(receiver.address, exchangeInstance.address);
        expect(wethAllowance).to.equal(amount);

        // ADD CONSUMER TO VRFV2
        const tx02 = vrfInstance.addConsumer(subscriptionId, erc721Instance.address);
        await expect(tx02)
          .to.emit(vrfInstance, "SubscriptionConsumerAdded")
          .withArgs(subscriptionId, erc721Instance.address);

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
              token: wethInstance.address,
              tokenId: 0,
              amount: 1,
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
              token: wethInstance.address,
              tokenId: 0,
              amount: 1,
            },
          ],
          signature,
          { gasLimit: 10000000000 }, // block gasLimit
        );

        await expect(tx1).to.emit(exchangeInstance, "Purchase");
        await randomRequest(erc721Instance, vrfInstance);

        const eventFilter = vrfInstance.filters.RandomWordsFulfilled();
        const events = await vrfInstance.queryFilter(eventFilter);

        expect(events[0].args.success).to.equal(true);

        const eventRndFilter = erc721Instance.filters.MintRandom();
        const eventsRnd = await erc721Instance.queryFilter(eventRndFilter);
        // @ts-ignore
        expect(eventsRnd[0].args.to).to.equal(receiver.address);

        const balance = await erc721Instance.balanceOf(receiver.address);
        expect(balance).to.equal(1);
      });

      it("should fail: InvalidConsumer", async function () {
        const [_owner, receiver] = await ethers.getSigners();
        const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
        const erc721Instance = await deployErc721Base("ERC721BlacklistUpgradeableRentableRandom", exchangeInstance);
        const erc20Instance = await deployERC20Bl("ERC20Blacklist");
        await erc20Instance.mint(receiver.address, amount);
        await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

        // DO NOT ADD SUBSCRIPTION CONSUMER FOR THIS TEST
        // const tx02 = vrfInstance.addConsumer(subId, erc721Instance.address);
        // await expect(tx02)
        //   .to.emit(vrfInstance, "SubscriptionConsumerAdded")
        //   .withArgs(subId, erc721Instance.address);

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
              amount,
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
              amount,
            },
          ],
          signature,
        );

        await expect(tx1).to.be.revertedWith(`InvalidConsumer`).withArgs(subscriptionId, erc721Instance.address);
      });
    });
  });

  // InvalidSubscription is not tested because we have to split Random extension first
  // InsufficientBalance is not tested because it is thrown by VRFCoordinator
});
