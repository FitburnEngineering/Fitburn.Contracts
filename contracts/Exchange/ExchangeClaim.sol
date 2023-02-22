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

abstract contract ExchangeClaim is SignatureValidator, ExchangeUtils, AccessControl, Pausable {
  event Claim(address from, uint256 externalId, Asset[] items);

  function claim(Params memory params, Asset[] memory items, bytes calldata signature) external payable whenNotPaused {
    address signer = _recoverManyToManySignature(params, items, new Asset[](0), signature);
    require(hasRole(MINTER_ROLE, signer), "Exchange: Wrong signer");

    address account = _msgSender();

    acquire(items, account);

    emit Claim(account, params.externalId, items);
  }
}
