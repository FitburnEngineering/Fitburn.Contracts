import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, constants } from "ethers";

import { amount } from "@gemunion/contracts-constants";

import { externalId, params, templateId, tokenId } from "../constants";
import { deployErc20Base, deployErc721Base, deployExchangeFixture } from "./shared/fixture";

describe("ExchangeGrade", function () {
  describe("earnUpgrade", function () {
    it("should update metadata", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const tx1 = erc721Instance.mintCommon(receiver.address, templateId);

      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      await erc20Instance.mint(receiver.address, amount);
      await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).earnUpgrade(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2)
        .to.emit(exchangeInstance, "EarnUpgrade")
        .withNamedArgs({
          from: receiver.address,
          externalId,
          item: {
            tokenType: 2,
            token: erc721Instance.address,
            tokenId: BigNumber.from(tokenId),
            amount: BigNumber.from(amount),
          },
          price: [
            {
              tokenType: 1,
              token: erc20Instance.address,
              tokenId: BigNumber.from(tokenId),
              amount: BigNumber.from(amount),
            },
          ],
        })
        .to.emit(erc721Instance, "EarnUpgraded")
        .withArgs(exchangeInstance.address, tokenId, 1);
    });

    it("should fail: insufficient allowance", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const tx1 = erc721Instance.mintCommon(receiver.address, templateId);

      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      await erc20Instance.mint(receiver.address, amount);
      // await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).earnUpgrade(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("should fail: transfer amount exceeds balance", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const tx1 = erc721Instance.mintCommon(receiver.address, templateId);

      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      // await erc20Instance.mint(receiver.address, amount);
      await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).earnUpgrade(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },

        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("should fail: invalid token ID", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      await erc20Instance.mint(receiver.address, amount);
      await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).earnUpgrade(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },

        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2).to.be.revertedWith("ERC721: invalid token ID");
    });
  });

  describe("timeUpgrade", function () {
    it("should update metadata", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const tx1 = erc721Instance.mintCommon(receiver.address, templateId);

      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      await erc20Instance.mint(receiver.address, amount);
      await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).timeUpgrade(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2)
        .to.emit(exchangeInstance, "TimeUpgrade")
        .withNamedArgs({
          from: receiver.address,
          externalId,
          item: {
            tokenType: 2,
            token: erc721Instance.address,
            tokenId: BigNumber.from(tokenId),
            amount: BigNumber.from(amount),
          },
          price: [
            {
              tokenType: 1,
              token: erc20Instance.address,
              tokenId: BigNumber.from(tokenId),
              amount: BigNumber.from(amount),
            },
          ],
        })
        .to.emit(erc721Instance, "TimeUpgraded")
        .withArgs(exchangeInstance.address, tokenId, 1);
    });

    it("should fail: insufficient allowance", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const tx1 = erc721Instance.mintCommon(receiver.address, templateId);

      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      await erc20Instance.mint(receiver.address, amount);
      // await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).timeUpgrade(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("should fail: transfer amount exceeds balance", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const tx1 = erc721Instance.mintCommon(receiver.address, templateId);

      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      // await erc20Instance.mint(receiver.address, amount);
      await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).timeUpgrade(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },

        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("should fail: invalid token ID", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      await erc20Instance.mint(receiver.address, amount);
      await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).timeUpgrade(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },

        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2).to.be.revertedWith("ERC721: invalid token ID");
    });
  });

  describe("earnBoost", function () {
    it("should update metadata", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const tx1 = erc721Instance.mintCommon(receiver.address, templateId);

      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      await erc20Instance.mint(receiver.address, amount);
      await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).earnBoost(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2)
        .to.emit(exchangeInstance, "EarnBoost")
        .withNamedArgs({
          from: receiver.address,
          externalId,
          item: {
            tokenType: 2,
            token: erc721Instance.address,
            tokenId: BigNumber.from(tokenId),
            amount: BigNumber.from(amount),
          },
          price: [
            {
              tokenType: 1,
              token: erc20Instance.address,
              tokenId: BigNumber.from(tokenId),
              amount: BigNumber.from(amount),
            },
          ],
        });
    });

    it("should fail: insufficient allowance", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const tx1 = erc721Instance.mintCommon(receiver.address, templateId);

      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      await erc20Instance.mint(receiver.address, amount);
      // await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).earnBoost(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("should fail: transfer amount exceeds balance", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const tx1 = erc721Instance.mintCommon(receiver.address, templateId);

      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      // await erc20Instance.mint(receiver.address, amount);
      await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).earnBoost(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },

        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("timeBoost", function () {
    it("should update metadata", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const tx1 = erc721Instance.mintCommon(receiver.address, templateId);

      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      await erc20Instance.mint(receiver.address, amount);
      await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).timeBoost(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2)
        .to.emit(exchangeInstance, "TimeBoost")
        .withNamedArgs({
          from: receiver.address,
          externalId,
          item: {
            tokenType: 2,
            token: erc721Instance.address,
            tokenId: BigNumber.from(tokenId),
            amount: BigNumber.from(amount),
          },
          price: [
            {
              tokenType: 1,
              token: erc20Instance.address,
              tokenId: BigNumber.from(tokenId),
              amount: BigNumber.from(amount),
            },
          ],
        });
    });

    it("should fail: insufficient allowance", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const tx1 = erc721Instance.mintCommon(receiver.address, templateId);

      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      await erc20Instance.mint(receiver.address, amount);
      // await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).timeBoost(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("should fail: transfer amount exceeds balance", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const tx1 = erc721Instance.mintCommon(receiver.address, templateId);

      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      // await erc20Instance.mint(receiver.address, amount);
      await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).timeBoost(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },

        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("wash", function () {
    it("should update metadata", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const tx1 = erc721Instance.mintCommon(receiver.address, templateId);

      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      await erc20Instance.mint(receiver.address, amount);
      await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).wash(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2)
        .to.emit(exchangeInstance, "Wash")
        .withNamedArgs({
          from: receiver.address,
          externalId,
          item: {
            tokenType: 2,
            token: erc721Instance.address,
            tokenId: BigNumber.from(tokenId),
            amount: BigNumber.from(amount),
          },
          price: [
            {
              tokenType: 1,
              token: erc20Instance.address,
              tokenId: BigNumber.from(tokenId),
              amount: BigNumber.from(amount),
            },
          ],
        });
    });

    it("should fail: insufficient allowance", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const tx1 = erc721Instance.mintCommon(receiver.address, templateId);

      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      await erc20Instance.mint(receiver.address, amount);
      // await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).wash(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("should fail: transfer amount exceeds balance", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const tx1 = erc721Instance.mintCommon(receiver.address, templateId);

      await expect(tx1).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

      const signature = await generateOneToManySignature({
        account: receiver.address,
        params,
        item: {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        price: [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
      });

      // await erc20Instance.mint(receiver.address, amount);
      await erc20Instance.connect(receiver).approve(exchangeInstance.address, amount);

      const tx2 = exchangeInstance.connect(receiver).wash(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },

        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        signature,
      );

      await expect(tx2).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });
});
