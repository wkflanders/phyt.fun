// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/PhytCards.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";

contract PhytCardsTest is Test {
    PhytCards public phytCards;
    address public owner;
    address public executor;
    address public user1;
    address public user2;

    // Custom errors from OpenZeppelin contracts
    error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);
    error ERC721NonexistentToken(uint256 tokenId);
    error ERC721InvalidReceiver(address receiver);

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
    event Approval(
        address indexed owner,
        address indexed approved,
        uint256 indexed tokenId
    );
    event ApprovalForAll(
        address indexed owner,
        address indexed operator,
        bool approved
    );

    function setUp() public {
        owner = makeAddr("owner");
        executor = makeAddr("executor");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        vm.startPrank(owner);
        phytCards = new PhytCards();
        phytCards.grantRole(phytCards.EXECUTOR_ROLE(), executor);
        vm.stopPrank();
    }

    function testInitialState() public view {
        assertEq(phytCards.name(), "Phyt");
        assertEq(phytCards.symbol(), "PHYT");
        assertEq(phytCards.tokenCounter(), 0);
        assertTrue(phytCards.hasRole(phytCards.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(phytCards.hasRole(phytCards.EXECUTOR_ROLE(), executor));
    }

    function testSafeMint() public {
        vm.startPrank(executor);

        vm.expectEmit(true, true, true, true);
        emit Transfer(address(0), user1, 0);

        phytCards.safeMint(user1);

        assertEq(phytCards.ownerOf(0), user1);
        assertEq(phytCards.balanceOf(user1), 1);
        assertEq(phytCards.tokenCounter(), 1);

        vm.stopPrank();
    }

    function testSafeMintOnlyExecutor() public {
        vm.startPrank(user1);

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                user1,
                phytCards.EXECUTOR_ROLE()
            )
        );
        phytCards.safeMint(user2);

        vm.stopPrank();
    }

    function testBurn() public {
        // First mint a token
        vm.prank(executor);
        phytCards.safeMint(user1);

        vm.startPrank(executor);

        vm.expectEmit(true, true, true, true);
        emit Transfer(user1, address(0), 0);

        phytCards.burn(0);

        vm.expectRevert(
            abi.encodeWithSelector(ERC721NonexistentToken.selector, 0)
        );
        phytCards.ownerOf(0);

        assertEq(phytCards.balanceOf(user1), 0);

        vm.stopPrank();
    }

    function testBurnOnlyExecutor() public {
        vm.prank(executor);
        phytCards.safeMint(user1);

        vm.startPrank(user1);

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                user1,
                phytCards.EXECUTOR_ROLE()
            )
        );
        phytCards.burn(0);

        vm.stopPrank();
    }

    function testSetBaseURI() public {
        string memory newBaseURI = "https://api.example.com/token/";

        vm.startPrank(owner);
        phytCards.setBaseURI(newBaseURI);
        vm.stopPrank();

        vm.prank(executor);
        phytCards.safeMint(user1);

        assertEq(phytCards.tokenURI(0), string.concat(newBaseURI, "0"));
    }

    function testSetBaseURIOnlyAdmin() public {
        vm.startPrank(user1);

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                user1,
                phytCards.DEFAULT_ADMIN_ROLE()
            )
        );
        phytCards.setBaseURI("https://api.example.com/token/");

        vm.stopPrank();
    }

    function testTransferFrom() public {
        vm.startPrank(owner);
        phytCards.grantRole(phytCards.EXECUTOR_ROLE(), executor);
        vm.stopPrank();

        vm.prank(executor);
        phytCards.safeMint(user1);

        uint256 tokenId = 0;

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                address(this),
                phytCards.EXECUTOR_ROLE()
            )
        );
        phytCards.transferFrom(user1, user2, tokenId);
    }

    function testTransferFromOnlyExecutor() public {
        vm.prank(executor);
        phytCards.safeMint(user1);

        vm.startPrank(user1);

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                user1,
                phytCards.EXECUTOR_ROLE()
            )
        );
        phytCards.transferFrom(user1, user2, 0);

        vm.stopPrank();
    }

    function testSafeTransferFrom() public {
        vm.startPrank(owner);
        phytCards.grantRole(phytCards.EXECUTOR_ROLE(), executor);
        vm.stopPrank();

        vm.prank(executor);
        phytCards.safeMint(user1);

        uint256 tokenId = 0;

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                address(this),
                phytCards.EXECUTOR_ROLE()
            )
        );
        phytCards.safeTransferFrom(user1, user2, tokenId);
    }

    function testSafeTransferFromOnlyExecutor() public {
        vm.prank(executor);
        phytCards.safeMint(user1);

        vm.startPrank(user1);

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                user1,
                phytCards.EXECUTOR_ROLE()
            )
        );
        phytCards.safeTransferFrom(user1, user2, 0);

        vm.stopPrank();
    }

    function testSupportsInterface() public view {
        assertTrue(phytCards.supportsInterface(type(IERC721).interfaceId));
        assertTrue(
            phytCards.supportsInterface(type(IERC721Metadata).interfaceId)
        );
        assertTrue(
            phytCards.supportsInterface(type(IAccessControl).interfaceId)
        );
    }
}
