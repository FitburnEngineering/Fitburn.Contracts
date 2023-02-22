import { task } from "hardhat/config";
import { Contract, utils } from "ethers";

import { chainLinkAddr } from "@gemunion/contracts-constants";

const LINK_TOKEN_ABI = [
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

task("fund-link", "Funds a contract with LINK")
  .addParam("contract", "The address of the contract that requires LINK")
  .setAction(async (taskArgs, hre) => {
    const address = taskArgs.contract;
    console.info(`Funding contract ${address} on network ${hre.network.name}`);

    // set the LINK token contract address according to the environment
    const linkContractAddr = chainLinkAddr[hre.network.name];

    // Fund with 1 LINK token
    const amount = utils.hexlify(1e18);

    // Get signer information
    const [owner] = await hre.ethers.getSigners();

    // Create connection to LINK token contract and initiate the transfer
    const linkTokenContract = new Contract(linkContractAddr, LINK_TOKEN_ABI, owner);
    const tx = await linkTokenContract.transfer(address, amount);
    console.info(`Transaction Hash: ${tx.hash}`);
  });
