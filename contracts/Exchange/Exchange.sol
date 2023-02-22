// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import "@gemunion/contracts-erc20/contracts/extensions/ERC1363Receiver.sol";

import "../utils/constants.sol";
import "./ExchangeCore.sol";
import "./ExchangeGrade.sol";
import "./ExchangeClaim.sol";

contract Exchange is
  ExchangeCore,
  ExchangeGrade,
  ExchangeClaim,
  PaymentSplitter,
  ERC721Holder,
  ERC1155Holder,
  ERC1363Receiver
{
  using Address for address;

  constructor(
    string memory name,
    address[] memory payees,
    uint256[] memory shares
  ) SignatureValidator(name) PaymentSplitter(payees, shares) {
    address account = _msgSender();
    _setupRole(DEFAULT_ADMIN_ROLE, account);
    _setupRole(MINTER_ROLE, account);
    _setupRole(PAUSER_ROLE, account);
    _setupRole(METADATA_ADMIN_ROLE, account);
  }

  function pause() public virtual onlyRole(PAUSER_ROLE) {
    _pause();
  }

  function unpause() public virtual onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(AccessControl, ERC1155Receiver) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
