// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Escrow is Ownable, ReentrancyGuard {
    enum State { AWAITING_PAYMENT, AWAITING_DELIVERY, COMPLETE, REFUNDED }

    struct Transaction {
        address buyer;
        address seller;
        uint256 amount;
        State state;
    }

    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;

    event TransactionCreated(uint256 indexed transactionId, address buyer, address seller, uint256 amount);
    event PaymentDeposited(uint256 indexed transactionId);
    event ItemDelivered(uint256 indexed transactionId);
    event PaymentRefunded(uint256 indexed transactionId);

    constructor() Ownable(msg.sender) {}

    function createTransaction(address _seller, uint256 _amount) external returns (uint256) {
        transactionCount++;
        transactions[transactionCount] = Transaction(msg.sender, _seller, _amount, State.AWAITING_PAYMENT);
        emit TransactionCreated(transactionCount, msg.sender, _seller, _amount);
        return transactionCount;
    }

    function depositPayment(uint256 _transactionId) external payable nonReentrant {
        Transaction storage transaction = transactions[_transactionId];
        require(transaction.buyer == msg.sender, "Only buyer can deposit");
        require(transaction.state == State.AWAITING_PAYMENT, "Transaction not awaiting payment");
        require(msg.value == transaction.amount, "Incorrect payment amount");

        transaction.state = State.AWAITING_DELIVERY;
        emit PaymentDeposited(_transactionId);
    }

    function confirmDelivery(uint256 _transactionId) external nonReentrant {
        Transaction storage transaction = transactions[_transactionId];
        require(transaction.seller == msg.sender, "Only seller can confirm delivery");
        require(transaction.state == State.AWAITING_DELIVERY, "Transaction not awaiting delivery");

        transaction.state = State.COMPLETE;
        payable(transaction.seller).transfer(transaction.amount);
        emit ItemDelivered(_transactionId);
    }

    function refundPayment(uint256 _transactionId) external onlyOwner nonReentrant {
        Transaction storage transaction = transactions[_transactionId];
        require(transaction.state == State.AWAITING_DELIVERY, "Transaction not awaiting delivery");

        transaction.state = State.REFUNDED;
        payable(transaction.buyer).transfer(transaction.amount);
        emit PaymentRefunded(_transactionId);
    }
}
