import { task } from "hardhat/config";
import { utils } from "ethers";

task("decode", "Decode error message")
  .addParam("data", "encoded data")
  // eslint-disable-next-line @typescript-eslint/require-await
  .setAction(async args => {
    const { data } = args;

    console.info(utils.toUtf8String(`0x${data.substr(138)}`));
  });
