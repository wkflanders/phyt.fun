// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/Executor.sol";

contract ApproveScript is Script {
    address EXECUTOR = vm.envAddress("EXECUTOR_ADDRESS"); // Add your executor address here
    address MINTER = vm.envAddress("MINTER_ADDRESS");

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Get Executor contract instance
        Executor executor = Executor(EXECUTOR);

        // Approve the Minter contract
        executor.approveContract(MINTER);

        vm.stopBroadcast();

        console.log("Approved Minter contract:", MINTER);
    }
}
