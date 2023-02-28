// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "./AbstractFactory.sol";

/**
 * @title VestingFactory
 * @dev Extension that provides functionality for deployment of Vesting contracts
 */
contract VestingFactory is AbstractFactory {
  bytes private constant VESTING_ARGUMENTS_SIGNATURE =
    "VestingArgs(address account,uint64 startTimestamp,uint64 duration,string contractTemplate)";
  bytes32 private constant VESTING_ARGUMENTS_TYPEHASH = keccak256(abi.encodePacked(VESTING_ARGUMENTS_SIGNATURE));

  bytes32 private immutable VESTING_PERMIT_SIGNATURE =
    keccak256(bytes.concat("EIP712(Params params,VestingArgs args)", PARAMS_SIGNATURE, VESTING_ARGUMENTS_SIGNATURE));

  // Array of all deployed vesting contracts.
  address[] private _vesting;

  // Structure representing Vesting template and arguments
  struct VestingArgs {
    address account;
    uint64 startTimestamp; // in sec
    uint64 duration; // in sec
    string contractTemplate;
  }

  event VestingDeployed(address addr, VestingArgs args);

  /**
   * @dev Deploys a vesting contract with the specified arguments.
   *
   * @param params struct containing bytecode and nonce.
   * @param args The arguments for the vesting contract deployment.
   * @param signature The signature provided to verify the transaction.
   * @return addr address of the deployed vesting contract
   */
  function deployVesting(
    Params calldata params,
    VestingArgs calldata args,
    bytes calldata signature
  ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (address addr) {
    // Check that the transaction with the same nonce was not executed yet
    _checkNonce(params.nonce);

    // Recover the signer from signature
    address signer = _recoverSigner(_hashVesting(params, args), signature);
    // verify that signer has required permissions
    require(hasRole(DEFAULT_ADMIN_ROLE, signer), "ContractManager: Wrong signer");

    // Deploy the contract
    addr = deploy2(params.bytecode, abi.encode(args.account, args.startTimestamp, args.duration), params.nonce);
    // add deployed address to the list of vesting contracts
    _vesting.push(addr);

    // Notify our server about successful deployment
    emit VestingDeployed(addr, args);
  }

  /**
   * @dev Computes the hash of the vesting contract arguments and deployment params.
   *
   * @param params struct containing bytecode and nonce
   * @param args The arguments for the vesting contract deployment.
   * @return bytes32 The keccak256 hash of the arguments and params.
   */
  function _hashVesting(Params calldata params, VestingArgs calldata args) internal view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(abi.encode(VESTING_PERMIT_SIGNATURE, _hashParamsStruct(params), _hashVestingStruct(args)))
      );
  }

  /**
   * @dev Computes the hash of the vesting contract arguments.
   *
   * @param args The arguments for the vesting contract deployment.
   * @return bytes32 The keccak256 hash of the arguments.
   */
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

  /**
   * @dev Returns an array of all deployed vesting contract addresses.
   */
  function allVesting() external view returns (address[] memory) {
    return _vesting;
  }
}
