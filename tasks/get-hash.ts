import { task } from "hardhat/config";
import { utils } from "ethers";

task("get-hash", "Prints an keccak hash")
  .addParam("key", "The account's address")
  // eslint-disable-next-line @typescript-eslint/require-await
  .setAction(async args => {
    const { key } = args;

    const hash = utils.keccak256(utils.toUtf8Bytes(key));

    console.info(`hash: ${hash}`);
  });
