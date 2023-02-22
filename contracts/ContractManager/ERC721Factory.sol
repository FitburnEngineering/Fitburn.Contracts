// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "./AbstractFactory.sol";

contract ERC721Factory is AbstractFactory {
  bytes private constant ERC721_ARGUMENTS_SIGNATURE =
    "Erc721Args(string name,string symbol,uint96 royalty,string baseTokenURI,string contractTemplate)";
  bytes32 private constant ERC721_ARGUMENTS_TYPEHASH = keccak256(abi.encodePacked(ERC721_ARGUMENTS_SIGNATURE));

  bytes32 private immutable ERC721_PERMIT_SIGNATURE =
    keccak256(bytes.concat("EIP712(Params params,Erc721Args args)", ERC721_ARGUMENTS_SIGNATURE, PARAMS_SIGNATURE));

  address[] private _erc721_tokens;

  struct Erc721Args {
    string name;
    string symbol;
    uint96 royalty;
    string baseTokenURI;
    string contractTemplate;
  }

  event ERC721TokenDeployed(address addr, Erc721Args args);

  function deployERC721Token(
    Params calldata params,
    Erc721Args calldata args,
    bytes calldata signature
  ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (address addr) {
    _checkNonce(params.nonce);

    address signer = _recoverSigner(_hashERC721(params, args), signature);
    require(hasRole(DEFAULT_ADMIN_ROLE, signer), "ContractManager: Wrong signer");

    addr = deploy2(params.bytecode, abi.encode(args.name, args.symbol, args.royalty, args.baseTokenURI), params.nonce);
    _erc721_tokens.push(addr);

    emit ERC721TokenDeployed(addr, args);

    bytes32[] memory roles = new bytes32[](2);
    roles[0] = MINTER_ROLE;
    roles[1] = DEFAULT_ADMIN_ROLE;

    grantFactoryMintPermission(addr);
    grantFactoryMetadataPermission(addr);
    fixPermissions(addr, roles);
  }

  function _hashERC721(Params calldata params, Erc721Args calldata args) internal view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(abi.encode(ERC721_PERMIT_SIGNATURE, _hashParamsStruct(params), _hashErc721Struct(args)))
      );
  }

  function _hashErc721Struct(Erc721Args calldata args) private pure returns (bytes32) {
    return
      keccak256(
        abi.encode(
          ERC721_ARGUMENTS_TYPEHASH,
          keccak256(abi.encodePacked(args.name)),
          keccak256(abi.encodePacked(args.symbol)),
          args.royalty,
          keccak256(abi.encodePacked(args.baseTokenURI)),
          keccak256(abi.encodePacked(args.contractTemplate))
        )
      );
  }

  function allERC721Tokens() external view returns (address[] memory) {
    return _erc721_tokens;
  }
}
