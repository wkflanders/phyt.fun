// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/Minter.sol";

contract DeployMinterScript is Script {
    function run() external {
        // Read deployer's private key from the environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Use the deployer address as treasury
        address treasury = vm.addr(deployerPrivateKey);

        // Read the executor address and phyt cards address from env
        address executor = vm.envAddress("EXECUTOR_ADDRESS");
        address phytCards = vm.envAddress("PHYT_CARDS_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the Minter contract
        Minter minter = new Minter(
            treasury,
            executor,
            3, // cardsRequiredForEvolve
            2, // cardsRequiredForRedraw
            1 // cardsDrawnPerRedraw
        );

        // Whitelist the PhytCards collection
        minter.whitelistCollection(phytCards);

        vm.stopBroadcast();

        // Log deployed contract address
        console.log("Minter deployed to:", address(minter));
    }
}
