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

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol";
import "./interfaces/IPhytCards.sol";
import "./interfaces/IExecutor.sol";

contract Executor is IExecutor, AccessControlDefaultAdminRules, Pausable {
    using Address for address;

    /// @dev Role hash for the address allowed to pause the contract
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    mapping(address => bool) public contracts; // Mapping to track approved contracts that can interact with executor
    mapping(address => bool) public revokedApproval; // Mapping to track addresses who have revoked approval for executor

    /// @dev Modifier to restrict function access to approved contracts only
    modifier approvedContract() {
        require(
            contracts[msg.sender],
            "Contract is not approved to make transfers"
        );
        _;
    }

    /// @dev Initializes contract with setting up roles
    constructor() AccessControlDefaultAdminRules(0, msg.sender) {
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    /**
     * @notice Approves a contract to interact with executor.
     * @param _contract Address of the contract to approve.
     */
    function approveContract(
        address _contract
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        contracts[_contract] = true;
        emit ApproveContract(_contract);
    }

    /**
     * @notice Denies a contract from interacting with executor.
     * @param _contract Address of the contract to deny.
     */
    function denyContract(
        address _contract
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        contracts[_contract] = false;
        emit DenyContract(_contract);
    }

    /**
     * @notice Allows address to remove executor's approval.
     */
    function revokeApproval() external {
        revokedApproval[msg.sender] = true;
        emit RevokeApproval(msg.sender);
    }

    /**
     * @notice Allows an address to grant executor approval.
     */
    function grantApproval() external {
        revokedApproval[msg.sender] = false;
        emit GrantApproval(msg.sender);
    }

    /**
     * @notice Mints a Phyt card to an address.
     * @param collection Token collection address.
     * @param to Address that will be minted the card.
     */
    function mintPhytCard(
        address collection,
        address to
    ) external whenNotPaused approvedContract {
        IPhytCards(collection).safeMint(to);
    }

    /**
     * @notice Burns a Phyt card.
     * @param collection Token collection address.
     * @param tokenId Token that is burned.
     * @param from Address of owner of burned token.
     */
    function burnPhytCard(
        address collection,
        uint256 tokenId,
        address from
    ) external whenNotPaused approvedContract {
        require(revokedApproval[from] == false, "User revoked approval");
        IPhytCards(collection).burn(tokenId);
    }

    /**
     * @notice Transfers an ERC721 token using unsafe {IERC721-transferFrom}.
     * @param collection Token collection address.
     * @param from Address of current owner.
     * @param to Address of new owner.
     * @param tokenId Id of token being transferred.
     */
    function transferERC721Unsafe(
        address collection,
        address from,
        address to,
        uint256 tokenId
    ) external whenNotPaused approvedContract {
        require(revokedApproval[from] == false, "User has revoked approval");
        IERC721(collection).transferFrom(from, to, tokenId);
    }

    /**
     * @notice Transfers an ERC721 token using safe {IERC721-safeTransferFrom}.
     * @param collection Token collection address.
     * @param from Address of current owner.
     * @param to Address of new owner.
     * @param tokenId Id of token being transferred.
     */
    function transferERC721(
        address collection,
        address from,
        address to,
        uint256 tokenId
    ) external whenNotPaused approvedContract {
        require(revokedApproval[from] == false, "User has revoked approval");
        IERC721(collection).safeTransferFrom(from, to, tokenId);
    }

    /**
     * @notice Transfers ERC20 tokens.
     * @param token ERC20 token address.
     * @param from Address of current owner.
     * @param to Address of new owner.
     * @param amount Quantity of tokens transferred.
     */
    function transferERC20(
        address token,
        address from,
        address to,
        uint256 amount
    ) external whenNotPaused approvedContract {
        require(revokedApproval[from] == false, "User has revoked approval");
        bytes memory data = abi.encodeWithSelector(
            IERC20.transferFrom.selector,
            from,
            to,
            amount
        );
        bytes memory returndata = token.functionCall(data);
        if (returndata.length > 0) {
            require(abi.decode(returndata, (bool)), "ERC20 transfer failed");
        }
    }

    /**
     * @notice Pauses the contract.
     * @dev Only callable by accounts with PAUSER_ROLE.
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses the contract.
     * @dev Only callable by accounts with DEFAULT_ADMIN_ROLE.
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
