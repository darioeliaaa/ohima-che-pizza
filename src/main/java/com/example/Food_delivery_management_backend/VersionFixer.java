package com.example.Food_delivery_management_backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class VersionFixer implements CommandLineRunner {

    private final JdbcTemplate jdbc;

    public VersionFixer(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) {
        String[] tables = {
            "opening_hours", "closing_days", "menu_categories", "menu_items",
            "bills", "bill_items", "users", "restaurants", "restaurant_tables",
            "promotions", "reservations"
        };
        for (String table : tables) {
            try {
                int updated = jdbc.update("UPDATE " + table + " SET version = 0 WHERE version IS NULL");
                if (updated > 0) {
                    System.out.println("[VersionFixer] " + table + ": " + updated + " righe aggiornate (version NULL → 0)");
                }
            } catch (Exception ignored) {
                // Tabella potrebbe non esistere ancora
            }
        }
    }
}
