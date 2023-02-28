// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";

import "@gemunion/contracts-access-list/contracts/extension/BlackList.sol";

import "./ERC721Simple.sol";

/**
 * @dev Advanced preset of ERC721 token contract that includes the following extensions:
 *      - Simple (Gemunion)
 *        core functionality to work in Gemunion's ecosystem
 *      - BlackList (Gemunion)
 *        provides access list to restrict suspicious account from interaction with tokens
 */
contract ERC721Blacklist is ERC721Simple, BlackList {
  constructor(
    string memory name,
    string memory symbol,
    uint96 royalty,
    string memory baseTokenURI
  ) ERC721Simple(name, symbol, royalty, baseTokenURI) {}

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(AccessControl, ERC721Simple) returns (bool) {
    return super.supportsInterface(interfaceId);
  }

  /**
   * @dev Hook that is called before any transfer of tokens.
   *      Checks if the sender or receiver is blacklisted before the transfer is executed.
   *
   * @param from Address of sender
   * @param to Address of receiver
   * @param firstTokenId First token id in the batch
   * @param batchSize Size of the batch
   */
  function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal override {
    // Ensure the sender is not blacklisted
    require(!this.isBlacklisted(from), "Blacklist: sender is blacklisted");
    // Ensure the receiver is not blacklisted
    require(!this.isBlacklisted(to), "Blacklist: receiver is blacklisted");
    // Execute other hooks
    super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
  }
}
