package com.example.Food_delivery_management_backend.config;

import com.example.Food_delivery_management_backend.entity.Restaurant;
import com.example.Food_delivery_management_backend.entity.User;
import com.example.Food_delivery_management_backend.entity.UserRole;
import com.example.Food_delivery_management_backend.repository.RestaurantRepository;
import com.example.Food_delivery_management_backend.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Order(1)
public class DataMigrationRunner implements ApplicationRunner {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    public DataMigrationRunner(RestaurantRepository restaurantRepository, UserRepository userRepository, EntityManager entityManager) {
        this.restaurantRepository = restaurantRepository;
        this.userRepository = userRepository;
        this.entityManager = entityManager;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // Assicura che la colonna promotions_enabled esista
        try {
            entityManager.createNativeQuery(
                "ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS promotions_enabled BOOLEAN NOT NULL DEFAULT false"
            ).executeUpdate();
            System.out.println("[DataMigration] Colonna promotions_enabled verificata");
        } catch (Exception e) {
            System.out.println("[DataMigration] promotions_enabled già presente: " + e.getMessage());
        }

        // Aggiorna il CHECK constraint per includere OWNER
        try {
            entityManager.createNativeQuery("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check").executeUpdate();
            entityManager.createNativeQuery(
                "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role::text = ANY (ARRAY['ADMIN'::text, 'OWNER'::text]))"
            ).executeUpdate();
            System.out.println("[DataMigration] CHECK constraint aggiornato per supportare OWNER");
        } catch (Exception e) {
            System.out.println("[DataMigration] Constraint già aggiornato o non presente: " + e.getMessage());
        }

        // Promuovi i proprietari di ristoranti da ADMIN a OWNER
        List<Restaurant> restaurants = restaurantRepository.findAll();
        for (Restaurant restaurant : restaurants) {
            User user = restaurant.getUser();
            if (user != null && user.getRole() == UserRole.ADMIN) {
                entityManager.createNativeQuery("UPDATE users SET role = 'OWNER' WHERE id = :id")
                        .setParameter("id", user.getId())
                        .executeUpdate();
                System.out.println("[DataMigration] Utente " + user.getEmail() + " promosso a OWNER (proprietario ristorante)");
            }
        }
    }
}
