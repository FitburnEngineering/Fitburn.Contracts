import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { BigNumber, utils } from "ethers";

import { mapSeries } from "@gemunion/utils";

async function main() {
  const contract = await ethers.getContractFactory("Dispersion");

  const dispersionInstance = await contract.deploy();

  const result = await mapSeries<BigNumber>(
    new Array(11_111).fill(null).map(() => {
      return (): any => dispersionInstance.getDispersion(BigNumber.from(utils.randomBytes(32)));
    }),
  );

  const dispersion = result.reduce((memo, e) => {
    const index = e.toString();
    if (!memo[index]) {
      memo[index] = 0;
    }
    memo[index]++;
    return memo;
  }, {} as Record<string, number>);

  console.info(dispersion);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
