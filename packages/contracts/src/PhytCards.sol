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

import "./interfaces/IPhytCards.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol";

contract PhytCards is
    Context,
    ERC165,
    IPhytCards,
    AccessControlDefaultAdminRules
{
    using Strings for uint256;

    /// @dev Role hash for the address allowed to exchange tokens
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    string public baseURI; // Base URI for token metadata
    uint256 public tokenCounter; // Counter for tracking token IDs
    string private _name;
    string private _symbol;
    mapping(uint256 => address) private _owners; // Mapping from token ID to owner address.
    mapping(address => uint256) private _balances; // Mapping from owner address to token count.
    mapping(uint256 => address) private _tokenApprovals; // Mapping from token ID to approved address.
    mapping(address => mapping(address => bool)) private _operatorApprovals; // Mapping from owner to operator approvals.

    /// @dev Initializes contract with token name and symbol
    constructor() AccessControlDefaultAdminRules(0, msg.sender) {
        _name = "Phyt";
        _symbol = "PHYT";
    }

    /**
     * @notice Returns the number of tokens in an account.
     * @param owner Address to query the balance of.
     * @return uint256 The number of tokens owned by the address.
     */
    function balanceOf(address owner) public view returns (uint256) {
        if (owner == address(0)) {
            revert ERC721InvalidOwner(address(0));
        }
        return _balances[owner];
    }

    /**
     * @notice Returns the owner of a token.
     * @param tokenId ID of the token to query the owner of.
     * @return address The owner of the token.
     */
    function ownerOf(uint256 tokenId) public view returns (address) {
        return _requireOwned(tokenId);
    }

    /**
     * @notice Returns the name of the token.
     * @return string The name of the token.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @notice Returns the symbol of the token.
     * @return string The symbol of the token.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @notice Returns the URI for a token's metadata.
     * @param tokenId ID of the token to query the URI of.
     * @return string The URI of the token's metadata.
     */
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        _requireOwned(tokenId);

        return
            bytes(baseURI).length > 0
                ? string.concat(baseURI, tokenId.toString())
                : "";
    }

    /**
     * @notice Approves another address to transfer the given token ID.
     * @param to Address to be approved for the given token ID.
     * @param tokenId ID of the token to be approved.
     */
    function approve(address to, uint256 tokenId) public {
        _approve(to, tokenId, _msgSender());
    }

    /**
     * @notice Gets the approved address for a token ID.
     * @param tokenId ID of the token to query the approval of.
     * @return address The approved address for the token ID.
     */
    function getApproved(uint256 tokenId) public view returns (address) {
        _requireOwned(tokenId);

        return _getApproved(tokenId);
    }

    /**
     * @notice Approves or removes an operator for the caller.
     * @param operator Address to add to the set of authorized operators.
     * @param approved True if the operator is approved, false to revoke approval.
     */
    function setApprovalForAll(address operator, bool approved) public {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @notice Tells whether an operator is approved by a given owner.
     * @param owner Address which you want to query the approval of.
     * @param operator Address of the operator to query the approval of.
     * @return bool True if the operator is approved, false otherwise.
     */
    function isApprovedForAll(
        address owner,
        address operator
    ) public view returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    /**
     * @notice Safely mints a new token.
     * @dev Limited to EXECUTOR_ROLE.
     * @param to The address the token is minted to.
     */
    function safeMint(address to) public onlyRole(EXECUTOR_ROLE) {
        _safeMint(to, tokenCounter);
        tokenCounter++;
    }

    /**
     * @notice Sets base URI for token URIs.
     * @dev Limited to DEFAULT_ADMIN_ROLE.
     * @param _baseURI Base URI string to be set.
     */
    function setBaseURI(
        string memory _baseURI
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        baseURI = _baseURI;
    }

    /**
     * @notice Burns a token.
     * @dev Limited to EXECUTOR_ROLE.
     * @param tokenId The ID of the token to burn.
     */
    function burn(uint256 tokenId) public onlyRole(EXECUTOR_ROLE) {
        _burn(tokenId);
    }

    /**
     * @notice Transfers ownership of a token to another address.
     * @dev Limited to EXECUTOR_ROLE. Requires sender to be owner, approved, or authorized operator.
     * @param from Current owner of token.
     * @param to Address to receive ownership of token.
     * @param tokenId ID of token to be transferred.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public onlyRole(EXECUTOR_ROLE) {
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        address previousOwner = _update(to, tokenId, _msgSender());
        if (previousOwner != from) {
            revert ERC721IncorrectOwner(from, tokenId, previousOwner);
        }
    }

    /**
     * @notice Safely transfers ownership of a token to another address.
     * @dev Handles if "to" is a smart contract, must implement {IERC721Receiver-onERC721Received}.
     * @dev Limited to EXECUTOR_ROLE. Requires sender to be owner, approved, or authorized operator.
     * @param from Current owner of token.
     * @param to Address to receive ownership of token.
     * @param tokenId ID of token to be transferred.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public onlyRole(EXECUTOR_ROLE) {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @notice Safely transfers ownership of a token to another address.
     * @dev Handles if "to" is a smart contract, must implement {IERC721Receiver-onERC721Received} and return additional data.
     * @dev Limited to EXECUTOR_ROLE. Requires sender to be owner, approved, or authorized operator.
     * @param from Current owner of token.
     * @param to Address to receive ownership of token.
     * @param tokenId ID of token to be transferred.
     * @param data Additional data.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public onlyRole(EXECUTOR_ROLE) {
        transferFrom(from, to, tokenId);
        _checkOnERC721Received(from, to, tokenId, data);
    }

    /**
     * @notice Checks if contract implements an interface.
     * @param interfaceId ERC165 interface identifier.
     * @return bool True if the contract implements the interface, false otherwise.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC165, IERC165, AccessControlDefaultAdminRules)
        returns (bool)
    {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    // ==========================================================
    //                      INTERNAL
    // ==========================================================

    /**
     * @dev Safely mints and transfers `tokenId` to `to`.
     * @param to Address safe minting to.
     * @param tokenId ID of minted token.
     */
    function _safeMint(address to, uint256 tokenId) internal {
        _safeMint(to, tokenId, "");
    }

    /**
     * @dev Wraps [_safeMint] with additional `data` parameter for a smart contract `to`.
     * @param to Address safe minting to.
     * @param tokenId ID of minted token.
     * @param data Additional data.
     */
    function _safeMint(
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal {
        _mint(to, tokenId);
        _checkOnERC721Received(address(0), to, tokenId, data);
    }

    /**
     * @dev Mints token and transfers to `to`.
     * @param to Address minting to.
     * @param tokenId ID of minted token.
     */
    function _mint(address to, uint256 tokenId) internal {
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        address previousOwner = _update(to, tokenId, address(0));
        if (previousOwner != address(0)) {
            revert ERC721InvalidSender(address(0));
        }
    }

    /**
     * @dev Destroys token.
     * @param tokenId ID of token to be destroyed.
     */
    function _burn(uint256 tokenId) internal {
        address previousOwner = _update(address(0), tokenId, address(0));
        if (previousOwner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        }
    }

    /**
     * @dev Transfers token from current owner to `to`.
     * @param from Current owner address.
     * @param to New owner address.
     * @param tokenId ID of token being transferred.
     */
    function _transfer(address from, address to, uint256 tokenId) internal {
        if (to == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        }
        address previousOwner = _update(to, tokenId, address(0));
        if (previousOwner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        } else if (previousOwner != from) {
            revert ERC721IncorrectOwner(from, tokenId, previousOwner);
        }
    }

    /**
     * @dev Updates ownership of token.
     * @param to New owner of token.
     * @param tokenId ID of token.
     * @param sig Authorization address.
     * @return address Previous owner of token.
     */
    function _update(
        address to,
        uint256 tokenId,
        address sig
    ) internal returns (address) {
        address from = _ownerOf(tokenId);

        if (sig != address(0)) {
            _checkSignature(from, sig, tokenId);
        }

        if (from != address(0)) {
            _tokenApprovals[tokenId] = address(0);
            unchecked {
                _balances[from] -= 1;
            }
        }

        if (to != address(0)) {
            unchecked {
                _balances[to] += 1;
            }
        }

        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);

        return from;
    }

    /**
     * @dev Approves `to` to operate and emits an {Approval} event.
     * @param to Address to be approved.
     * @param tokenId Token ID to approve.
     * @param sig Address performing the approval.
     */
    function _approve(address to, uint256 tokenId, address sig) internal {
        _approve(to, tokenId, sig, true);
    }

    /**
     * @dev Overload of {_approve} with flag to enable or disable {Approval} event emission.
     * @param to Address to be approved.
     * @param tokenId Token ID to approve.
     * @param sig Address performing the approval.
     * @param emitEvent Whether to emit the {Approval} event.
     */
    function _approve(
        address to,
        uint256 tokenId,
        address sig,
        bool emitEvent
    ) internal {
        if (emitEvent || sig != address(0)) {
            address owner = _requireOwned(tokenId);

            if (
                sig != address(0) &&
                owner != sig &&
                !isApprovedForAll(owner, sig)
            ) {
                revert ERC721InvalidApprover(sig);
            }

            if (emitEvent) {
                emit Approval(owner, to, tokenId);
            }
        }
        _tokenApprovals[tokenId] = to;
    }

    /**
     * @dev Gets approved address for `tokenId`.
     * @param tokenId Token ID to get approved address.
     * @return address The approved address for the token ID.
     */
    function _getApproved(uint256 tokenId) internal view returns (address) {
        return _tokenApprovals[tokenId];
    }

    /**
     * @dev Approves `operator` to operate on all tokens of `owner`.
     * @param owner Address of token owner.
     * @param operator Address to operate on tokens of `owner`.
     * @param approved Permission for operator to operate.
     */
    function _setApprovalForAll(
        address owner,
        address operator,
        bool approved
    ) internal {
        if (operator == address(0)) {
            revert ERC721InvalidOperator(operator);
        }
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }

    /**
     * @dev Gets owner of the `tokenId`.
     * @param tokenId Token to get owner address of.
     * @return address The owner of the token ID.
     */
    function _ownerOf(uint256 tokenId) internal view returns (address) {
        return _owners[tokenId];
    }

    /**
     * @dev Wraps {_ownerOf} providing a revert if token isn't minted.
     * @param tokenId Token to get owner address of.
     * @return address The owner of the token ID.
     */
    function _requireOwned(uint256 tokenId) internal view returns (address) {
        address owner = _ownerOf(tokenId);
        if (owner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        }
        return owner;
    }

    /**
     * @dev Checks if signature can operate on owner's token.
     * @param owner Address of token owner.
     * @param sig Address to be checked.
     * @param tokenId Token to be operated on.
     */
    function _checkSignature(
        address owner,
        address sig,
        uint256 tokenId
    ) internal view {
        if (!_isAuthorized(owner, sig, tokenId)) {
            if (owner == address(0)) {
                revert ERC721NonexistentToken(tokenId);
            } else {
                revert ERC721InsufficientApproval(sig, tokenId);
            }
        }
    }

    /**
     * @dev Checks if an address is authorized to operate on a token.
     * @param owner Address of token owner.
     * @param sig Address to be checked.
     * @param tokenId Token to be operated on.
     * @return bool True if the address is authorized, false otherwise.
     */
    function _isAuthorized(
        address owner,
        address sig,
        uint256 tokenId
    ) internal view returns (bool) {
        return
            sig != address(0) &&
            (owner == sig ||
                isApprovedForAll(owner, sig) ||
                _getApproved(tokenId) == sig);
    }

    /**
     * @dev Invokes {IERC721Receiver-onERC721Received} on target address.
     * @param from Current owner of token.
     * @param to Address to receive ownership of token.
     * @param tokenId ID of token to be transferred.
     * @param data Additional data.
     */
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) private {
        if (to.code.length > 0) {
            try
                IERC721Receiver(to).onERC721Received(
                    _msgSender(),
                    from,
                    tokenId,
                    data
                )
            returns (bytes4 retval) {
                if (retval != IERC721Receiver.onERC721Received.selector) {
                    revert ERC721InvalidReceiver(to);
                }
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert ERC721InvalidReceiver(to);
                } else {
                    /// @solidity memory-safe-assembly
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        }
    }
}
