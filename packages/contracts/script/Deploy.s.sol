// packages/contracts/script/Deploy.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/Executor.sol";
import "../src/Minter.sol";
import "../src/PhytCards.sol";
import "../src/Exchange.sol";

contract DeployScript is Script {
    function run() external {
        // Read deployer's private key from the environment variable.
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        // Use the deployer address as treasury.
        address treasury = vm.addr(deployerPrivateKey);

        // Read the whitelist Merkle root from the environment variable.
        // This should be a 32-byte hex string (for example, "0x0000000000000000000000000000000000000000000000000000000000000000" when empty).
        bytes32 whitelistRoot = vm.envBytes32("WHITELIST_ROOT");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contracts.
        Executor executor = new Executor();
        PhytCards phytCards = new PhytCards();
        Minter minter = new Minter(
            treasury,
            address(executor),
            3, // cardsRequiredForEvolve
            2, // cardsRequiredForRedraw
            1 // cardsDrawnPerRedraw
        );
        Exchange exchange = new Exchange(treasury, 250, address(executor));

        // Setup roles and permissions.
        // Grant the Executor its role in the PhytCards contract.
        phytCards.grantRole(phytCards.EXECUTOR_ROLE(), address(executor));
        // Approve the Minter contract on the Executor.
        executor.approveContract(address(minter));
        // Whitelist the PhytCards collection in the Minter.
        minter.whitelistCollection(address(phytCards));
        // Whitelist the PhytCards Collection in the Exchange.

        // Create an initial mint configuration.
        // Enable whitelist checks by setting requiresWhitelist to true and passing the whitelistRoot.
        minter.newMintConfig(
            address(phytCards), // collection address
            1, // cardsPerPack
            100, // maxPacks
            0.001 ether, // price per pack
            199, // maxPacksPerAddress
            true, // requiresWhitelist is enabled
            whitelistRoot, // whitelist Merkle root from env variable
            block.timestamp + 2 minutes, // startTimestamp
            block.timestamp + 7 days // expirationTimestamp
        );

        vm.stopBroadcast();

        // Log deployed contract addresses.
        console.log("Executor deployed to:", address(executor));
        console.log("PhytCards deployed to:", address(phytCards));
        console.log("Minter deployed to:", address(minter));
        console.log("Exchange deployed to:", address(exchange));
    }
}
