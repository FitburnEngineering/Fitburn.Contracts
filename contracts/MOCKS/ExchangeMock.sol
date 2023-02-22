// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import "@gemunion/contracts-erc20/contracts/extensions/ERC1363Receiver.sol";

import "../Exchange/ExchangeUtils.sol";

contract ExchangeMock is ExchangeUtils, AccessControl, ERC721Holder, ERC1155Holder, ERC1363Receiver {
  function testSpendFrom(Asset[] memory price, address spender, address receiver) external payable {
    spendFrom(price, spender, receiver);
  }

  function testSpend(Asset[] memory price, address receiver) external payable {
    //` Spender here always Exchange contract - address(this)), due to only he have permision to call ERC20.transfer
    spend(price, receiver);
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(AccessControl, ERC1155Receiver) returns (bool) {
    return super.supportsInterface(interfaceId);
  }

  receive() external payable {}
}
