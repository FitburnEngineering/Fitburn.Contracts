// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "./AbstractFactory.sol";

/**
 * @title ERC20Factory
 * @dev Extension that provides functionality for deployment of ERC20 tokens
 */
contract ERC20Factory is AbstractFactory {
  bytes private constant ERC20_ARGUMENTS_SIGNATURE =
    "Erc20Args(string name,string symbol,uint256 cap,string contractTemplate)";
  bytes32 private constant ERC20_ARGUMENTS_TYPEHASH = keccak256(abi.encodePacked(ERC20_ARGUMENTS_SIGNATURE));

  bytes32 private immutable ERC20_PERMIT_SIGNATURE =
    keccak256(bytes.concat("EIP712(Params params,Erc20Args args)", ERC20_ARGUMENTS_SIGNATURE, PARAMS_SIGNATURE));

  // Array of all deployed ERC20 token contracts
  address[] private _erc20_tokens;

  // Structure representing ERC20 template and arguments
  struct Erc20Args {
    string name;
    string symbol;
    uint256 cap;
    string contractTemplate;
  }

  // Event emitted when an ERC20 token is deployed
  event ERC20TokenDeployed(address addr, Erc20Args args);

  /**
   * @dev Deploys a new ERC20 token contract with a set of predefined roles.
   *
   * @param params struct containing bytecode and nonce
   * @param args The arguments for the ERC20 token contract deployment.
   * @param signature The signature provided to verify the transaction.
   * @return addr The address of the newly deployed ERC20 token contract.
   */
  function deployERC20Token(
    Params calldata params,
    Erc20Args calldata args,
    bytes calldata signature
  ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (address addr) {
    // Check that the transaction with the same nonce was not executed yet
    _checkNonce(params.nonce);

    // Recover the signer from signature
    address signer = _recoverSigner(_hashERC20(params, args), signature);
    // verify that signer has required permissions
    require(hasRole(DEFAULT_ADMIN_ROLE, signer), "ContractManager: Wrong signer");

    // Deploy the contract
    addr = deploy2(params.bytecode, abi.encode(args.name, args.symbol, args.cap), params.nonce);
    // add deployed address to the list of ERC20 token contracts
    _erc20_tokens.push(addr);

    // Notify our server about successful deployment
    emit ERC20TokenDeployed(addr, args);

    // Grant minting permissions to Exchange and MysteryBox
    grantFactoryMintPermission(addr);

    // Grant necessary permissions to the deployer
    bytes32[] memory roles = new bytes32[](3);
    roles[0] = MINTER_ROLE;
    roles[1] = SNAPSHOT_ROLE;
    roles[2] = DEFAULT_ADMIN_ROLE;
    fixPermissions(addr, roles);
  }

  /**
   * @dev Computes the hash of the ERC20 token contract arguments and deployment params.
   *
   * @param params struct containing bytecode and nonce
   * @param args The arguments for the ERC20 token contract deployment.
   * @return bytes32 The keccak256 hash of the arguments and params.
   */
  function _hashERC20(Params calldata params, Erc20Args calldata args) internal view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(abi.encode(ERC20_PERMIT_SIGNATURE, _hashParamsStruct(params), _hashErc20Struct(args)))
      );
  }

  /**
   * @dev Computes the hash of the ERC20 token contract arguments.
   *
   * @param args The arguments for the ERC20 token contract deployment.
   * @return bytes32 The keccak256 hash of the arguments.
   */
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

  /**
   * @dev Returns an array of all deployed ERC20 contract addresses.
   */
  function allERC20Tokens() external view returns (address[] memory) {
    return _erc20_tokens;
  }
}
