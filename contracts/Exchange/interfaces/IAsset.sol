// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

enum TokenType {
  // 0: ETH on mainnet, MATIC on polygon, etc.
  NATIVE,
  // 1: ERC20 items (ERC777 and other ERC20 analogues could also technically work)
  ERC20,
  // 2: ERC721 items
  ERC721,
  // 3: ERC998 heroes
  ERC998,
  // 4: ERC1155 items
  ERC1155
}

struct Asset {
  TokenType tokenType;
  address token;
  uint256 tokenId; // or templateId or mysteryboxId
  uint256 amount;
}

struct Params {
  bytes32 nonce;
  address referrer;
  uint256 externalId;
  uint256 expiresAt;
}
