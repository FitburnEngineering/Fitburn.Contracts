// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@gemunion/contracts-chain-link-v2/contracts/mocks/VRFCoordinator.sol";

contract VrfV2 is VRFCoordinatorMock {
  constructor(address link) VRFCoordinatorMock(link) {}
}
