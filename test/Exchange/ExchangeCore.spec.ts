import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BigNumber, constants, utils } from "ethers";
import { time } from "@openzeppelin/test-helpers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { amount, decimals, DEFAULT_ADMIN_ROLE, nonce, PAUSER_ROLE } from "@gemunion/contracts-constants";
import { shouldBehaveLikeAccessControl, shouldBehaveLikePausable } from "@gemunion/contracts-mocha";

import { externalId, params, tokenId } from "../constants";
import { wrapOneToManySignature } from "./shared/utils";
import { deployErc20Base, deployErc721Base, deployExchangeFixture } from "./shared/fixture";
import { deployLinkVrfFixture } from "../shared/link";
import { LinkToken } from "../../typechain-types";

describe("ExchangeCore", function () {
  let linkInstance: LinkToken;

  before(async function () {
    await network.provider.send("hardhat_reset");

    // https://github.com/NomicFoundation/hardhat/issues/2980
    ({ linkInstance } = await loadFixture(function exchange() {
      return deployLinkVrfFixture();
    }));
  });

  const factory = async () => {
    const { contractInstance } = await deployExchangeFixture();
    return contractInstance;
  };

  shouldBehaveLikeAccessControl(factory)(DEFAULT_ADMIN_ROLE, PAUSER_ROLE);
  shouldBehaveLikePausable(factory);

  describe("purchase", function () {
    it("should purchase, spend ERC20", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      await linkInstance.transfer(erc721Instance.address, BigNumber.from("1000").mul(decimals));

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

      const tx1 = exchangeInstance.connect(receiver).purchase(
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

      await expect(tx1).to.emit(exchangeInstance, "Purchase");
    });

    it("should purchase, spend ETH", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      await linkInstance.transfer(erc721Instance.address, BigNumber.from("1000").mul(decimals));

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
            amount: "123000000000000000",
            token: "0x0000000000000000000000000000000000000000",
            tokenId: "0",
            tokenType: 0,
          },
        ],
      });

      const tx1 = exchangeInstance.connect(receiver).purchase(
        params,
        {
          tokenType: 2,
          token: erc721Instance.address,
          tokenId,
          amount,
        },
        [
          {
            amount: "123000000000000000",
            token: "0x0000000000000000000000000000000000000000",
            tokenId: "0",
            tokenType: 0,
          },
        ],
        signature,
        { value: BigNumber.from("123000000000000000") },
      );

      await expect(tx1).to.emit(exchangeInstance, "Purchase");
    });

    it("should fail: duplicate mint", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      await linkInstance.transfer(erc721Instance.address, BigNumber.from("1000").mul(decimals));

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

      const tx1 = exchangeInstance.connect(receiver).purchase(
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

      await expect(tx1).to.emit(exchangeInstance, "Purchase");

      const tx2 = exchangeInstance.connect(receiver).purchase(
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
      await expect(tx2).to.be.revertedWith("Exchange: Expired signature");
    });

    it("should fail: wrong signer", async function () {
      const [_owner, receiver, stranger] = await ethers.getSigners();
      const { contractInstance: exchangeInstance } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const network = await ethers.provider.getNetwork();
      const generateOneToManySignature = wrapOneToManySignature(network, exchangeInstance, stranger);

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

      const tx1 = exchangeInstance.connect(receiver).purchase(
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

      await expect(tx1).to.be.revertedWith("Exchange: Wrong signer");
    });

    it("should fail: wrong signer role", async function () {
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

      const tx1 = exchangeInstance.connect(receiver).purchase(
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

      // ECDSA always returns an address
      await expect(tx1).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("should fail: wrong signature", async function () {
      const { contractInstance: exchangeInstance } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const tx = exchangeInstance.purchase(
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
        utils.formatBytes32String("signature"),
      );

      await expect(tx).to.be.revertedWith("ECDSA: invalid signature length");
    });

    it("should fail: expired signature", async function () {
      const [_owner, receiver] = await ethers.getSigners();
      const { contractInstance: exchangeInstance, generateOneToManySignature } = await deployExchangeFixture();
      const erc20Instance = await deployErc20Base("ERC20Simple", exchangeInstance);
      const erc721Instance = await deployErc721Base("ERC721Hardhat", exchangeInstance);

      const expiresAt = (await time.latest()).toString();
      const params = {
        nonce,
        externalId,
        expiresAt,
        referrer: constants.AddressZero,
      };
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

      const tx = exchangeInstance.connect(receiver).purchase(
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

      await expect(tx).to.be.revertedWith("Exchange: Expired signature");
    });
  });
});
