import { ethers } from "hardhat";
import { constants, Contract } from "ethers";

import { blockAwait } from "@gemunion/contracts-utils";
import { MINTER_ROLE } from "@gemunion/contracts-constants";

export async function deployStaking(contracts: Record<string, Contract>) {
  const stakingFactory = await ethers.getContractFactory("Staking");
  const stakingInstance = await stakingFactory.deploy(10);
  await blockAwait();

  contracts.staking = stakingInstance;

  await stakingInstance.setRules([
    {
      externalId: 1, // NATIVE > NATIVE
      deposit: {
        tokenType: 0,
        token: constants.AddressZero,
        tokenId: 0,
        amount: constants.WeiPerEther,
      },
      reward: {
        tokenType: 0,
        token: constants.AddressZero,
        tokenId: 0,
        amount: constants.WeiPerEther.div(100).mul(5), // 5%
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
  ]);
  await blockAwait();

  await stakingInstance.setRules([
    {
      externalId: 8, // ERC20 > ERC721
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
  ]);
  await blockAwait();

  await blockAwait();
  await contracts.contractManager.addFactory(stakingInstance.address, MINTER_ROLE);
  await blockAwait();
}
