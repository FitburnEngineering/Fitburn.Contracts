import { task } from "hardhat/config";
import { utils } from "ethers";

task("balance-eth", "Prints an ETH balance")
  .addParam("account", "The account's address")
  .setAction(async (args, hre) => {
    const { account } = args;

    const provider = hre.ethers.getDefaultProvider();
    const balance = await provider.getBalance(account);
    console.info("ETH Balance:", utils.formatEther(balance), "ETH");
  });
