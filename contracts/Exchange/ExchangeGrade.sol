// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./SignatureValidator.sol";
import "./ExchangeUtils.sol";
import "./interfaces/IAsset.sol";
import "../ERC721/interfaces/IERC721Upgradeable.sol";

abstract contract ExchangeGrade is SignatureValidator, ExchangeUtils, AccessControl, Pausable {
  event EarnUpgrade(address from, uint256 externalId, Asset item, Asset[] price); // attr
  event TimeUpgrade(address from, uint256 externalId, Asset item, Asset[] price); // attr
  event EarnBoost(address from, uint256 externalId, Asset item, Asset[] price); // params
  event TimeBoost(address from, uint256 externalId, Asset item, Asset[] price); // params
  event Wash(address from, uint256 externalId, Asset item, Asset[] price); // params dirt=0

  function earnUpgrade(
    Params memory params,
    Asset memory item,
    Asset[] memory price,
    bytes calldata signature
  ) external payable {
    address signer = _recoverOneToManySignature(params, item, price, signature);
    require(hasRole(METADATA_ADMIN_ROLE, signer), "Exchange: Wrong signer");

    address account = _msgSender();

    spendFrom(price, account, address(this));

    emit EarnUpgrade(account, params.externalId, item, price);

    IERC721Upgradeable(item.token).earnUpgrade(item.tokenId);
  }

  function timeUpgrade(
    Params memory params,
    Asset memory item,
    Asset[] memory price,
    bytes calldata signature
  ) external payable {
    address signer = _recoverOneToManySignature(params, item, price, signature);
    require(hasRole(METADATA_ADMIN_ROLE, signer), "Exchange: Wrong signer");

    address account = _msgSender();

    spendFrom(price, account, address(this));

    emit TimeUpgrade(account, params.externalId, item, price);

    IERC721Upgradeable(item.token).timeUpgrade(item.tokenId);
  }

  function earnBoost(
    Params memory params,
    Asset memory item,
    Asset[] memory price,
    bytes calldata signature
  ) external payable {
    address signer = _recoverOneToManySignature(params, item, price, signature);
    require(hasRole(METADATA_ADMIN_ROLE, signer), "Exchange: Wrong signer");

    address account = _msgSender();

    spendFrom(price, account, address(this));

    emit EarnBoost(account, params.externalId, item, price);
  }

  function timeBoost(
    Params memory params,
    Asset memory item,
    Asset[] memory price,
    bytes calldata signature
  ) external payable {
    address signer = _recoverOneToManySignature(params, item, price, signature);
    require(hasRole(METADATA_ADMIN_ROLE, signer), "Exchange: Wrong signer");

    address account = _msgSender();

    spendFrom(price, account, address(this));

    emit TimeBoost(account, params.externalId, item, price);
  }

  function wash(
    Params memory params,
    Asset memory item,
    Asset[] memory price,
    bytes calldata signature
  ) external payable {
    address signer = _recoverOneToManySignature(params, item, price, signature);
    require(hasRole(METADATA_ADMIN_ROLE, signer), "Exchange: Wrong signer");

    address account = _msgSender();

    spendFrom(price, account, address(this));

    emit Wash(account, params.externalId, item, price);
  }
}
