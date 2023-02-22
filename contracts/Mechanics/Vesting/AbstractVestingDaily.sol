// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/finance/VestingWallet.sol";
import "@openzeppelin/contracts/governance/utils/IVotes.sol";
import "@openzeppelin/contracts/utils/Multicall.sol";

import "@gemunion/contracts-erc20/contracts/extensions/ERC1363Receiver.sol";

import "../../Exchange/ExchangeUtils.sol";
import "../../Exchange/interfaces/IAsset.sol";

contract AbstractVestingDaily is VestingWallet, Ownable, Multicall, ExchangeUtils, ERC1363Receiver {
  event EtherReceived(address from, uint256 amount);

  uint64 public constant _dayInSeconds = 86400;
  uint16 private immutable _cliffInDays;
  uint16 private immutable _dailyRelease;

  constructor(
    address beneficiaryAddress,
    uint64 startTimestamp,
    uint16 cliffInDays,
    uint16 dailyRelease
  ) VestingWallet(address(1), startTimestamp, (10000000 * _dayInSeconds) / dailyRelease) {
    _cliffInDays = cliffInDays;
    _dailyRelease = dailyRelease;
    _transferOwnership(beneficiaryAddress);
  }

  function _vestingSchedule(uint256 totalAllocation, uint64 timestamp) internal view override returns (uint256) {
    uint256 _start = start() + _cliffInDays * _dayInSeconds;
    uint256 period = timestamp > _start ? (timestamp - _start) / _dayInSeconds : 0;

    if (timestamp < _start) {
      return 0;
    } else if (timestamp > _start + duration()) {
      return totalAllocation;
    } else {
      return (totalAllocation * period * _dailyRelease) / 10000000;
    }
  }

  function topUp(Asset[] memory price) external {
    spendFrom(price, _msgSender(), address(this));
  }

  receive() external payable override {
    emit EtherReceived(_msgSender(), msg.value);
  }

  // Vesting beneficiary
  function beneficiary() public view virtual override returns (address) {
    return owner();
  }

  function releaseable() public view virtual returns (uint256) {
    return vestedAmount(uint64(block.timestamp)) - released();
  }

  function releaseable(address token) public view virtual returns (uint256) {
    return vestedAmount(token, uint64(block.timestamp)) - released(token);
  }

  // Allow delegation of votes
  function delegate(IVotes token, address delegatee) public virtual onlyOwner {
    token.delegate(delegatee);
  }
}
