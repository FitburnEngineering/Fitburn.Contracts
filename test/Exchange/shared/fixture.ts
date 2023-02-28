import { ethers, network } from "hardhat";

import {
  amount,
  baseTokenURI,
  METADATA_ROLE,
  MINTER_ROLE,
  royalty,
  tokenName,
  tokenSymbol,
} from "@gemunion/contracts-constants";

import { Exchange } from "../../../typechain-types";
import { wrapManyToManySignature, wrapOneToManySignature, wrapOneToOneSignature } from "./utils";
import { getContractName } from "../../utils";

export async function deployExchangeFixture() {
  const [owner] = await ethers.getSigners();

  const exchangeFactory = await ethers.getContractFactory("Exchange");
  const exchangeInstance = await exchangeFactory.deploy(tokenName, [owner.address], [100]);

  const network = await ethers.provider.getNetwork();

  const generateOneToOneSignature = wrapOneToOneSignature(network, exchangeInstance, owner);
  const generateOneToManySignature = wrapOneToManySignature(network, exchangeInstance, owner);
  const generateManyToManySignature = wrapManyToManySignature(network, exchangeInstance, owner);

  return {
    contractInstance: exchangeInstance,
    generateOneToOneSignature,
    generateOneToManySignature,
    generateManyToManySignature,
  };
}

export async function deployErc20Base(name: string, exchangeInstance: Exchange) {
  const erc20Factory = await ethers.getContractFactory(name);
  const erc20Instance = await erc20Factory.deploy(tokenName, tokenSymbol, amount * 10);
  await erc20Instance.grantRole(MINTER_ROLE, exchangeInstance.address);
  await erc20Instance.grantRole(METADATA_ROLE, exchangeInstance.address);

  return erc20Instance;
}

export async function deployErc721Base(name: string, exchangeInstance: Exchange) {
  const erc721Factory = await ethers.getContractFactory(getContractName(name, network.name));
  const erc721Instance = await erc721Factory.deploy(tokenName, tokenSymbol, royalty, baseTokenURI);
  await erc721Instance.grantRole(MINTER_ROLE, exchangeInstance.address);
  await erc721Instance.grantRole(METADATA_ROLE, exchangeInstance.address);

  return erc721Instance;
}

export async function deployErc1155Base(name: string, exchangeInstance: Exchange) {
  const erc1155Factory = await ethers.getContractFactory(name);
  const erc1155Instance = await erc1155Factory.deploy(royalty, baseTokenURI);
  await erc1155Instance.grantRole(MINTER_ROLE, exchangeInstance.address);

  return erc1155Instance;
}
