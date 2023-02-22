// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

interface IERC721Simple {
  struct Metadata {
    bytes32 key;
    uint256 value;
  }

  function getTokenMetadata(uint256 tokenId) external returns (Metadata[] calldata);

  function getRecordFieldValue(uint256 pk, bytes32 fieldKey) external view returns (uint256);

  function mintCommon(address to, uint256 templateId) external;
}
