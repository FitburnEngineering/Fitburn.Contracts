// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./SignatureValidator.sol";
import "./ExchangeUtils.sol";
import "./interfaces/IAsset.sol";
import "../ERC721/interfaces/IERC721Upgradeable.sol";

abstract contract ExchangeGrade is SignatureValidator, ExchangeUtils, AccessControl, Pausable {
  event EarnUpgrade(address from, uint256 externalId, Asset item, Asset[] price); // attr EARN_UPGRADE
  event TimeUpgrade(address from, uint256 externalId, Asset item, Asset[] price); // attr EARN_UPGRADE
  event EarnBoost(address from, uint256 externalId, Asset item, Asset[] price); // params EARN_BOOST
  event TimeBoost(address from, uint256 externalId, Asset item, Asset[] price); // params TIME_BOOST
  event Wash(address from, uint256 externalId, Asset item, Asset[] price); // params WORKOUTS

  /**
   * @dev Permanently updated token metadata on chain
   *
   * @param params Struct of Params that containing the signature parameters.
   * @param item Struct of Asset that will be used for upgrade
   * @param price array of Assets that will be used as payment.
   * @param signature The signature of the message.
   */
  function earnUpgrade(
    Params memory params,
    Asset memory item,
    Asset[] memory price,
    bytes calldata signature
  ) external payable whenNotPaused {
    // Recover the signer from signature
    address signer = _recoverOneToManySignature(params, item, price, signature);
    // Verify that signer has required permissions
    require(hasRole(METADATA_ROLE, signer), "Exchange: Wrong signer");

    // Get user account
    address account = _msgSender();
    // Spend the required amount of tokens.
    spendFrom(price, account, address(this));
    // Notify our server about successful upgrade
    emit EarnUpgrade(account, params.externalId, item, price);

    // Update EARN_UPGRADE metadata in NFT
    IERC721Upgradeable(item.token).earnUpgrade(item.tokenId);
  }

  /**
   * @dev Permanently updated token metadata on chain
   *
   * @param params Struct of Params that containing the signature parameters.
   * @param item Struct of Asset that will be used for upgrade
   * @param price array of Assets that will be used as payment.
   * @param signature The signature of the message.
   */
  function timeUpgrade(
    Params memory params,
    Asset memory item,
    Asset[] memory price,
    bytes calldata signature
  ) external payable whenNotPaused {
    // Recover the signer from signature
    address signer = _recoverOneToManySignature(params, item, price, signature);
    // Verify that signer has required permissions
    require(hasRole(METADATA_ROLE, signer), "Exchange: Wrong signer");

    // Get user account
    address account = _msgSender();
    // Spend the required amount of tokens.
    spendFrom(price, account, address(this));
    // Notify our server about successful upgrade
    emit TimeUpgrade(account, params.externalId, item, price);

    // Update TIME_UPGRADE metadata in NFT
    IERC721Upgradeable(item.token).timeUpgrade(item.tokenId);
  }

  /**
   * @dev Temporary updated token metadata in database
   *
   * @param params Struct of Params that containing the signature parameters.
   * @param item Struct of Asset that will be used for boost
   * @param price array of Assets that will be used as payment.
   * @param signature The signature of the message.
   */
  function earnBoost(
    Params memory params,
    Asset memory item,
    Asset[] memory price,
    bytes calldata signature
  ) external payable whenNotPaused {
    // Recover the signer from signature
    address signer = _recoverOneToManySignature(params, item, price, signature);
    // Verify that signer has required permissions
    require(hasRole(METADATA_ROLE, signer), "Exchange: Wrong signer");

    // Get user account
    address account = _msgSender();
    // Spend the required amount of tokens.
    spendFrom(price, account, address(this));
    // Notify our server about successful boost
    emit EarnBoost(account, params.externalId, item, price);
  }

  /**
   * @dev Temporary upgrades token metadata in database
   *
   * @param params Struct of Params that containing the signature parameters.
   * @param item Struct of Asset that will be used for boost
   * @param price array of Assets that will be used as payment.
   * @param signature The signature of the message.
   */
  function timeBoost(
    Params memory params,
    Asset memory item,
    Asset[] memory price,
    bytes calldata signature
  ) external payable whenNotPaused {
    // Recover the signer from signature
    address signer = _recoverOneToManySignature(params, item, price, signature);
    // Verify that signer has required permissions
    require(hasRole(METADATA_ROLE, signer), "Exchange: Wrong signer");

    // Get user account
    address account = _msgSender();
    // Transfer all price Assets from account to the contract
    spendFrom(price, account, address(this));
    // Notify our server about successful boost
    emit TimeBoost(account, params.externalId, item, price);
  }

  /**
   * @dev Temporary updated token metadata in database
   *
   * @param params Struct of Params that containing the signature parameters.
   * @param item Struct of Asset that will be used.
   * @param price array of Assets that will be used as payment.
   * @param signature The signature of the message.
   */
  function wash(
    Params memory params,
    Asset memory item,
    Asset[] memory price,
    bytes calldata signature
  ) external payable whenNotPaused {
    // Recover the signer from signature
    address signer = _recoverOneToManySignature(params, item, price, signature);
    // Verify that signer has required permissions
    require(hasRole(METADATA_ROLE, signer), "Exchange: Wrong signer");

    // Get user account
    address account = _msgSender();
    // Spend the required amount of tokens.
    spendFrom(price, account, address(this));

    // Notify our server about successful wash
    emit Wash(account, params.externalId, item, price);
  }
}
