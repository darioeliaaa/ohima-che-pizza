package com.example.Food_delivery_management_backend.controller;

import com.example.Food_delivery_management_backend.entity.ClosingDay;
import com.example.Food_delivery_management_backend.entity.OpeningHours;
import com.example.Food_delivery_management_backend.service.ScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    // ---- OPENING HOURS ----

    @GetMapping("/hours/{restaurantId}")
    public ResponseEntity<List<OpeningHours>> getOpeningHours(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(scheduleService.getOpeningHours(restaurantId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PostMapping("/hours/{restaurantId}")
    public ResponseEntity<?> setOpeningHours(@PathVariable Long restaurantId,
                                              @RequestBody List<Map<String, Object>> body) {
        try {
            List<ScheduleService.OpeningHoursInput> inputs = body.stream().map(m -> {
                Integer dayOfWeek = ((Number) m.get("dayOfWeek")).intValue();
                Boolean isClosed = Boolean.TRUE.equals(m.get("isClosed"));
                LocalTime openTime = m.get("openTime") != null ? LocalTime.parse((String) m.get("openTime")) : null;
                LocalTime closeTime = m.get("closeTime") != null ? LocalTime.parse((String) m.get("closeTime")) : null;
                return new ScheduleService.OpeningHoursInput(dayOfWeek, openTime, closeTime, isClosed);
            }).toList();

            List<OpeningHours> saved = scheduleService.setOpeningHours(restaurantId, inputs);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // ---- CLOSING DAYS ----

    @GetMapping("/closing-days/{restaurantId}")
    public ResponseEntity<List<ClosingDay>> getClosingDays(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(scheduleService.getClosingDays(restaurantId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PostMapping("/closing-days/{restaurantId}")
    public ResponseEntity<?> addClosingDay(@PathVariable Long restaurantId,
                                            @RequestBody Map<String, String> body) {
        try {
            LocalDate date = LocalDate.parse(body.get("date"));
            String reason = body.getOrDefault("reason", "");
            ClosingDay cd = scheduleService.addClosingDay(restaurantId, date, reason);
            return ResponseEntity.status(HttpStatus.CREATED).body(cd);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @DeleteMapping("/closing-days/{id}")
    public ResponseEntity<?> removeClosingDay(@PathVariable Long id) {
        try {
            scheduleService.removeClosingDay(id);
            return ResponseEntity.ok("Giorno di chiusura rimosso");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // ---- CHECK AVAILABILITY ----

    @GetMapping("/check/{restaurantId}")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @PathVariable Long restaurantId,
            @RequestParam String date,
            @RequestParam String time) {
        boolean open = scheduleService.isOpenAt(restaurantId, LocalDate.parse(date), LocalTime.parse(time));
        return ResponseEntity.ok(Map.of("open", open, "date", date, "time", time));
    }
}
