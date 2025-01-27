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

interface IMinter {
    struct MintConfig {
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

    event NewMintConfig(
        uint256 mintConfigId,
        address collection,
        uint256 cardsPerPack,
        uint256 maxPacks,
        uint256 price,
        uint256 maxPacksPerAddress,
        bool requiresWhitelist,
        bytes32 merkleRoot,
        uint256 expirationTimestamp
    );

    event Mint(
        uint256 mintConfigId,
        address buyer,
        uint256 totalMintedPacks,
        uint256 firstTokenId,
        uint256 lastTokenId,
        uint256 price
    );

    event Evolve(
        uint256[] burntTokenIds,
        uint256 mintedTokenId,
        address collection,
        address caller
    );

    event Redraw(
        uint256[] burntTokenIds,
        uint256[] mintedTokenIds,
        address collection,
        address caller
    );

    event CollectionUpdatedForMintConfig(
        uint256 mintConfigId,
        address newCollection
    );

    event CardsPerPackUpdatedForMintConfig(
        uint256 mintConfigId,
        uint256 newCardsPerPack
    );

    event MaxPacksUpdatedForMintConfig(
        uint256 mintConfigId,
        uint256 newMaxPacks
    );

    event PriceUpdatedForMintConfig(uint256 mintConfigId, uint256 newPrice);

    event MaxPacksPerAddressUpdatedForMintConfig(
        uint256 mintConfigId,
        uint256 maxPacksPerAddress
    );

    event WhitelistRequirementUpdatedForMintConfig(
        uint256 mintConfigId,
        bool newRequiresWhitelist
    );

    event MerkleRootUpdatedForMintConfig(
        uint256 mintConfigId,
        bytes32 newMerkleRoot
    );

    event ExpirationTimestampUpdatedForMintConfig(
        uint256 mintConfigId,
        uint256 newExpirationTimestamp
    );

    event MintConfigCancelled(uint256 mintConfigId);

    event NewTreasury(address treasury);

    event NewExecutor(address executor);

    event NewCardsRequiredForEvolve(uint256 cardsRequired);

    event NewCardsRequiredForRedraw(uint256 cardsRequired);

    event NewCardsDrawnPerRedraw(uint256 cardsDrawn);

    event NewWhitelistedCollection(address collection);

    event UnWhitelistedCollection(address collection);

    function mint(
        uint256 configId,
        bytes32[] calldata merkleProof
    ) external payable;

    function evolve(uint256[] calldata tokenIds, address collection) external;

    function redraw(uint256[] calldata tokenIds, address collection) external;

    function getPackPrice(uint256 configId) external view returns (uint256);

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
        );

    function getAmountMintedPerAddress(
        uint256 mintConfigId,
        address user
    ) external view returns (uint256);

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
    ) external;

    function setCollectionForMintConfig(
        uint256 mintConfigId,
        address collection
    ) external;

    function setCardsPerPackForMintConfig(
        uint256 mintConfigId,
        uint256 cardsPerPack
    ) external;

    function setMaxPacksForMintConfig(
        uint256 mintConfigId,
        uint256 maxPacks
    ) external;

    function setPriceForMintConfig(
        uint256 mintConfigId,
        uint256 price
    ) external;

    function setMaxPacksPerAddressForMintConfig(
        uint256 mintConfigId,
        uint256 maxPacksPerAddress
    ) external;

    function setRequiresWhitelistForMintConfig(
        uint256 mintConfigId,
        bool requiresWhitelist
    ) external;

    function setMerkleRootForMintConfig(
        uint256 mintConfigId,
        bytes32 merkleRoot
    ) external;

    function setExpirationTimestampForMintConfig(
        uint256 mintConfigId,
        uint256 expirationTimestamp
    ) external;

    function cancelMintConfig(uint256 mintConfigId) external;

    function whitelistCollection(address collection) external;

    function unwhitelistCollection(address collection) external;

    function setTreasury(address treasury) external;

    function setExecutor(address executor) external;

    function setCardsRequiredForEvolve(uint256 cardsRequired) external;

    function setCardsRequiredForRedraw(uint256 cardsRequired) external;

    function setCardsDrawnPerRedraw(uint256 cardsDrawn) external;

    function saveFunds(address to, uint256 amount) external;
}
