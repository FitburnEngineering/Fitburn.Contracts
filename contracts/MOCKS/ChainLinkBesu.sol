// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@gemunion/contracts-chain-link/contracts/extensions/ChainLinkBase.sol";

abstract contract ChainLinkBesu is ChainLinkBase {
  constructor()
    ChainLinkBase(
      address(0xa50a51c09a5c451C52BB714527E1974b686D8e77), // vrfCoordinator
      address(0x42699A7612A82f1d9C36148af9C77354759b210b), // LINK token
      0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311, // system hash
      0.01 ether // fee
    )
  {}
}
