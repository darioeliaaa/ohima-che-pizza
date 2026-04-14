package com.example.Food_delivery_management_backend.repository;

import com.example.Food_delivery_management_backend.entity.User;
import com.example.Food_delivery_management_backend.entity.WebAuthnCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WebAuthnCredentialRepository extends JpaRepository<WebAuthnCredential, Long> {

    List<WebAuthnCredential> findByUser(User user);

    Optional<WebAuthnCredential> findByCredentialId(String credentialId);

    boolean existsByUser(User user);
}
