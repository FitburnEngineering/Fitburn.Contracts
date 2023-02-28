// SPDX-License-Identifier: MIT

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/finance/VestingWallet.sol";
import "@openzeppelin/contracts/governance/utils/IVotes.sol";
import "@openzeppelin/contracts/utils/Multicall.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import "@gemunion/contracts-erc20/contracts/extensions/ERC1363Receiver.sol";

import "../../Exchange/ExchangeUtils.sol";
import "../../Exchange/interfaces/IAsset.sol";

/**
 * @title AbstractVesting
 * @dev Basic preset of Vesting contract that includes the following extensions:
 *      - Ownable (OpenZeppelin)
 *      - VestingWallet (OpenZeppelin)
 *      - Multicall (OpenZeppelin)
 *      - ERC1363 (OpenZeppelin)
 *      This contract abstracts all common functions and is used as an foundation for other vesting contracts
 */
contract AbstractVesting is ERC165, VestingWallet, Ownable, Multicall, ExchangeUtils, ERC1363Receiver {
  event EtherReceived(address from, uint256 amount);

  uint64 public constant _dayInSeconds = 86400; // The number of seconds in a day
  uint16 private immutable _cliffInDays; // The number of days before the cliff period ends
  uint16 private immutable _dailyRelease; // The amount of tokens that can be released daily

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

  /**
   * @dev Computes the vesting schedule based on the total allocation and the timestamp.
   * @param totalAllocation The total allocation of tokens for vesting
   * @param timestamp The timestamp for which the vesting schedule is computed
   * @return The vesting schedule for the given total allocation and timestamp
   */
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

  /**
   * @dev Allows to top-up the contract with tokens.
   * @param price An array of Asset representing the tokens to be transferred.
   */
  function topUp(Asset[] memory price) external {
    spendFrom(price, _msgSender(), address(this));
  }

  /**
   * @dev Allows the contract to receive Ether.
   */
  receive() external payable override {
    emit EtherReceived(_msgSender(), msg.value);
  }

  /**
   * @dev Returns the beneficiary of the vesting contract.
   */
  function beneficiary() public view virtual override returns (address) {
    return owner();
  }

  /**
   * @dev Computes the amount of tokens that are releaseable at the current time for this contract's default token.
   * @return uin256 amount of tokens that can be released currently.
   */
  function releaseable() public view virtual returns (uint256) {
    return vestedAmount(uint64(block.timestamp)) - released();
  }

  /**
   * @dev Computes the amount of tokens that are releaseable at the current time for a given token.
   * @param token The ERC20 token address for which to compute the releaseable amount.
   * @return uint256 amount of tokens that can be released currently.
   */
  function releaseable(address token) public view virtual returns (uint256) {
    return vestedAmount(token, uint64(block.timestamp)) - released(token);
  }

  /**
   * @dev Allow delegation of votes
   */
  function delegate(IVotes token, address delegatee) public virtual onlyOwner {
    token.delegate(delegatee);
  }

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
    return
      interfaceId == type(IERC1363Receiver).interfaceId ||
      interfaceId == type(IERC1363Spender).interfaceId ||
      super.supportsInterface(interfaceId);
  }
}
