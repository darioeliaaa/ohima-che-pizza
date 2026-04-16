package com.example.Food_delivery_management_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Il nome cliente è obbligatorio")
    private String customerName;

    @NotBlank(message = "Il numero di telefono è obbligatorio")
    private String customerPhone;

    @NotNull(message = "La data è obbligatoria")
    @FutureOrPresent(message = "La data non può essere nel passato")
    private LocalDate bookingDate;

    @NotNull(message = "L'orario è obbligatorio")
    private LocalTime bookingTime;

    @Min(value = 1, message = "Deve esserci almeno una persona")
    private Integer numberOfPeople;

    @Column(length = 500)
    private String notes; // Per allergie o richieste particolari (es. seggiolone)

    @Builder.Default
    private String status = "PENDING"; // PENDING, CONFIRMED, CANCELLED

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}