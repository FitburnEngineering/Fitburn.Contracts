import { ethers } from "hardhat";
import { Contract } from "ethers";

// import { wallet, wallets } from "@gemunion/constants";
import { blockAwait, blockAwaitMs } from "@gemunion/contracts-utils";
import { MINTER_ROLE } from "@gemunion/contracts-constants";

const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter}`);
const delay = 2; // block delay
const delayMsec = 30000; // block delay ms
// const decimals = BigNumber.from(10).pow(18);
// const linkAmountInWei = BigNumber.from("1000").mul(decimals);
// const linkAmountInEth = utils.parseEther("1");

interface IObj {
  address?: string;
  hash?: string;
}

const debug = async (obj: IObj | Record<string, Contract>, name?: string) => {
  if (obj && obj.hash) {
    console.info(`${name} tx: ${obj.hash}`);
    await blockAwaitMs(delayMsec);
  } else {
    console.info(`${Object.keys(obj).pop()} deployed`);
    await blockAwait(delay);
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

const contracts: Record<string, Contract> = {};
// const amount = constants.WeiPerEther.mul(1e6);

// const timestamp = Math.ceil(Date.now() / 1000);

async function main() {
  // const [owner] = await ethers.getSigners();
  // LINK & VRF
  // const linkFactory = await ethers.getContractFactory("LinkToken");
  // // const linkInstance = linkFactory.attach("0x18C8044BEaf97a626E2130Fe324245b96F81A31F");
  // const linkInstance = await linkFactory.deploy("LINK", "LINK");
  // contracts.link = linkInstance;
  // // await debug(contracts);
  // console.info(`LINK_ADDR=${contracts.link.address}`);
  // const vrfFactory = await ethers.getContractFactory("VRFCoordinatorMock");
  // contracts.vrf = await vrfFactory.deploy(contracts.link.address);
  // // await debug(contracts);
  // console.info(`VRF_ADDR=${contracts.vrf.address}`);
  // await debug(await linkInstance.mint(owner.address, linkAmountInWei.mul(100)), "LinkInstance.mint");
  /*
  // console.info("afterDebug");
  // process.exit(0);
  // HAVE TO PASS VRF AND LINK ADDRESSES TO CHAINLINK-BESU CONCTRACT
  */
  // const link = await ethers.getContractFactory("LinkToken");
  // const linkInstance = link.attach("0x326C977E6efc84E512bB9C30f76E30c160eD06FB"); // GOERLI
  // const linkInstance = link.attach("0x18C8044BEaf97a626E2130Fe324245b96F81A31F"); // GOERLI FW TEST

  /*
  const cmFactory = await ethers.getContractFactory("ContractManager");
  // contracts.contractManager = cmFactory.attach("0x690579e4b583dd87db51361e30e0b3493d5c5e6c");

  contracts.contractManager = await cmFactory.deploy();
  // await debug(contracts);
*/
  const exchangeFactory = await ethers.getContractFactory("Exchange");
  /*
  const exchangeInstance = await exchangeFactory.deploy(
    "Exchange",
    [
      // "0xfe3b557e8fb62b89f4916b721be55ceb828dbd73",
      // "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
      "0x61284003e50b2d7ca2b95f93857abb78a1b0f3ca",
    ],
    [100],
  );
  */
  const exchangeInstance = exchangeFactory.attach("0x363a249fc3a8b83e258b388709fa9fa0c59667dd");
  contracts.exchange = exchangeInstance;
  /*
  // await debug(contracts);

  await debug(
    await contracts.contractManager.setFactories([exchangeInstance.address], [contracts.contractManager.address]),
    "contractManager.setFactories",
  );
*/
  const erc20SimpleFactory = await ethers.getContractFactory("ERC20Simple");
  // const erc20SimpleInstance = await erc20SimpleFactory.deploy("Space Credits", "GEM20", amount);
  const erc20SimpleInstance = erc20SimpleFactory.attach("0xe85c9cdd5ba93b0b3893e38a8b71c868a63f31c3");
  contracts.erc20Simple = erc20SimpleInstance;
  // await debug(contracts);
  /*
    await debug(await erc20SimpleInstance.mint(owner.address, amount), "erc20SimpleInstance.mint");

    await debug(await erc20SimpleInstance.approve(contracts.exchange.address, amount), "erc20SimpleInstance.approve");

    // const erc20InactiveFactory = await ethers.getContractFactory("ERC20Simple");
    // contracts.erc20Inactive = await erc20InactiveFactory.deploy("ERC20 INACTIVE", "OFF20", amount);
    // // await debug(contracts);

    // const erc20NewFactory = await ethers.getContractFactory("ERC20Simple");
    // contracts.erc20New = await erc20NewFactory.deploy("ERC20 NEW", "NEW20", amount);
    // // await debug(contracts);

    // const erc20BlacklistFactory = await ethers.getContractFactory("ERC20Blacklist");
    // const erc20BlacklistInstance = await erc20BlacklistFactory.deploy("ERC20 BLACKLIST", "BL20", amount);
    // contracts.erc20Blacklist = erc20BlacklistInstance;
    // // await debug(contracts);
    //
    // await debug(await erc20BlacklistInstance.blacklist(wallets[1]), "erc20BlacklistInstance.blacklist");
    //
    // await debug(await erc20BlacklistInstance.blacklist(wallets[2]), "erc20BlacklistInstance.blacklist");
  */
  const erc721SimpleFactory = await ethers.getContractFactory("ERC721Simple");
  // contracts.erc721Simple = await erc721SimpleFactory.deploy("RUNE", "GEM721", royalty, baseTokenURI);
  contracts.erc721Simple = erc721SimpleFactory.attach("0x31ed22a4432726cb2fa4ebf886bb69ebb47cb75c");

  /*
    // await debug(contracts);

    // const erc721InactiveFactory = await ethers.getContractFactory("ERC721Simple");
    // contracts.erc721Inactive = await erc721InactiveFactory.deploy("ERC721 INACTIVE", "OFF721", royalty, baseTokenURI);
    // // await debug(contracts);
    //
    // const erc721NewFactory = await ethers.getContractFactory("ERC721Simple");
    // contracts.erc721New = await erc721NewFactory.deploy("ERC721 NEW", "NEW721", royalty, baseTokenURI);
    // // await debug(contracts);
    //
    // const ERC721BFactory = await ethers.getContractFactory("ERC721B");
    // contracts.ERC721B = await ERC721BFactory.deploy("ERC721 BLACKLIST", "BL721", royalty, baseTokenURI);
    // // await debug(contracts);

    // const ERC721UpgradeableFactory = await ethers.getContractFactory("ERC721Upgradeable");
    // contracts.erc721Upgradeable = await ERC721UpgradeableFactory.deploy("ERC721 ARMOUR", "LVL721", royalty, baseTokenURI);
    // // await debug(contracts);
  */
  const erc721RandomFactory = await ethers.getContractFactory("ERC721RandomGoerli");
  // const erc721RandomFactory = await ethers.getContractFactory("ERC721RandomBesu");
  // const erc721RandomFactory = await ethers.getContractFactory("ERC721Random");
  // contracts.erc721Random = await erc721RandomFactory.deploy("ERC721 WEAPON", "RNG721", royalty, baseTokenURI);
  contracts.erc721Random = erc721RandomFactory.attach("0xd7dc83e9d481f4c1516239f93db0c11c6c34a3b9");

  const stakingFactory = await ethers.getContractFactory("Staking");
  // const stakingInstance = await stakingFactory.deploy(10);
  const stakingInstance = stakingFactory.attach("0xaa400e9f522d7178d4ee27b4843f8bdc01d7d813");
  contracts.staking = stakingInstance;
  // await debug(contracts);

  // GRANT ROLES

  await grantRoles(
    [contracts.erc721Simple.address],
    [contracts.exchange.address, contracts.staking.address],
    [MINTER_ROLE],
  );
}

// eslint-disable-next-line promise/catch-or-return
main()
  .then(() => {
    Object.entries(contracts).map(([key, value]) =>
      console.info(`${camelToSnakeCase(key).toUpperCase()}_ADDR=${value.address.toLowerCase()}`),
    );
    process.exit(0);
  })
  .catch(error => {
    Object.entries(contracts).map(([key, value]) =>
      console.info(`${camelToSnakeCase(key).toUpperCase()}_ADDR=${value.address.toLowerCase()}`),
    );
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    Object.entries(contracts).map(([key, value]) =>
      console.info(`${camelToSnakeCase(key).toUpperCase()}_ADDR=${value.address.toLowerCase()}`),
    );
  });
