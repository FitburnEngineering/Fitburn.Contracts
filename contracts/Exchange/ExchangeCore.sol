// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
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

  /**
   * @dev Purchases an asset by minting through the `acquire` function
   *
   * @param params Struct of Params that containing the signature parameters.
   * @param item Struct of Asset that will be purchased.
   * @param price Array of Assets that will be used as payment.
   * @param signature Signature used to sign the message.
   */
  function purchase(
    Params memory params,
    Asset memory item,
    Asset[] memory price,
    bytes calldata signature
  ) external payable whenNotPaused {
    // Recover the signer from signature
    address signer = _recoverOneToManySignature(params, item, price, signature);
    // verify that signer has required permissions
    require(hasRole(MINTER_ROLE, signer), "Exchange: Wrong signer");

    // Get user account
    address account = _msgSender();
    // Spend the required amount of tokens.
    spendFrom(price, account, address(this));
    // Mint NFT
    acquire(toArray(item), account);

    // Notify our server about successful purchase
    emit Purchase(account, params.externalId, item, price);
  }
}
