import { ethers } from "hardhat";
import { Contract } from "ethers";

import { blockAwait } from "@gemunion/contracts-utils";
import { baseTokenURI, royalty } from "@gemunion/contracts-constants";

export async function deployERC721(contracts: Record<string, Contract>) {
  const ERC721UpgradeableFactory = await ethers.getContractFactory("ERC721UpgradeableRandomBlacklist");
  contracts.erc721Upgradeable = await ERC721UpgradeableFactory.deploy("ERC721 ARMOUR", "LVL721", royalty, baseTokenURI);
  await blockAwait();
}
