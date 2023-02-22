import { Contract } from "ethers";

import { deploySystem } from "./deploy/system";
import { deployERC20 } from "./deploy/hierarchy/erc20";
import { deployERC721 } from "./deploy/hierarchy/erc721";
import { deployVesting } from "./deploy/mechanics/vesting";
import { deployStaking } from "./deploy/mechanics/staking";
import { deployChainLink } from "./deploy/integrations/chain-link";

const contracts: Record<string, Contract> = {};

async function deployHierarchy(contracts: Record<string, Contract>) {
  await deployERC20(contracts);
  await deployERC721(contracts);
}

async function deployMechanics(contracts: Record<string, Contract>) {
  await deployVesting(contracts);
  await deployStaking(contracts);
}

async function deployIntegrations(contracts: Record<string, Contract>) {
  await deployChainLink(contracts);
}

async function main() {
  await deploySystem(contracts);
  await deployHierarchy(contracts);
  await deployMechanics(contracts);
  await deployIntegrations(contracts);
}

const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter}`);

main()
  .then(() => {
    Object.entries(contracts).map(([key, value]) =>
      console.info(`${camelToSnakeCase(key).toUpperCase()}_ADDR=${value.address.toLowerCase()}`),
    );
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
