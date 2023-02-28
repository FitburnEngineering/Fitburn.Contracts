// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "@gemunion/contracts-erc20/contracts/interfaces/IERC1363.sol";
import "@gemunion/contracts-misc/contracts/constants.sol";

import "../ERC721/interfaces/IERC721Simple.sol";
import "../ERC721/interfaces/IERC721Random.sol";
import "../ERC1155/interfaces/IERC1155Simple.sol";
import "./interfaces/IAsset.sol";
import "../utils/constants.sol";
import "../utils/errors.sol";

contract ExchangeUtils {
  using Address for address;
  using SafeERC20 for IERC20;

  event PaymentEthReceived(address from, uint256 amount);
  event PaymentEthSent(address to, uint256 amount);

  /**
   * @dev transfer `Assets` from `spender` to `receiver`.
   *
   * @param price An array of assets to transfer
   * @param spender Address of spender
   * @param receiver Address of receiver
   */
  function spendFrom(Asset[] memory price, address spender, address receiver) internal {
    // The total amount of native tokens in the transaction.
    uint256 totalAmount;

    // Loop through all assets
    uint256 length = price.length;
    for (uint256 i = 0; i < length; ) {
      Asset memory ingredient = price[i];
      // If the `Asset` token is native.
      if (ingredient.tokenType == TokenType.NATIVE) {
        // increase the total amount.
        totalAmount = totalAmount + ingredient.amount;
      }
      // If the `Asset` token is an ERC20 token.
      else if (ingredient.tokenType == TokenType.ERC20) {
        bool isERC1363Supported;
        if (receiver.isContract()) {
          // Check if the token supports ERC1363
          try IERC165(ingredient.token).supportsInterface(IERC1363_ID) returns (bool isERC1363) {
            if (isERC1363) {
              // and the receiver supports ERC1363
              try IERC165(receiver).supportsInterface(IERC1363_RECEIVER_ID) returns (bool isERC1363Receiver) {
                isERC1363Supported = isERC1363Receiver;
              } catch (bytes memory) {}
            }
          } catch (bytes memory) {}
        }

        if (isERC1363Supported) {
          // Transfer the ERC20 token and emit event to notify server
          IERC1363(ingredient.token).transferFromAndCall(spender, receiver, ingredient.amount);
        } else {
          // Transfer the ERC20 token in a safe way
          SafeERC20.safeTransferFrom(IERC20(ingredient.token), spender, receiver, ingredient.amount);
        }
      }
      // If the `Asset` token is an ERC721/ERC998 token.
      else if (ingredient.tokenType == TokenType.ERC721 || ingredient.tokenType == TokenType.ERC998) {
        // Transfer the ERC721/ERC998 token in a safe way
        IERC721(ingredient.token).safeTransferFrom(spender, receiver, ingredient.tokenId);
      }
      // If the `Asset` token is an ERC1155 token.
      else if (ingredient.tokenType == TokenType.ERC1155) {
        // Transfer the ERC1155 token in a safe way
        IERC1155(ingredient.token).safeTransferFrom(spender, receiver, ingredient.tokenId, ingredient.amount, "0x");
      } else {
        // should never happen
        revert UnsupportedTokenType();
      }

      unchecked {
        i++;
      }
    }

    // If there is any native token in the transaction.
    if (totalAmount > 0) {
      // Verify the total amount of native tokens matches the amount sent with the transaction.
      require(totalAmount == msg.value, "Exchange: Wrong amount");
      if (address(this) == receiver) {
        emit PaymentEthReceived(receiver, msg.value);
      } else {
        Address.sendValue(payable(receiver), totalAmount);
      }
    }
  }

  /**
   * @dev transfer `Assets` from `this contract` to `receiver`.
   *
   * @param price An array of assets to transfer
   * @param receiver Address of receiver
   */
  function spend(Asset[] memory price, address receiver) internal {
    // The total amount of native tokens in the transaction.
    uint256 totalAmount;

    // Loop through all assets
    uint256 length = price.length;
    for (uint256 i = 0; i < length; ) {
      Asset memory ingredient = price[i];
      // If the `Asset` is native token.
      if (ingredient.tokenType == TokenType.NATIVE) {
        // increase the total amount.
        totalAmount = totalAmount + ingredient.amount;
      }
      // If the `Asset` is an ERC20 token.
      else if (ingredient.tokenType == TokenType.ERC20) {
        bool isERC1363Supported;
        if (receiver.isContract()) {
          // Check if the token supports ERC1363
          try IERC165(ingredient.token).supportsInterface(IERC1363_ID) returns (bool isERC1363) {
            if (isERC1363) {
              // and the receiver supports ERC1363
              try IERC165(receiver).supportsInterface(IERC1363_RECEIVER_ID) returns (bool isERC1363Receiver) {
                isERC1363Supported = isERC1363Receiver;
              } catch (bytes memory) {}
            }
          } catch (bytes memory) {}
        }

        if (isERC1363Supported) {
          // Transfer the ERC20 token and emit event to notify server
          IERC1363(ingredient.token).transferAndCall(receiver, ingredient.amount);
        } else {
          // Transfer the ERC20 token in a safe way
          SafeERC20.safeTransfer(IERC20(ingredient.token), receiver, ingredient.amount);
        }
      }
      // If the `Asset` is an ERC721/ERC998 token.
      else if (ingredient.tokenType == TokenType.ERC721 || ingredient.tokenType == TokenType.ERC998) {
        // Transfer the ERC721/ERC998 token in a safe way
        IERC721(ingredient.token).safeTransferFrom(address(this), receiver, ingredient.tokenId);
      }
      // If the `Asset` is an ERC1155 token.
      else if (ingredient.tokenType == TokenType.ERC1155) {
        // Transfer the ERC1155 token in a safe way
        IERC1155(ingredient.token).safeTransferFrom(
          address(this),
          receiver,
          ingredient.tokenId,
          ingredient.amount,
          "0x"
        );
      } else {
        // should never happen
        revert UnsupportedTokenType();
      }

      unchecked {
        i++;
      }
    }

    // If there is any native token in the transaction.
    if (totalAmount > 0) {
      // Send the total amount to the receiver
      Address.sendValue(payable(receiver), totalAmount);
      emit PaymentEthSent(receiver, totalAmount);
    }
  }

  /**
   * @dev Mints array of `Assets` to `receiver`.
   *
   * @param items An array of assets to mint.
   * @param receiver Address of receiver
   */
  function acquire(Asset[] memory items, address receiver) internal {
    // Loop through all assets
    uint256 length = items.length;
    for (uint256 i = 0; i < length; ) {
      Asset memory item = items[i];
      // If the `Asset` is an ERC721/ERC998 token.
      if (item.tokenType == TokenType.ERC721 || item.tokenType == TokenType.ERC998) {
        // Checks if the token supports the IERC721Random interface
        bool randomInterface = IERC721(item.token).supportsInterface(IERC721_RANDOM_ID);
        if (randomInterface) {
          // Calls the 'mintRandom' function to acquire token using ChainLink
          IERC721Random(item.token).mintRandom(receiver, item.tokenId);
        } else {
          // Otherwise, calls the 'mintCommon' function to acquire the token
          IERC721Simple(item.token).mintCommon(receiver, item.tokenId);
        }
      }
      // If the `Asset` is an ERC1155 token
      else if (item.tokenType == TokenType.ERC1155) {
        // Calls the 'mint' function to acquire the token
        IERC1155Simple(item.token).mint(receiver, item.tokenId, item.amount, "0x");
      }
      // If the `Asset` token is NATIVE/ERC20
      else {
        // we do not meant these types of token
        revert UnsupportedTokenType();
      }

      unchecked {
        i++;
      }
    }
  }

  /**
   * @dev Utility function that converts single item into array of items
   *
   * @param item a single Asset to be converted to array
   */
  function toArray(Asset memory item) public pure returns (Asset[] memory) {
    Asset[] memory items = new Asset[](1);
    items[0] = item;
    return items;
  }
}
