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

abstract contract ExchangeClaim is SignatureValidator, ExchangeUtils, AccessControl, Pausable {
  event Claim(address from, uint256 externalId, Asset[] items);

  /**
   * @dev Claims assets from db to chain
   *
   * @param params Struct of Params that containing the signature parameters.
   * @param items Array of Assets to be claimed.
   * @param signature The signature that is verified to confirm the claim.
   */
  function claim(Params memory params, Asset[] memory items, bytes calldata signature) external payable whenNotPaused {
    // Recover the signer from signature
    address signer = _recoverManyToManySignature(params, items, new Asset[](0), signature);
    // verify that signer has required permissions
    require(hasRole(MINTER_ROLE, signer), "Exchange: Wrong signer");

    // Get user account
    address account = _msgSender();
    // Mint NFTs
    acquire(items, account);

    // Notify our server about successful claim
    emit Claim(account, params.externalId, items);
  }
}
