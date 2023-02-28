import { expect } from "chai";
import { ethers, web3 } from "hardhat";
import { BigNumber } from "ethers";
import { time } from "@openzeppelin/test-helpers";

import { shouldBehaveLikeOwnable } from "@gemunion/contracts-mocha";
import { nonce, tokenName, tokenSymbol } from "@gemunion/contracts-constants";

import { deployVesting } from "./shared/fixture";
import { deployContractManager } from "../../ContractManager/fixture";
import { amount, contractTemplate } from "../../constants";
import { deployERC20 } from "../../ERC20/shared/fixtures";

const span = 86400; // one day in seconds
describe("Vesting Factory", function () {
  const factory = () => deployVesting("TeamVesting");
  const cm = () => deployContractManager("VestingFactory");

  shouldBehaveLikeOwnable(factory);

  describe("factory deploy and topUp", function () {
    it("TeamVesting", async function () {
      const [owner] = await ethers.getSigners();
      const network = await ethers.provider.getNetwork();

      const cmInstance = await cm();

      const vesting = await ethers.getContractFactory("TeamVesting");
      const current = await time.latest();
      const signature = await owner._signTypedData(
        // Domain
        {
          name: "ContractManager",
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: cmInstance.address,
        },
        // Types
        {
          EIP712: [
            { name: "params", type: "Params" },
            { name: "args", type: "VestingArgs" },
          ],
          Params: [
            { name: "nonce", type: "bytes32" },
            { name: "bytecode", type: "bytes" },
          ],
          VestingArgs: [
            { name: "account", type: "address" },
            { name: "startTimestamp", type: "uint64" },
            { name: "duration", type: "uint64" },
            { name: "contractTemplate", type: "string" },
          ],
        },
        // Values
        {
          params: {
            nonce,
            bytecode: vesting.bytecode,
          },
          args: {
            account: owner.address,
            startTimestamp: current.toNumber(),
            duration: span * 4,
            contractTemplate,
          },
        },
      );

      const tx = await cmInstance.deployVesting(
        {
          nonce,
          bytecode: vesting.bytecode,
        },
        {
          account: owner.address,
          startTimestamp: current.toNumber(),
          duration: span * 4,
          contractTemplate,
        },
        signature,
      );

      const [address] = await cmInstance.allVesting();
      const vestingInstance = vesting.attach(address);

      await expect(tx)
        .to.emit(cmInstance, "VestingDeployed")
        .withNamedArgs({
          addr: address,
          args: {
            account: owner.address,
            startTimestamp: BigNumber.from(current.toNumber()),
            duration: BigNumber.from(span * 4),
            contractTemplate,
          },
        });

      const erc20Factory = await ethers.getContractFactory("ERC20Simple");
      const erc20Instance = await erc20Factory.deploy(tokenName, tokenSymbol, amount);
      await erc20Instance.mint(owner.address, amount);
      await erc20Instance.approve(vestingInstance.address, amount);

      const tx1 = await vestingInstance.topUp([
        {
          tokenType: 1,
          token: erc20Instance.address,
          tokenId: 0,
          amount,
        },
      ]);

      await expect(tx1)
        .to.emit(vestingInstance, "TransferReceived")
        .withArgs(vestingInstance.address, owner.address, amount, "0x");

      await expect(tx1).changeTokenBalances(erc20Instance, [owner, vestingInstance], [-amount, amount]);
    });
  });

  describe("release", function () {
    it("factory AdvisorsVesting", async function () {
      const [owner] = await ethers.getSigners();
      // const vestingInstance = await deployVesting("AdvisorsVesting");
      const network = await ethers.provider.getNetwork();

      const cmInstance = await cm();

      const vesting = await ethers.getContractFactory("TeamVesting");
      const current = await time.latest();
      const signature = await owner._signTypedData(
        // Domain
        {
          name: "ContractManager",
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: cmInstance.address,
        },
        // Types
        {
          EIP712: [
            { name: "params", type: "Params" },
            { name: "args", type: "VestingArgs" },
          ],
          Params: [
            { name: "nonce", type: "bytes32" },
            { name: "bytecode", type: "bytes" },
          ],
          VestingArgs: [
            { name: "account", type: "address" },
            { name: "startTimestamp", type: "uint64" },
            { name: "duration", type: "uint64" },
            { name: "contractTemplate", type: "string" },
          ],
        },
        // Values
        {
          params: {
            nonce,
            bytecode: vesting.bytecode,
          },
          args: {
            account: owner.address,
            startTimestamp: current.toNumber(),
            duration: span * 4,
            contractTemplate,
          },
        },
      );

      const tx = await cmInstance.deployVesting(
        {
          nonce,
          bytecode: vesting.bytecode,
        },
        {
          account: owner.address,
          startTimestamp: current.toNumber(),
          duration: span * 4,
          contractTemplate,
        },
        signature,
      );
      const [address] = await cmInstance.allVesting();
      await expect(tx)
        .to.emit(cmInstance, "VestingDeployed")
        .withNamedArgs({
          addr: address,
          args: {
            account: owner.address,
            startTimestamp: BigNumber.from(current.toNumber()),
            duration: BigNumber.from(span * 4),
            contractTemplate,
          },
        });

      const dailyRelease = (amount * 13698) / 10000000;
      const cliff = new Array(12 * 30).fill(0);
      const whole = ~~(amount / dailyRelease);
      const rest = amount % dailyRelease;
      const body = new Array(whole).fill(dailyRelease);
      const expectedAmounts = [0, ...cliff, ...body, rest, 0];

      const vestingInstance = vesting.attach(address);
      const erc20Instance = await deployERC20(void 0, { amount });
      await erc20Instance.mint(vestingInstance.address, amount);

      await owner.sendTransaction({ to: vestingInstance.address, value: amount });

      let sum = 0;
      for (const expectedAmount of expectedAmounts) {
        const releaseableETH = await vestingInstance["releaseable()"]();
        sum += expectedAmount;
        expect(releaseableETH).to.be.equal(sum);

        const releaseableERC20 = await vestingInstance["releaseable(address)"](erc20Instance.address);
        expect(releaseableERC20).to.be.equal(expectedAmount);

        const tx = await vestingInstance["release(address)"](erc20Instance.address);
        await expect(tx).changeTokenBalances(
          erc20Instance,
          [vestingInstance.address, owner.address],
          [releaseableERC20.mul(-1), releaseableERC20],
        );

        const current = await time.latest();
        await time.increaseTo(current.add(web3.utils.toBN(span)));
      }
    });
  });
});
