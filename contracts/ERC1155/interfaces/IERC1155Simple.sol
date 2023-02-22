// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface IERC1155Simple is IERC1155 {
  function mint(address to, uint256 id, uint256 amount, bytes memory data) external;

  function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) external;

  function burn(address from, uint256 id, uint256 amount) external;

  function burnBatch(address from, uint256[] memory ids, uint256[] memory amounts) external;
}
