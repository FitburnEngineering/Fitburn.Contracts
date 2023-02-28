// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "../utils/constants.sol";
import "./interfaces/IAsset.sol";

contract SignatureValidator is EIP712, Context {
  using ECDSA for bytes32;
  using Address for address;

  mapping(bytes32 => bool) private _expired;

  bytes private constant PARAMS_SIGNATURE =
    "Params(bytes32 nonce,uint256 externalId,uint256 expiresAt,address referrer)";
  bytes32 private constant PARAMS_TYPEHASH = keccak256(abi.encodePacked(PARAMS_SIGNATURE));

  bytes private constant ASSET_SIGNATURE = "Asset(uint256 tokenType,address token,uint256 tokenId,uint256 amount)";
  bytes32 private constant ASSET_TYPEHASH = keccak256(abi.encodePacked(ASSET_SIGNATURE));

  bytes32 private immutable ONE_TO_ONE_TYPEHASH =
    keccak256(
      bytes.concat("EIP712(address account,Params params,Asset item,Asset price)", ASSET_SIGNATURE, PARAMS_SIGNATURE)
    );
  bytes32 private immutable ONE_TO_MANY_TYPEHASH =
    keccak256(
      bytes.concat("EIP712(address account,Params params,Asset item,Asset[] price)", ASSET_SIGNATURE, PARAMS_SIGNATURE)
    );
  bytes32 private immutable MANY_TO_MANY_TYPEHASH =
    keccak256(
      bytes.concat(
        "EIP712(address account,Params params,Asset[] items,Asset[] price)",
        ASSET_SIGNATURE,
        PARAMS_SIGNATURE
      )
    );

  constructor(string memory name) EIP712(name, "1.0.0") {}

  /**
   * @dev Recovers the signer of a one-to-one signature.
   * @dev Checks that the signature is not expired and matches passed parameters.
   *
   * @param params Struct of Params that containing the signature parameters.
   * @param item Struct of Asset that will be purchased/upgraded/claimed...
   * @param price Struct of Asset that will be used as payment.
   * @param signature The signature to be verified.
   * @return address of the signer.
   */
  function _recoverOneToOneSignature(
    Params memory params,
    Asset memory item,
    Asset memory price,
    bytes calldata signature
  ) internal returns (address) {
    // Check that the transaction with the same nonce was not executed yet
    require(!_expired[params.nonce], "Exchange: Expired signature");
    // Mark the transaction as executed.
    _expired[params.nonce] = true;

    // If the signature has an expiration time
    if (params.expiresAt != 0) {
      // Check that it has not expired.
      require(block.timestamp <= params.expiresAt, "Exchange: Expired signature");
    }

    address account = _msgSender();
    // Get the signer of the message hash
    return _recoverSigner(_hashOneToOne(account, params, item, price), signature);
  }

  /**
   * @dev Recovers the signer of a one-to-many signature.
   * @dev Checks that the signature is not expired and matches passed parameters.
   *
   * @param params struct of Params that containing the signature parameters.
   * @param item struct of Asset that will be purchased/upgraded/claimed...
   * @param price array of Asset structs that will be used as payment.
   * @param signature The signature to be verified.
   * @return address of the signer.
   */
  function _recoverOneToManySignature(
    Params memory params,
    Asset memory item,
    Asset[] memory price,
    bytes calldata signature
  ) internal returns (address) {
    // Check that the transaction with the same nonce was not executed yet
    require(!_expired[params.nonce], "Exchange: Expired signature");
    // Mark the transaction as executed.
    _expired[params.nonce] = true;

    // If the signature has an expiration time
    if (params.expiresAt != 0) {
      // Check that it has not expired.
      require(block.timestamp <= params.expiresAt, "Exchange: Expired signature");
    }

    address account = _msgSender();
    // Get the signer of the message hash
    return _recoverSigner(_hashOneToMany(account, params, item, price), signature);
  }

  /**
   * @dev Recovers the signer of a many-to-many signature.
   * @dev Checks that the signature is not expired and matches passed parameters.
   *
   * @param params struct of Params that containing the signature parameters.
   * @param items array of Asset structs that will be purchased/upgraded/claimed...
   * @param price array of Asset structs that will be used as payment.
   * @param signature The signature to be verified.
   * @return address of the signer.
   */
  function _recoverManyToManySignature(
    Params memory params,
    Asset[] memory items,
    Asset[] memory price,
    bytes calldata signature
  ) internal returns (address) {
    // Check that the transaction with the same nonce was not executed yet
    require(!_expired[params.nonce], "Exchange: Expired signature");
    // Mark the transaction as executed.
    _expired[params.nonce] = true;

    // If the signature has an expiration time
    if (params.expiresAt != 0) {
      // Check that it has not expired.
      require(block.timestamp <= params.expiresAt, "Exchange: Expired signature");
    }

    address account = _msgSender();
    // Get the signer of the message hash
    return _recoverSigner(_hashManyToMany(account, params, items, price), signature);
  }

  function _recoverSigner(bytes32 digest, bytes memory signature) private pure returns (address) {
    return digest.recover(signature);
  }

  /**
   * @dev Computes the hash of the one-to-one signature message using EIP-712 typed data hashing.
   *
   * @param account The address of the signer.
   * @param params struct of Params that containing the signature parameters.
   * @param item struct of Asset that will be purchased/upgraded/claimed...
   * @param price struct of Asset that will be used as payment.
   * @return bytes32 hash of the signature message.
   */
  function _hashOneToOne(
    address account,
    Params memory params,
    Asset memory item,
    Asset memory price
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            ONE_TO_ONE_TYPEHASH,
            account,
            _hashParamsStruct(params),
            _hashAssetStruct(item),
            _hashAssetStruct(price)
          )
        )
      );
  }

  /**
   * @dev Computes the hash of the one-to-many signature message using EIP-712 typed data hashing.
   *
   * @param account The address of the signer.
   * @param params struct of Params that containing the signature parameters.
   * @param item struct of Asset that will be purchased/upgraded/claimed...
   * @param price array of Asset structs that will be used as payment.
   * @return bytes32 hash of the signature message.
   */
  function _hashOneToMany(
    address account,
    Params memory params,
    Asset memory item,
    Asset[] memory price
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            ONE_TO_MANY_TYPEHASH,
            account,
            _hashParamsStruct(params),
            _hashAssetStruct(item),
            _hashAssetStructArray(price)
          )
        )
      );
  }

  /**
   * @dev Computes the hash of the many-to-many signature message using EIP-712 typed data hashing.
   *
   * @param account The address of the signer.
   * @param params struct of Params that containing the signature parameters.
   * @param items array of Asset structs that will be purchased/upgraded/claimed...
   * @param price array of Asset structs that will be used as payment.
   * @return bytes32 hash of the signature message.
   */
  function _hashManyToMany(
    address account,
    Params memory params,
    Asset[] memory items,
    Asset[] memory price
  ) private view returns (bytes32) {
    return
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            MANY_TO_MANY_TYPEHASH,
            account,
            _hashParamsStruct(params),
            _hashAssetStructArray(items),
            _hashAssetStructArray(price)
          )
        )
      );
  }

  /**
   * @dev Computes the hash of Params struct using EIP-712 typed data hashing.
   *
   * @param params Struct of Params that containing the signature parameters.
   * @return betys32 hash of Params struct.
   */
  function _hashParamsStruct(Params memory params) private pure returns (bytes32) {
    return keccak256(abi.encode(PARAMS_TYPEHASH, params.nonce, params.externalId, params.expiresAt, params.referrer));
  }

  /**
   * @dev Computes the hash of Asset struct using EIP-712 typed data hashing.
   *
   * @param item Struct of Asset that will be purchased/upgraded/claimed....
   * @return bytes32 hash of Asset struct.
   */
  function _hashAssetStruct(Asset memory item) private pure returns (bytes32) {
    return keccak256(abi.encode(ASSET_TYPEHASH, item.tokenType, item.token, item.tokenId, item.amount));
  }

  /**
   * @dev Computes the hash of an array of Asset structs using EIP-712 typed data hashing.
   *
   * @param items Array of Asset structs that will be purchased/upgraded/claimed....
   * @return bytes32 hash of an array of Asset structs.
   */
  function _hashAssetStructArray(Asset[] memory items) private pure returns (bytes32) {
    uint256 length = items.length;
    bytes32[] memory padded = new bytes32[](length);
    for (uint256 i = 0; i < length; i++) {
      padded[i] = _hashAssetStruct(items[i]);
    }
    return keccak256(abi.encodePacked(padded));
  }
}
