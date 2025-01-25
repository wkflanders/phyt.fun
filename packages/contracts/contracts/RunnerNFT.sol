// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RunnerNFT
 * @author Phyt
 * @dev ERC721 token that represents a Runner and
 * allows a trusted minter to mint new tokens with specific URIs.
 */

contract RunnerNFT is ERC721URIStorage, Ownable {
    address public packContract;

    uint256 private _currentTokenId;

    constructor() Ownable(msg.sender) ERC721("RunnerNFT", "RUNNER") {}

    /**
     *
     * @dev Set the Pack contract that is allowed to mint new tokens.
     *
     */
    function setPackContract(address _packContract) external onlyOwner {
        packContract = _packContract;
    }

    /**
     *
     * @dev Mints a new Runner NFT to 'to' with the metadata URI 'tokenURI.'
     * Can only be called by the Pack contract.
     *
     */
    function mintCard(
        address to,
        string calldata tokenURI
    ) external returns (uint256) {
        require(
            msg.sender == packContract,
            "RunnerNFT: Only Pack contract can mint new tokens"
        );

        _currentTokenId += 1;
        uint256 newTokenId = _currentTokenId;

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        return newTokenId;
    }

    /**
     * @dev Returns the most recently minted token ID.
     */

    function currentTokenId() external view returns (uint256) {
        return _currentTokenId;
    }
}
