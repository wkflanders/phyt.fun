// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/Minter.sol";
import "../src/Executor.sol";
import "../src/PhytCards.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MinterTest is Test {
    Minter public minter;
    Executor public executor;
    PhytCards public phytCards;

    address public admin;
    address public configManager;
    address public treasury;
    address public user1;
    address public user2;
    address public user3;

    uint256 public constant CARDS_REQUIRED_EVOLVE = 3;
    uint256 public constant CARDS_REQUIRED_REDRAW = 2;
    uint256 public constant CARDS_DRAWN_PER_REDRAW = 1;

    bytes32[] public emptyProof;
    bytes32 public merkleRoot;
    bytes32[] public validProof;

    error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);

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

    function setUp() public {
        admin = makeAddr("admin");
        configManager = makeAddr("configManager");
        treasury = makeAddr("treasury");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");

        vm.startPrank(admin);

        // Deploy contracts
        executor = new Executor();
        phytCards = new PhytCards();
        minter = new Minter(
            treasury,
            address(executor),
            CARDS_REQUIRED_EVOLVE,
            CARDS_REQUIRED_REDRAW,
            CARDS_DRAWN_PER_REDRAW
        );

        // Setup roles and permissions
        minter.grantRole(minter.MINT_CONFIG_ROLE(), configManager);
        phytCards.grantRole(phytCards.EXECUTOR_ROLE(), address(executor));

        // Approve Minter contract in Executor
        executor.approveContract(address(minter));

        // Whitelist collection
        minter.whitelistCollection(address(phytCards));

        // Setup merkle root for whitelist tests
        setupMerkleRoot();

        vm.stopPrank();
    }

    function setupMerkleRoot() internal {
        bytes32[] memory leaves = new bytes32[](2);
        leaves[0] = keccak256(abi.encodePacked(user1));
        leaves[1] = keccak256(abi.encodePacked(user2));

        // Order leaves by their numeric value to match OpenZeppelin's implementation
        if (uint256(leaves[0]) > uint256(leaves[1])) {
            (leaves[0], leaves[1]) = (leaves[1], leaves[0]);
        }

        // Calculate root based on sorted leaves
        merkleRoot = keccak256(abi.encodePacked(leaves[0], leaves[1]));

        // Store the appropriate proof based on original leaf position
        validProof = new bytes32[](1);
        bytes32 user1Leaf = keccak256(abi.encodePacked(user1));
        validProof[0] = (user1Leaf == leaves[0]) ? leaves[1] : leaves[0];
    }

    function testMerkleProof() public view {
        bytes32 leaf = keccak256(abi.encodePacked(user1));

        bool isValid = MerkleProof.verify(validProof, merkleRoot, leaf);
        assertTrue(isValid, "Merkle proof should be valid");
    }

    function createBasicMintConfig() internal returns (uint256) {
        vm.startPrank(configManager);

        uint256 configId = minter.mintConfigIdCounter();

        minter.newMintConfig(
            address(phytCards), // collection
            3, // cardsPerPack
            100, // maxPacks
            0.1 ether, // price
            5, // maxPacksPerAddress
            false, // requiresWhitelist
            bytes32(0), // merkleRoot
            block.timestamp, // startTimestamp
            block.timestamp + 7 days // expirationTimestamp
        );

        vm.stopPrank();
        return configId;
    }

    function createWhitelistMintConfig() internal returns (uint256) {
        vm.startPrank(configManager);

        uint256 configId = minter.mintConfigIdCounter();

        minter.newMintConfig(
            address(phytCards), // collection
            3, // cardsPerPack
            100, // maxPacks
            0.1 ether, // price
            5, // maxPacksPerAddress
            true, // requiresWhitelist
            merkleRoot, // merkleRoot
            block.timestamp, // startTimestamp
            block.timestamp + 7 days // expirationTimestamp
        );

        vm.stopPrank();
        return configId;
    }

    // ============ Mint Config Tests ============

    function testInitialState() public view {
        assertTrue(minter.hasRole(minter.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(minter.hasRole(minter.MINT_CONFIG_ROLE(), configManager));
        assertTrue(minter.whitelistedCollections(address(phytCards)));
        assertEq(minter.treasury(), treasury);
        assertEq(address(minter.executor()), address(executor));
        assertEq(minter.cardsRequiredForEvolve(), CARDS_REQUIRED_EVOLVE);
        assertEq(minter.cardsRequiredForRedraw(), CARDS_REQUIRED_REDRAW);
        assertEq(minter.cardsDrawnPerRedraw(), CARDS_DRAWN_PER_REDRAW);
    }

    function testCreateMintConfig() public {
        vm.startPrank(configManager);

        uint256 configId = minter.mintConfigIdCounter();

        vm.expectEmit(true, true, true, true);
        emit NewMintConfig(
            configId,
            address(phytCards),
            3,
            100,
            0.1 ether,
            5,
            false,
            bytes32(0),
            block.timestamp + 7 days
        );

        minter.newMintConfig(
            address(phytCards),
            3,
            100,
            0.1 ether,
            5,
            false,
            bytes32(0),
            block.timestamp,
            block.timestamp + 7 days
        );

        (
            address collection,
            uint256 cardsPerPack,
            uint256 maxPacks,
            uint256 price,
            uint256 maxPacksPerAddress,
            bool requiresWhitelist,
            bytes32 rootHash,
            uint256 startTimestamp,
            uint256 expirationTimestamp,
            uint256 totalMintedPacks,
            bool cancelled
        ) = minter.getMintConfig(configId);

        assertEq(collection, address(phytCards));
        assertEq(cardsPerPack, 3);
        assertEq(maxPacks, 100);
        assertEq(price, 0.1 ether);
        assertEq(maxPacksPerAddress, 5);
        assertFalse(requiresWhitelist);
        assertEq(rootHash, bytes32(0));
        assertEq(startTimestamp, block.timestamp);
        assertEq(expirationTimestamp, block.timestamp + 7 days);
        assertEq(totalMintedPacks, 0);
        assertFalse(cancelled);

        vm.stopPrank();
    }

    function testCreateMintConfigNotConfigManager() public {
        vm.startPrank(user1);

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                user1,
                minter.MINT_CONFIG_ROLE()
            )
        );
        minter.newMintConfig(
            address(phytCards),
            3,
            100,
            0.1 ether,
            5,
            false,
            bytes32(0),
            block.timestamp,
            block.timestamp + 7 days
        );

        vm.stopPrank();
    }

    // ============ Minting Tests ============

    function testMint() public {
        // Arrange: Setup the mint configuration
        vm.startPrank(configManager);
        minter.newMintConfig(
            address(phytCards), // collection
            3, // cardsPerPack
            100, // maxPacks
            1e17, // price (0.1 ETH)
            5, // maxPacksPerAddress
            false, // requiresWhitelist
            0x0000000000000000000000000000000000000000000000000000000000000000, // merkleRoot
            block.timestamp + 1, // startTimestamp
            block.timestamp + 604801 // expirationTimestamp (1 week later)
        );
        vm.stopPrank();

        uint256 configId = 0; // Using the first config
        uint256 price = minter.getPackPrice(configId);

        // Advance time to pass startTimestamp
        vm.warp(block.timestamp + 2);

        // Act: Set expectation for the Mint event
        vm.expectEmit(true, true, true, true);
        emit Mint(
            configId, // mintConfigId
            user1, // buyer
            1, // totalMintedPacks
            0, // firstTokenId (assuming starts at 0)
            2, // lastTokenId (0 + 3 - 1)
            1e17 // price
        );
        // Act: Perform the mint
        vm.deal(user1, price); // Fund user1 with ETH
        vm.prank(user1, user1); // Simulate transaction from user1 (EOA)
        minter.mint{value: price}(configId, emptyProof);

        // Assert: Verify the minting results
        assertEq(phytCards.balanceOf(user1), 3, "User1 should have 3 cards");
        assertEq(
            minter.getAmountMintedPerAddress(configId, user1),
            1,
            "User1 should have minted 1 pack"
        );
        assertEq(
            treasury.balance,
            price,
            "Treasury should have received the payment"
        );
    }

    function testMintWithWhitelist() public {
        uint256 configId = createWhitelistMintConfig();
        uint256 price = minter.getPackPrice(configId);

        vm.deal(user1, price);

        vm.prank(user1, user1);
        minter.mint{value: price}(configId, validProof);
        vm.stopPrank();

        assertEq(phytCards.balanceOf(user1), 3);

        // Test non-whitelisted user
        vm.deal(user3, price);
        vm.prank(user3, user3);
        vm.expectRevert("Not whitelisted");
        minter.mint{value: price}(configId, emptyProof);
    }

    function testMintWithIncorrectPayment() public {
        uint256 configId = createBasicMintConfig();
        uint256 price = minter.getPackPrice(configId);

        vm.deal(user1, price);

        vm.prank(user1, user1);
        vm.expectRevert("Incorrect ETH amount");
        minter.mint{value: price - 0.01 ether}(configId, emptyProof);
    }

    function testMintExceedMaxPerAddress() public {
        uint256 configId = createBasicMintConfig();
        uint256 price = minter.getPackPrice(configId);

        vm.deal(user1, price * 6);

        vm.startPrank(user1, user1);

        // Mint maximum allowed (5 packs)
        for (uint256 i = 0; i < 5; i++) {
            minter.mint{value: price}(configId, emptyProof);
        }

        // Try to mint one more
        vm.expectRevert("Exceeds max per address");
        minter.mint{value: price}(configId, emptyProof);

        vm.stopPrank();
    }

    // ============ Evolution Tests ============

    function testEvolve() public {
        uint256 configId = createBasicMintConfig();
        uint256 price = minter.getPackPrice(configId);

        vm.deal(user1, price);
        vm.startPrank(user1, user1);

        vm.expectEmit(true, true, true, true);
        emit Mint(
            configId, // mintConfigId
            user1, // buyer
            1, // totalMintedPacks
            0, // firstTokenId
            2, // lastTokenId (2 since we're minting 3 cards: 0,1,2)
            price // price
        );

        minter.mint{value: price}(configId, emptyProof);

        uint256[] memory tokenIds = new uint256[](CARDS_REQUIRED_EVOLVE);
        for (uint256 i = 0; i < CARDS_REQUIRED_EVOLVE; i++) {
            tokenIds[i] = i;
        }

        vm.expectEmit(true, true, true, true);
        emit Evolve(tokenIds, 3, address(phytCards), user1);

        minter.evolve(tokenIds, address(phytCards));

        // Verify evolution results
        assertEq(phytCards.balanceOf(user1), 1);
        assertEq(phytCards.ownerOf(3), user1);

        vm.stopPrank();
    }

    function testEvolveNotEnoughCards() public {
        uint256[] memory tokenIds = new uint256[](CARDS_REQUIRED_EVOLVE - 1);

        vm.startPrank(user1);
        vm.expectRevert("Wrong number of cards");
        minter.evolve(tokenIds, address(phytCards));
        vm.stopPrank();
    }

    // ============ Redraw Tests ============

    function testRedraw() public {
        // First mint some cards
        uint256 configId = createBasicMintConfig();
        uint256 price = minter.getPackPrice(configId);

        vm.deal(user1, price);
        vm.startPrank(user1, user1);
        minter.mint{value: price}(configId, emptyProof);

        uint256[] memory tokenIds = new uint256[](CARDS_REQUIRED_REDRAW);
        for (uint256 i = 0; i < CARDS_REQUIRED_REDRAW; i++) {
            tokenIds[i] = i;
        }

        uint256[] memory mintedTokenIds = new uint256[](CARDS_DRAWN_PER_REDRAW);
        mintedTokenIds[0] = 3;

        vm.expectEmit(true, true, true, true);
        emit Redraw(tokenIds, mintedTokenIds, address(phytCards), user1);

        minter.redraw(tokenIds, address(phytCards));

        // Verify redraw results
        assertEq(phytCards.balanceOf(user1), 2); // 3 initial - 2 burnt + 1 drawn
        assertEq(phytCards.ownerOf(3), user1);

        vm.stopPrank();
    }

    function testRedrawNotEnoughCards() public {
        uint256[] memory tokenIds = new uint256[](CARDS_REQUIRED_REDRAW - 1);

        vm.startPrank(user1);
        vm.expectRevert("Wrong number of cards");
        minter.redraw(tokenIds, address(phytCards));
        vm.stopPrank();
    }

    // ============ Configuration Update Tests ============

    function testUpdateMintConfig() public {
        uint256 configId = createBasicMintConfig();

        vm.startPrank(configManager);

        // Test updating various parameters
        minter.setCardsPerPackForMintConfig(configId, 4);
        minter.setMaxPacksForMintConfig(configId, 200);
        minter.setPriceForMintConfig(configId, 0.2 ether);
        minter.setMaxPacksPerAddressForMintConfig(configId, 10);
        minter.setRequiresWhitelistForMintConfig(configId, true);
        minter.setMerkleRootForMintConfig(configId, merkleRoot);
        minter.setExpirationTimestampForMintConfig(
            configId,
            block.timestamp + 14 days
        );

        // Verify updates
        (
            ,
            uint256 cardsPerPack,
            uint256 maxPacks,
            uint256 price,
            uint256 maxPacksPerAddress,
            bool requiresWhitelist,
            bytes32 rootHash,
            ,
            uint256 expirationTimestamp,
            ,

        ) = minter.getMintConfig(configId);

        assertEq(cardsPerPack, 4);
        assertEq(maxPacks, 200);
        assertEq(price, 0.2 ether);
        assertEq(maxPacksPerAddress, 10);
        assertTrue(requiresWhitelist);
        assertEq(rootHash, merkleRoot);
        assertEq(expirationTimestamp, block.timestamp + 14 days);

        vm.stopPrank();
    }

    function testUpdateMintConfigNotConfigManager() public {
        uint256 configId = createBasicMintConfig();

        vm.startPrank(user1);

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                user1,
                minter.MINT_CONFIG_ROLE()
            )
        );
        minter.setCardsPerPackForMintConfig(configId, 4);

        vm.stopPrank();
    }

    function testUpdateMintConfigInvalidValues() public {
        uint256 configId = createBasicMintConfig();

        vm.startPrank(configManager);

        // Test invalid cards per pack
        vm.expectRevert("Invalid cards per pack");
        minter.setCardsPerPackForMintConfig(configId, 0);

        // Test invalid max packs
        vm.expectRevert("Invalid max packs");
        minter.setMaxPacksForMintConfig(configId, 0);

        // Test invalid price
        vm.expectRevert("Invalid price");
        minter.setPriceForMintConfig(configId, 0);

        // Test invalid merkle root
        vm.expectRevert("Invalid merkleRoot");
        minter.setMerkleRootForMintConfig(configId, bytes32(0));

        // Test invalid expiration timestamp
        vm.expectRevert("Invalid expiration");
        minter.setExpirationTimestampForMintConfig(configId, block.timestamp);

        vm.stopPrank();
    }

    function testUpdateMintConfigCancelled() public {
        uint256 configId = createBasicMintConfig();

        vm.startPrank(configManager);
        minter.cancelMintConfig(configId);

        vm.expectRevert("Config cancelled");
        minter.setCardsPerPackForMintConfig(configId, 4);

        vm.expectRevert("Config cancelled");
        minter.setMaxPacksForMintConfig(configId, 200);

        vm.stopPrank();
    }

    function testUpdateGlobalParameters() public {
        vm.startPrank(admin);

        address newTreasury = makeAddr("newTreasury");
        address newExecutor = makeAddr("newExecutor");

        minter.setTreasury(newTreasury);
        minter.setExecutor(newExecutor);
        minter.setCardsRequiredForEvolve(5);
        minter.setCardsRequiredForRedraw(3);
        minter.setCardsDrawnPerRedraw(2);

        assertEq(minter.treasury(), newTreasury);
        assertEq(address(minter.executor()), newExecutor);
        assertEq(minter.cardsRequiredForEvolve(), 5);
        assertEq(minter.cardsRequiredForRedraw(), 3);
        assertEq(minter.cardsDrawnPerRedraw(), 2);

        vm.stopPrank();
    }

    function testUpdateGlobalParametersNotAdmin() public {
        vm.startPrank(user1);

        address newTreasury = makeAddr("newTreasury");

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                user1,
                minter.DEFAULT_ADMIN_ROLE()
            )
        );
        minter.setTreasury(newTreasury);

        vm.stopPrank();
    }

    function testUpdateGlobalParametersInvalidValues() public {
        vm.startPrank(admin);

        vm.expectRevert("Invalid treasury");
        minter.setTreasury(address(0));

        vm.expectRevert("Invalid executor");
        minter.setExecutor(address(0));

        vm.expectRevert("Invalid cards required");
        minter.setCardsRequiredForEvolve(0);

        vm.expectRevert("Invalid cards required");
        minter.setCardsRequiredForRedraw(0);

        vm.expectRevert("Invalid cards drawn");
        minter.setCardsDrawnPerRedraw(0);

        vm.stopPrank();
    }

    // ============ Collection Management Tests ============

    function testWhitelistCollection() public {
        address newCollection = makeAddr("newCollection");

        vm.startPrank(admin);

        minter.whitelistCollection(newCollection);
        assertTrue(minter.whitelistedCollections(newCollection));

        minter.unwhitelistCollection(newCollection);
        assertFalse(minter.whitelistedCollections(newCollection));

        vm.stopPrank();
    }

    function testWhitelistCollectionNotAdmin() public {
        address newCollection = makeAddr("newCollection");

        vm.startPrank(user1);

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                user1,
                minter.DEFAULT_ADMIN_ROLE()
            )
        );
        minter.whitelistCollection(newCollection);

        vm.stopPrank();
    }

    function testEvolveNotWhitelistedCollection() public {
        address newCollection = makeAddr("newCollection");
        uint256[] memory tokenIds = new uint256[](CARDS_REQUIRED_EVOLVE);

        vm.startPrank(user1);
        vm.expectRevert("Collection not whitelisted");
        minter.evolve(tokenIds, newCollection);
        vm.stopPrank();
    }

    // ============ Fund Management Tests ============

    function testSaveFunds() public {
        // Send some ETH to the contract
        vm.deal(address(minter), 1 ether);

        vm.startPrank(admin);

        uint256 recipientBalance = user1.balance;
        minter.saveFunds(user1, 0.5 ether);

        assertEq(user1.balance, recipientBalance + 0.5 ether);
        assertEq(address(minter).balance, 0.5 ether);

        vm.stopPrank();
    }

    function testSaveFundsNotAdmin() public {
        vm.deal(address(minter), 1 ether);

        vm.startPrank(user1);

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                user1,
                minter.DEFAULT_ADMIN_ROLE()
            )
        );
        minter.saveFunds(user2, 0.5 ether);

        vm.stopPrank();
    }

    function testSaveFundsInsufficientBalance() public {
        vm.startPrank(admin);

        vm.expectRevert("Insufficient balance");
        minter.saveFunds(user1, 1 ether);

        vm.stopPrank();
    }

    // Helper function to receive ETH
    receive() external payable {}
}
