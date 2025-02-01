/**

   _____  _    ___     _________ 
 |  __ \| |  | \ \   / /__   __|
 | |__) | |__| |\ \_/ /   | |   
 |  ___/|  __  | \   /    | |   
 | |    | |  | |  | |     | |   
 |_|    |_|  |_|  |_|     |_|   
                                
                                

 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

interface IPhytCards is IERC721, IERC721Metadata, IERC721Errors {
    function safeMint(address to) external;

    function setBaseURI(string calldata baseURI_) external;

    function burn(uint256 tokenId) external;

    function tokenCounter() external view returns (uint256);
}
