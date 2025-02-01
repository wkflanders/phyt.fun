// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../lib/OrderLib.sol";

interface IExchange {
    /* Events */
    event Buy(
        address indexed buyer,
        OrderLib.Order sell,
        bytes32 sellOrderHash
    );
    event BuyAndBurn(
        address indexed buyer,
        OrderLib.Order sell,
        bytes32 sellOrderHash
    );
    event Sell(
        address indexed seller,
        OrderLib.Order buyOrder,
        uint256 tokenId,
        bytes32 buyOrderHash
    );
    event CancelOrder(bytes32 orderHash);
    event NewWhitelistedCollection(address collection);
    event UnWhitelistedCollection(address collection);
    event NewProtocolFeeRecipient(address protocolFeeRecipient);
    event NewProtocolFeeBps(uint256 protocolFeeBps);
    event NewExecutor(address executionDelegate);

    /* Functions */
    function buy(
        OrderLib.Order calldata sellOrder,
        bytes calldata sellerSignature,
        bool burnAfterPurchase
    ) external payable;

    function sell(
        OrderLib.Order calldata buyOrder,
        bytes calldata buyerSignature,
        uint256 tokenId,
        bytes32[] calldata merkleProof
    ) external;

    function cancelOrder(OrderLib.Order calldata order) external;

    function whiteListCollection(address _collection) external;

    function unWhiteListCollection(address _collection) external;

    function setProtocolFeeBps(uint256 _protocolFeeBps) external;

    function setProtocolFeeRecipient(address _protocolFeeRecipient) external;

    function setExecutor(address _executionDelegate) external;
}
