import { config } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";

import "./tasks";

config();

export default {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      blockGasLimit: 1e10, // default: 3e7
      gas: 7000000,
    },
    besu: {
      url: process.env.JSON_RPC_ADDR_BESU,
      timeout: 142000,
      accounts: [
        "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63", // 0xfe3b557e8fb62b89f4916b721be55ceb828dbd73
        "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3", // 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
        "0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f", // 0xf17f52151EbEF6C7334FAD080c5704D77216b732
      ],
    },
    gemunion: {
      url: process.env.JSON_RPC_ADDR_GEMUNION,
      timeout: 30000,
      accounts: [
        "0x93551a60e21c15bd7cf36eb98cadba972e44aed3e7405f3bcee3c8d8fcb03c95", // 0x61284003E50b2D7cA2B95F93857abB78a1b0F3Ca
        "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3", // 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
        "0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f", // 0xf17f52151EbEF6C7334FAD080c5704D77216b732
      ],
    },
    binance: {
      url: process.env.JSON_RPC_ADDR_BINANCE,
      chainId: 56,
      gasPrice: 20000000000,
      accounts: {
        mnemonic: process.env.MM_MNEMONIC,
      },
    },
    // has to have underscore
    binance_test: {
      url: process.env.JSON_RPC_ADDR_BINANCE_TEST,
      chainId: 97,
      gasPrice: 20000000000,
      accounts: {
        mnemonic: process.env.MM_MNEMONIC,
      },
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.4.18",
      },
      {
        version: "0.5.16",
      },
      {
        version: "0.7.6",
      },
      {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000, // DO NOT CHANGE
          },
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
  },
  contractSizer: {
    alphaSort: true,
  },
} as HardhatUserConfig;
