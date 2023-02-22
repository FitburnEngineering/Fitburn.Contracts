import { expect, use } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers, network, waffle, web3 } from "hardhat";
import { BigNumber, constants, utils } from "ethers";
import { time } from "@openzeppelin/test-helpers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { shouldBehaveLikeAccessControl, shouldBehaveLikePausable } from "@gemunion/contracts-mocha";
import { amount, decimals, DEFAULT_ADMIN_ROLE, MINTER_ROLE, PAUSER_ROLE } from "@gemunion/contracts-constants";

import { LinkToken, VRFCoordinatorMock } from "../../../typechain-types";
import { templateId } from "../../constants";
import { IRule } from "./interface/staking";
import { randomRequest } from "../../shared/randomRequest";
import { deployLinkVrfFixture } from "../../shared/link";
import { deployStaking } from "./shared/fixture";
import { deployERC20 } from "../../ERC20/shared/fixtures";
import { deployERC721 } from "../../ERC721/shared/fixtures";

use(solidity);

describe("Staking", function () {
  const period = 300;
  const penalty = 0;
  const cycles = 2;

  // TODO use @types
  const templateKey = "0xe2db241bb2fe321e8c078a17b0902f9429cee78d5f3486725d73d0356e97c842";

  let linkInstance: LinkToken;
  let vrfInstance: VRFCoordinatorMock;

  const factory = () => deployStaking();
  const erc20Factory = () => deployERC20("ERC20Simple", { amount: utils.parseEther("200000") });
  const erc721Factory = (name: string) => deployERC721(name);

  shouldBehaveLikeAccessControl(factory)(DEFAULT_ADMIN_ROLE, PAUSER_ROLE);
  shouldBehaveLikePausable(factory);

  before(async function () {
    await network.provider.send("hardhat_reset");

    // https://github.com/NomicFoundation/hardhat/issues/2980
    ({ linkInstance, vrfInstance } = await loadFixture(function staking() {
      return deployLinkVrfFixture();
    }));
  });

  after(async function () {
    await network.provider.send("hardhat_reset");
  });

  describe("setRule", function () {
    it("should fail for wrong role", async function () {
      const [_owner, receiver] = await ethers.getSigners();

      const stakingInstance = await factory();
      const erc721RandomInstance = await erc721Factory("ERC721Random");

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 0, // NATIVE
          token: constants.AddressZero,
          tokenId: 0,
          amount,
        },
        reward: {
          tokenType: 2, // ERC721
          token: erc721RandomInstance.address,
          tokenId: 1,
          amount: 0,
        },
        content: [],
        period,
        penalty,
        recurrent: false,
        active: true,
      };

      const tx = stakingInstance.connect(receiver).setRules([stakeRule]);

      await expect(tx).to.be.revertedWith(
        `AccessControl: account ${receiver.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
      );
    });

    it("should fail edit when Rule not exist", async function () {
      const stakingInstance = await factory();
      const erc721RandomInstance = await erc721Factory("ERC721Random");

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 0, // NATIVE
          token: constants.AddressZero,
          tokenId: 0,
          amount,
        },
        reward: {
          tokenType: 2, // ERC721
          token: erc721RandomInstance.address,
          tokenId: 1,
          amount: 0,
        },
        content: [],
        period,
        penalty,
        recurrent: false,
        active: true,
      };

      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");

      const tx1 = stakingInstance.updateRule(2, false);
      await expect(tx1).to.be.revertedWith("Staking: rule does not exist");
    });

    it("should set one Rule", async function () {
      const stakingInstance = await factory();
      const erc721RandomInstance = await erc721Factory("ERC721Random");

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 0, // NATIVE
          token: constants.AddressZero,
          tokenId: 0,
          amount,
        },
        reward: {
          tokenType: 2, // ERC721
          token: erc721RandomInstance.address,
          tokenId: 1,
          amount: 0,
        },
        content: [],
        period,
        penalty,
        recurrent: false,
        active: true,
      };

      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");
    });

    it("should set multiple Rules", async function () {
      const stakingInstance = await factory();
      const erc721SimpleInstance = await erc721Factory("ERC721Simple");
      const erc721RandomInstance = await erc721Factory("ERC721Random");

      const stakeRule1: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 0, // NATIVE
          token: constants.AddressZero,
          tokenId: 0,
          amount,
        },
        reward: {
          tokenType: 2, // ERC721
          token: erc721RandomInstance.address,
          tokenId: 1,
          amount: 0,
        },
        content: [],
        period,
        penalty,
        recurrent: false,
        active: true,
      };

      const stakeRule2: IRule = {
        externalId: 2,
        deposit: {
          tokenType: 0, // NATIVE
          token: constants.AddressZero,
          tokenId: 0,
          amount,
        },
        reward: {
          tokenType: 2, // ERC721
          token: erc721SimpleInstance.address,
          tokenId: 1,
          amount: 0,
        },
        content: [
          {
            tokenType: 2, // ERC721
            token: erc721SimpleInstance.address,
            tokenId: 1,
            amount: 0,
          },
        ],
        period,
        penalty,
        recurrent: false,
        active: true,
      };

      const tx = stakingInstance.setRules([stakeRule1, stakeRule2]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");
      // todo count Events?
    });

    it("should edit Rule", async function () {
      const stakingInstance = await factory();
      const erc721RandomInstance = await erc721Factory("ERC721Random");

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 0, // NATIVE
          token: constants.AddressZero,
          tokenId: 0,
          amount,
        },
        reward: {
          tokenType: 2, // ERC721
          token: erc721RandomInstance.address,
          tokenId: 1,
          amount: 0,
        },
        content: [],
        period,
        penalty,
        recurrent: false,
        active: true,
      };

      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");

      const tx1 = stakingInstance.updateRule(1, false);
      await expect(tx1).to.emit(stakingInstance, "RuleUpdated").withArgs(1, false);
    });
  });

  describe("Stake", function () {
    it("should fail for not existing rule", async function () {
      const stakingInstance = await factory();
      const erc721RandomInstance = await erc721Factory("ERC721Random");

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 0, // NATIVE
          token: constants.AddressZero,
          tokenId: 0,
          amount,
        },
        reward: {
          tokenType: 2, // ERC721
          token: erc721RandomInstance.address,
          tokenId: 1,
          amount: 0,
        },
        content: [],
        period,
        penalty,
        recurrent: false,
        active: true,
      };

      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");

      const tx1 = stakingInstance.deposit(2, 1, { value: 100 });
      await expect(tx1).to.be.revertedWith("Staking: rule doesn't exist");
    });

    it("should fail for not active rule", async function () {
      const stakingInstance = await factory();
      const erc721RandomInstance = await erc721Factory("ERC721Random");

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 0, // NATIVE
          token: constants.AddressZero,
          tokenId: 0,
          amount,
        },
        reward: {
          tokenType: 2, // ERC721
          token: erc721RandomInstance.address,
          tokenId: 1,
          amount: 0,
        },
        content: [],
        period,
        penalty,
        recurrent: false,
        active: false,
      };

      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");

      const tx1 = stakingInstance.deposit(1, 1, { value: amount });
      await expect(tx1).to.be.revertedWith("Staking: rule doesn't active");
    });

    it("should fail for wrong pay amount", async function () {
      const stakingInstance = await factory();
      const erc721RandomInstance = await erc721Factory("ERC721Random");

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 0, // NATIVE
          token: constants.AddressZero,
          tokenId: 0,
          amount,
        },
        reward: {
          tokenType: 2, // ERC721
          token: erc721RandomInstance.address,
          tokenId: 1,
          amount: 0,
        },
        content: [],
        period,
        penalty,
        recurrent: false,
        active: true,
      };

      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");

      const tx1 = stakingInstance.deposit(1, 1, { value: 100 });
      await expect(tx1).to.be.revertedWith("Staking: wrong amount");
    });

    it("should fail for limit exceed", async function () {
      const stakingInstance = await factory();
      const erc721RandomInstance = await erc721Factory("ERC721Random");

      await stakingInstance.setMaxStake(1);

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 0, // NATIVE
          token: constants.AddressZero,
          tokenId: 0,
          amount,
        },
        reward: {
          tokenType: 2, // ERC721
          token: erc721RandomInstance.address,
          tokenId: 1,
          amount: 0,
        },
        content: [],
        period,
        penalty,
        recurrent: false,
        active: true,
      };

      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");

      const tx1 = stakingInstance.deposit(1, 1, { value: amount });
      await expect(tx1).to.not.be.reverted;

      const tx2 = stakingInstance.deposit(1, 1, { value: amount });
      await expect(tx2).to.be.revertedWith("Staking: stake limit exceeded");
    });
  });

  describe("Reward", function () {
    it("should fail for wrong staking id", async function () {
      const [_owner, receiver] = await ethers.getSigners();

      const stakingInstance = await factory();

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 0, // NATIVE
          token: constants.AddressZero,
          tokenId: 0,
          amount,
        },
        reward: {
          tokenType: 0, // NATIVE
          token: constants.AddressZero,
          tokenId: 0,
          amount,
        },
        content: [],
        period, // 60 sec
        penalty,
        recurrent: false,
        active: true,
      };

      // SET RULE
      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");
      // STAKE
      const tx1 = stakingInstance.connect(receiver).deposit(1, 0, { value: amount });
      await expect(tx1).to.emit(stakingInstance, "StakingStart");

      const stakeBalance = await waffle.provider.getBalance(stakingInstance.address);
      expect(stakeBalance).to.equal(amount);
      // TIME
      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(period * cycles)));
      // REWARD
      await stakingInstance.fundEth({ value: utils.parseEther("1.0") });
      const tx2 = stakingInstance.connect(receiver).receiveReward(2, true, true);
      await expect(tx2).to.be.revertedWith("Staking: wrong staking id");
    });

    it("should fail for not an owner", async function () {
      const [_owner, receiver] = await ethers.getSigners();

      const stakingInstance = await factory();

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 0, // NATIVE
          token: constants.AddressZero,
          tokenId: 0,
          amount,
        },
        reward: {
          tokenType: 0, // NATIVE
          token: constants.AddressZero,
          tokenId: 0,
          amount,
        },
        content: [],
        period, // 60 sec
        penalty,
        recurrent: false,
        active: true,
      };

      // SET RULE
      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");
      // STAKE
      const tx1 = stakingInstance.connect(receiver).deposit(1, 0, { value: amount });
      await expect(tx1).to.emit(stakingInstance, "StakingStart");
      const stakeBalance = await waffle.provider.getBalance(stakingInstance.address);
      expect(stakeBalance).to.equal(amount);
      // TIME
      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(period * cycles)));
      // REWARD
      await stakingInstance.fundEth({ value: utils.parseEther("1.0") });
      const tx2 = stakingInstance.receiveReward(1, true, true);
      await expect(tx2).to.be.revertedWith("Staking: not an owner");
    });

    it("should fail for withdrawn already", async function () {
      const [_owner, receiver] = await ethers.getSigners();

      const stakingInstance = await factory();

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 0, // NATIVE
          token: constants.AddressZero,
          tokenId: 0,
          amount,
        },
        reward: {
          tokenType: 0, // NATIVE
          token: constants.AddressZero,
          tokenId: 0,
          amount,
        },
        content: [],
        period, // 60 sec
        penalty,
        recurrent: false,
        active: true,
      };

      // SET RULE
      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");
      // STAKE
      const tx1 = stakingInstance.connect(receiver).deposit(1, 0, { value: amount });
      await expect(tx1).to.emit(stakingInstance, "StakingStart");
      const stakeBalance = await waffle.provider.getBalance(stakingInstance.address);
      expect(stakeBalance).to.equal(amount);
      // TIME
      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(period * cycles)));
      // REWARD
      await stakingInstance.fundEth({ value: utils.parseEther("1.0") });
      const tx2 = await stakingInstance.connect(receiver).receiveReward(1, true, true);
      await expect(tx2)
        .to.emit(stakingInstance, "StakingWithdraw")
        .to.emit(stakingInstance, "StakingFinish")
        .to.changeEtherBalance(receiver, amount * 2 + amount);

      const tx3 = stakingInstance.connect(receiver).receiveReward(1, true, true);
      await expect(tx3).to.be.revertedWith("Staking: deposit withdrawn already");
    });

    it("should fail deposit for wrong tokenId", async function () {
      const [owner] = await ethers.getSigners();

      const stakingInstance = await factory();
      const erc721RandomInstance = await erc721Factory("ERC721Random");

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 2, // ERC721
          token: erc721RandomInstance.address,
          tokenId: 1,
          amount: 0,
        },
        reward: {
          tokenType: 2, // ERC721
          token: erc721RandomInstance.address,
          tokenId: 1,
          amount: 0,
        },
        content: [],
        period,
        penalty,
        recurrent: false,
        active: true,
      };

      // SET RULE
      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");
      // STAKE
      await erc721RandomInstance.mintCommon(owner.address, templateId);
      await erc721RandomInstance.mintCommon(owner.address, templateId + 1);
      const balance = await erc721RandomInstance.balanceOf(owner.address);
      expect(balance).to.equal(2);
      expect(await erc721RandomInstance.getRecordFieldValue(1, templateKey)).to.equal(templateId);
      expect(await erc721RandomInstance.getRecordFieldValue(2, templateKey)).to.equal(templateId + 1);
      // APPROVE
      await erc721RandomInstance.approve(stakingInstance.address, 1);
      await erc721RandomInstance.approve(stakingInstance.address, 2);
      // DEPOSIT
      const tx1 = stakingInstance.deposit(1, 1 + 1);
      await expect(tx1).to.be.revertedWith("Staking: wrong deposit token templateID");
    });
  });

  describe("Permutations", function () {
    it("should stake ERC20 & receive ERC20", async function () {
      const [owner] = await ethers.getSigners();

      const stakingInstance = await factory();
      const erc20Instance = await erc20Factory();

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 1, // ERC20
          token: erc20Instance.address,
          tokenId: 0,
          amount,
        },
        reward: {
          tokenType: 1, // ERC20
          token: erc20Instance.address,
          tokenId: 0,
          amount,
        },
        content: [],
        period,
        penalty,
        recurrent: false,
        active: true,
      };

      // SET RULE
      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");
      // STAKE
      await erc20Instance.mint(owner.address, amount);
      let balance = await erc20Instance.balanceOf(owner.address);
      expect(balance).to.equal(amount);
      await erc20Instance.approve(stakingInstance.address, amount);
      const tx1 = stakingInstance.deposit(1, 0);
      await expect(tx1).to.emit(stakingInstance, "StakingStart");
      await expect(tx1).to.emit(erc20Instance, "Transfer");
      balance = await erc20Instance.balanceOf(owner.address);
      expect(balance).to.equal(0);
      // TIME
      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(period * cycles)));
      // REWARD
      await erc20Instance.mint(stakingInstance.address, amount * cycles);
      const tx2 = await stakingInstance.receiveReward(1, true, true);
      await expect(tx2).to.emit(stakingInstance, "StakingWithdraw");
      await expect(tx2).to.emit(stakingInstance, "StakingFinish");
      balance = await erc20Instance.balanceOf(owner.address);
      expect(balance).to.equal(amount * cycles + amount);
    });

    it("should stake ERC20 & receive ERC721 Random", async function () {
      const [owner] = await ethers.getSigners();

      const stakingInstance = await factory();
      const erc20Instance = await erc20Factory();
      const erc721RandomInstance = await erc721Factory("ERC721Random");

      await erc721RandomInstance.grantRole(MINTER_ROLE, vrfInstance.address);
      await erc721RandomInstance.grantRole(MINTER_ROLE, stakingInstance.address);

      await linkInstance.transfer(erc721RandomInstance.address, BigNumber.from("1000").mul(decimals));

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 1, // ERC20
          token: erc20Instance.address,
          tokenId: 0,
          amount,
        },
        reward: {
          tokenType: 2, // ERC721
          token: erc721RandomInstance.address,
          tokenId: 1,
          amount: 0,
        },
        content: [],
        period,
        penalty,
        recurrent: false,
        active: true,
      };

      // SET RULE
      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");
      // STAKE
      await erc20Instance.mint(owner.address, amount);
      let balance = await erc20Instance.balanceOf(owner.address);
      expect(balance).to.equal(amount);
      await erc20Instance.approve(stakingInstance.address, amount);
      const tx1 = stakingInstance.deposit(1, 0);
      await expect(tx1).to.emit(stakingInstance, "StakingStart");
      await expect(tx1).to.emit(erc20Instance, "Transfer");
      balance = await erc20Instance.balanceOf(owner.address);
      expect(balance).to.equal(0);
      // TIME
      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(period * cycles)));
      // REWARD
      const tx2 = await stakingInstance.receiveReward(1, true, true);
      await expect(tx2).to.emit(stakingInstance, "StakingWithdraw");
      await expect(tx2).to.emit(stakingInstance, "StakingFinish");
      await expect(tx2)
        .to.emit(linkInstance, "Transfer(address,address,uint256)")
        .withArgs(erc721RandomInstance.address, vrfInstance.address, utils.parseEther("0.1"));
      // RANDOM
      await randomRequest(erc721RandomInstance, vrfInstance);
      balance = await erc721RandomInstance.balanceOf(owner.address);
      expect(balance).to.equal(cycles);
      balance = await erc20Instance.balanceOf(owner.address);
      expect(balance).to.equal(amount);
    });

    it("should stake ERC20 & receive ERC721 Common", async function () {
      const [owner] = await ethers.getSigners();

      const stakingInstance = await factory();
      const erc20Instance = await erc20Factory();
      const erc721SimpleInstance = await erc721Factory("ERC721Simple");

      await erc721SimpleInstance.grantRole(MINTER_ROLE, stakingInstance.address);

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 1, // ERC20
          token: erc20Instance.address,
          tokenId: 0,
          amount,
        },
        reward: {
          tokenType: 2, // ERC721
          token: erc721SimpleInstance.address,
          tokenId: 1,
          amount: 0,
        },
        content: [],
        period,
        penalty,
        recurrent: false,
        active: true,
      };

      // SET RULE
      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");
      // STAKE
      await erc20Instance.mint(owner.address, amount);
      let balance = await erc20Instance.balanceOf(owner.address);
      expect(balance).to.equal(amount);
      await erc20Instance.approve(stakingInstance.address, amount);
      const tx1 = stakingInstance.deposit(1, 0);
      await expect(tx1).to.emit(stakingInstance, "StakingStart");
      await expect(tx1).to.emit(erc20Instance, "Transfer");
      balance = await erc20Instance.balanceOf(owner.address);
      expect(balance).to.equal(0);
      // TIME
      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(period * cycles)));
      // REWARD
      const tx2 = await stakingInstance.receiveReward(1, true, true);
      await expect(tx2).to.emit(stakingInstance, "StakingWithdraw");
      await expect(tx2).to.emit(stakingInstance, "StakingFinish");
      await expect(tx2).to.emit(erc721SimpleInstance, "Transfer");
      balance = await erc721SimpleInstance.balanceOf(owner.address);
      expect(balance).to.equal(cycles);
      balance = await erc20Instance.balanceOf(owner.address);
      expect(balance).to.equal(amount);
    });

    it("should stake ERC721 & receive ERC20", async function () {
      const [owner] = await ethers.getSigners();

      const stakingInstance = await factory();
      const erc20Instance = await erc20Factory();
      const erc721RandomInstance = await erc721Factory("ERC721Random");

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 2, // ERC721
          token: erc721RandomInstance.address,
          tokenId: 1,
          amount: 0,
        },
        reward: {
          tokenType: 1, // ERC20
          token: erc20Instance.address,
          tokenId: 0,
          amount,
        },
        content: [],
        period,
        penalty,
        recurrent: false,
        active: true,
      };

      // SET RULE
      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");
      // STAKE
      await erc721RandomInstance.mintCommon(owner.address, templateId);
      let balance = await erc721RandomInstance.balanceOf(owner.address);
      expect(balance).to.equal(1);
      await erc721RandomInstance.approve(stakingInstance.address, 1);
      const tx1 = stakingInstance.deposit(1, 1);
      await expect(tx1).to.emit(stakingInstance, "StakingStart");
      await expect(tx1).to.emit(erc721RandomInstance, "Transfer");
      balance = await erc721RandomInstance.balanceOf(owner.address);
      expect(balance).to.equal(0);
      // TIME
      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(period * cycles)));
      // REWARD
      await erc20Instance.mint(stakingInstance.address, amount * cycles);
      const tx2 = await stakingInstance.receiveReward(1, true, true);
      await expect(tx2).to.emit(stakingInstance, "StakingWithdraw").to.emit(stakingInstance, "StakingFinish");
      balance = await erc20Instance.balanceOf(owner.address);
      expect(balance).to.equal(amount * cycles);
      balance = await erc721RandomInstance.balanceOf(owner.address);
      expect(balance).to.equal(1);
    });

    it("should stake ERC721 & receive ERC721 Random", async function () {
      const [owner] = await ethers.getSigners();

      const stakingInstance = await factory();
      const erc721RandomInstance = await erc721Factory("ERC721Random");

      await erc721RandomInstance.grantRole(MINTER_ROLE, vrfInstance.address);
      await erc721RandomInstance.grantRole(MINTER_ROLE, stakingInstance.address);

      await linkInstance.transfer(erc721RandomInstance.address, BigNumber.from("1000").mul(decimals));

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 2, // ERC721
          token: erc721RandomInstance.address,
          tokenId: 1,
          amount: 0,
        },
        reward: {
          tokenType: 2, // ERC721
          token: erc721RandomInstance.address,
          tokenId: 1,
          amount: 0,
        },
        content: [],
        period,
        penalty,
        recurrent: false,
        active: true,
      };

      // SET RULE
      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");
      // STAKE
      await erc721RandomInstance.mintCommon(owner.address, templateId);
      let balance = await erc721RandomInstance.balanceOf(owner.address);
      expect(balance).to.equal(1);
      await erc721RandomInstance.approve(stakingInstance.address, 1);
      const tx1 = stakingInstance.deposit(1, 1);
      await expect(tx1).to.emit(stakingInstance, "StakingStart").to.emit(erc721RandomInstance, "Transfer");
      balance = await erc721RandomInstance.balanceOf(owner.address);
      expect(balance).to.equal(0);
      // TIME
      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(period * cycles)));
      // REWARD
      const tx2 = await stakingInstance.receiveReward(1, true, true);
      await expect(tx2)
        .to.emit(stakingInstance, "StakingWithdraw")
        .to.emit(stakingInstance, "StakingFinish")
        .to.emit(linkInstance, "Transfer(address,address,uint256)")
        .withArgs(erc721RandomInstance.address, vrfInstance.address, utils.parseEther("0.1"));
      // RANDOM
      await randomRequest(erc721RandomInstance, vrfInstance);
      balance = await erc721RandomInstance.balanceOf(owner.address);
      expect(balance).to.equal(cycles + 1);
    });

    it("should stake ERC721 & receive ERC721 Common", async function () {
      const [owner] = await ethers.getSigners();

      const stakingInstance = await factory();
      const erc721SimpleInstance = await erc721Factory("ERC721Simple");
      const erc721RandomInstance = await erc721Factory("ERC721Random");

      await erc721SimpleInstance.grantRole(MINTER_ROLE, stakingInstance.address);

      const stakeRule: IRule = {
        externalId: 1,
        deposit: {
          tokenType: 2, // ERC721
          token: erc721RandomInstance.address,
          tokenId: 1,
          amount: 0,
        },
        reward: {
          tokenType: 2, // ERC721
          token: erc721SimpleInstance.address,
          tokenId: 1,
          amount: 0,
        },
        content: [],
        period,
        penalty,
        recurrent: false,
        active: true,
      };

      // SET RULE
      const tx = stakingInstance.setRules([stakeRule]);
      await expect(tx).to.emit(stakingInstance, "RuleCreated");
      // STAKE
      await erc721RandomInstance.mintCommon(owner.address, templateId);
      let balance = await erc721RandomInstance.balanceOf(owner.address);
      expect(balance).to.equal(1);
      await erc721RandomInstance.approve(stakingInstance.address, 1);
      const tx1 = stakingInstance.deposit(1, 1);
      await expect(tx1).to.emit(stakingInstance, "StakingStart").to.emit(erc721RandomInstance, "Transfer");
      balance = await erc721RandomInstance.balanceOf(owner.address);
      expect(balance).to.equal(0);
      // TIME
      const current = await time.latestBlock();
      await time.advanceBlockTo(current.add(web3.utils.toBN(period * cycles)));
      // REWARD
      const tx2 = await stakingInstance.receiveReward(1, true, true);
      await expect(tx2)
        .to.emit(stakingInstance, "StakingWithdraw")
        .to.emit(stakingInstance, "StakingFinish")
        .to.emit(erc721SimpleInstance, "Transfer");
      balance = await erc721SimpleInstance.balanceOf(owner.address);
      expect(balance).to.equal(cycles);
      balance = await erc721RandomInstance.balanceOf(owner.address);
      expect(balance).to.equal(1);
    });
  });

  // todo test recurrent
});
