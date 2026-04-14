package com.example.Food_delivery_management_backend.repository;

import com.example.Food_delivery_management_backend.entity.User;
import com.example.Food_delivery_management_backend.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<User> findByRole(UserRole role);
}
