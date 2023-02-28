// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";

import "@gemunion/contracts-erc721/contracts/interfaces/IERC4906.sol";
import "@gemunion/contracts-misc/contracts/constants.sol";

import "./ERC721Blacklist.sol";
import "./interfaces/IERC721Upgradeable.sol";
import "../utils/constants.sol";

/**
 * @dev Advanced preset of ERC721 token contract that includes the following extensions:
 *      - Simple (Gemunion)
 *        core functionality to work in Gemunion's ecosystem
 *      - Blacklist (Gemunion)
 *        provides access list to restrict suspicious account from interaction with tokens
 *      - ERC4906 (OpenSea)
 *        notifies marketplace about metadata update
 */
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

  /**
   * @dev upgrades token metadata
   *
   * @param tokenId that would be upgraded
   */
  function earnUpgrade(uint256 tokenId) public virtual onlyRole(METADATA_ROLE) returns (bool) {
    // Revert if the token has not been minted yet
    _requireMinted(tokenId);

    // Get and increment the EARN_UPGRADE value of the token
    uint256 value = getRecordFieldValue(tokenId, EARN_UPGRADE);
    // Set the Metadata of tokenId of the record EARN_UPGRADE field to zero.
    _upsertRecordField(tokenId, EARN_UPGRADE, value + 1);

    // Notify our server
    emit EarnUpgraded(_msgSender(), tokenId, value + 1);
    // support IERC4906
    emit MetadataUpdate(tokenId);

    // Return true to indicate that the upgrade was successful
    return true;
  }

  /**
   * @dev upgrades token metadata
   *
   * @param tokenId that would be upgraded
   */
  function timeUpgrade(uint256 tokenId) public virtual onlyRole(METADATA_ROLE) returns (bool) {
    // Revert if the token has not been minted yet
    _requireMinted(tokenId);

    // Get and increment the TIME_UPGRADE value of the token
    uint256 value = getRecordFieldValue(tokenId, TIME_UPGRADE);
    // Set the Metadata of tokenId of the record TIME_UPGRADE field to zero.
    _upsertRecordField(tokenId, TIME_UPGRADE, value + 1);

    // Notify our server
    emit TimeUpgraded(_msgSender(), tokenId, value + 1);
    // support IERC4906
    emit MetadataUpdate(tokenId);

    // Return true to indicate that the upgrade was successful
    return true;
  }

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Blacklist, IERC165) returns (bool) {
    return
      interfaceId == IERC4906_ID ||
      interfaceId == type(IERC721Upgradeable).interfaceId ||
      super.supportsInterface(interfaceId);
  }
}
