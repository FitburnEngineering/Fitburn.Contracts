// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "./AbstractFactory.sol";

contract ERC20Factory is AbstractFactory {
  bytes private constant ERC20_ARGUMENTS_SIGNATURE =
    "Erc20Args(string name,string symbol,uint256 cap,string contractTemplate)";
  bytes32 private constant ERC20_ARGUMENTS_TYPEHASH = keccak256(abi.encodePacked(ERC20_ARGUMENTS_SIGNATURE));

  bytes32 private immutable ERC20_PERMIT_SIGNATURE =
    keccak256(bytes.concat("EIP712(Params params,Erc20Args args)", ERC20_ARGUMENTS_SIGNATURE, PARAMS_SIGNATURE));

  address[] private _erc20_tokens;

  struct Erc20Args {
    string name;
    string symbol;
    uint256 cap;
    string contractTemplate;
  }

  event ERC20TokenDeployed(address addr, Erc20Args args);

  function deployERC20Token(
    Params calldata params,
    Erc20Args calldata args,
    bytes calldata signature
  ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (address addr) {
    _checkNonce(params.nonce);

    address signer = _recoverSigner(_hashERC20(params, args), signature);
    require(hasRole(DEFAULT_ADMIN_ROLE, signer), "ContractManager: Wrong signer");

    addr = deploy2(params.bytecode, abi.encode(args.name, args.symbol, args.cap), params.nonce);
    _erc20_tokens.push(addr);

    emit ERC20TokenDeployed(addr, args);

    bytes32[] memory roles = new bytes32[](3);
    roles[0] = MINTER_ROLE;
    roles[1] = SNAPSHOT_ROLE;
    roles[2] = DEFAULT_ADMIN_ROLE;

    grantFactoryMintPermission(addr);
    fixPermissions(addr, roles);
  }

  function _hashERC20(Params calldata params, Erc20Args calldata args) internal view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(abi.encode(ERC20_PERMIT_SIGNATURE, _hashParamsStruct(params), _hashErc20Struct(args)))
      );
  }

  function _hashErc20Struct(Erc20Args calldata args) private pure returns (bytes32) {
    return
      keccak256(
        abi.encode(
          ERC20_ARGUMENTS_TYPEHASH,
          keccak256(abi.encodePacked(args.name)),
          keccak256(abi.encodePacked(args.symbol)),
          args.cap,
          keccak256(abi.encodePacked(args.contractTemplate))
        )
      );
  }

  function allERC20Tokens() external view returns (address[] memory) {
    return _erc20_tokens;
  }
}
