// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

enum TokenType {
  NATIVE,
  ERC20,
  ERC721,
  ERC998,
  ERC1155
}

struct Asset {
  TokenType tokenType;
  address token;
  uint256 tokenId;
  uint256 amount;
}

struct Params {
  bytes32 nonce;
  address referrer;
  uint256 externalId;
  uint256 expiresAt;
}
