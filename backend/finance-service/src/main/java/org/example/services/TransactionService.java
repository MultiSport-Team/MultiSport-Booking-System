package org.example.services;

import org.example.daos.TransactionDao;
import org.example.entities.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionDao transactionDao;

    public List<Transaction> getAllTransactions() {
        return transactionDao.findAll();
    }

    public Transaction saveTransaction(Transaction transaction) {
        // You can add logic here (e.g., check if amount > 0)
        return transactionDao.save(transaction);
    }
}