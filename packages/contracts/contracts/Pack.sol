// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

interface IRunnerNFT {
    function mintCard(
        address to,
        string calldata tokenURI
    ) external returns (uint256);
}

/**
 * @title Pack
 * @author Phyt
 * @dev Handles the logic for "opening" packs to get new RunnerNFTs with random random rarities.
 */
contract Pack is Ownable {
    using ECDSA for bytes32;

    // ============ Events ============
    event PackOpened(
        address indexed opener,
        uint256 indexed tokenId,
        string rarity,
        string tokenURI
    );

    // ============ State ============
    uint256 public packPrice;

    address public packSigner;

    IRunnerNFT public runnerNFT;

    mapping(bytes => bool) public usedSignatures;

    struct CardRarity {
        string rarityName;
        uint256 probability;
        string[] possibleTokenURIs;
    }

    CardRarity[] public rarities;

    // ============ Constructor ============

    constructor(
        address _runnerNFT,
        address _packSigner,
        uint256 _initialPrice
    ) Ownable(msg.sender) {
        require(_runnerNFT != address(0), "Invalid NFT address");
        require(_packSigner != address(0), "Invalid signer address");

        runnerNFT = IRunnerNFT(_runnerNFT);
        packSigner = _packSigner;
        packPrice = _initialPrice;
    }

    // ============ External Functions ============

    /**
     *
     * @dev Allows a user to open a pack by providing a valid signature from 'packSigner'.
     * Uses naive randomness from block data to pick a rarity and metadata URI.
     */

    function openPack(
        bytes calldata signature
    ) external payable returns (uint256) {
        // Payment check
        require(msg.value == packPrice, "Pack: Insufficient payment");

        // Check signature replay
        require(!usedSignatures[signature], "Pack: Signature already used");

        // Pack opener cannot be a smart contract
        // This prevents any possibility of pack opener
        // also predicting random number generation based on block hash
        require(msg.sender == tx.origin, "Opener cannot be smart contract");

        // Verify signature is from packSigner
        bytes32 messageHash = keccak256(
            abi.encodePacked(msg.sender, address(this))
        );
        address recoveredSigner = _verifySignature(messageHash, signature);
        require(recoveredSigner == packSigner, "Pack: Invalid signature");

        // Get a pseudo-random number
        uint256 randomNum = uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    block.timestamp,
                    msg.sender
                )
            )
        ) % 10000;

        // Determine which rarity bracket the random number falls into
        (
            string memory rarityName,
            string memory selectedURI
        ) = _selectRarityAndURI(randomNum);

        // Mint the NFT via the RunnerNFT contract
        uint256 newTokenId = runnerNFT.mintCard(msg.sender, selectedURI);

        // Emit an event
        emit PackOpened(msg.sender, newTokenId, rarityName, selectedURI);

        return newTokenId;
    }

    /**
     * @dev Owner can set/update pack price
     */
    function setPackPrice(uint256 _newPrice) external onlyOwner {
        packPrice = _newPrice;
    }

    /**
     * @dev Owner can add new rarities or update them.
     */
    function addRarity(
        string calldata rarityName,
        uint256 probability,
        string[] calldata possibleTokenURIs
    ) external onlyOwner {
        rarities.push(
            CardRarity({
                rarityName: rarityName,
                probability: probability,
                possibleTokenURIs: possibleTokenURIs
            })
        );
    }

    /**
     * @dev Owner can change the packSigner if needed.
     */
    function setPackSigner(address _newSigner) external onlyOwner {
        packSigner = _newSigner;
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
    }

    // ============ Internal Functions ============

    function _verifySignature(
        bytes32 messageHash,
        bytes calldata signature
    ) internal pure returns (address) {
        address recovered = ECDSA.recover(
            MessageHashUtils.toEthSignedMessageHash(messageHash),
            signature
        );
        return recovered;
        // bytes32 ethHash = messageHash.toEthSignedMessageHash();
        // return ethHash.recover(signature);
    }

    function _selectRarityAndURI(
        uint256 randomNum
    ) internal view returns (string memory, string memory) {
        uint256 cumulative = 0;
        for (uint256 i = 0; i < rarities.length; i++) {
            cumulative += rarities[i].probability;
            if (randomNum < cumulative) {
                // Found the correct rarity
                CardRarity memory r = rarities[i];
                if (r.possibleTokenURIs.length == 0) {
                    // fallback
                    return (r.rarityName, "");
                }

                uint256 uriIndex = randomNum % r.possibleTokenURIs.length;
                return (r.rarityName, r.possibleTokenURIs[uriIndex]);
            }
        }
        // Fallback (if probabilities don't sum exactly 10000)
        CardRarity memory last = rarities[rarities.length - 1];
        uint256 fallbackIndex = randomNum % last.possibleTokenURIs.length;
        return (last.rarityName, last.possibleTokenURIs[fallbackIndex]);
    }
}
