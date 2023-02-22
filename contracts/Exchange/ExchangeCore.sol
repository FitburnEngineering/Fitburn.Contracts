// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "./SignatureValidator.sol";
import "./ExchangeUtils.sol";
import "./interfaces/IAsset.sol";

abstract contract ExchangeCore is SignatureValidator, ExchangeUtils, AccessControl, Pausable {
  event Purchase(address from, uint256 externalId, Asset item, Asset[] price);

  function purchase(
    Params memory params,
    Asset memory item,
    Asset[] memory price,
    bytes calldata signature
  ) external payable whenNotPaused {
    address signer = _recoverOneToManySignature(params, item, price, signature);
    require(hasRole(MINTER_ROLE, signer), "Exchange: Wrong signer");

    address account = _msgSender();

    spendFrom(price, account, address(this));
    acquire(toArray(item), account);

    emit Purchase(account, params.externalId, item, price);
  }
}
