import { task } from "hardhat/config";
import { utils } from "ethers";

task("balance-erc20", "Prints an ERC20 balance")
  .addParam("account", "The account's address")
  .addParam("contract", "The ERC20 contract's address")
  .setAction(async (args, hre) => {
    const { account, contract } = args;

    const coinFactory = await hre.ethers.getContractFactory("LinkToken");
    const coinInstance = coinFactory.attach(contract);
    const balance = await coinInstance.balanceOf(account);
    console.info("ERC20 Balance:", utils.formatEther(balance.toString()));
  });

// hardhat balance-erc20 --account 0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73 --contract 0x8BCaF30fed623A721aB6A2E9A9ed4f0b2F141Bfd --network besu
// hardhat balance-erc20 --account 0xb470f7347c822acd02333de25144abf2cd26c284 --contract 0x8BCaF30fed623A721aB6A2E9A9ed4f0b2F141Bfd --network besu
