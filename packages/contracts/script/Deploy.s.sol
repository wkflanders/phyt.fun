// packages/contracts/script/Deploy.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/Executor.sol";
import "../src/Minter.sol";
import "../src/PhytCards.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        // Use deployer address as treasury for testing
        address treasury = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy contracts
        Executor executor = new Executor();
        PhytCards phytCards = new PhytCards();
        Minter minter = new Minter(
            treasury,
            address(executor),
            3, // cardsRequiredForEvolve
            2, // cardsRequiredForRedraw
            1 // cardsDrawnPerRedraw
        );

        // Setup roles and permissions
        phytCards.grantRole(phytCards.EXECUTOR_ROLE(), address(executor));
        executor.approveContract(address(minter));
        minter.whitelistCollection(address(phytCards));

        // Create initial mint config for testing
        minter.newMintConfig(
            address(phytCards), // collection
            1, // cardsPerPack
            100, // maxPacks
            0.0001 ether, // price
            199, // maxPacksPerAddress
            false, // requiresWhitelist
            bytes32(0), // merkleRoot
            block.timestamp + 2 minutes, // startTimestamp
            block.timestamp + 7 days // expirationTimestamp
        );

        vm.stopBroadcast();

        // Log deployed addresses
        console.log("Executor deployed to:", address(executor));
        console.log("PhytCards deployed to:", address(phytCards));
        console.log("Minter deployed to:", address(minter));
    }
}
