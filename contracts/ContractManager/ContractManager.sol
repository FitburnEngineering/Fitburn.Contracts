// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "./VestingFactory.sol";
import "./ERC20Factory.sol";
import "./ERC721Factory.sol";

/**
 * @title ContractManager
 * @dev Core contract that provides functionality for deployment of other contracts (tokens).
 */
contract ContractManager is AccessControl, VestingFactory, ERC20Factory, ERC721Factory {
  /**
   * @dev Destroy the contract and transfer any remaining Ether to the owner's address
   */
  function destroy() public onlyRole(DEFAULT_ADMIN_ROLE) {
    selfdestruct(payable(_msgSender()));
  }
}
