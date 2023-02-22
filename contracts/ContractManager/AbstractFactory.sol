// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

import "../utils/constants.sol";

abstract contract AbstractFactory is EIP712, AccessControl {
  using ECDSA for bytes32;

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

  function deploy(bytes calldata bytecode, bytes memory arguments) internal returns (address addr) {
    bytes memory _bytecode = abi.encodePacked(bytecode, arguments);

    assembly {
      addr := create(0, add(_bytecode, 0x20), mload(_bytecode))
      if iszero(extcodesize(addr)) {
        revert(0, 0)
      }
    }
  }

  function deploy2(bytes calldata bytecode, bytes memory arguments, bytes32 nonce) internal returns (address addr) {
    bytes memory _bytecode = abi.encodePacked(bytecode, arguments);

    return Create2.deploy(0, nonce, _bytecode);
  }

  function setFactories(address[] memory minters, address[] memory manipulators) public onlyRole(DEFAULT_ADMIN_ROLE) {
    _minters = minters;
    _manipulators = manipulators;
  }

  function addFactory(address factory, bytes32 role) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require((role == MINTER_ROLE || role == METADATA_ADMIN_ROLE), "ContractManager: Wrong role");

    if (role == MINTER_ROLE) {
      _minters.push(factory);
    } else if (role == METADATA_ADMIN_ROLE) {
      _manipulators.push(factory);
    }
  }

  function removeFactory(address factory) public onlyRole(DEFAULT_ADMIN_ROLE) {
    for (uint256 i = 0; i < _minters.length; i++) {
      if (_minters[i] == factory) {
        delete _minters[i];
      }
    }

    for (uint256 i = 0; i < _manipulators.length; i++) {
      if (_manipulators[i] == factory) {
        delete _manipulators[i];
      }
    }
  }

  function grantFactoryMintPermission(address addr) internal {
    IAccessControl instance = IAccessControl(addr);
    for (uint256 i = 0; i < _minters.length; i++) {
      instance.grantRole(MINTER_ROLE, _minters[i]);
    }
  }

  function grantFactoryMetadataPermission(address addr) internal {
    IAccessControl instance = IAccessControl(addr);
    for (uint256 i = 0; i < _manipulators.length; i++) {
      instance.grantRole(METADATA_ADMIN_ROLE, _manipulators[i]);
    }
  }

  function fixPermissions(address addr, bytes32[] memory roles) internal {
    IAccessControl instance = IAccessControl(addr);
    for (uint256 i = 0; i < roles.length; i++) {
      instance.grantRole(roles[i], _msgSender());
      instance.renounceRole(roles[i], address(this));
    }
  }

  function _recoverSigner(bytes32 digest, bytes calldata signature) internal pure returns (address) {
    return digest.recover(signature);
  }

  function _checkNonce(bytes32 nonce) internal {
    require(!_expired[nonce], "ContractManager: Expired signature");
    _expired[nonce] = true;
  }

  function _hashParamsStruct(Params calldata params) internal pure returns (bytes32) {
    return keccak256(abi.encode(PARAMS_TYPEHASH, params.nonce, keccak256(abi.encodePacked(params.bytecode))));
  }
}
