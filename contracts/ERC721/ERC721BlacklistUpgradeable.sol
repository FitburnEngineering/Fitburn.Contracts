// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";

import "@gemunion/contracts-erc721/contracts/interfaces/IERC4906.sol";

import "./ERC721Blacklist.sol";
import "./interfaces/IERC721Upgradeable.sol";
import "../utils/constants.sol";

contract ERC721BlacklistUpgradeable is IERC4906, IERC721Upgradeable, ERC721Blacklist {
  using Counters for Counters.Counter;

  event EarnUpgraded(address from, uint256 tokenId, uint256 value);
  event TimeUpgraded(address from, uint256 tokenId, uint256 value);

  constructor(
    string memory name,
    string memory symbol,
    uint96 royalty,
    string memory baseTokenURI
  ) ERC721Blacklist(name, symbol, royalty, baseTokenURI) {}

  function earnUpgrade(uint256 tokenId) public virtual onlyRole(METADATA_ADMIN_ROLE) returns (bool) {
    _requireMinted(tokenId);
    uint256 value = getRecordFieldValue(tokenId, EARN_UPGRADE);
    _upsertRecordField(tokenId, EARN_UPGRADE, value + 1);
    emit EarnUpgraded(_msgSender(), tokenId, value + 1);
    emit MetadataUpdate(tokenId);
    return true;
  }

  function timeUpgrade(uint256 tokenId) public virtual onlyRole(METADATA_ADMIN_ROLE) returns (bool) {
    _requireMinted(tokenId);
    uint256 value = getRecordFieldValue(tokenId, TIME_UPGRADE);
    _upsertRecordField(tokenId, TIME_UPGRADE, value + 1);
    emit TimeUpgraded(_msgSender(), tokenId, value + 1);
    emit MetadataUpdate(tokenId);
    return true;
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Blacklist, IERC165) returns (bool) {
    return interfaceId == IERC4906_ID || interfaceId == IERC721_GRADE_ID || super.supportsInterface(interfaceId);
  }
}
