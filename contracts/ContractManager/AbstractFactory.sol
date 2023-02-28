// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

import "@gemunion/contracts-misc/contracts/constants.sol";

import "../utils/constants.sol";

/**
 * @title AbstractFactory
 * @dev Utility contract provides common functionality for deployment other contracts (tokens)
 */
abstract contract AbstractFactory is EIP712, AccessControl {
  using ECDSA for bytes32;

  // mapping to track expired nonces
  mapping(bytes32 => bool) private _expired;

  bytes internal constant PARAMS_SIGNATURE = "Params(bytes32 nonce,bytes bytecode)";
  bytes32 private constant PARAMS_TYPEHASH = keccak256(abi.encodePacked(PARAMS_SIGNATURE));

  address[] _minters;
  address[] _manipulators;

  struct Params {
    bytes32 nonce;
    bytes bytecode;
  }

  constructor() EIP712("ContractManager", "1.0.0") {
    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
  }

  /**
   * @dev Deploys a contract using `create2` optcode.
   *
   * @param bytecode The bytecode to deploy.
   * @param arguments The constructor arguments for the contract.
   * @param nonce A random value to ensure the deployed address is unique.
   * @return addr The address of the deployed contract.
   */
  function deploy2(bytes calldata bytecode, bytes memory arguments, bytes32 nonce) internal returns (address addr) {
    // Combine `bytecode` and `arguments` into a single `bytes` array.
    bytes memory _bytecode = abi.encodePacked(bytecode, arguments);

    // Deploy the contract using `create2`
    // The deployed address will be deterministic based on `nonce` and the hash of `_bytecode`.
    return Create2.deploy(0, nonce, _bytecode);
  }

  /**
   * @dev Set the list of allowed factories for creating and manipulating tokens
   *
   * @param minters An array of addresses representing the allowed token minters
   * @param manipulators An array of addresses representing the allowed token manipulators
   */
  function setFactories(address[] memory minters, address[] memory manipulators) public onlyRole(DEFAULT_ADMIN_ROLE) {
    _minters = minters;
    _manipulators = manipulators;
  }

  /**
   * @dev Adds a new factory to the list of minters or manipulators based on the specified role.
   *
   * @param factory The address of the factory to add.
   * @param role The role of the factory. Must be either MINTER_ROLE or METADATA_ROLE.
   */
  function addFactory(address factory, bytes32 role) public onlyRole(DEFAULT_ADMIN_ROLE) {
    // Check that the specified role is either MINTER_ROLE or METADATA_ROLE
    require((role == MINTER_ROLE || role == METADATA_ROLE), "ContractManager: Wrong role");

    // Add the factory address to the appropriate array based on the specified role
    if (role == MINTER_ROLE) {
      _minters.push(factory);
    } else if (role == METADATA_ROLE) {
      _manipulators.push(factory);
    }
  }

  /**
   * @notice Removes a factory address from the list of minters and manipulators.
   * @param factory The address of the factory to be removed.
   */
  function removeFactory(address factory) public onlyRole(DEFAULT_ADMIN_ROLE) {
    // Loop through the minters list and remove the factory if it's found.
    for (uint256 i = 0; i < _minters.length; i++) {
      if (_minters[i] == factory) {
        delete _minters[i];
      }
    }

    // Loop through the manipulators list and remove the factory if it's found.
    for (uint256 i = 0; i < _manipulators.length; i++) {
      if (_manipulators[i] == factory) {
        delete _manipulators[i];
      }
    }
  }

  /**
   * @dev Grants MINTER_ROLE to factories
   *
   * @param addr Address of the factory
   */
  function grantFactoryMintPermission(address addr) internal {
    // Create an instance of the contract that supports the AccessControl interface.
    IAccessControl instance = IAccessControl(addr);
    // Grant MINTER_ROLE to all _minters
    for (uint256 i = 0; i < _minters.length; i++) {
      instance.grantRole(MINTER_ROLE, _minters[i]);
    }
  }

  /**
   * @dev Grants METADATA_ROLE to contracts that can update token's metadata
   *
   * @param addr Address of the factory that support IAccessControl
   */
  function grantFactoryMetadataPermission(address addr) internal {
    // Create an instance of the contract that supports the AccessControl interface.
    IAccessControl instance = IAccessControl(addr);
    // Grant METADATA_ROLE to all _manipulators
    for (uint256 i = 0; i < _manipulators.length; i++) {
      instance.grantRole(METADATA_ROLE, _manipulators[i]);
    }
  }

  /**
   * @dev Grants the specified roles to the deployer of the contract.
   *
   * @param addr The address of the contract to modify permissions for.
   * @param roles An array of role IDs to modify permissions for.
   */
  function fixPermissions(address addr, bytes32[] memory roles) internal {
    // Create an instance of the contract that supports the AccessControl interface.
    IAccessControl instance = IAccessControl(addr);

    for (uint256 i = 0; i < roles.length; i++) {
      // Grant the specified roles to the caller of the function.
      instance.grantRole(roles[i], _msgSender());
      // Renounce the specified roles from the ContractManager contract.
      instance.renounceRole(roles[i], address(this));
    }
  }

  /**
   * @dev Recover the address of the signer of transaction
   *
   * @param digest The message digest that was signed.
   * @param signature The signature bytes of the signer.
   * @return The address of the signer of the message.
   */
  function _recoverSigner(bytes32 digest, bytes calldata signature) internal pure returns (address) {
    return digest.recover(signature);
  }

  /**
   * @dev Prevents transaction replay
   *
   * @param nonce The nonce of the transaction.
   */
  function _checkNonce(bytes32 nonce) internal {
    // Check that the transaction with the same nonce was not executed yet
    require(!_expired[nonce], "ContractManager: Expired signature");
    // Mark the transaction as executed.
    _expired[nonce] = true;
  }

  /**
   * @dev Computes the hash of the Params struct for signing purposes.
   *
   * @param params The Params struct to hash.
   * @return The hash of the Params struct.
   */
  function _hashParamsStruct(Params calldata params) internal pure returns (bytes32) {
    return keccak256(abi.encode(PARAMS_TYPEHASH, params.nonce, keccak256(abi.encodePacked(params.bytecode))));
  }
}
