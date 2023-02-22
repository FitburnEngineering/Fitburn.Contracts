import { task } from "hardhat/config";
import { Contract, constants, utils, BigNumber } from "ethers";

// import { chainLinkAddr } from "@gemunion/contracts-constants";

const LINK_TOKEN_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "transferAndCall",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const chainLinkAddr: Record<string, any> = {
  hardhat: {
    chainLinkVRFCoordinator: "",
    chainLinkToken: "",
    chainLinkFee: 2,
    chainLinkKeyHash: "",
  },
  besu: {
    chainLinkVRFCoordinator: "0xa50a51c09a5c451C52BB714527E1974b686D8e77",
    chainLinkToken: "0x42699A7612A82f1d9C36148af9C77354759b210b",
    chainLinkFee: 2,
    chainLinkKeyHash: "0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186",
  },
  mainnet: {
    chainLinkVRFCoordinator: "0xf0d54349aDdcf704F77AE15b96510dEA15cb7952",
    chainLinkToken: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    chainLinkFee: 2,
    chainLinkKeyHash: "0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445",
  },
  binancetest: {
    chainLinkVRFCoordinator: "0xa555fC018435bef5A13C6c6870a9d4C11DEC329C",
    chainLinkToken: "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06",
    chainLinkFee: 0.1,
    chainLinkKeyHash: "0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186",
  },
};

task("fund-link2", "Funds a contract with LINK")
  .addParam("sub", "The ChainLINK subscription ID")
  .setAction(async (taskArgs, hre) => {
    const sub = taskArgs.sub;
    const subId = utils.hexZeroPad(utils.hexlify(BigNumber.from(sub)), 32);
    console.info(`Funding subscription ID ${subId} on network ${hre.network.name}`);

    // set the LINK token contract address according to the environment
    const linkContractAddr = chainLinkAddr[hre.network.name].chainLinkToken;

    // set the LINK token contract address according to the environment
    const vrfContractAddr = chainLinkAddr[hre.network.name].chainLinkVRFCoordinator;

    // Fund with 10 LINK token
    const amount = constants.WeiPerEther.mul(10);

    // Get signer information
    const [owner] = await hre.ethers.getSigners();

    // Create connection to LINK token contract and initiate the transfer
    const linkTokenContract = new Contract(linkContractAddr, LINK_TOKEN_ABI, owner);
    const tx = await linkTokenContract.transferAndCall(vrfContractAddr, amount, subId);
    console.info(`Transaction Hash: ${tx.hash}`);
  });
