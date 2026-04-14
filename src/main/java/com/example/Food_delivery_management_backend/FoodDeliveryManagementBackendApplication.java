package com.example.Food_delivery_management_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FoodDeliveryManagementBackendApplication {

	public static void main(String[] args) {

		SpringApplication.run(FoodDeliveryManagementBackendApplication.class, args);

	}

}
