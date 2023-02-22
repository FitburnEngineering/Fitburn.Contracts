// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@gemunion/contracts-erc20/contracts/preset/ERC20ABCS.sol";

contract ERC20Simple is ERC20ABCS {
  constructor(string memory name, string memory symbol, uint256 cap) ERC20ABCS(name, symbol, cap) {}

  receive() external payable {
    revert();
  }
}
