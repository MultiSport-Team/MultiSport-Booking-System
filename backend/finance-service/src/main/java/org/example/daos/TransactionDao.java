package org.example.daos;

import org.example.entities.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Extending JpaRepository gives you save(), findAll(), findById(), etc. automatically
@Repository
public interface TransactionDao extends JpaRepository<Transaction, Long> {
}