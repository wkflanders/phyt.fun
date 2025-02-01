/**

   _____  _    ___     _________ 
 |  __ \| |  | \ \   / /__   __|
 | |__) | |__| |\ \_/ /   | |   
 |  ___/|  __  | \   /    | |   
 | |    | |  | |  | |     | |   
 |_|    |_|  |_|  |_|     |_|   
                                
                                

 */
// Shout out Travis Bickle/Fantasy Top for archietcture
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./lib/OrderLib.sol";
import "./interfaces/IExecutor.sol";

/**
 * @title Exchange
 * @notice A simplified exchange contract designed to trade Phyt NFTs using ETH only.
 * Orders are signed using EIP712 and only externally owned accounts (EOAs) can call the public functions.
 * This version uses an external Executor contract for ERC721 transfers and token burns.
 */
contract Exchange is EIP712, Ownable2Step, ReentrancyGuard {
    // Use a basis-point system (1 bp = 0.01%) for protocol fees.
    uint256 public constant INVERSE_BASIS_POINT = 10000;

    /// @notice Tracks order hashes that have been cancelled or already filled.
    mapping(bytes32 => bool) public cancelledOrFilled;
    /// @notice Only NFT collections that are whitelisted can be traded.
    mapping(address => bool) public whitelistedCollections;

    /// @notice Protocol fee in basis points.
    uint256 public protocolFeeBps;
    /// @notice Address that will receive the protocol fees.
    address public protocolFeeRecipient;
    /// @notice The executor contract that handles NFT transfers and burns.
    IExecutor public executor;

    /// @dev Only externally owned accounts may call functions with this modifier.
    modifier onlyEOA() {
        require(
            msg.sender == tx.origin,
            "Function can only be called by an EOA"
        );
        _;
    }

    /**
     * @notice Constructor.
     * @param _protocolFeeRecipient Address to receive protocol fees.
     * @param _protocolFeeBps Protocol fee (in basis points).
     * @param _executor Address of the executor contract.
     */
    constructor(
        address _protocolFeeRecipient,
        uint256 _protocolFeeBps,
        address _executor
    ) EIP712("Exchange", "1") Ownable(msg.sender) {
        _setProtocolFeeRecipient(_protocolFeeRecipient);
        _setProtocolFeeBps(_protocolFeeBps);
        _setExecutor(_executor);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // EXTERNAL FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * @notice Executes a buy operation (buyer accepting a sell order).
     * @param sellOrder The sell order.
     * @param sellerSignature The seller’s signature over the order.
     * @param burnAfterPurchase If true, the NFT will be burned (via the executor) after purchase.
     */
    function buy(
        OrderLib.Order calldata sellOrder,
        bytes calldata sellerSignature,
        bool burnAfterPurchase
    ) external payable nonReentrant onlyEOA {
        _buy(sellOrder, sellerSignature, burnAfterPurchase);
    }

    /**
     * @notice Executes multiple buy orders in one transaction.
     * @param sellOrders Array of sell orders.
     * @param sellerSignatures Array of signatures (one per order).
     * @param burnAfterPurchase If true, NFTs are burned after purchase.
     */
    function batchBuy(
        OrderLib.Order[] calldata sellOrders,
        bytes[] calldata sellerSignatures,
        bool burnAfterPurchase
    ) external payable nonReentrant onlyEOA {
        require(
            sellOrders.length == sellerSignatures.length,
            "Array length mismatch"
        );

        uint256 totalEthSpending;
        // Since only ETH is allowed, ensure every order’s paymentToken is the zero address.
        for (uint256 i = 0; i < sellOrders.length; i++) {
            require(
                sellOrders[i].paymentToken == address(0),
                "Payment token must be ETH"
            );
            totalEthSpending += sellOrders[i].price;
        }
        require(totalEthSpending <= msg.value, "Insufficient ETH sent");

        for (uint256 i = 0; i < sellOrders.length; i++) {
            _buy(sellOrders[i], sellerSignatures[i], burnAfterPurchase);
        }

        if (burnAfterPurchase) {
            emit BatchBuyAndBurn(msg.sender, sellOrders, sellerSignatures);
        } else {
            emit BatchBuy(msg.sender, sellOrders, sellerSignatures);
        }
    }

    /**
     * @notice Executes a sell operation (seller accepting a buy order).
     * @param buyOrder The buy order.
     * @param buyerSignature The buyer’s signature over the order.
     * @param tokenId The token ID being sold.
     * @param merkleProof The merkle proof for validating tokenId eligibility.
     */
    function sell(
        OrderLib.Order calldata buyOrder,
        bytes calldata buyerSignature,
        uint256 tokenId,
        bytes32[] calldata merkleProof
    ) external payable nonReentrant onlyEOA {
        _sell(buyOrder, buyerSignature, tokenId, merkleProof);
    }

    /**
     * @notice Executes multiple sell orders in one transaction.
     */
    function batchSell(
        OrderLib.Order[] calldata buyOrders,
        bytes[] calldata buyerSignatures,
        uint256[] calldata tokenIds,
        bytes32[][] calldata merkleProofs
    ) external payable nonReentrant onlyEOA {
        require(
            buyOrders.length == buyerSignatures.length,
            "Array length mismatch"
        );
        require(buyOrders.length == tokenIds.length, "Array length mismatch");
        require(
            buyOrders.length == merkleProofs.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < buyOrders.length; i++) {
            _sell(
                buyOrders[i],
                buyerSignatures[i],
                tokenIds[i],
                merkleProofs[i]
            );
        }
        emit BatchSell(msg.sender, buyOrders, tokenIds, merkleProofs);
    }

    /**
     * @notice Cancels a single order.
     */
    function cancelOrder(OrderLib.Order calldata order) external {
        _cancelOrder(order);
    }

    /**
     * @notice Cancels multiple orders.
     */
    function batchCancelOrders(OrderLib.Order[] calldata orders) external {
        for (uint256 i = 0; i < orders.length; i++) {
            _cancelOrder(orders[i]);
        }
    }

    /**
     * @notice Whitelists an NFT collection.
     */
    function whiteListCollection(address _collection) external onlyOwner {
        whitelistedCollections[_collection] = true;
        emit NewWhitelistedCollection(_collection);
    }

    /**
     * @notice Removes an NFT collection from the whitelist.
     */
    function unWhiteListCollection(address _collection) external onlyOwner {
        whitelistedCollections[_collection] = false;
        emit UnWhitelistedCollection(_collection);
    }

    /**
     * @notice Sets a new protocol fee (in basis points).
     */
    function setProtocolFeeBps(uint256 _protocolFeeBps) external onlyOwner {
        _setProtocolFeeBps(_protocolFeeBps);
    }

    /**
     * @notice Sets a new protocol fee recipient.
     */
    function setProtocolFeeRecipient(
        address _protocolFeeRecipient
    ) external onlyOwner {
        _setProtocolFeeRecipient(_protocolFeeRecipient);
    }

    /**
     * @notice Sets a new executor contract.
     */
    function setExecutor(address _executor) external onlyOwner {
        _setExecutor(_executor);
    }

    /**
     * @notice Returns the EIP712 domain separator.
     */
    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**
     * @notice Withdraws any accidentally sent ETH.
     */
    function saveFunds(address to, uint256 amount) external onlyOwner {
        payable(to).transfer(amount);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // INTERNAL FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────────

    function _buy(
        OrderLib.Order calldata sellOrder,
        bytes calldata sellerSignature,
        bool burnAfterPurchase
    ) internal {
        require(sellOrder.side == OrderLib.Side.Sell, "Order must be a sell");
        require(sellOrder.expirationTime > block.timestamp, "Order expired");
        require(sellOrder.trader != address(0), "Trader cannot be 0");
        require(sellOrder.paymentToken == address(0), "Payment must be ETH");
        require(sellOrder.salt > 100_000, "Salt should be above 100_000");

        bytes32 sellOrderHash = OrderLib._hashOrder(sellOrder);
        require(
            !cancelledOrFilled[sellOrderHash],
            "Sell order cancelled or filled"
        );

        bytes32 sellOrderDigest = _hashTypedDataV4(sellOrderHash);
        address recoveredSeller = ECDSA.recover(
            sellOrderDigest,
            sellerSignature
        );
        require(recoveredSeller == sellOrder.trader, "Invalid signature");

        // Mark the order as filled.
        cancelledOrFilled[sellOrderHash] = true;

        // Transfer ETH from the buyer (msg.sender) to the seller (minus fees).
        _executeFundsTransfer(
            msg.sender,
            sellOrder.trader,
            sellOrder.paymentToken,
            sellOrder.price
        );

        emit Buy(msg.sender, sellOrder, sellOrderHash);

        if (burnAfterPurchase) {
            require(
                whitelistedCollections[sellOrder.collection],
                "Collection is not whitelisted"
            );
            // Call the executor to burn the token.
            executor.burnPhytCard(
                sellOrder.collection,
                sellOrder.tokenId,
                sellOrder.trader
            );
            emit BuyAndBurn(msg.sender, sellOrder, sellOrderHash);
        } else {
            _executeTokenTransfer(
                sellOrder.collection,
                sellOrder.trader,
                msg.sender,
                sellOrder.tokenId
            );
        }
    }

    function _sell(
        OrderLib.Order calldata buyOrder,
        bytes calldata buyerSignature,
        uint256 tokenId,
        bytes32[] calldata merkleProof
    ) internal {
        require(buyOrder.paymentToken == address(0), "Payment must be ETH");
        require(buyOrder.side == OrderLib.Side.Buy, "Order must be a buy");
        require(buyOrder.expirationTime > block.timestamp, "Order expired");
        require(buyOrder.trader != address(0), "Trader cannot be 0");
        require(buyOrder.salt > 100_000, "Salt should be above 100_000");

        bytes32 buyOrderHash = OrderLib._hashOrder(buyOrder);
        require(
            !cancelledOrFilled[buyOrderHash],
            "Buy order cancelled or filled"
        );

        bytes32 buyOrderDigest = _hashTypedDataV4(buyOrderHash);
        address recoveredBuyer = ECDSA.recover(buyOrderDigest, buyerSignature);
        require(recoveredBuyer == buyOrder.trader, "Invalid signature");

        require(
            _verifyTokenId(buyOrder.merkleRoot, merkleProof, tokenId),
            "Invalid tokenId for this buy order"
        );

        // Mark the order as filled.
        cancelledOrFilled[buyOrderHash] = true;

        // Transfer ETH from buyer (order trader) to the seller (msg.sender), minus fees.
        _executeFundsTransfer(
            buyOrder.trader,
            msg.sender,
            buyOrder.paymentToken,
            buyOrder.price
        );

        // Transfer the NFT from the seller to the buyer.
        _executeTokenTransfer(
            buyOrder.collection,
            msg.sender,
            buyOrder.trader,
            tokenId
        );

        emit Sell(msg.sender, buyOrder, tokenId, buyOrderHash);
    }

    function _cancelOrder(OrderLib.Order calldata order) internal {
        require(order.trader == msg.sender, "Only order owner can cancel");
        bytes32 orderHash = OrderLib._hashOrder(order);
        cancelledOrFilled[orderHash] = true;
        emit CancelOrder(orderHash);
    }

    function _setProtocolFeeBps(uint256 _protocolFeeBps) internal {
        require(
            _protocolFeeBps <= INVERSE_BASIS_POINT,
            "Fee cannot exceed 100%"
        );
        protocolFeeBps = _protocolFeeBps;
        emit NewProtocolFeeBps(_protocolFeeBps);
    }

    function _setProtocolFeeRecipient(address _protocolFeeRecipient) internal {
        require(
            _protocolFeeRecipient != address(0),
            "Fee recipient cannot be 0"
        );
        protocolFeeRecipient = _protocolFeeRecipient;
        emit NewProtocolFeeRecipient(_protocolFeeRecipient);
    }

    function _setExecutor(address _executor) internal {
        require(_executor != address(0), "Executor cannot be 0");
        executor = IExecutor(_executor);
        emit NewExecutor(_executor);
    }

    /**
     * @dev Executes the ETH transfers (including fee deduction).
     * Assumes paymentToken is address(0) (i.e. ETH).
     */
    function _executeFundsTransfer(
        address from,
        address to,
        address paymentToken,
        uint256 price
    ) internal {
        require(paymentToken == address(0), "Only ETH supported");
        require(msg.value >= price, "Incorrect ETH amount sent");

        uint256 amountAfterFees = _transferFees(paymentToken, from, price);
        _transferTo(paymentToken, to, amountAfterFees);
    }

    /**
     * @dev Transfers the protocol fee and returns the remaining amount.
     */
    function _transferFees(
        address paymentToken,
        address /*from*/,
        uint256 price
    ) internal returns (uint256) {
        uint256 fee = (price * protocolFeeBps) / INVERSE_BASIS_POINT;
        _transferTo(paymentToken, protocolFeeRecipient, fee);
        require(fee <= price, "Fee exceeds price");
        return price - fee;
    }

    /**
     * @dev Transfers ETH to the recipient.
     */
    function _transferTo(
        address paymentToken,
        address to,
        uint256 amount
    ) internal {
        if (amount == 0) {
            return;
        }
        if (paymentToken == address(0)) {
            payable(to).transfer(amount);
        } else {
            revert("Invalid payment token");
        }
    }

    /**
     * @dev Uses the executor to transfer an NFT.
     */
    function _executeTokenTransfer(
        address collection,
        address from,
        address to,
        uint256 tokenId
    ) internal {
        require(
            whitelistedCollections[collection],
            "Collection is not whitelisted"
        );
        executor.transferERC721Unsafe(collection, from, to, tokenId);
    }

    /**
     * @dev Verifies that the tokenId is valid using a Merkle proof.
     */
    function _verifyTokenId(
        bytes32 merkleRoot,
        bytes32[] calldata merkleProof,
        uint256 tokenId
    ) internal pure returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(tokenId));
        return MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────────────────────────────────────────

    event Buy(
        address indexed buyer,
        OrderLib.Order sellOrder,
        bytes32 orderHash
    );
    event BuyAndBurn(
        address indexed buyer,
        OrderLib.Order sellOrder,
        bytes32 orderHash
    );
    event BatchBuy(
        address indexed buyer,
        OrderLib.Order[] sellOrders,
        bytes[] sellerSignatures
    );
    event BatchBuyAndBurn(
        address indexed buyer,
        OrderLib.Order[] sellOrders,
        bytes[] sellerSignatures
    );
    event Sell(
        address indexed seller,
        OrderLib.Order buyOrder,
        uint256 tokenId,
        bytes32 orderHash
    );
    event BatchSell(
        address indexed seller,
        OrderLib.Order[] buyOrders,
        uint256[] tokenIds,
        bytes32[][] merkleProofs
    );
    event CancelOrder(bytes32 orderHash);
    event NewWhitelistedCollection(address collection);
    event UnWhitelistedCollection(address collection);
    event NewProtocolFeeBps(uint256 feeBps);
    event NewProtocolFeeRecipient(address recipient);
    event NewExecutor(address executor);
}
