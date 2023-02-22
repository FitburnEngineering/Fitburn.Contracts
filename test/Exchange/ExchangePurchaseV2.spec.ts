import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BigNumber, constants, utils } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { amount, decimals } from "@gemunion/contracts-constants";
import { params, tokenId } from "../constants";

import { deployErc721Base, deployExchangeFixture } from "./shared/fixture";
import { deployLinkVrfFixtureV2 } from "../shared/link";
import { LinkToken, VRFCoordinatorV2Mock, ERC721HardhatV2 } from "../../typechain-types";
import { deployERC20Bl } from "../ERC20/shared/fixtures";
import { randomRequestV2 } from "../shared/randomRequest";

describe("Exchange Purchase Random ChainLink V2", function () {
  let linkInstance: LinkToken;
  let vrfInstance: VRFCoordinatorV2Mock;

  before(async function () {
    await network.provider.send("hardhat_reset");

    // https://github.com/NomicFoundation/hardhat/issues/2980
    ({ linkInstance, vrfInstance } = await loadFixture(function exchange() {
      return deployLinkVrfFixtureV2();
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
        const erc721Instance: ERC721HardhatV2 = (await deployErc721Base(
          "ERC721HardhatV2",
          exchangeInstance,
        )) as ERC721HardhatV2;
        const erc20Instance = await deployERC20Bl("ERC20Blacklist");
        await erc20Instance.mint(receiver.address, constants.WeiPerEther.mul(amount));
        await erc20Instance.connect(receiver).approve(exchangeInstance.address, constants.WeiPerEther.mul(amount));

        // SETUP CHAIN_LINK V2 TO WORK
        const tx0 = vrfInstance.setConfig(3, 1000000, 1, 1, 1);
        await expect(tx0).to.emit(vrfInstance, "ConfigSet").withArgs(3, 1000000, 1, 1, 1);
        const tx = vrfInstance.createSubscription();
        await expect(tx).to.emit(vrfInstance, "SubscriptionCreated");
        const vrfEventFilter = vrfInstance.filters.SubscriptionCreated();
        const vrfEvents = await vrfInstance.queryFilter(vrfEventFilter);
        const subsriptionId = vrfEvents[0].args.subId;
        expect(subsriptionId).to.equal(1);
        const tx01 = linkInstance.transferAndCall(
          vrfInstance.address,
          BigNumber.from("10").mul(decimals),
          utils.hexZeroPad(ethers.utils.hexlify(~~subsriptionId.toString()), 32),
          // utils.hexZeroPad(ethers.utils.hexlify(BigNumber.from(1)), 32),
        );
        await expect(tx01).to.emit(vrfInstance, "SubscriptionFunded");
        const tx02 = vrfInstance.addConsumer(subsriptionId, erc721Instance.address);
        await expect(tx02)
          .to.emit(vrfInstance, "SubscriptionConsumerAdded")
          .withArgs(subsriptionId, erc721Instance.address);

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

        await randomRequestV2(erc721Instance, vrfInstance);

        const eventFilter = vrfInstance.filters.RandomWordsFulfilled();
        const events = await vrfInstance.queryFilter(eventFilter);

        expect(events[0].args.success).to.equal(true);

        const eventRndFilter = erc721Instance.filters.MintRandom();
        const eventsRnd = await erc721Instance.queryFilter(eventRndFilter);
        expect(eventsRnd[0].args.to).to.equal(receiver.address);

        const balance = await erc721Instance.balanceOf(receiver.address);
        expect(balance).to.equal(1);
      });
    });
  });
});
