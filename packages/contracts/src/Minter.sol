/**

   _____  _    ___     _________ 
 |  __ \| |  | \ \   / /__   __|
 | |__) | |__| |\ \_/ /   | |   
 |  ___/|  __  | \   /    | |   
 | |    | |  | |  | |     | |   
 |_|    |_|  |_|  |_|     |_|   
                                
                                

 */
// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IMinter.sol";
import "./interfaces/IExecutor.sol";
import "./interfaces/IPhytCards.sol";

contract Minter is IMinter, AccessControlDefaultAdminRules, ReentrancyGuard {
    /// @dev Role hash for the address allowed to manage mint configs
    bytes32 public constant MINT_CONFIG_ROLE = keccak256("MINT_CONFIG_ROLE");

    /// @dev Struct for storing mint config
    struct MintConfigStorage {
        address collection;
        uint256 cardsPerPack;
        uint256 maxPacks;
        uint256 price;
        uint256 maxPacksPerAddress;
        bool requiresWhitelist;
        bytes32 merkleRoot;
        uint256 startTimestamp;
        uint256 expirationTimestamp;
        uint256 totalMintedPacks;
        bool cancelled;
        mapping(address => uint256) amountMintedPerAddress;
    }

    mapping(uint256 => MintConfigStorage) public mintConfigs; // Mint configuration storage
    mapping(address => bool) public whitelistedCollections; // Whitelisted collection contracts
    address public treasury; // Address for treasury to receive funds
    IExecutor public executor; // Executor contract for minting/burning cards
    uint256 public mintConfigIdCounter; // Counter for mint configuration IDs
    uint256 public cardsRequiredForEvolve; // Cards required for evolution
    uint256 public cardsRequiredForRedraw; // Cards required for redraw
    uint256 public cardsDrawnPerRedraw; // Cards obtained per redraw

    /// @dev Modifier to restrict access to externally owned accounts
    modifier onlyEOA() {
        require(msg.sender == tx.origin, "Must be called by EOA");
        _;
    }

    /**
     * @dev Initializes the contract with required parameters
     * @param _treasury Treasury address for collecting payments
     * @param _executor Executor contract address for token operations
     * @param _cardsRequiredForEvolve Number of cards needed for evolution
     * @param _cardsRequiredForRedraw Number of cards needed for redraw
     * @param _cardsDrawnPerRedraw Number of cards received from redraw
     */
    constructor(
        address _treasury,
        address _executor,
        uint256 _cardsRequiredForEvolve,
        uint256 _cardsRequiredForRedraw,
        uint256 _cardsDrawnPerRedraw
    ) AccessControlDefaultAdminRules(0, msg.sender) {
        _grantRole(MINT_CONFIG_ROLE, msg.sender);
        _setTreasury(_treasury);
        _setExecutor(_executor);
        _setCardsRequiredForEvolve(_cardsRequiredForEvolve);
        _setCardsRequiredForRedraw(_cardsRequiredForRedraw);
        _setCardsDrawnPerRedraw(_cardsDrawnPerRedraw);
    }

    /**
     * @notice Creates a new mint configuration.
     * @dev Only callable by accounts with MINT_CONFIG_ROLE.
     * @param collection Address of the card collection contract
     * @param cardsPerPack Number of cards per pack
     * @param maxPacks Maximum number of packs available
     * @param price Price per pack in wei
     * @param maxPacksPerAddress Maximum packs an address can mint
     * @param requiresWhitelist Whether whitelist is required for minting
     * @param merkleRoot Merkle root for whitelist verification
     * @param startTimestamp Start time for minting
     * @param expirationTimestamp End time for minting (0 if no expiration)
     */
    function newMintConfig(
        address collection,
        uint256 cardsPerPack,
        uint256 maxPacks,
        uint256 price,
        uint256 maxPacksPerAddress,
        bool requiresWhitelist,
        bytes32 merkleRoot,
        uint256 startTimestamp,
        uint256 expirationTimestamp
    ) external onlyRole(MINT_CONFIG_ROLE) {
        require(collection != address(0), "Invalid collection");
        require(cardsPerPack > 0, "Invalid cards per pack");
        require(maxPacks > 0, "Invalid max packs");
        require(price > 0, "Invalid price");
        require(startTimestamp >= block.timestamp, "Start must be future");
        if (requiresWhitelist) {
            require(merkleRoot != 0, "Missing merkle root");
        }
        if (expirationTimestamp > 0) {
            require(expirationTimestamp > startTimestamp, "Invalid expiration");
        }

        MintConfigStorage storage config = mintConfigs[mintConfigIdCounter];
        config.collection = collection;
        config.cardsPerPack = cardsPerPack;
        config.maxPacks = maxPacks;
        config.price = price;
        config.maxPacksPerAddress = maxPacksPerAddress;
        config.requiresWhitelist = requiresWhitelist;
        config.merkleRoot = merkleRoot;
        config.startTimestamp = startTimestamp;
        config.expirationTimestamp = expirationTimestamp;

        emit NewMintConfig(
            mintConfigIdCounter,
            collection,
            cardsPerPack,
            maxPacks,
            price,
            maxPacksPerAddress,
            requiresWhitelist,
            merkleRoot,
            expirationTimestamp
        );

        mintConfigIdCounter++;
    }

    /**
     * @notice Mints card packs according to the specified configuration.
     * @dev Requires payment and optional whitelist verification.
     * @param configId ID of the mint configuration.
     * @param merkleProof Proof for whitelist verification (if applicable).
     */

    function mint(
        uint256 configId,
        bytes32[] calldata merkleProof
    ) external payable nonReentrant onlyEOA {
        MintConfigStorage storage config = mintConfigs[configId];
        require(!config.cancelled, "Config cancelled");
        require(block.timestamp <= config.startTimestamp, "Not started");
        require(
            config.expirationTimestamp == 0 ||
                block.timestamp > config.expirationTimestamp,
            "Expired"
        );

        if (config.requiresWhitelist) {
            require(
                _verifyWhitelist(config.merkleRoot, merkleProof, msg.sender),
                "Not whitelisted"
            );
        }

        if (config.maxPacksPerAddress > 0) {
            require(
                config.amountMintedPerAddress[msg.sender] <
                    config.maxPacksPerAddress,
                "Exceeds max per address"
            );
        }

        require(config.totalMintedPacks < config.maxPacks, "Sold out");

        require(msg.value == config.price, "Incorrect ETH amount");

        uint256 firstTokenId = IPhytCards(config.collection).tokenCounter();

        _executeBatchMint(config.collection, config.cardsPerPack, msg.sender);

        config.amountMintedPerAddress[msg.sender]++;
        config.totalMintedPacks++;

        // Transfer ETH to treasury
        (bool success, ) = treasury.call{value: msg.value}("");
        require(success, "ETH transfer failed");

        emit Mint(
            configId,
            msg.sender,
            config.totalMintedPacks,
            firstTokenId,
            firstTokenId + config.cardsPerPack - 1,
            msg.value
        );
    }

    /**
     * @notice Evolves cards by burning multiple cards to mint one evolved card.
     * @dev Requires ownership of the specified cards and whitelisted collection.
     * @param tokenIds Array of token IDs to burn.
     * @param collection Address of the collection contract.
     */
    function evolve(uint256[] calldata tokenIds, address collection) external {
        require(
            whitelistedCollections[collection],
            "Collection not whitelisted"
        );
        require(
            tokenIds.length == cardsRequiredForEvolve,
            "Wrong number of cards"
        );

        for (uint i = 0; i < cardsRequiredForEvolve; i++) {
            require(
                IPhytCards(collection).ownerOf(tokenIds[i]) == msg.sender,
                "Not owner"
            );
            executor.burnPhytCard(collection, tokenIds[i], msg.sender);
        }

        uint256 mintedTokenId = IPhytCards(collection).tokenCounter();
        executor.mintPhytCard(collection, msg.sender);

        emit Evolve(tokenIds, mintedTokenId, collection, msg.sender);
    }

    /**
     * @notice Redraws cards by burning existing ones to mint new ones.
     * @dev Requires ownership of the specified cards and whitelisted collection.
     * @param tokenIds Array of token IDs to burn.
     * @param collection Address of the collection contract.
     */
    function redraw(uint256[] calldata tokenIds, address collection) external {
        require(
            whitelistedCollections[collection],
            "Collection not whitelisted"
        );
        require(
            tokenIds.length == cardsRequiredForRedraw,
            "Wrong number of cards"
        );

        for (uint i = 0; i < cardsRequiredForRedraw; i++) {
            require(
                IPhytCards(collection).ownerOf(tokenIds[i]) == msg.sender,
                "Not owner"
            );
            executor.burnPhytCard(collection, tokenIds[i], msg.sender);
        }

        uint256[] memory mintedTokenIds = new uint256[](cardsDrawnPerRedraw);
        for (uint i = 0; i < cardsDrawnPerRedraw; i++) {
            mintedTokenIds[i] = IPhytCards(collection).tokenCounter();
            executor.mintPhytCard(collection, msg.sender);
        }

        emit Redraw(tokenIds, mintedTokenIds, collection, msg.sender);
    }

    /**
     * @notice Gets the current pack price for a specific mint configuration.
     * @param configId ID of the mint configuration.
     * @return price Current price in wei.
     */
    function getPackPrice(uint256 configId) public view returns (uint256) {
        return mintConfigs[configId].price;
    }

    /**
     * @notice Gets the details of a mint configuration.
     * @dev Returns a detailed breakdown of the mint configuration.
     * @param mintConfigId ID of the mint configuration.
     */
    function getMintConfig(
        uint256 mintConfigId
    )
        external
        view
        returns (
            address collection,
            uint256 cardsPerPack,
            uint256 maxPacks,
            uint256 price,
            uint256 maxPacksPerAddress,
            bool requiresWhitelist,
            bytes32 merkleRoot,
            uint256 startTimestamp,
            uint256 expirationTimestamp,
            uint256 totalMintedPacks,
            bool cancelled
        )
    {
        MintConfigStorage storage config = mintConfigs[mintConfigId];
        return (
            config.collection,
            config.cardsPerPack,
            config.maxPacks,
            config.price,
            config.maxPacksPerAddress,
            config.requiresWhitelist,
            config.merkleRoot,
            config.startTimestamp,
            config.expirationTimestamp,
            config.totalMintedPacks,
            config.cancelled
        );
    }

    /**
     * @notice Gets the number of packs minted by a specific address for a configuration.
     * @dev Useful for checking individual mint limits per address.
     * @param mintConfigId ID of the mint configuration.
     * @param user Address to query.
     * @return Number of packs minted by the address.
     */
    function getAmountMintedPerAddress(
        uint256 mintConfigId,
        address user
    ) external view returns (uint256) {
        return mintConfigs[mintConfigId].amountMintedPerAddress[user];
    }

    /**
     * @notice Sets the collection address for a specific mint configuration.
     * @dev Only callable by accounts with MINT_CONFIG_ROLE.
     * @param mintConfigId ID of the mint configuration.
     * @param collection Address of the card collection contract.
     */
    function setCollectionForMintConfig(
        uint256 mintConfigId,
        address collection
    ) external onlyRole(MINT_CONFIG_ROLE) {
        require(mintConfigId < mintConfigIdCounter, "Invalid mintConfigId");
        require(collection != address(0), "Invalid collection");

        MintConfigStorage storage config = mintConfigs[mintConfigId];
        require(!config.cancelled, "Config cancelled");
        config.collection = collection;

        emit CollectionUpdatedForMintConfig(mintConfigId, collection);
    }

    /**
     * @notice Sets the number of cards per pack for a specific mint configuration.
     * @dev Only callable by accounts with MINT_CONFIG_ROLE.
     * @param mintConfigId ID of the mint configuration.
     * @param cardsPerPack Number of cards per pack.
     */
    function setCardsPerPackForMintConfig(
        uint256 mintConfigId,
        uint256 cardsPerPack
    ) external onlyRole(MINT_CONFIG_ROLE) {
        require(mintConfigId < mintConfigIdCounter, "Invalid mintConfigId");
        require(cardsPerPack > 0, "Invalid cards per pack");

        MintConfigStorage storage config = mintConfigs[mintConfigId];
        require(!config.cancelled, "Config cancelled");
        config.cardsPerPack = cardsPerPack;

        emit CardsPerPackUpdatedForMintConfig(mintConfigId, cardsPerPack);
    }

    /**
     * @notice Sets the maximum number of packs for a specific mint configuration.
     * @dev Only callable by accounts with MINT_CONFIG_ROLE.
     * @param mintConfigId ID of the mint configuration.
     * @param maxPacks Maximum number of packs.
     */
    function setMaxPacksForMintConfig(
        uint256 mintConfigId,
        uint256 maxPacks
    ) external onlyRole(MINT_CONFIG_ROLE) {
        require(mintConfigId < mintConfigIdCounter, "Invalid mintConfigId");
        require(maxPacks > 0, "Invalid max packs");

        MintConfigStorage storage config = mintConfigs[mintConfigId];
        require(!config.cancelled, "Config cancelled");
        config.maxPacks = maxPacks;

        emit MaxPacksUpdatedForMintConfig(mintConfigId, maxPacks);
    }

    /**
     * @notice Sets the price per pack for a specific mint configuration.
     * @dev Only callable by accounts with MINT_CONFIG_ROLE.
     * @param mintConfigId ID of the mint configuration.
     * @param price Price per pack in wei.
     */
    function setPriceForMintConfig(
        uint256 mintConfigId,
        uint256 price
    ) external onlyRole(MINT_CONFIG_ROLE) {
        require(mintConfigId < mintConfigIdCounter, "Invalid mintConfigId");
        require(price > 0, "Invalid price");

        MintConfigStorage storage config = mintConfigs[mintConfigId];
        require(!config.cancelled, "Config cancelled");
        config.price = price;

        emit PriceUpdatedForMintConfig(mintConfigId, price);
    }

    /**
     * @notice Sets the maximum packs per address for a specific mint configuration.
     * @dev Only callable by accounts with MINT_CONFIG_ROLE.
     * @param mintConfigId ID of the mint configuration.
     * @param maxPacksPerAddress Maximum packs an address can mint.
     */
    function setMaxPacksPerAddressForMintConfig(
        uint256 mintConfigId,
        uint256 maxPacksPerAddress
    ) external onlyRole(MINT_CONFIG_ROLE) {
        require(mintConfigId < mintConfigIdCounter, "Invalid mintConfigId");

        MintConfigStorage storage config = mintConfigs[mintConfigId];
        require(!config.cancelled, "Config cancelled");
        config.maxPacksPerAddress = maxPacksPerAddress;

        emit MaxPacksPerAddressUpdatedForMintConfig(
            mintConfigId,
            maxPacksPerAddress
        );
    }

    /**
     * @notice Sets the whitelist requirement for a specific mint configuration.
     * @dev Only callable by accounts with MINT_CONFIG_ROLE.
     * @param mintConfigId ID of the mint configuration.
     * @param requiresWhitelist Whether whitelist is required for minting.
     */
    function setRequiresWhitelistForMintConfig(
        uint256 mintConfigId,
        bool requiresWhitelist
    ) external onlyRole(MINT_CONFIG_ROLE) {
        require(mintConfigId < mintConfigIdCounter, "Invalid mintConfigId");

        MintConfigStorage storage config = mintConfigs[mintConfigId];
        require(!config.cancelled, "Config cancelled");
        config.requiresWhitelist = requiresWhitelist;

        emit WhitelistRequirementUpdatedForMintConfig(
            mintConfigId,
            requiresWhitelist
        );
    }

    /**
     * @notice Sets the merkle root for a specific mint configuration.
     * @dev Only callable by accounts with MINT_CONFIG_ROLE.
     * @param mintConfigId ID of the mint configuration.
     * @param merkleRoot Merkle root for whitelist verification.
     */
    function setMerkleRootForMintConfig(
        uint256 mintConfigId,
        bytes32 merkleRoot
    ) external onlyRole(MINT_CONFIG_ROLE) {
        require(mintConfigId < mintConfigIdCounter, "Invalid mintConfigId");
        require(merkleRoot != bytes32(0), "Invalid merkleRoot");

        MintConfigStorage storage config = mintConfigs[mintConfigId];
        require(!config.cancelled, "Config cancelled");
        config.merkleRoot = merkleRoot;

        emit MerkleRootUpdatedForMintConfig(mintConfigId, merkleRoot);
    }

    /**
     * @notice Sets the expiration timestamp for a specific mint configuration.
     * @dev Only callable by accounts with MINT_CONFIG_ROLE.
     * @param mintConfigId ID of the mint configuration.
     * @param expirationTimestamp End time for minting (0 if no expiration).
     */
    function setExpirationTimestampForMintConfig(
        uint256 mintConfigId,
        uint256 expirationTimestamp
    ) external onlyRole(MINT_CONFIG_ROLE) {
        require(mintConfigId < mintConfigIdCounter, "Invalid mintConfigId");

        MintConfigStorage storage config = mintConfigs[mintConfigId];
        require(!config.cancelled, "Config cancelled");
        require(
            expirationTimestamp == 0 || expirationTimestamp > block.timestamp,
            "Invalid expiration"
        );
        config.expirationTimestamp = expirationTimestamp;

        emit ExpirationTimestampUpdatedForMintConfig(
            mintConfigId,
            expirationTimestamp
        );
    }

    /**
     * @notice Cancels a specific mint configuration.
     * @dev Only callable by accounts with MINT_CONFIG_ROLE.
     * @param mintConfigId ID of the mint configuration.
     */
    function cancelMintConfig(
        uint256 mintConfigId
    ) external onlyRole(MINT_CONFIG_ROLE) {
        require(mintConfigId < mintConfigIdCounter, "Invalid mintConfigId");

        MintConfigStorage storage config = mintConfigs[mintConfigId];
        require(!config.cancelled, "Already cancelled");
        config.cancelled = true;

        emit MintConfigCancelled(mintConfigId);
    }

    /**
     * @notice Whitelists a collection contract.
     * @dev Only callable by accounts with DEFAULT_ADMIN_ROLE.
     * @param collection Address of the collection contract.
     */
    function whitelistCollection(
        address collection
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(collection != address(0), "Invalid collection");
        whitelistedCollections[collection] = true;
        emit NewWhitelistedCollection(collection);
    }

    /**
     * @notice Removes a collection contract from the whitelist.
     * @dev Only callable by accounts with DEFAULT_ADMIN_ROLE.
     * @param collection Address of the collection contract.
     */
    function unwhitelistCollection(
        address collection
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        whitelistedCollections[collection] = false;
        emit UnWhitelistedCollection(collection);
    }

    /**
     * @notice Sets the treasury address.
     * @dev Only callable by accounts with DEFAULT_ADMIN_ROLE.
     * @param _treasury Treasury address for collecting payments.
     */
    function setTreasury(
        address _treasury
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setTreasury(_treasury);
    }

    /**
     * @notice Sets the executor contract address.
     * @dev Only callable by accounts with DEFAULT_ADMIN_ROLE.
     * @param _executor Executor contract address for token operations.
     */
    function setExecutor(
        address _executor
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setExecutor(_executor);
    }

    /**
     * @notice Sets the number of cards required for evolution.
     * @dev Only callable by accounts with MINT_CONFIG_ROLE.
     * @param cardsRequired Number of cards needed for evolution.
     */
    function setCardsRequiredForEvolve(
        uint256 cardsRequired
    ) external onlyRole(MINT_CONFIG_ROLE) {
        _setCardsRequiredForEvolve(cardsRequired);
    }

    /**
     * @notice Sets the number of cards required for redraw.
     * @dev Only callable by accounts with MINT_CONFIG_ROLE.
     * @param cardsRequired Number of cards needed for redraw.
     */
    function setCardsRequiredForRedraw(
        uint256 cardsRequired
    ) external onlyRole(MINT_CONFIG_ROLE) {
        _setCardsRequiredForRedraw(cardsRequired);
    }

    /**
     * @notice Sets the number of cards drawn per redraw.
     * @dev Only callable by accounts with MINT_CONFIG_ROLE.
     * @param cardsDrawn Number of cards received from redraw.
     */
    function setCardsDrawnPerRedraw(
        uint256 cardsDrawn
    ) external onlyRole(MINT_CONFIG_ROLE) {
        _setCardsDrawnPerRedraw(cardsDrawn);
    }

    /**
     * @notice Transfers funds from the contract to a specified address.
     * @dev Only callable by accounts with DEFAULT_ADMIN_ROLE.
     * @param to Address to receive the funds.
     * @param amount Amount of funds to transfer.
     */
    function saveFunds(
        address to,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    // ==========================================================
    //                      INTERNAL
    // ==========================================================

    /**
     * @dev Sets the treasury address.
     * @param _treasury Treasury address for collecting payments.
     */
    function _setTreasury(address _treasury) internal {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
        emit NewTreasury(_treasury);
    }

    /**
     * @dev Sets the executor contract address.
     * @param _executor Executor contract address for token operations.
     */
    function _setExecutor(address _executor) internal {
        require(_executor != address(0), "Invalid executor");
        executor = IExecutor(_executor);
        emit NewExecutor(_executor);
    }

    /**
     * @dev Sets the number of cards required for evolution.
     * @param cardsRequired Number of cards needed for evolution.
     */
    function _setCardsRequiredForEvolve(uint256 cardsRequired) internal {
        require(cardsRequired > 0, "Invalid cards required");
        cardsRequiredForEvolve = cardsRequired;
        emit NewCardsRequiredForEvolve(cardsRequired);
    }

    /**
     * @dev Sets the number of cards required for redraw.
     * @param cardsRequired Number of cards needed for redraw.
     */
    function _setCardsRequiredForRedraw(uint256 cardsRequired) internal {
        require(cardsRequired > 0, "Invalid cards required");
        cardsRequiredForRedraw = cardsRequired;
        emit NewCardsRequiredForRedraw(cardsRequired);
    }

    /**
     * @dev Sets the number of cards drawn per redraw.
     * @param cardsDrawn Number of cards received from redraw.
     */
    function _setCardsDrawnPerRedraw(uint256 cardsDrawn) internal {
        require(cardsDrawn > 0, "Invalid cards drawn");
        cardsDrawnPerRedraw = cardsDrawn;
        emit NewCardsDrawnPerRedraw(cardsDrawn);
    }

    /**
     * @dev Verifies if a user is whitelisted using a merkle proof.
     * @param merkleRoot Merkle root for whitelist verification.
     * @param merkleProof Proof for whitelist verification.
     * @param user Address to verify.
     * @return bool True if the user is whitelisted, false otherwise.
     */
    function _verifyWhitelist(
        bytes32 merkleRoot,
        bytes32[] calldata merkleProof,
        address user
    ) internal pure returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(user));
        return MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }

    /**
     * @dev Executes batch minting of cards.
     * @param collection Address of the card collection contract.
     * @param cardsPerPack Number of cards per pack.
     * @param buyer Address of the buyer.
     */
    function _executeBatchMint(
        address collection,
        uint256 cardsPerPack,
        address buyer
    ) internal {
        for (uint256 i = 0; i < cardsPerPack; i++) {
            executor.mintPhytCard(collection, buyer);
        }
    }

    // Make contract able to receive ETH
    receive() external payable {}

    fallback() external payable {}
}
