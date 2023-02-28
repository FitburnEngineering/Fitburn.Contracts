import csv2json from "csvtojson";
import fs from "fs";

import { ethers } from "hardhat";
import { utils, Contract, BigNumber } from "ethers";

import { blockAwait, blockAwaitMs } from "@gemunion/contracts-utils";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/abstract-provider";

// CONTRACT MANAGER ADDRESS
const contractManagerAddress = "0xfa5e30c1452d52ecb4b44b564bbfb766303ad059";
// ERC20 CAL ADDRESS
const erc20CalAddress = "0x35c8325eea439b27ef91cfb76b49a5c7d01018fc";

const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter}`);
const delay = 2; // block delay
const delayMs = 1000; // block delay ms

interface IObj {
  address?: string;
  hash?: string;
  wait: () => Promise<TransactionReceipt> | void;
}

const debug = async (obj: IObj | Record<string, Contract> | TransactionResponse, name?: string) => {
  if (obj && obj.hash) {
    console.info(`${name} tx: ${obj.hash}`);
    await blockAwaitMs(delayMs);
    const transaction: TransactionResponse = obj as TransactionResponse;
    await transaction.wait();
  } else {
    console.info(`${Object.keys(obj).pop()} deployed`);
    await blockAwait(delay, delayMs);
  }
};

const contracts: Record<string, Contract> = {};
const vestings: { [k: number]: Contract } = {};

async function main() {
  const content = fs.readFileSync(`${process.cwd()}/scripts/deploy/vesting/vestings.csv`);

  const [owner] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  const cmFactory = await ethers.getContractFactory("ContractManager");
  // contracts.contractManager = await cmFactory.deploy();
  contracts.contractManager = cmFactory.attach(contractManagerAddress);
  // await debug(contracts);

  const erc20SimpleFactory = await ethers.getContractFactory("ERC20Blacklist");
  // const erc20SimpleInstance = await erc20SimpleFactory.deploy("Calories", "CAL", amount);
  const erc20SimpleInstance = erc20SimpleFactory.attach(erc20CalAddress);
  contracts.erc20Simple = erc20SimpleInstance;
  // await debug(contracts);

  // await debug(await erc20SimpleInstance.mint(owner.address, amount), "erc20SimpleInstance.mint");

  // CSV Format
  // 0x61284003e50b2d7ca2b95f93857abb78a1b0f3ca,2025-01-01T00:00:00.000Z,2592000,ADVISORS,10000
  const csvArr = await csv2json({
    noheader: true,
    headers: ["account", "startTimestamp", "duration", "contractTemplate", "amount"],
  }).fromString(content.toString());
  // VESTING BATCH
  if (csvArr && csvArr.length) {
    // console.info("csv", csvArr);
    let i = 0;
    for (const vesting of csvArr) {
      console.info(`Processing Vesting record ${i + 1} from ${csvArr.length}`);

      // VESTING
      const account = vesting.account;
      const startTimestamp = vesting.startTimestamp;
      // const current = Math.ceil(Date.now() / 1000);
      const current = Math.ceil(new Date(startTimestamp).getTime() / 1000);
      const span = ~~vesting.duration; // vesting period

      const vestingTemplate =
        vesting.contractTemplate === "ADVISORS"
          ? "AdvisorsVesting"
          : vesting.contractTemplate === "MARKETING"
          ? "MarketingVesting"
          : vesting.contractTemplate === "PARTNERSHIP"
          ? "PartnershipVesting"
          : vesting.contractTemplate === "PRE_SEED_SALE"
          ? "PreSeedSaleVesting"
          : vesting.contractTemplate === "PRIVATE_SALE"
          ? "PrivateSaleVesting"
          : vesting.contractTemplate === "PUBLIC_SALE"
          ? "PublicSaleVesting"
          : vesting.contractTemplate === "SEED_SALE"
          ? "SeedSaleVesting"
          : vesting.contractTemplate === "TEAM"
          ? "TeamVesting"
          : "AbstractVesting";

      const vestingAmount = BigNumber.from(vesting.amount);

      console.info("Data:", account, current, span, vestingTemplate, vestingAmount);
      const vestingFactory = await ethers.getContractFactory(vestingTemplate);
      const nonce = utils.randomBytes(32);
      // const nonce = ethers.utils.formatBytes32String(i.toString());
      const signature = await owner._signTypedData(
        // Domain
        {
          name: "ContractManager",
          version: "1.0.0",
          chainId: network.chainId,
          verifyingContract: contracts.contractManager.address,
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
            bytecode: vestingFactory.bytecode,
          },
          args: {
            account,
            startTimestamp: current,
            duration: span,
            contractTemplate: vesting.contractTemplate,
          },
        },
      );
      await debug(
        await contracts.contractManager.deployVesting(
          {
            nonce,
            bytecode: vestingFactory.bytecode,
          },
          {
            account,
            startTimestamp: current,
            duration: span,
            contractTemplate: vesting.contractTemplate,
          },
          signature,
        ),
        "DeployVesting",
      );
      const allVesting = await contracts.contractManager.allVesting();
      const address = allVesting[allVesting.length - 1];
      contracts.vesting = vestingFactory.attach(address);
      vestings[i] = contracts.vesting;

      await debug(await erc20SimpleInstance.approve(contracts.vesting.address, vestingAmount), "Approved");

      await debug(
        await contracts.vesting.topUp([
          {
            tokenType: 1,
            token: erc20SimpleInstance.address,
            tokenId: 0,
            amount: vestingAmount,
          },
        ]),
        "VestingTopUp",
      );
      i = i + 1;
    }
  }
  // console.log("vestings", vestings);
}

main()
  .then(() => {
    Object.entries(vestings).map(([key, value]) => {
      console.info(`VESTING_${camelToSnakeCase(key).toUpperCase()}_ADDR=${value.address.toLowerCase()}`);
      return fs.appendFileSync(
        `${process.cwd()}/scripts/deploy/vesting/vesting-deployed.csv`,
        `VESTING_${camelToSnakeCase(key).toUpperCase()}_ADDR=${value.address.toLowerCase()}\n`,
      );
    });
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
