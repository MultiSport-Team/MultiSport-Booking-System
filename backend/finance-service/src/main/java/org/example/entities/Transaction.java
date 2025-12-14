package org.example.entities;

import jakarta.persistence.*;
import lombok.Data; // Lombok automatically generates Getters/Setters
import java.time.LocalDateTime;

@Data // This annotation creates getters, setters, and toString automatically
@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;
    private String type;
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}