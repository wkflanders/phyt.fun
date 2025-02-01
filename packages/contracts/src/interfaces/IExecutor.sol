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

interface IExecutor {
    event ApproveContract(address _contract);
    event DenyContract(address _contract);
    event RevokeApproval(address user);
    event GrantApproval(address user);

    function approveContract(address _contract) external;
    function denyContract(address _contract) external;
    function revokeApproval() external;
    function grantApproval() external;

    function mintPhytCard(address collection, address to) external;
    function burnPhytCard(
        address collection,
        uint256 tokenId,
        address from
    ) external;

    function transferERC721Unsafe(
        address collection,
        address from,
        address to,
        uint256 tokenId
    ) external;

    function transferERC721(
        address collection,
        address from,
        address to,
        uint256 tokenId
    ) external;

    function transferERC20(
        address token,
        address from,
        address to,
        uint256 amount
    ) external;
}
