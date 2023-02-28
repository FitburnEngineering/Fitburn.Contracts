// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@gemunion/contracts-erc721/contracts/extensions/ERC4907.sol";

import "./ERC721BlacklistUpgradeable.sol";

/**
 * @dev Advanced preset of ERC721 token contract that includes the following extensions:
 *      - Simple (Gemunion)
 *        core functionality to work in Gemunion's ecosystem
 *      - Blacklist (Gemunion)
 *        provides access list to restrict suspicious account from interaction with tokens
 *      - ERC4906 (OpenSea)
 *        notifies marketplace about metadata update
 *      - ERC4907 (ThirdWeb)
 *        enables rent/borrow functionality
 */
contract ERC721BlacklistUpgradeableRentable is ERC721BlacklistUpgradeable, ERC4907 {
  constructor(
    string memory name,
    string memory symbol,
    uint96 royalty,
    string memory baseTokenURI
  ) ERC721BlacklistUpgradeable(name, symbol, royalty, baseTokenURI) {}

  /**
   * @dev Checks if the given owner address is the owner of or is approved to take ownership of the token with ID tokenId.
   *
   * @param owner The address to check ownership or approval status for.
   * @param tokenId The ID of the token to check.
   * @return bool Returns true if the given owner address is the owner of or is approved to take ownership of the token with ID tokenId, false otherwise.
   */
  function _isApprovedOrOwner(address owner, uint256 tokenId) internal view override(ERC721, ERC4907) returns (bool) {
    return super._isApprovedOrOwner(owner, tokenId);
  }

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(ERC721BlacklistUpgradeable, ERC4907) returns (bool) {
    return ERC721BlacklistUpgradeable.supportsInterface(interfaceId) || ERC4907.supportsInterface(interfaceId);
  }
}
