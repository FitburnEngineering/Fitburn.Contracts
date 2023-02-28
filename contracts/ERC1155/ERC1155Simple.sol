// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@gemunion/contracts-erc1155/contracts/preset/ERC1155ABSR.sol";
import "@gemunion/contracts-erc1155/contracts/extensions/ERC1155BaseUrl.sol";

contract ERC1155Simple is ERC1155ABSR, ERC1155BaseUrl {
  constructor(uint96 royaltyNumerator, string memory baseTokenURI) ERC1155ABSR(royaltyNumerator, baseTokenURI) {}

  /**
   * @return string The token URI
   */
  function uri(uint256 tokenId) public view virtual override returns (string memory) {
    return url(super.uri(tokenId));
  }
}
