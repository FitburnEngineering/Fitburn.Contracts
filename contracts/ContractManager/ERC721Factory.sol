// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "./AbstractFactory.sol";

/**
 * @title ERC721Factory
 * @dev Extension that provides functionality for deployment of ERC721 tokens
 */
contract ERC721Factory is AbstractFactory {
  bytes private constant ERC721_ARGUMENTS_SIGNATURE =
    "Erc721Args(string name,string symbol,uint96 royalty,string baseTokenURI,string contractTemplate)";
  bytes32 private constant ERC721_ARGUMENTS_TYPEHASH = keccak256(abi.encodePacked(ERC721_ARGUMENTS_SIGNATURE));

  bytes32 private immutable ERC721_PERMIT_SIGNATURE =
    keccak256(bytes.concat("EIP712(Params params,Erc721Args args)", ERC721_ARGUMENTS_SIGNATURE, PARAMS_SIGNATURE));

  // Array of all deployed ERC721 token contract
  address[] private _erc721_tokens;

  // Structure representing ERC721 template and arguments
  struct Erc721Args {
    string name;
    string symbol;
    uint96 royalty;
    string baseTokenURI;
    string contractTemplate;
  }

  event ERC721TokenDeployed(address addr, Erc721Args args);

  /**
   * @dev Function to deploy an ERC721 token contract with a set of predefined roles.
   *
   * @param params struct containing bytecode and nonce
   * @param args The arguments for the ERC721 token contract deployment.
   * @param signature The signature provided to verify the transaction.
   * @return addr address of the deployed ERC721 token contract
   */
  function deployERC721Token(
    Params calldata params,
    Erc721Args calldata args,
    bytes calldata signature
  ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (address addr) {
    // Check that the transaction with the same nonce was not executed yet
    _checkNonce(params.nonce);

    // Recover the signer from signature
    address signer = _recoverSigner(_hashERC721(params, args), signature);
    // verify that signer has required permissions
    require(hasRole(DEFAULT_ADMIN_ROLE, signer), "ContractManager: Wrong signer");

    // Deploy the contract
    addr = deploy2(params.bytecode, abi.encode(args.name, args.symbol, args.royalty, args.baseTokenURI), params.nonce);
    // add deployed address to the list of ERC721 token contracts
    _erc721_tokens.push(addr);

    // Notify our server about successful deployment
    emit ERC721TokenDeployed(addr, args);

    // Grant minting permissions to Exchange (Purchase) and MysteryBox
    grantFactoryMintPermission(addr);

    // Grant update permissions to Exchange (Grade)
    grantFactoryMetadataPermission(addr);

    // Grant necessary permissions to the contract
    bytes32[] memory roles = new bytes32[](2);
    roles[0] = MINTER_ROLE;
    roles[1] = DEFAULT_ADMIN_ROLE;
    fixPermissions(addr, roles);
  }

  /**
   * @dev Computes the hash of the ERC721 token contract arguments and deployment params.
   *
   * @param params struct containing bytecode and nonce
   * @param args The arguments for the ERC721 token contract deployment.
   * @return bytes32 The keccak256 hash of the arguments and params.
   */
  function _hashERC721(Params calldata params, Erc721Args calldata args) internal view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(abi.encode(ERC721_PERMIT_SIGNATURE, _hashParamsStruct(params), _hashErc721Struct(args)))
      );
  }

  /**
   * @dev Computes the hash of the ERC721 token contract arguments.
   *
   * @param args The arguments for the ERC721 token contract deployment.
   * @return bytes32 The keccak256 hash of the arguments.
   */
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

  /**
   * @dev Returns an array of all deployed ERC721 contract addresses.
   */
  function allERC721Tokens() external view returns (address[] memory) {
    return _erc721_tokens;
  }
}
