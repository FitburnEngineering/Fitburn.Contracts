// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@gemunion/contracts-chain-link/contracts/mocks/VRFCoordinatorV2.sol";

contract VrfV2 is VRFCoordinatorV2Mock {
  constructor( address link ) VRFCoordinatorV2Mock(link) {}
}
