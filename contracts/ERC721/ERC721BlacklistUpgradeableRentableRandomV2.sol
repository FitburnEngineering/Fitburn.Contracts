// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+gemunion@gmail.com
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";

import "./ERC721BlacklistUpgradeableRentable.sol";
import "../Mechanics/Rarity/Rarity.sol";

abstract contract ERC721BlacklistUpgradeableRentableRandomV2 is ERC721BlacklistUpgradeableRentable, Rarity {
  using Counters for Counters.Counter;

  event MintRandom(uint256 requestId, address to, uint256[] randomWords, uint256 templateId, uint256 tokenId);

  struct Request {
    address account;
    uint256 templateId;
  }

  mapping(uint256 => Request) internal _queue;

  constructor(
    string memory name,
    string memory symbol,
    uint96 royalty,
    string memory baseTokenURI
  ) ERC721BlacklistUpgradeableRentable(name, symbol, royalty, baseTokenURI) {}

  function mintCommon(address, uint256) external virtual override onlyRole(MINTER_ROLE) {
    revert MethodNotSupported();
  }

  function mintRandom(address account, uint256 templateId) external onlyRole(MINTER_ROLE) {
    if (templateId == 0) {
      revert TemplateZero();
    }

    _queue[getRandomNumber()] = Request(account, templateId);
  }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal virtual {
    Request memory request = _queue[requestId];

    uint256 tokenId = _tokenIdTracker.current();

    emit MintRandom(requestId, request.account, randomWords, request.templateId, tokenId + 1);

    _upsertRecordField(tokenId, EARN_UPGRADE, 0);
    _upsertRecordField(tokenId, TIME_UPGRADE, 0);
    _upsertRecordField(tokenId, RARITY, _getDispersion(randomWords[0]));

    delete _queue[requestId];

    _mintCommon(request.account, request.templateId);
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
    return interfaceId == IERC721_RANDOM_ID || super.supportsInterface(interfaceId);
  }

  function getRandomNumber() internal virtual returns (uint256 requestId);
}