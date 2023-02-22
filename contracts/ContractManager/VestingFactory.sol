// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "./AbstractFactory.sol";
import "hardhat/console.sol";

contract VestingFactory is AbstractFactory {
  bytes private constant VESTING_ARGUMENTS_SIGNATURE =
    "VestingArgs(address account,uint64 startTimestamp,uint64 duration,string contractTemplate)";
  bytes32 private constant VESTING_ARGUMENTS_TYPEHASH = keccak256(abi.encodePacked(VESTING_ARGUMENTS_SIGNATURE));

  bytes32 private immutable VESTING_PERMIT_SIGNATURE =
    keccak256(bytes.concat("EIP712(Params params,VestingArgs args)", PARAMS_SIGNATURE, VESTING_ARGUMENTS_SIGNATURE));

  address[] private _vesting;

  struct VestingArgs {
    address account;
    uint64 startTimestamp; // in sec
    uint64 duration; // in sec
    string contractTemplate;
  }

  event VestingDeployed(address addr, VestingArgs args);

  function deployVesting(
    Params calldata params,
    VestingArgs calldata args,
    bytes calldata signature
  ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (address addr) {
    _checkNonce(params.nonce);

    address signer = _recoverSigner(_hashVesting(params, args), signature);
    require(hasRole(DEFAULT_ADMIN_ROLE, signer), "ContractManager: Wrong signer");

    addr = deploy2(params.bytecode, abi.encode(args.account, args.startTimestamp, args.duration), params.nonce);
    _vesting.push(addr);

    emit VestingDeployed(addr, args);
  }

  function _hashVesting(Params calldata params, VestingArgs calldata args) internal view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(abi.encode(VESTING_PERMIT_SIGNATURE, _hashParamsStruct(params), _hashVestingStruct(args)))
      );
  }

  function _hashVestingStruct(VestingArgs calldata args) private pure returns (bytes32) {
    return
      keccak256(
        abi.encode(
          VESTING_ARGUMENTS_TYPEHASH,
          args.account,
          args.startTimestamp,
          args.duration,
          keccak256(abi.encodePacked(args.contractTemplate))
        )
      );
  }

  function allVesting() external view returns (address[] memory) {
    return _vesting;
  }
}
