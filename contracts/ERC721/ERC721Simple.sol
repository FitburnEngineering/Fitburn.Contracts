// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun@gemunion.io
// Website: https://gemunion.io/

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";

import "@gemunion/contracts-erc721/contracts/extensions/ERC721ABaseUrl.sol";
import "@gemunion/contracts-erc721/contracts/extensions/ERC721AMetaDataGetter.sol";
import "@gemunion/contracts-erc721-enumerable/contracts/preset/ERC721ABER.sol";

import "./interfaces/IERC721Simple.sol";
import "../utils/errors.sol";

/**
 * @dev Basic preset of ERC721 token contract that includes the following extensions:
 *      - ERC721Burnable (OpenZeppelin)
 *      - ERC721Enumerable (OpenZeppelin)
 *      - AccessControl (OpenZeppelin)
 *      - Royalty EIP-2981 (OpenSea)
 *      - GeneralizedCollection (Rob Hitchens)
 *        provides tiny key/values storage for metadata associated with an NFT
 *      - BaseUrl (Gemunion)
 *        allows the NFTs to have a URI pointing to a public location where additional information and resources can be stored
 */
contract ERC721Simple is ERC721ABER, ERC721ABaseUrl, ERC721AMetaDataGetter {
  // Incremental counter for token ids
  using Counters for Counters.Counter;

  constructor(
    string memory name,
    string memory symbol,
    uint96 royalty,
    string memory baseTokenURI
  ) ERC721ABER(name, symbol, royalty) ERC721ABaseUrl(baseTokenURI) {
    // Increment token id tracker to start at 1
    _tokenIdTracker.increment();
  }

  /**
   * @dev Mint a new NFT with the given template id.
   *
   * @param account The address that will own the newly minted NFT
   * @param templateId The template id for the newly minted NFT
   */
  function mintCommon(address account, uint256 templateId) external virtual onlyRole(MINTER_ROLE) {
    _mintCommon(account, templateId);
  }

  /**
   * @dev Internal function to mint a new NFT with the given template id.
   *
   * @param account The address that will own the newly minted NFT
   * @param templateId The template id for the newly minted NFT
   * @return The new token id
   */
  function _mintCommon(address account, uint256 templateId) internal returns (uint256) {
    // Reverts if the template ID is zero.
    if (templateId == 0) {
      revert TemplateZero();
    }

    // Get current tokenId
    uint256 tokenId = _tokenIdTracker.current();
    // Increment token id tracker
    _tokenIdTracker.increment();

    // Update token metadata
    _upsertRecordField(tokenId, TEMPLATE_ID, templateId);

    // Mint the NFT in a safe way
    _safeMint(account, tokenId);

    return tokenId;
  }

  /**
   * @notice Disable minting without templateId
   */
  function mint(address) public pure override {
    revert MethodNotSupported();
  }

  /**
   * @notice Disable minting without templateId
   */
  function safeMint(address) public pure override {
    revert MethodNotSupported();
  }

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(AccessControl, ERC721ABER) returns (bool) {
    return super.supportsInterface(interfaceId);
  }

  /**
   * @return string The contract's base token URI
   */
  function _baseURI() internal view virtual override(ERC721, ERC721ABaseUrl) returns (string memory) {
    return _baseURI(_baseTokenURI);
  }

  /**
   * @notice No tipping!
   * @dev Reject all Ether from being sent here
   */
  receive() external payable {
    revert();
  }
}
