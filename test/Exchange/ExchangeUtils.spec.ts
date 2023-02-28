import { expect } from "chai";
import { ethers, network } from "hardhat";
import { constants } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import {
  deployErc1155NonReceiver,
  deployErc1155Receiver,
  deployErc20NonReceiver,
  deployErc20Receiver,
  deployErc721NonReceiver,
  deployErc721Receiver,
} from "@gemunion/contracts-mocks";
import { amount, MINTER_ROLE } from "@gemunion/contracts-constants";

import { VRFCoordinatorMock } from "../../typechain-types";
import { subscriptionId, templateId, tokenId } from "../constants";
import { deployContract } from "../shared/fixture";
import { deployLinkVrfFixture } from "../shared/link";
import { randomRequest } from "../shared/randomRequest";
import { deployERC721 } from "../ERC721/shared/fixtures";
import { deployERC1155 } from "../ERC1155/shared/fixtures";
import { deployERC20 } from "../ERC20/shared/fixtures";

describe("ExchangeUtils", function () {
  describe("spendFrom", function () {
    describe("ETH", function () {
      it("should spendFrom: ETH => SELF", async function () {
        const [owner] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const tx = exchangeMockInstance.testSpendFrom(
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

      it("should spendFrom: ETH => EOA", async function () {
        const [owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const tx = exchangeMockInstance.testSpendFrom(
          [
            {
              tokenType: 0,
              token: constants.AddressZero,
              tokenId: 0,
              amount,
            },
          ],
          owner.address,
          receiver.address,
          { value: amount },
        );

        await expect(tx).changeEtherBalances([owner, receiver], [-amount, amount]);
      });

      it("should spendFrom: ETH => EOA (wrong amount)", async function () {
        const [owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const tx = exchangeMockInstance.testSpendFrom(
          [
            {
              tokenType: 0,
              token: constants.AddressZero,
              tokenId: 0,
              amount,
            },
          ],
          owner.address,
          receiver.address,
          { value: 0 },
        );

        await expect(tx).to.be.revertedWith("Exchange: Wrong amount");
      });

      it("should spendFrom: ETH => Wallet", async function () {
        const [owner] = await ethers.getSigners();

        const walletInstance = await deployContract("Wallet");

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const tx = exchangeMockInstance.testSpendFrom(
          [
            {
              tokenType: 0,
              token: constants.AddressZero,
              tokenId: 0,
              amount,
            },
          ],
          owner.address,
          walletInstance.address,
          { value: amount },
        );

        await expect(tx).changeEtherBalances([owner, walletInstance], [-amount, amount]);
      });

      it("should spendFrom: ETH => Reverter", async function () {
        const [owner] = await ethers.getSigners();

        const reverterInstance = await deployContract("Reverter");

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const tx = exchangeMockInstance.testSpendFrom(
          [
            {
              tokenType: 0,
              token: constants.AddressZero,
              tokenId: 0,
              amount,
            },
          ],
          owner.address,
          reverterInstance.address,
          { value: amount },
        );

        await expect(tx).to.be.revertedWith("Address: unable to send value, recipient may have reverted");
      });
    });

    describe("ERC20", function () {
      it("should spendFrom: ERC20 => ERC1363 non Holder", async function () {
        const [owner] = await ethers.getSigners();

        const erc20NonReceiverInstance = await deployErc20NonReceiver();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc20Instance = await deployERC20("ERC20Mock");
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
          erc20NonReceiverInstance.address,
        );

        await expect(tx)
          .to.emit(erc20Instance, "Transfer")
          .withArgs(owner.address, erc20NonReceiverInstance.address, amount);
        await expect(tx).changeTokenBalances(erc20Instance, [owner, erc20NonReceiverInstance], [-amount, amount]);
      });

      it("should spendFrom: ERC20 => ERC1363 Holder", async function () {
        const [owner] = await ethers.getSigners();

        const erc20ReceiverInstance = await deployErc20Receiver();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc20Instance = await deployERC20("ERC20Mock");
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
          erc20ReceiverInstance.address,
        );

        await expect(tx)
          .to.emit(erc20Instance, "Transfer")
          .withArgs(owner.address, erc20ReceiverInstance.address, amount)
          .not.to.emit(erc20ReceiverInstance, "TransferReceived");
        await expect(tx).changeTokenBalances(erc20Instance, [owner, erc20ReceiverInstance], [-amount, amount]);
      });

      it("should spendFrom: ERC20 => EOA", async function () {
        const [owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock"); // ERC1363 Receiver.
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc20Instance = await deployERC20("ERC20Mock");
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
          receiver.address,
        );

        await expect(tx).to.emit(erc20Instance, "Transfer").withArgs(owner.address, receiver.address, amount);
        await expect(tx).changeTokenBalances(erc20Instance, [owner, receiver], [-amount, amount]);
      });

      it("should spendFrom: ERC20 => EOA (insufficient amount)", async function () {
        const [owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock"); // ERC1363 Receiver.
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc20Instance = await deployERC20("ERC20Mock");
        // await erc20Instance.mint(owner.address, amount);
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
          receiver.address,
        );

        await expect(tx).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      });

      it("should spendFrom: ERC20 => EOA (insufficient allowance)", async function () {
        const [owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock"); // ERC1363 Receiver.
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc20Instance = await deployERC20("ERC20Mock");
        await erc20Instance.mint(owner.address, amount);
        // await erc20Instance.approve(exchangeMockInstance.address, amount);

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
          receiver.address,
        );

        await expect(tx).to.be.revertedWith("ERC20: insufficient allowance");
      });

      it("should spendFrom: ERC1363 => ERC1363 non Holder", async function () {
        const [owner] = await ethers.getSigners();

        const erc20NonReceiverInstance = await deployErc20NonReceiver();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock"); // ERC1363 Receiver. Inherited from ExchangeUtils
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc20Instance = await deployERC20("ERC20Simple");
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
          erc20NonReceiverInstance.address,
        );

        await expect(tx)
          .to.emit(erc20Instance, "Transfer")
          .withArgs(owner.address, erc20NonReceiverInstance.address, amount);
        await expect(tx).changeTokenBalances(erc20Instance, [owner, erc20NonReceiverInstance], [-amount, amount]);
      });

      it("should spendFrom: ERC1363 => ERC1363 Holder", async function () {
        const [owner] = await ethers.getSigners();

        const erc20ReceiverInstance = await deployErc20Receiver();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc20Instance = await deployERC20("ERC20Simple");
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
          erc20ReceiverInstance.address,
        );

        await expect(tx)
          .to.emit(erc20Instance, "Transfer")
          .withArgs(owner.address, erc20ReceiverInstance.address, amount)
          .to.emit(erc20ReceiverInstance, "TransferReceived");
        await expect(tx).changeTokenBalances(erc20Instance, [owner, erc20ReceiverInstance], [-amount, amount]);
      });

      it("should spendFrom: ERC1363 => EOA", async function () {
        const [owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock"); // ERC1363 Receiver.
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc20Instance = await deployERC20("ERC20Simple");
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
          receiver.address,
        );

        await expect(tx).to.emit(erc20Instance, "Transfer").withArgs(owner.address, receiver.address, amount);
        await expect(tx).changeTokenBalances(erc20Instance, [owner, receiver], [-amount, amount]);
      });
    });

    describe("ERC721", function () {
      it("should spendFrom: ERC721 => non Holder", async function () {
        const [owner] = await ethers.getSigners();

        const erc721NonReceiverInstance = await deployErc721NonReceiver();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc721Instance = await deployERC721("ERC721Simple");
        await erc721Instance.mintCommon(owner.address, templateId);
        await erc721Instance.approve(exchangeMockInstance.address, templateId);

        const tx = exchangeMockInstance.testSpendFrom(
          [
            {
              tokenType: 2,
              token: erc721Instance.address,
              tokenId,
              amount,
            },
          ],
          owner.address,
          erc721NonReceiverInstance.address,
        );

        await expect(tx).to.be.revertedWith("ERC721: transfer to non ERC721Receiver implementer");
      });

      it("should spendFrom: ERC721 => Holder", async function () {
        const [owner] = await ethers.getSigners();

        const erc721ReceiverInstance = await deployErc721Receiver();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc721Instance = await deployERC721("ERC721Simple");
        await erc721Instance.mintCommon(owner.address, templateId);
        await erc721Instance.approve(exchangeMockInstance.address, templateId);

        const tx = exchangeMockInstance.testSpendFrom(
          [
            {
              tokenType: 2,
              token: erc721Instance.address,
              tokenId,
              amount,
            },
          ],
          owner.address,
          erc721ReceiverInstance.address,
        );

        await expect(tx)
          .to.emit(erc721Instance, "Transfer")
          .withArgs(owner.address, erc721ReceiverInstance.address, tokenId);

        const balance = await erc721Instance.balanceOf(erc721ReceiverInstance.address);
        expect(balance).to.equal(1);
      });

      it("should spendFrom: ERC721 => EOA", async function () {
        const [owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc721Instance = await deployERC721("ERC721Simple");
        await erc721Instance.mintCommon(owner.address, templateId);
        await erc721Instance.approve(exchangeMockInstance.address, templateId);

        const tx = exchangeMockInstance.testSpendFrom(
          [
            {
              tokenType: 2,
              token: erc721Instance.address,
              tokenId,
              amount,
            },
          ],
          owner.address,
          receiver.address,
        );

        await expect(tx).to.emit(erc721Instance, "Transfer").withArgs(owner.address, receiver.address, tokenId);

        const balance = await erc721Instance.balanceOf(receiver.address);
        expect(balance).to.equal(1);
      });

      it("should spendFrom: ERC721 => EOA (not an owner)", async function () {
        const [owner, receiver, stranger] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc721Instance = await deployERC721("ERC721Simple");
        await erc721Instance.mintCommon(stranger.address, templateId);

        const tx = exchangeMockInstance.testSpendFrom(
          [
            {
              tokenType: 2,
              token: erc721Instance.address,
              tokenId,
              amount,
            },
          ],
          owner.address,
          receiver.address,
        );

        await expect(tx).to.be.revertedWith("ERC721: caller is not token owner or approved");
      });

      it("should spendFrom: ERC721 => EOA (not approved)", async function () {
        const [owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc721Instance = await deployERC721("ERC721Simple");
        await erc721Instance.mintCommon(owner.address, templateId);
        // await erc721Instance.approve(exchangeMockInstance.address, templateId);

        const tx = exchangeMockInstance.testSpendFrom(
          [
            {
              tokenType: 2,
              token: erc721Instance.address,
              tokenId,
              amount,
            },
          ],
          owner.address,
          receiver.address,
        );

        await expect(tx).to.be.revertedWith("ERC721: caller is not token owner or approved");
      });
    });

    describe("ERC1155", function () {
      it("should spendFrom: ERC1155 => non Holder", async function () {
        const [owner] = await ethers.getSigners();

        const erc1155NonReceiverInstance = await deployErc1155NonReceiver();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc1155Instance = await deployERC1155("ERC1155Simple");
        await erc1155Instance.mint(owner.address, templateId, amount, "0x");
        await erc1155Instance.setApprovalForAll(exchangeMockInstance.address, true);

        const tx = exchangeMockInstance.testSpendFrom(
          [
            {
              tokenType: 4,
              token: erc1155Instance.address,
              tokenId,
              amount,
            },
          ],
          owner.address,
          erc1155NonReceiverInstance.address,
        );

        await expect(tx).to.be.revertedWith("ERC1155: transfer to non-ERC1155Receiver implementer");
      });

      it("should spendFrom: ERC1155 => Holder", async function () {
        const [owner] = await ethers.getSigners();

        const erc1155ReceiverInstance = await deployErc1155Receiver();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc1155Instance = await deployERC1155("ERC1155Simple");
        await erc1155Instance.mint(owner.address, templateId, amount, "0x");
        await erc1155Instance.setApprovalForAll(exchangeMockInstance.address, true);

        const tx = exchangeMockInstance.testSpendFrom(
          [
            {
              tokenType: 4,
              token: erc1155Instance.address,
              tokenId,
              amount,
            },
          ],
          owner.address,
          erc1155ReceiverInstance.address,
        );

        await expect(tx)
          .to.emit(erc1155Instance, "TransferSingle")
          .withArgs(exchangeMockInstance.address, owner.address, erc1155ReceiverInstance.address, tokenId, amount);

        const balance = await erc1155Instance.balanceOf(erc1155ReceiverInstance.address, templateId);
        expect(balance).to.equal(amount);
      });

      it("should spendFrom: ERC1155 => EOA", async function () {
        const [owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc1155Instance = await deployERC1155("ERC1155Simple");
        await erc1155Instance.mint(owner.address, templateId, amount, "0x");
        await erc1155Instance.setApprovalForAll(exchangeMockInstance.address, true);

        const tx = exchangeMockInstance.connect(receiver).testSpendFrom(
          [
            {
              tokenType: 4,
              token: erc1155Instance.address,
              tokenId,
              amount,
            },
          ],
          owner.address,
          receiver.address,
        );

        await expect(tx)
          .to.emit(erc1155Instance, "TransferSingle")
          .withArgs(exchangeMockInstance.address, owner.address, receiver.address, tokenId, amount);

        const balance = await erc1155Instance.balanceOf(receiver.address, 1);
        expect(balance).to.equal(amount);
      });

      it("should spendFrom: ERC1155 => EOA (insufficient amount)", async function () {
        const [owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc1155Instance = await deployERC1155("ERC1155Simple");
        // await erc1155Instance.mint(owner.address, templateId, amount, "0x");
        await erc1155Instance.setApprovalForAll(exchangeMockInstance.address, true);

        const tx = exchangeMockInstance.connect(receiver).testSpendFrom(
          [
            {
              tokenType: 4,
              token: erc1155Instance.address,
              tokenId,
              amount,
            },
          ],
          owner.address,
          receiver.address,
        );

        await expect(tx).to.be.revertedWith("ERC1155: insufficient balance for transfer");
      });

      it("should spendFrom: ERC1155 => EOA (insufficient allowance)", async function () {
        const [owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc1155Instance = await deployERC1155("ERC1155Simple");
        await erc1155Instance.mint(owner.address, templateId, amount, "0x");
        // await erc1155Instance.setApprovalForAll(exchangeMockInstance.address, true);

        const tx = exchangeMockInstance.connect(receiver).testSpendFrom(
          [
            {
              tokenType: 4,
              token: erc1155Instance.address,
              tokenId,
              amount,
            },
          ],
          owner.address,
          receiver.address,
        );

        await expect(tx).to.be.revertedWith("ERC1155: caller is not token owner or approved");
      });
    });
  });

  describe("spend", function () {
    describe("ETH", function () {
      it("should spend: ETH => EOA", async function () {
        const [owner] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        await owner.sendTransaction({ to: exchangeMockInstance.address, value: amount });

        const tx = exchangeMockInstance.testSpend(
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

      it("should spend: ETH => EOA (insufficient amount)", async function () {
        const [owner] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const tx = exchangeMockInstance.testSpend(
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

        await expect(tx).to.be.revertedWith("Address: insufficient balance");
      });
    });

    describe("ERC20", function () {
      it("should spend: ERC20 => ERC1363 non Holder", async function () {
        const erc20NonReceiverInstance = await deployErc20NonReceiver();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc20Instance = await deployERC20("ERC20Mock");
        await erc20Instance.mint(exchangeMockInstance.address, amount);

        const tx = exchangeMockInstance.testSpend(
          [
            {
              tokenType: 1,
              token: erc20Instance.address,
              tokenId,
              amount,
            },
          ],
          erc20NonReceiverInstance.address,
        );

        await expect(tx)
          .to.emit(erc20Instance, "Transfer")
          .withArgs(exchangeMockInstance.address, erc20NonReceiverInstance.address, amount);

        await expect(tx).changeTokenBalances(
          erc20Instance,
          [exchangeMockInstance, erc20NonReceiverInstance],
          [-amount, amount],
        );
      });

      it("should spend: ERC20 => ERC1363 Holder", async function () {
        const erc20ReceiverInstance = await deployErc20Receiver();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc20Instance = await deployERC20("ERC20Mock");
        await erc20Instance.mint(exchangeMockInstance.address, amount);

        const tx = exchangeMockInstance.testSpend(
          [
            {
              tokenType: 1,
              token: erc20Instance.address,
              tokenId,
              amount,
            },
          ],
          erc20ReceiverInstance.address,
        );

        await expect(tx)
          .to.emit(erc20Instance, "Transfer")
          .withArgs(exchangeMockInstance.address, erc20ReceiverInstance.address, amount)
          .not.to.emit(erc20ReceiverInstance, "TransferReceived");

        await expect(tx).changeTokenBalances(
          erc20Instance,
          [exchangeMockInstance, erc20ReceiverInstance],
          [-amount, amount],
        );
      });

      it("should spend: ERC20 => EOA", async function () {
        const [_owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc20Instance = await deployERC20("ERC20Mock");
        await erc20Instance.mint(exchangeMockInstance.address, amount);

        const tx = exchangeMockInstance.testSpend(
          [
            {
              tokenType: 1,
              token: erc20Instance.address,
              tokenId,
              amount,
            },
          ],
          receiver.address,
        );

        await expect(tx)
          .to.emit(erc20Instance, "Transfer")
          .withArgs(exchangeMockInstance.address, receiver.address, amount);
        await expect(tx).changeTokenBalances(erc20Instance, [exchangeMockInstance, receiver], [-amount, amount]);
      });

      it("should spend: ERC20 => EOA (insufficient amount)", async function () {
        const [owner] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc20Instance = await deployERC20("ERC20Mock");
        // await erc20Instance.mint(exchangeMockInstance.address, amount);

        const tx = exchangeMockInstance.testSpend(
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

        await expect(tx).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      });

      it("should spend: ERC1363 => ERC1363 non Holder", async function () {
        const erc20NonReceiverInstance = await deployErc20NonReceiver();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc20Instance = await deployERC20("ERC20Simple");
        await erc20Instance.mint(exchangeMockInstance.address, amount);

        const tx = exchangeMockInstance.testSpend(
          [
            {
              tokenType: 1,
              token: erc20Instance.address,
              tokenId,
              amount,
            },
          ],
          erc20NonReceiverInstance.address,
        );

        await expect(tx)
          .to.emit(erc20Instance, "Transfer")
          .withArgs(exchangeMockInstance.address, erc20NonReceiverInstance.address, amount);
        await expect(tx).changeTokenBalances(
          erc20Instance,
          [exchangeMockInstance, erc20NonReceiverInstance],
          [-amount, amount],
        );
      });

      it("should spend: ERC1363 => ERC1363 Holder", async function () {
        const erc20ReceiverInstance = await deployErc20Receiver();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc20Instance = await deployERC20("ERC20Simple");
        await erc20Instance.mint(exchangeMockInstance.address, amount);

        const tx = exchangeMockInstance.testSpend(
          [
            {
              tokenType: 1,
              token: erc20Instance.address,
              tokenId,
              amount,
            },
          ],
          erc20ReceiverInstance.address,
        );

        await expect(tx)
          .to.emit(erc20Instance, "Transfer")
          .withArgs(exchangeMockInstance.address, erc20ReceiverInstance.address, amount)
          .to.emit(erc20ReceiverInstance, "TransferReceived");

        await expect(tx).changeTokenBalances(
          erc20Instance,
          [exchangeMockInstance, erc20ReceiverInstance],
          [-amount, amount],
        );
      });

      it("should spend: ERC1363 => EOA", async function () {
        const [_owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc20Instance = await deployERC20("ERC20Simple");
        await erc20Instance.mint(exchangeMockInstance.address, amount);

        const tx = exchangeMockInstance.testSpend(
          [
            {
              tokenType: 1,
              token: erc20Instance.address,
              tokenId,
              amount,
            },
          ],
          receiver.address,
        );

        await expect(tx)
          .to.emit(erc20Instance, "Transfer")
          .withArgs(exchangeMockInstance.address, receiver.address, amount);
        await expect(tx).changeTokenBalances(erc20Instance, [exchangeMockInstance, receiver], [-amount, amount]);
      });
    });

    describe("ERC721", function () {
      it("should spend: ERC721 => non Holder", async function () {
        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc721Instance = await deployERC721("ERC721Simple");
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

      it("should spend: ERC721 => Holder ", async function () {
        // const [owner] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc721HolderFactory = await ethers.getContractFactory("ExchangeMock");
        const erc721HolderInstance = await erc721HolderFactory.deploy();

        const erc721Instance = await deployERC721("ERC721Simple");
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
          erc721HolderInstance.address,
        );

        await expect(tx)
          .to.emit(erc721Instance, "Transfer")
          .withArgs(exchangeMockInstance.address, erc721HolderInstance.address, tokenId);

        const balance = await erc721Instance.balanceOf(erc721HolderInstance.address);
        expect(balance).to.equal(1);
      });

      it("should spend: ERC721 => EOA", async function () {
        const [_owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc721Instance = await deployERC721("ERC721Simple");
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
          receiver.address,
        );

        await expect(tx)
          .to.emit(erc721Instance, "Transfer")
          .withArgs(exchangeMockInstance.address, receiver.address, tokenId);

        const balance = await erc721Instance.balanceOf(receiver.address);
        expect(balance).to.equal(1);
      });

      it("should spend: ERC721 => EOA (not an owner)", async function () {
        const [_owner, receiver, stranger] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc721Instance = await deployERC721("ERC721Simple");
        await erc721Instance.mintCommon(stranger.address, templateId);

        const tx = exchangeMockInstance.testSpend(
          [
            {
              tokenType: 2,
              token: erc721Instance.address,
              tokenId,
              amount,
            },
          ],
          receiver.address,
        );

        await expect(tx).to.be.revertedWith("ERC721: caller is not token owner or approved");
      });
    });

    describe("ERC1155", function () {
      it("should spend: ERC1155 => non Holder", async function () {
        const [_owner, receiver] = await ethers.getSigners();

        const erc1155NonReceiverInstance = await deployErc1155NonReceiver();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc1155Instance = await deployERC1155("ERC1155Simple");
        await erc1155Instance.mint(exchangeMockInstance.address, templateId, amount, "0x");

        const tx = exchangeMockInstance.connect(receiver).testSpend(
          [
            {
              tokenType: 4,
              token: erc1155Instance.address,
              tokenId,
              amount,
            },
          ],
          erc1155NonReceiverInstance.address,
        );

        await expect(tx).to.be.revertedWith("ERC1155: transfer to non-ERC1155Receiver implementer");
      });

      it("should spend: ERC1155 => Holder", async function () {
        const [_owner, receiver] = await ethers.getSigners();

        const erc1155ReceiverInstance = await deployErc1155Receiver();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc1155Instance = await deployERC1155("ERC1155Simple");
        await erc1155Instance.mint(exchangeMockInstance.address, templateId, amount, "0x");

        const tx = exchangeMockInstance.connect(receiver).testSpend(
          [
            {
              tokenType: 4,
              token: erc1155Instance.address,
              tokenId,
              amount,
            },
          ],
          erc1155ReceiverInstance.address,
        );

        await expect(tx)
          .to.emit(erc1155Instance, "TransferSingle")
          .withArgs(
            exchangeMockInstance.address,
            exchangeMockInstance.address,
            erc1155ReceiverInstance.address,
            tokenId,
            amount,
          );

        const balance = await erc1155Instance.balanceOf(erc1155ReceiverInstance.address, templateId);
        expect(balance).to.equal(amount);
      });

      it("should spend: ERC1155 => EOA", async function () {
        const [_owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc1155Instance = await deployERC1155("ERC1155Simple");
        await erc1155Instance.mint(exchangeMockInstance.address, templateId, amount, "0x");

        const tx = exchangeMockInstance.connect(receiver).testSpend(
          [
            {
              tokenType: 4,
              token: erc1155Instance.address,
              tokenId,
              amount,
            },
          ],
          receiver.address,
        );

        await expect(tx)
          .to.emit(erc1155Instance, "TransferSingle")
          .withArgs(exchangeMockInstance.address, exchangeMockInstance.address, receiver.address, tokenId, amount);

        const balance = await erc1155Instance.balanceOf(receiver.address, templateId);
        expect(balance).to.equal(amount);
      });

      it("should spend: ERC1155 => EOA (insufficient amount)", async function () {
        const [_owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc1155Instance = await deployERC1155("ERC1155Simple");
        // await erc1155Instance.mint(exchangeMockInstance.address, templateId, amount, "0x");

        const tx = exchangeMockInstance.connect(receiver).testSpend(
          [
            {
              tokenType: 4,
              token: erc1155Instance.address,
              tokenId,
              amount,
            },
          ],
          receiver.address,
        );

        await expect(tx).to.be.revertedWith("ERC1155: insufficient balance for transfer");
      });
    });
  });

  describe("acquire", function () {
    describe("ETH", function () {
      it("should mint: ETH => EOA", async function () {
        const [owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        await owner.sendTransaction({ to: exchangeMockInstance.address, value: amount });

        const tx = exchangeMockInstance.testAcquire(
          [
            {
              tokenType: 0,
              token: constants.AddressZero,
              tokenId,
              amount,
            },
          ],
          receiver.address,
        );

        await expect(tx).to.be.revertedWith("UnsupportedTokenType");
      });
    });

    describe("ERC20", function () {
      it("should mint: ERC20 => EOA", async function () {
        const [_owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc20Instance = await deployERC20("ERC20Simple");
        await erc20Instance.mint(exchangeMockInstance.address, amount);

        const tx = exchangeMockInstance.testAcquire(
          [
            {
              tokenType: 1,
              token: erc20Instance.address,
              tokenId,
              amount,
            },
          ],
          receiver.address,
        );

        await expect(tx).to.be.revertedWith("UnsupportedTokenType");
      });
    });

    describe("ERC721", function () {
      let vrfInstance: VRFCoordinatorMock;

      before(async function () {
        await network.provider.send("hardhat_reset");

        // https://github.com/NomicFoundation/hardhat/issues/2980
        ({ vrfInstance } = await loadFixture(function staking() {
          return deployLinkVrfFixture();
        }));
      });

      it("should mint: ERC721 => EOA (Simple)", async function () {
        const [_owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc721Instance = await deployERC721("ERC721Simple");
        await erc721Instance.grantRole(MINTER_ROLE, exchangeMockInstance.address);

        const tx = exchangeMockInstance.testAcquire(
          [
            {
              tokenType: 2,
              token: erc721Instance.address,
              tokenId: templateId,
              amount,
            },
          ],
          receiver.address,
        );

        await expect(tx).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

        const balance = await erc721Instance.balanceOf(receiver.address);
        expect(balance).to.equal(1);
      });

      it("should mint: ERC721 => EOA (Random)", async function () {
        const [_owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc721Instance = await deployERC721("ERC721BlacklistUpgradeableRentableRandom");
        await erc721Instance.grantRole(MINTER_ROLE, exchangeMockInstance.address);

        await erc721Instance.grantRole(MINTER_ROLE, vrfInstance.address);
        await vrfInstance.addConsumer(subscriptionId, erc721Instance.address);

        await exchangeMockInstance.testAcquire(
          [
            {
              tokenType: 2,
              token: erc721Instance.address,
              tokenId: templateId,
              amount,
            },
          ],
          receiver.address,
        );

        await randomRequest(erc721Instance, vrfInstance);

        // await expect(tx).to.emit(erc721Instance, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);

        const balance = await erc721Instance.balanceOf(receiver.address);
        expect(balance).to.equal(1);
      });
    });

    describe("ERC1155", function () {
      it("should mint: ERC1155 => EOA", async function () {
        const [_owner, receiver] = await ethers.getSigners();

        const exchangeMockFactory = await ethers.getContractFactory("ExchangeMock");
        const exchangeMockInstance = await exchangeMockFactory.deploy();

        const erc1155Instance = await deployERC1155("ERC1155Simple");
        await erc1155Instance.grantRole(MINTER_ROLE, exchangeMockInstance.address);

        const tx = exchangeMockInstance.testAcquire(
          [
            {
              tokenType: 4,
              token: erc1155Instance.address,
              tokenId,
              amount,
            },
          ],
          receiver.address,
        );

        await expect(tx)
          .to.emit(erc1155Instance, "TransferSingle")
          .withArgs(exchangeMockInstance.address, constants.AddressZero, receiver.address, tokenId, amount);

        const balance = await erc1155Instance.balanceOf(receiver.address, tokenId);
        expect(balance).to.equal(amount);
      });
    });
  });
});
