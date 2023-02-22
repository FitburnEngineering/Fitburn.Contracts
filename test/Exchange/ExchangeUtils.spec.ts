import { expect } from "chai";
import { ethers } from "hardhat";

import { amount, baseTokenURI, royalty, tokenName, tokenSymbol } from "@gemunion/contracts-constants";
import { templateId, tokenId } from "../constants";
import { constants } from "ethers";

describe("ExchangeMock", function () {
  describe("spendFrom", function () {
    it("should spendFrom: ETH", async function () {
      const [owner] = await ethers.getSigners();

      const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
      const exchangeMockInstance = await exchangeMockFactory.deploy();

      const tx = await exchangeMockInstance.testSpendFrom(
        [
          {
            tokenType: 0,
            token: constants.AddressZero,
            tokenId: 0,
            amount,
          },
        ],
        owner.address,
        exchangeMockInstance.address,
        { value: amount },
      );

      await expect(tx).changeEtherBalances([owner, exchangeMockInstance], [-amount, amount]);
    });

    it("should spendFrom: ERC20 - non 1363", async function () {
      const [owner] = await ethers.getSigners();

      const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
      const exchangeMockInstance = await exchangeMockFactory.deploy();

      const erc20Factory = await ethers.getContractFactory("ERC20Mock");
      const erc20Instance = await erc20Factory.deploy(tokenName, tokenSymbol, amount);

      await erc20Instance.mint(owner.address, amount);

      await erc20Instance.approve(exchangeMockInstance.address, amount);

      const tx = await exchangeMockInstance.testSpendFrom(
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId: 0,
            amount,
          },
        ],
        owner.address,
        exchangeMockInstance.address,
      );

      await expect(tx).not.to.emit(exchangeMockInstance, "TransferReceived");

      await expect(tx).changeTokenBalances(erc20Instance, [owner, exchangeMockInstance], [-amount, amount]);
    });

    it("should spendFrom: ERC20 - 1363 => EOA Receiver", async function () {
      const [owner, receiver] = await ethers.getSigners();

      const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock"); // ERC1363 Receiver.
      const exchangeMockInstance = await exchangeMockFactory.deploy();

      const erc20Factory = await ethers.getContractFactory("ERC20Simple"); // extansion ERC1363, but not ERC1363 receiver
      const erc20Instance = await erc20Factory.deploy(tokenName, tokenSymbol, amount);

      await erc20Instance.mint(owner.address, amount);

      await erc20Instance.approve(exchangeMockInstance.address, amount);

      const tx = await exchangeMockInstance.testSpendFrom(
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId: 0,
            amount,
          },
        ],
        owner.address,
        receiver.address,
      );

      await expect(tx).changeTokenBalances(erc20Instance, [owner, receiver], [-amount, amount]);
    });

    it("should spendFrom: ERC20 - 1363 => Contract - ERC1363 Receiver", async function () {
      const [owner] = await ethers.getSigners();

      const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock"); // ERC1363 Receiver. Inherited from ExchangeUtils
      const exchangeMockInstance = await exchangeMockFactory.deploy();

      const erc20Factory = await ethers.getContractFactory("ERC20Simple"); // extansion ERC1363, but not ERC1363 receiver
      const erc20Instance = await erc20Factory.deploy(tokenName, tokenSymbol, amount);

      await erc20Instance.mint(owner.address, amount);

      await erc20Instance.approve(exchangeMockInstance.address, amount);

      const tx = await exchangeMockInstance.testSpendFrom(
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId: 0,
            amount,
          },
        ],
        owner.address,
        exchangeMockInstance.address,
      );

      await expect(tx).to.emit(exchangeMockInstance, "TransferReceived");

      await expect(tx).changeTokenBalances(erc20Instance, [owner, exchangeMockInstance], [-amount, amount]);
    });

    it("should fail spendFrom: ERC20 - 1363 => Contract - non ERC1363 Receiver", async function () {
      const [owner] = await ethers.getSigners();

      const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock"); // ERC1363 Receiver. Inherited from ExchangeUtils
      const exchangeMockInstance = await exchangeMockFactory.deploy();

      const erc20Factory = await ethers.getContractFactory("ERC20Simple"); // extansion ERC1363, but not ERC1363 receiver
      const erc20Instance = await erc20Factory.deploy(tokenName, tokenSymbol, amount);

      await erc20Instance.mint(owner.address, amount);

      await erc20Instance.approve(exchangeMockInstance.address, amount);

      const tx = exchangeMockInstance.testSpendFrom(
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId: 0,
            amount,
          },
        ],
        owner.address,
        erc20Instance.address,
      );

      await expect(tx).to.be.revertedWith("ERC1363: transfer to non ERC1363Receiver implementer");
    });

    it("should spendFrom: ERC721 => EOA", async function () {
      const [owner, receiver] = await ethers.getSigners();

      const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
      const exchangeMockInstance = await exchangeMockFactory.deploy();

      const erc721Factory = await ethers.getContractFactory("ERC721Simple");
      const erc721Instance = await erc721Factory.deploy(tokenName, tokenSymbol, royalty, baseTokenURI);

      await erc721Instance.mintCommon(owner.address, templateId);

      await erc721Instance.approve(exchangeMockInstance.address, templateId);

      await exchangeMockInstance.testSpendFrom(
        [
          {
            tokenType: 2,
            token: erc721Instance.address,
            tokenId: 1,
            amount,
          },
        ],
        owner.address,
        receiver.address,
      );

      const balance = await erc721Instance.balanceOf(receiver.address);
      expect(balance).to.equal(1);
    });

    it("should spendFrom: ERC721 => Contract - ERC721Holder", async function () {
      const [owner] = await ethers.getSigners();

      const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
      const exchangeMockInstance = await exchangeMockFactory.deploy();

      const erc721Factory = await ethers.getContractFactory("ERC721Simple");
      const erc721Instance = await erc721Factory.deploy(tokenName, tokenSymbol, royalty, baseTokenURI);

      await erc721Instance.mintCommon(owner.address, templateId);

      await erc721Instance.approve(exchangeMockInstance.address, templateId);

      await exchangeMockInstance.testSpendFrom(
        [
          {
            tokenType: 2,
            token: erc721Instance.address,
            tokenId: 1,
            amount,
          },
        ],
        owner.address,
        exchangeMockInstance.address,
      );

      const balance = await erc721Instance.balanceOf(exchangeMockInstance.address);
      expect(balance).to.equal(1);
    });

    it("should fail spendFrom: ERC721 => Contract - non ERC721Holder", async function () {
      const [owner] = await ethers.getSigners();

      const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
      const exchangeMockInstance = await exchangeMockFactory.deploy();

      const erc721Factory = await ethers.getContractFactory("ERC721Simple");
      const erc721Instance = await erc721Factory.deploy(tokenName, tokenSymbol, royalty, baseTokenURI);

      await erc721Instance.mintCommon(owner.address, templateId);

      await erc721Instance.approve(exchangeMockInstance.address, templateId);

      const tx = exchangeMockInstance.testSpendFrom(
        [
          {
            tokenType: 2,
            token: erc721Instance.address,
            tokenId: 1,
            amount,
          },
        ],
        owner.address,
        erc721Instance.address,
      );

      await expect(tx).to.be.revertedWith("ERC721: transfer to non ERC721Receiver implementer");

      // const balance = await erc721Instance.balanceOf(exchangeMockInstance.address);
      // expect(balance).to.equal(1);
    });
  });

  describe("spend", function () {
    it("should spend: ETH", async function () {
      const [owner] = await ethers.getSigners();

      const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
      const exchangeMockInstance = await exchangeMockFactory.deploy();

      await owner.sendTransaction({ to: exchangeMockInstance.address, value: amount });

      const tx = await exchangeMockInstance.testSpend(
        [
          {
            tokenType: 0,
            token: constants.AddressZero,
            tokenId,
            amount,
          },
        ],
        owner.address,
      );

      await expect(tx).changeEtherBalances([exchangeMockInstance, owner], [-amount, amount]);
    });

    it("should spend: ERC20 - non 1363", async function () {
      const [owner] = await ethers.getSigners();

      const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
      const exchangeMockInstance = await exchangeMockFactory.deploy();

      const erc20Factory = await ethers.getContractFactory("ERC20Mock");
      const erc20Instance = await erc20Factory.deploy(tokenName, tokenSymbol, amount);

      await erc20Instance.mint(exchangeMockInstance.address, amount);

      await erc20Instance.approve(exchangeMockInstance.address, amount);

      const tx = await exchangeMockInstance.testSpend(
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        owner.address,
      );

      await expect(tx).changeTokenBalances(erc20Instance, [exchangeMockInstance, owner], [-amount, amount]);
    });

    it("should spend: ERC20 1363 => EOA Receiver", async function () {
      const [owner] = await ethers.getSigners();

      const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
      const exchangeMockInstance = await exchangeMockFactory.deploy();

      const erc20Factory = await ethers.getContractFactory("ERC20Simple");
      const erc20Instance = await erc20Factory.deploy(tokenName, tokenSymbol, amount);

      await erc20Instance.mint(exchangeMockInstance.address, amount);

      await erc20Instance.approve(exchangeMockInstance.address, amount);

      const tx = await exchangeMockInstance.testSpend(
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        owner.address,
      );

      await expect(tx).changeTokenBalances(erc20Instance, [exchangeMockInstance, owner], [-amount, amount]);
    });

    it("should spend: ERC20 1363 => Contract - ERC1363 Receiver", async function () {
      // const [owner] = await ethers.getSigners();

      const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
      const exchangeMockInstance = await exchangeMockFactory.deploy();

      const erc20Factory = await ethers.getContractFactory("ERC20Simple");
      const erc20Instance = await erc20Factory.deploy(tokenName, tokenSymbol, amount);

      const erc1363ReceiverFactory = await ethers.getContractFactory("ExchangeMock");
      const erc1363ReceiverInstance = await erc1363ReceiverFactory.deploy();

      await erc20Instance.mint(exchangeMockInstance.address, amount);

      await erc20Instance.approve(exchangeMockInstance.address, amount);

      const tx = await exchangeMockInstance.testSpend(
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        erc1363ReceiverInstance.address,
      );

      await expect(tx).to.emit(erc1363ReceiverInstance, "TransferReceived");

      await expect(tx).changeTokenBalances(
        erc20Instance,
        [exchangeMockInstance, erc1363ReceiverInstance],
        [-amount, amount],
      );
    });

    it("should fail spend: ERC20 1363 => Contract - non ERC1363 Receiver", async function () {
      // const [owner] = await ethers.getSigners();

      const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
      const exchangeMockInstance = await exchangeMockFactory.deploy();

      const erc20Factory = await ethers.getContractFactory("ERC20Simple");
      const erc20Instance = await erc20Factory.deploy(tokenName, tokenSymbol, amount);

      await erc20Instance.mint(exchangeMockInstance.address, amount);

      await erc20Instance.approve(exchangeMockInstance.address, amount);

      const tx = exchangeMockInstance.testSpend(
        [
          {
            tokenType: 1,
            token: erc20Instance.address,
            tokenId,
            amount,
          },
        ],
        erc20Instance.address,
      );

      await expect(tx).to.be.revertedWith("ERC1363: transfer to non ERC1363Receiver implementer");
    });

    it("should spend: ERC721 => EOA Receiver", async function () {
      const [owner] = await ethers.getSigners();

      const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
      const exchangeMockInstance = await exchangeMockFactory.deploy();

      const erc721Factory = await ethers.getContractFactory("ERC721Simple");
      const erc721Instance = await erc721Factory.deploy(tokenName, tokenSymbol, royalty, baseTokenURI);

      await erc721Instance.mintCommon(exchangeMockInstance.address, templateId);

      await exchangeMockInstance.testSpend(
        [
          {
            tokenType: 2,
            token: erc721Instance.address,
            tokenId,
            amount,
          },
        ],
        owner.address,
      );

      const balance = await erc721Instance.balanceOf(owner.address);
      expect(balance).to.equal(1);
    });

    it("should spend: ERC721 => Contract - ERC721 Holder ", async function () {
      // const [owner] = await ethers.getSigners();

      const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
      const exchangeMockInstance = await exchangeMockFactory.deploy();

      const erc721Factory = await ethers.getContractFactory("ERC721Simple");
      const erc721Instance = await erc721Factory.deploy(tokenName, tokenSymbol, royalty, baseTokenURI);

      const erc721HolderFactory = await ethers.getContractFactory("ExchangeMock");
      const erc721HolderInstance = await erc721HolderFactory.deploy();

      await erc721Instance.mintCommon(exchangeMockInstance.address, templateId);

      await exchangeMockInstance.testSpend(
        [
          {
            tokenType: 2,
            token: erc721Instance.address,
            tokenId,
            amount,
          },
        ],
        erc721HolderInstance.address,
      );

      const balance = await erc721Instance.balanceOf(erc721HolderInstance.address);
      expect(balance).to.equal(1);
    });

    it("should fail spend: ERC721 => Contract - non ERC721 Holder", async function () {
      const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
      const exchangeMockInstance = await exchangeMockFactory.deploy();

      const erc721Factory = await ethers.getContractFactory("ERC721Simple");
      const erc721Instance = await erc721Factory.deploy(tokenName, tokenSymbol, royalty, baseTokenURI);

      await erc721Instance.mintCommon(exchangeMockInstance.address, templateId);

      const tx = exchangeMockInstance.testSpend(
        [
          {
            tokenType: 2,
            token: erc721Instance.address,
            tokenId,
            amount,
          },
        ],
        erc721Instance.address,
      );

      await expect(tx).to.be.revertedWith("ERC721: transfer to non ERC721Receiver implementer");
    });
  });
});
