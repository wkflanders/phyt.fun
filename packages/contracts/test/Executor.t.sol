// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/Executor.sol";
import "../src/PhytCards.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}

contract MockERC721Receiver {
    bool public shouldReject;

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external view returns (bytes4) {
        require(!shouldReject, "MockERC721Receiver: rejected");
        return this.onERC721Received.selector;
    }

    function setShouldReject(bool _shouldReject) external {
        shouldReject = _shouldReject;
    }
}

contract ExecutorTest is Test {
    Executor public executor;
    PhytCards public phytCards;
    MockERC20 public mockToken;
    MockERC721Receiver public mockReceiver;

    address public admin;
    address public pauser;
    address public approvedContract;
    address public user1;
    address public user2;
    address public treasury;

    // Custom errors
    error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);
    error ERC721NonexistentToken(uint256 tokenId);
    error ERC721InvalidReceiver(address receiver);

    event ApproveContract(address _contract);
    event DenyContract(address _contract);
    event RevokeApproval(address user);
    event GrantApproval(address user);

    function setUp() public {
        admin = makeAddr("admin");
        pauser = makeAddr("pauser");
        approvedContract = makeAddr("approvedContract");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        treasury = makeAddr("treasury");

        vm.startPrank(admin);

        executor = new Executor();
        phytCards = new PhytCards();
        mockToken = new MockERC20();
        mockReceiver = new MockERC721Receiver();

        // Setup roles
        executor.grantRole(executor.PAUSER_ROLE(), pauser);
        phytCards.grantRole(phytCards.EXECUTOR_ROLE(), address(executor));

        // Approve contract
        executor.approveContract(approvedContract);

        vm.stopPrank();
    }

    // ============ Access Control Tests ============

    function testInitialState() public view {
        assertTrue(executor.hasRole(executor.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(executor.hasRole(executor.PAUSER_ROLE(), pauser));
        assertTrue(executor.contracts(approvedContract));
        assertFalse(executor.paused());
    }

    function testApproveContract() public {
        address newContract = makeAddr("newContract");

        vm.startPrank(admin);

        vm.expectEmit(true, true, true, true);
        emit ApproveContract(newContract);

        executor.approveContract(newContract);
        assertTrue(executor.contracts(newContract));

        vm.stopPrank();
    }

    function testApproveContractNotAdmin() public {
        address newContract = makeAddr("newContract");

        vm.startPrank(user1);

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                user1,
                executor.DEFAULT_ADMIN_ROLE()
            )
        );
        executor.approveContract(newContract);

        vm.stopPrank();
    }

    function testDenyContract() public {
        vm.startPrank(admin);

        vm.expectEmit(true, true, true, true);
        emit DenyContract(approvedContract);

        executor.denyContract(approvedContract);
        assertFalse(executor.contracts(approvedContract));

        vm.stopPrank();
    }

    function testDenyContractNotAdmin() public {
        vm.startPrank(user1);

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                user1,
                executor.DEFAULT_ADMIN_ROLE()
            )
        );
        executor.denyContract(approvedContract);

        vm.stopPrank();
    }

    // ============ Approval Management Tests ============

    function testRevokeAndGrantApproval() public {
        vm.startPrank(user1);

        vm.expectEmit(true, true, true, true);
        emit RevokeApproval(user1);

        executor.revokeApproval();
        assertTrue(executor.revokedApproval(user1));

        vm.expectEmit(true, true, true, true);
        emit GrantApproval(user1);

        executor.grantApproval();
        assertFalse(executor.revokedApproval(user1));

        vm.stopPrank();
    }

    // ============ Pause Functionality Tests ============

    function testPauseAndUnpause() public {
        // Test pause
        vm.prank(pauser);
        executor.pause();
        assertTrue(executor.paused());

        // Test functionality when paused
        vm.startPrank(approvedContract);
        vm.expectRevert(
            abi.encodeWithSelector(Pausable.EnforcedPause.selector)
        );
        executor.mintPhytCard(address(phytCards), user1);
        vm.stopPrank();

        // Test unpause
        vm.prank(admin);
        executor.unpause();
        assertFalse(executor.paused());

        // Test functionality after unpause
        vm.prank(approvedContract);
        executor.mintPhytCard(address(phytCards), user1);
        assertEq(phytCards.ownerOf(0), user1);
    }

    function testPauseNotPauser() public {
        vm.startPrank(user1);

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                user1,
                executor.PAUSER_ROLE()
            )
        );
        executor.pause();

        vm.stopPrank();
    }

    function testUnpauseNotAdmin() public {
        // First pause
        vm.prank(pauser);
        executor.pause();

        // Try to unpause as non-admin
        vm.startPrank(user1);

        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlUnauthorizedAccount.selector,
                user1,
                executor.DEFAULT_ADMIN_ROLE()
            )
        );
        executor.unpause();

        vm.stopPrank();
    }

    // ============ PhytCard Operation Tests ============

    function testMintPhytCard() public {
        vm.startPrank(approvedContract);

        executor.mintPhytCard(address(phytCards), user1);

        assertEq(phytCards.ownerOf(0), user1);
        assertEq(phytCards.balanceOf(user1), 1);

        vm.stopPrank();
    }

    function testMintPhytCardNotApprovedContract() public {
        vm.startPrank(user1);

        vm.expectRevert("Contract is not approved to make transfers");
        executor.mintPhytCard(address(phytCards), user2);

        vm.stopPrank();
    }

    function testBurnPhytCard() public {
        // First mint a token
        vm.prank(approvedContract);
        executor.mintPhytCard(address(phytCards), user1);

        vm.startPrank(approvedContract);

        executor.burnPhytCard(address(phytCards), 0, user1);

        vm.expectRevert(
            abi.encodeWithSelector(ERC721NonexistentToken.selector, 0)
        );
        phytCards.ownerOf(0);

        vm.stopPrank();
    }

    function testBurnPhytCardWithRevokedApproval() public {
        // First mint a token
        vm.prank(approvedContract);
        executor.mintPhytCard(address(phytCards), user1);

        // User revokes approval
        vm.prank(user1);
        executor.revokeApproval();

        // Try to burn
        vm.startPrank(approvedContract);
        vm.expectRevert("User revoked approval");
        executor.burnPhytCard(address(phytCards), 0, user1);
        vm.stopPrank();
    }

    // ============ ERC721 Transfer Tests ============

    function testTransferERC721() public {
        // First mint a token
        vm.prank(approvedContract);
        executor.mintPhytCard(address(phytCards), user1);

        vm.prank(user1);
        phytCards.setApprovalForAll(address(executor), true);

        vm.startPrank(approvedContract);
        executor.transferERC721(address(phytCards), user1, user2, 0);

        assertEq(phytCards.ownerOf(0), user2);
        assertEq(phytCards.balanceOf(user1), 0);
        assertEq(phytCards.balanceOf(user2), 1);

        vm.stopPrank();
    }

    function testTransferERC721WithRevokedApproval() public {
        // First mint a token
        vm.prank(approvedContract);
        executor.mintPhytCard(address(phytCards), user1);

        // User revokes approval
        vm.prank(user1);
        executor.revokeApproval();

        // Try to transfer
        vm.startPrank(approvedContract);
        vm.expectRevert("User has revoked approval");
        executor.transferERC721(address(phytCards), user1, user2, 0);
        vm.stopPrank();
    }

    function testTransferERC721ToInvalidReceiver() public {
        // First mint a token
        vm.prank(approvedContract);
        executor.mintPhytCard(address(phytCards), user1);

        // Set receiver to reject transfers
        mockReceiver.setShouldReject(true);

        vm.startPrank(approvedContract);
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721InsufficientApproval.selector,
                executor,
                0
            )
        );
        executor.transferERC721(
            address(phytCards),
            user1,
            address(mockReceiver),
            0
        );
        vm.stopPrank();
    }

    // ============ ERC20 Transfer Tests ============

    function testTransferERC20() public {
        // First approve executor for ERC20 transfers
        vm.prank(admin);
        mockToken.approve(address(executor), type(uint256).max);

        uint256 transferAmount = 1000 * 10 ** mockToken.decimals();

        vm.startPrank(approvedContract);
        executor.transferERC20(
            address(mockToken),
            admin,
            user1,
            transferAmount
        );

        assertEq(mockToken.balanceOf(user1), transferAmount);

        vm.stopPrank();
    }

    function testTransferERC20WithRevokedApproval() public {
        // First approve executor for ERC20 transfers
        vm.startPrank(admin);
        mockToken.approve(address(executor), type(uint256).max);

        // User revokes approval
        executor.revokeApproval();

        uint256 transferAmount = 1000 * 10 ** mockToken.decimals();

        // Try to transfer
        vm.startPrank(approvedContract);
        vm.expectRevert("User has revoked approval");
        executor.transferERC20(
            address(mockToken),
            admin,
            user1,
            transferAmount
        );
        vm.stopPrank();
    }

    function testTransferERC20InsufficientAllowance() public {
        uint256 transferAmount = 1000 * 10 ** mockToken.decimals();

        vm.startPrank(approvedContract);
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientAllowance.selector,
                executor,
                0,
                transferAmount
            )
        );
        executor.transferERC20(
            address(mockToken),
            admin,
            user1,
            transferAmount
        );
        vm.stopPrank();
    }

    // ============ Complex Scenario Tests ============

    function testComplexScenarioWithMultipleOperations() public {
        // 1. Setup initial state
        vm.startPrank(admin);
        mockToken.approve(address(executor), type(uint256).max);
        vm.stopPrank();

        // 2. Mint tokens
        vm.startPrank(approvedContract);
        executor.mintPhytCard(address(phytCards), user1);
        executor.mintPhytCard(address(phytCards), user1);
        vm.stopPrank();

        vm.prank(user1);
        phytCards.setApprovalForAll(address(executor), true);

        // 3. Transfer ERC20
        vm.prank(approvedContract);
        uint256 transferAmount = 1000 * 10 ** mockToken.decimals();
        vm.prank(approvedContract);
        executor.transferERC20(
            address(mockToken),
            admin,
            user1,
            transferAmount
        );

        // 4. Transfer one NFT
        vm.prank(approvedContract);
        executor.transferERC721(address(phytCards), user1, user2, 0);

        // 5. User revokes approval
        vm.prank(user1);
        executor.revokeApproval();

        // 6. Verify final state
        assertEq(phytCards.ownerOf(0), user2);
        assertEq(phytCards.ownerOf(1), user1);
        assertEq(phytCards.balanceOf(user1), 1);
        assertEq(phytCards.balanceOf(user2), 1);
        assertEq(mockToken.balanceOf(user1), transferAmount);
        assertTrue(executor.revokedApproval(user1));

        // 7. Verify revoked operations fail
        vm.startPrank(approvedContract);
        vm.expectRevert("User has revoked approval");
        executor.transferERC721(address(phytCards), user1, user2, 1);
        vm.stopPrank();
    }

    function testPausedScenarioWithMultipleOperations() public {
        // 1. Mint initial tokens
        vm.startPrank(approvedContract);
        executor.mintPhytCard(address(phytCards), user1);
        executor.mintPhytCard(address(phytCards), user2);
        vm.stopPrank();

        // 2. Pause contract
        vm.prank(pauser);
        executor.pause();

        // 3. Verify all operations fail when paused
        vm.startPrank(approvedContract);

        vm.expectRevert(
            abi.encodeWithSelector(Pausable.EnforcedPause.selector)
        );
        executor.mintPhytCard(address(phytCards), user1);

        vm.expectRevert(
            abi.encodeWithSelector(Pausable.EnforcedPause.selector)
        );
        executor.burnPhytCard(address(phytCards), 0, user1);

        vm.expectRevert(
            abi.encodeWithSelector(Pausable.EnforcedPause.selector)
        );
        executor.transferERC721(address(phytCards), user1, user2, 0);

        vm.expectRevert(
            abi.encodeWithSelector(Pausable.EnforcedPause.selector)
        );
        executor.transferERC20(address(mockToken), user1, user2, 100);

        vm.stopPrank();

        // 4. Verify non-transfer operations still work when paused
        vm.prank(user1);
        executor.revokeApproval();
        assertTrue(executor.revokedApproval(user1));

        vm.prank(admin);
        executor.approveContract(makeAddr("newContract"));

        // 5. Unpause and verify operations work again
        vm.prank(admin);
        executor.unpause();

        vm.prank(approvedContract);
        executor.mintPhytCard(address(phytCards), user1);
        assertEq(phytCards.ownerOf(2), user1);
    }

    // ============ Edge Case Tests ============

    function testTransferToZeroAddress() public {
        // First mint a token
        vm.prank(approvedContract);
        executor.mintPhytCard(address(phytCards), user1);

        vm.startPrank(approvedContract);

        vm.expectRevert(
            abi.encodeWithSelector(ERC721InvalidReceiver.selector, address(0))
        );
        executor.transferERC721(address(phytCards), user1, address(0), 0);

        vm.stopPrank();
    }

    function testBurnNonexistentToken() public {
        vm.startPrank(approvedContract);

        vm.expectRevert(
            abi.encodeWithSelector(ERC721NonexistentToken.selector, 999)
        );
        executor.burnPhytCard(address(phytCards), 999, user1);

        vm.stopPrank();
    }

    function testTransferNonexistentToken() public {
        vm.startPrank(approvedContract);

        vm.expectRevert(
            abi.encodeWithSelector(ERC721NonexistentToken.selector, 999)
        );
        executor.transferERC721(address(phytCards), user1, user2, 999);

        vm.stopPrank();
    }

    function testMintToZeroAddress() public {
        vm.prank(approvedContract);
        vm.expectRevert(
            abi.encodeWithSelector(ERC721InvalidReceiver.selector, address(0))
        );
        executor.mintPhytCard(address(phytCards), address(0));
    }

    function testTransferFromNonOwner() public {
        // First mint a token
        vm.prank(approvedContract);
        executor.mintPhytCard(address(phytCards), user1);

        vm.startPrank(approvedContract);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721InsufficientApproval.selector,
                executor,
                0
            )
        );
        executor.transferERC721(address(phytCards), user2, user1, 0);

        vm.stopPrank();
    }

    // ============ Gas Usage Tests ============

    function testGasUsageMint() public {
        vm.startPrank(approvedContract);

        uint256 gasBefore = gasleft();
        executor.mintPhytCard(address(phytCards), user1);
        uint256 gasUsed = gasBefore - gasleft();

        assertLt(gasUsed, 200000); // Adjust threshold as needed

        vm.stopPrank();
    }

    function testGasUsageTransfer() public {
        // First mint a token
        vm.prank(approvedContract);
        executor.mintPhytCard(address(phytCards), user1);

        vm.prank(user1);
        phytCards.setApprovalForAll(address(executor), true);

        vm.prank(approvedContract);
        uint256 gasBefore = gasleft();
        executor.transferERC721(address(phytCards), user1, user2, 0);
        uint256 gasUsed = gasBefore - gasleft();

        assertLt(gasUsed, 150000); // Adjust threshold as needed
    }

    // ============ Batch Operation Tests ============

    function testBatchMint() public {
        vm.startPrank(approvedContract);

        for (uint256 i = 0; i < 5; i++) {
            executor.mintPhytCard(address(phytCards), user1);
        }

        assertEq(phytCards.balanceOf(user1), 5);
        for (uint256 i = 0; i < 5; i++) {
            assertEq(phytCards.ownerOf(i), user1);
        }

        vm.stopPrank();
    }

    function testBatchTransfer() public {
        // First mint multiple tokens
        vm.startPrank(approvedContract);
        for (uint256 i = 0; i < 5; i++) {
            executor.mintPhytCard(address(phytCards), user1);
        }

        vm.stopPrank();
        vm.prank(user1);
        phytCards.setApprovalForAll(address(executor), true);

        vm.startPrank(approvedContract);
        // Transfer all tokens
        for (uint256 i = 0; i < 5; i++) {
            executor.transferERC721(address(phytCards), user1, user2, i);
        }

        assertEq(phytCards.balanceOf(user1), 0);
        assertEq(phytCards.balanceOf(user2), 5);
        for (uint256 i = 0; i < 5; i++) {
            assertEq(phytCards.ownerOf(i), user2);
        }

        vm.stopPrank();
    }

    // ============ Receive Function Tests ============

    // function testReceiveEther() public {
    //     // Send ETH to contract
    //     vm.deal(user1, 1 ether);

    //     vm.startPrank(user1);
    //     (bool success, ) = address(executor).call{value: 1 ether}("");
    //     assertTrue(success);
    //     assertEq(address(executor).balance, 1 ether);
    //     vm.stopPrank();
    // }

    // receive() external payable {}
}
