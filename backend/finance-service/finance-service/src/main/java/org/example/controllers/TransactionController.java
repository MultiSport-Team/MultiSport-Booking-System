package org.example.controllers;

import org.example.dtos.Result;
import org.example.entities.Transaction;
import org.example.services.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/finance")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping("/")
    public Result getAll() {
        try {
            return new Result(null, transactionService.getAllTransactions());
        } catch (Exception e) {
            return new Result(e.getMessage(), null);
        }
    }

    @PostMapping("/")
    public Result create(@RequestBody Transaction transaction) {
        try {
            Transaction saved = transactionService.saveTransaction(transaction);
            return new Result(null, saved);
        } catch (Exception e) {
            return new Result(e.getMessage(), null);
        }
    }
}