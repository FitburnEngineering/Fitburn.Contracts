import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Network } from "@ethersproject/networks";
import { Contract } from "ethers";

import { tokenName } from "@gemunion/contracts-constants";

export const wrapOneToOneSignature = (network: Network, contract: Contract, account: SignerWithAddress) => {
  return (values: Record<string, any>) => {
    return account._signTypedData(
      // Domain
      {
        name: tokenName,
        version: "1.0.0",
        chainId: network.chainId,
        verifyingContract: contract.address,
      },
      // Types
      {
        EIP712: [
          { name: "account", type: "address" },
          { name: "params", type: "Params" },
          { name: "item", type: "Asset" },
          { name: "price", type: "Asset" },
        ],
        Params: [
          { name: "nonce", type: "bytes32" },
          { name: "externalId", type: "uint256" },
          { name: "expiresAt", type: "uint256" },
          { name: "referrer", type: "address" },
        ],
        Asset: [
          { name: "tokenType", type: "uint256" },
          { name: "token", type: "address" },
          { name: "tokenId", type: "uint256" },
          { name: "amount", type: "uint256" },
        ],
      },
      // Value
      values,
    );
  };
};

export const wrapOneToManySignature = (network: Network, contract: Contract, account: SignerWithAddress) => {
  return (values: Record<string, any>) => {
    return account._signTypedData(
      // Domain
      {
        name: tokenName,
        version: "1.0.0",
        chainId: network.chainId,
        verifyingContract: contract.address,
      },
      // Types
      {
        EIP712: [
          { name: "account", type: "address" },
          { name: "params", type: "Params" },
          { name: "item", type: "Asset" },
          { name: "price", type: "Asset[]" },
        ],
        Params: [
          { name: "nonce", type: "bytes32" },
          { name: "externalId", type: "uint256" },
          { name: "expiresAt", type: "uint256" },
          { name: "referrer", type: "address" },
        ],
        Asset: [
          { name: "tokenType", type: "uint256" },
          { name: "token", type: "address" },
          { name: "tokenId", type: "uint256" },
          { name: "amount", type: "uint256" },
        ],
      },
      // Value
      values,
    );
  };
};

export const wrapManyToManySignature = (network: Network, contract: Contract, account: SignerWithAddress) => {
  return (values: Record<string, any>) => {
    return account._signTypedData(
      // Domain
      {
        name: tokenName,
        version: "1.0.0",
        chainId: network.chainId,
        verifyingContract: contract.address,
      },
      // Types
      {
        EIP712: [
          { name: "account", type: "address" },
          { name: "params", type: "Params" },
          { name: "items", type: "Asset[]" },
          { name: "price", type: "Asset[]" },
        ],
        Params: [
          { name: "nonce", type: "bytes32" },
          { name: "externalId", type: "uint256" },
          { name: "expiresAt", type: "uint256" },
          { name: "referrer", type: "address" },
        ],
        Asset: [
          { name: "tokenType", type: "uint256" },
          { name: "token", type: "address" },
          { name: "tokenId", type: "uint256" },
          { name: "amount", type: "uint256" },
        ],
      },
      // Value
      values,
    );
  };
};
