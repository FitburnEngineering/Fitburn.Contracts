// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "@gemunion/contracts-misc/contracts/constants.sol";

contract ERC20Mock is AccessControl, ERC20, ERC20Capped {
  constructor(string memory name, string memory symbol, uint256 cap) ERC20(name, symbol) ERC20Capped(cap) {
    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    _setupRole(MINTER_ROLE, _msgSender());
  }

  function _mint(address account, uint256 amount) internal virtual override(ERC20, ERC20Capped) {
    super._mint(account, amount);
  }

  function mint(address to, uint256 amount) public virtual onlyRole(DEFAULT_ADMIN_ROLE) {
    _mint(to, amount);
  }
}
