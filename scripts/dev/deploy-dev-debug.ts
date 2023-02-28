import { ethers, network } from "hardhat";
import { constants, Contract } from "ethers";
import { wallet, baseTokenURI, MINTER_ROLE, METADATA_ROLE, royalty } from "@gemunion/contracts-constants";

import { blockAwait, blockAwaitMs } from "@gemunion/contracts-utils";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/abstract-provider";

const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter}`);
const delay = 2; // block delay
const delayMs = 2000; // block delay ms
// const linkAmountInEth = ethers.utils.parseEther("1");

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

const grantRoles = async (contracts: Array<string>, grantee: Array<string>, roles: Array<string>) => {
  for (let i = 0; i < contracts.length; i++) {
    for (let j = 0; j < grantee.length; j++) {
      for (let k = 0; k < roles.length; k++) {
        if (contracts[i] !== grantee[j]) {
          const accessFabric = await ethers.getContractFactory("ERC721Simple");
          const accessInstance = accessFabric.attach(contracts[i]);
          console.info("grantRole", contracts[i], grantee[j]);
          await debug(await accessInstance.grantRole(roles[k], grantee[j]), "grantRole");
        }
      }
    }
  }
};

let currentBlock: { number: number } = { number: 1 };
const contracts: Record<string, Contract> = {};
const amount = constants.WeiPerEther.mul(1e6);
const timestamp = Math.ceil(Date.now() / 1000);

async function main() {
  const [owner] = await ethers.getSigners();
  currentBlock = await ethers.provider.getBlock("latest");
  // LINK & VRF
  // const linkFactory = await ethers.getContractFactory("LinkToken");
  // // const linkInstance = linkFactory.attach("0x18C8044BEaf97a626E2130Fe324245b96F81A31F");
  // const linkInstance = await linkFactory.deploy();
  // contracts.link = linkInstance;
  // await debug(contracts);
  // console.info(`LINK_ADDR=${contracts.link.address}`);
  // const vrfFactory = await ethers.getContractFactory("VRFCoordinatorMock");
  // contracts.vrf = await vrfFactory.deploy(contracts.link.address);
  // await debug(contracts);
  // console.info(`VRF_ADDR=${contracts.vrf.address}`);
  // console.info("afterDebug");
  // process.exit(0);
  // HAVE TO PASS VRF AND LINK ADDRESSES TO CHAINLINK-BESU CONCTRACT
  // const link = await ethers.getContractFactory("LinkToken");
  // const linkAddr =
  //   network.name === "besu"
  //     ? "0x42699A7612A82f1d9C36148af9C77354759b210b"
  //     : network.name === "gemunion"
  //     ? "0x1fa66727cDD4e3e4a6debE4adF84985873F6cd8a"
  //     : "0x42699A7612A82f1d9C36148af9C77354759b210b";
  // const linkInstance = link.attach(linkAddr); // localhost BESU or GEMUNION

  const vrf = await ethers.getContractFactory("VRFCoordinatorMock");
  const vrfAddr =
    network.name === "besu"
      ? "0xa50a51c09a5c451C52BB714527E1974b686D8e77" // vrf besu localhost
      : network.name === "gemunion"
      ? "0x86c86939c631d53c6d812625bd6ccd5bf5beb774" // vrf besu gemunion
      : "0xa50a51c09a5c451C52BB714527E1974b686D8e77";
  const vrfInstance = vrf.attach(vrfAddr); // localhost BESU or GEMUNION
  // const linkInstance = link.attach("0x42699A7612A82f1d9C36148af9C77354759b210b"); // localhost BESU
  // const linkInstance = link.attach("0x1fa66727cDD4e3e4a6debE4adF84985873F6cd8a"); // Gemunion BESU
  // const linkInstance = link.attach("0x326C977E6efc84E512bB9C30f76E30c160eD06FB"); // GOERLI
  // const linkInstance = link.attach("0x18C8044BEaf97a626E2130Fe324245b96F81A31F"); // GOERLI FW TEST
  const cmFactory = await ethers.getContractFactory("ContractManager");

  contracts.contractManager = await cmFactory.deploy();
  await debug(contracts);
  // console.info("contracts.contractManager.address", contracts.contractManager.address);
  // process.exit(0);

  const exchangeFactory = await ethers.getContractFactory("Exchange");
  const exchangeInstance = await exchangeFactory.deploy(
    "Exchange",
    [
      "0xfe3b557e8fb62b89f4916b721be55ceb828dbd73",
      "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
      "0x61284003e50b2d7ca2b95f93857abb78a1b0f3ca",
    ],
    [85, 10, 5],
  );
  contracts.exchange = exchangeInstance;
  await debug(contracts);

  await debug(
    await contracts.contractManager.setFactories([exchangeInstance.address], [contracts.contractManager.address]),
    "contractManager.setFactories",
  );

  const erc20SimpleFactory = await ethers.getContractFactory("ERC20Blacklist");
  // const erc20SimpleFactory = await ethers.getContractFactory("ERC20Simple");
  const erc20SimpleInstance = await erc20SimpleFactory.deploy("Calories", "CAL", amount);
  // const erc20SimpleInstance = erc20SimpleFactory.attach("0x7b3f38cd327c375d7baae448c1380397d304fcec");
  contracts.erc20Simple = erc20SimpleInstance;
  await debug(contracts);

  await debug(await erc20SimpleInstance.mint(owner.address, amount), "erc20SimpleInstance.mint");

  await debug(await erc20SimpleInstance.approve(contracts.exchange.address, amount), "erc20SimpleInstance.approve");

  // await debug(
  //   await erc20SimpleInstance.approve("0x4a105d0f5b712ed69ff02634091f544dd960106a", amount),
  //   "erc20SimpleInstance.approve",
  // );
  // console.info(`ERC20_SIMPLE_ADDR=${contracts.erc20Simple.address}`);
  // process.exit(0);

  // const erc721RandomFactory = await ethers.getContractFactory("ERC721Besu");
  // const erc721RandomFactory = await ethers.getContractFactory("ERC721Gemunion");
  // const erc721RandomFactory = await ethers.getContractFactory("ERC721Random");
  const randomContractName =
    network.name === "besu"
      ? "ERC721BlacklistUpgradeableRentableRandomBesu"
      : network.name === "gemunion"
      ? "ERC721BlacklistUpgradeableRentableRandomGemunion"
      : "ERC721BlacklistUpgradeableRentableRandom";

  const erc721RandomFactory = await ethers.getContractFactory(randomContractName);

  contracts.erc721Random = await erc721RandomFactory.deploy("FITBURN T-SHIRT", "FBTSHRT", royalty, baseTokenURI);
  await debug(contracts);

  // await debug(await linkInstance.transfer(contracts.erc721Random.address, linkAmountInEth), "linkInstance.transfer");
  await debug(await vrfInstance.addConsumer(1, contracts.erc721Random.address), "vrfInstance.addConsumer");

  // VESTING
  const advisorVestingFactory = await ethers.getContractFactory("AdvisorsVesting");
  contracts.vestingAdvisors = await advisorVestingFactory.deploy(wallet, timestamp, 365 * 86400);
  await debug(contracts);

  const marketingVestingFactory = await ethers.getContractFactory("MarketingVesting");
  contracts.vestingMarketing = await marketingVestingFactory.deploy(wallet, timestamp, 365 * 86400);
  await debug(contracts);

  const partnershipVestingFactory = await ethers.getContractFactory("PartnershipVesting");
  contracts.vestingPartnership = await partnershipVestingFactory.deploy(wallet, timestamp, 365 * 86400);
  await debug(contracts);

  const preSeedSaleVestingFactory = await ethers.getContractFactory("PreSeedSaleVesting");
  contracts.vestingPreSeed = await preSeedSaleVestingFactory.deploy(wallet, timestamp, 365 * 86400);
  await debug(contracts);

  const privateSaleVestingFactory = await ethers.getContractFactory("PrivateSaleVesting");
  contracts.vestingPrivateSale = await privateSaleVestingFactory.deploy(wallet, timestamp, 365 * 86400);
  await debug(contracts);

  const publicSaleVestingFactory = await ethers.getContractFactory("PublicSaleVesting");
  contracts.vestingPublicSale = await publicSaleVestingFactory.deploy(wallet, timestamp, 365 * 86400);
  await debug(contracts);

  const seedSaleVestingFactory = await ethers.getContractFactory("SeedSaleVesting");
  contracts.vestingSeedSale = await seedSaleVestingFactory.deploy(wallet, timestamp, 365 * 86400);
  await debug(contracts);

  const teamVestingFactory = await ethers.getContractFactory("TeamVesting");
  contracts.vestingTeam = await teamVestingFactory.deploy(wallet, timestamp, 365 * 86400);
  await debug(contracts);

  const stakingFactory = await ethers.getContractFactory("Staking");
  const stakingInstance = await stakingFactory.deploy(10);
  contracts.staking = stakingInstance;
  await debug(contracts);

  await debug(
    await stakingInstance.setRules([
      {
        externalId: 22, // ERC20 > ERC20
        deposit: {
          tokenType: 1,
          token: contracts.erc20Simple.address,
          tokenId: 0,
          amount: constants.WeiPerEther,
        },
        reward: {
          tokenType: 1,
          token: contracts.erc20Simple.address,
          tokenId: 0,
          amount: constants.WeiPerEther.div(100).mul(5), // 5%
        },
        content: [],
        period: 30 * 84600,
        penalty: 1,
        recurrent: false,
        active: true,
      },
    ]),
    "stakingInstance.setRules",
  );

  await debug(
    await stakingInstance.setRules([
      {
        externalId: 23, // ERC20 > ERC721
        deposit: {
          tokenType: 1,
          token: contracts.erc20Simple.address,
          tokenId: 0,
          amount: constants.WeiPerEther,
        },
        reward: {
          tokenType: 2,
          token: contracts.erc721Random.address,
          tokenId: 306001,
          amount: 1,
        },
        content: [
          {
            tokenType: 2,
            token: contracts.erc721Random.address,
            tokenId: 306001,
            amount: 1,
          },
        ],
        period: 30 * 84600,
        penalty: 1,
        recurrent: false,
        active: true,
      },
    ]),
    "stakingInstance.setRules",
  );

  await debug(
    await contracts.contractManager.addFactory(stakingInstance.address, MINTER_ROLE),
    "contractManager.addFactory",
  );

  const usdtFactory = await ethers.getContractFactory("TetherToken");
  contracts.usdt = await usdtFactory.deploy(100000000000, "Tether USD", "USDT", 6);
  await debug(contracts);

  // GRANT ROLES
  await grantRoles(
    [contracts.erc721Random.address],
    [contracts.exchange.address, contracts.staking.address],
    [MINTER_ROLE, METADATA_ROLE],
  );
}

main()
  .then(() => {
    console.info(`STARTING_BLOCK=${currentBlock.number}`);
    Object.entries(contracts).map(([key, value]) =>
      console.info(`${camelToSnakeCase(key).toUpperCase()}_ADDR=${value.address.toLowerCase()}`),
    );
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
