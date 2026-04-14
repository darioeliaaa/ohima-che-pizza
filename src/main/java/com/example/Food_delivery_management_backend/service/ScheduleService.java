package com.example.Food_delivery_management_backend.service;

import com.example.Food_delivery_management_backend.entity.ClosingDay;
import com.example.Food_delivery_management_backend.entity.OpeningHours;
import com.example.Food_delivery_management_backend.entity.Restaurant;
import com.example.Food_delivery_management_backend.repository.ClosingDayRepository;
import com.example.Food_delivery_management_backend.repository.OpeningHoursRepository;
import com.example.Food_delivery_management_backend.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class ScheduleService {

    private final OpeningHoursRepository openingHoursRepository;
    private final ClosingDayRepository closingDayRepository;
    private final RestaurantRepository restaurantRepository;

    public ScheduleService(OpeningHoursRepository openingHoursRepository,
                           ClosingDayRepository closingDayRepository,
                           RestaurantRepository restaurantRepository) {
        this.openingHoursRepository = openingHoursRepository;
        this.closingDayRepository = closingDayRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Transactional(readOnly = true)
    public List<OpeningHours> getOpeningHours(Long restaurantId) {
        return openingHoursRepository.findByRestaurantIdOrderByDayOfWeekAscOpenTimeAsc(restaurantId);
    }

    @Transactional
    public List<OpeningHours> setOpeningHours(Long restaurantId, List<OpeningHoursInput> inputs) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Ristorante non trovato"));

        openingHoursRepository.deleteByRestaurantId(restaurantId);

        List<OpeningHours> hours = inputs.stream().map(input -> {
            OpeningHours oh = new OpeningHours();
            oh.setRestaurant(restaurant);
            oh.setDayOfWeek(input.dayOfWeek());
            oh.setOpenTime(input.openTime());
            oh.setCloseTime(input.closeTime());
            oh.setIsClosed(input.isClosed());
            return oh;
        }).toList();

        return openingHoursRepository.saveAll(hours);
    }

    @Transactional(readOnly = true)
    public List<ClosingDay> getClosingDays(Long restaurantId) {
        return closingDayRepository.findByRestaurantIdAndDateGreaterThanEqual(restaurantId, LocalDate.now());
    }

    @Transactional
    public ClosingDay addClosingDay(Long restaurantId, LocalDate date, String reason) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Ristorante non trovato"));

        if (closingDayRepository.existsByRestaurantIdAndDate(restaurantId, date)) {
            throw new RuntimeException("Giorno di chiusura già inserito per questa data");
        }

        ClosingDay cd = new ClosingDay();
        cd.setRestaurant(restaurant);
        cd.setDate(date);
        cd.setReason(reason);
        return closingDayRepository.save(cd);
    }

    @Transactional
    public void removeClosingDay(Long closingDayId) {
        if (!closingDayRepository.existsById(closingDayId)) {
            throw new RuntimeException("Giorno di chiusura non trovato");
        }
        closingDayRepository.deleteById(closingDayId);
    }

    /**
     * Verifica se il ristorante è aperto in una data e ora specifiche.
     */
    @Transactional(readOnly = true)
    public boolean isOpenAt(Long restaurantId, LocalDate date, LocalTime time) {
        // Controlla giorni di chiusura speciali
        if (closingDayRepository.existsByRestaurantIdAndDate(restaurantId, date)) {
            return false;
        }

        // DayOfWeek: MONDAY=1 ... SUNDAY=7
        int dayOfWeek = date.getDayOfWeek().getValue();

        List<OpeningHours> hours = openingHoursRepository
                .findByRestaurantIdOrderByDayOfWeekAscOpenTimeAsc(restaurantId);

        List<OpeningHours> dayHours = hours.stream()
                .filter(h -> h.getDayOfWeek() == dayOfWeek)
                .toList();

        // Se non ci sono orari configurati per questo giorno, considero aperto (fallback)
        if (dayHours.isEmpty()) {
            return true;
        }

        // Se il giorno è marcato come chiuso
        if (dayHours.stream().anyMatch(h -> Boolean.TRUE.equals(h.getIsClosed()))) {
            return false;
        }

        // Controlla se l'orario rientra in almeno una fascia
        return dayHours.stream().anyMatch(h ->
                h.getOpenTime() != null && h.getCloseTime() != null &&
                !time.isBefore(h.getOpenTime()) && !time.isAfter(h.getCloseTime())
        );
    }

    public record OpeningHoursInput(Integer dayOfWeek, LocalTime openTime, LocalTime closeTime, Boolean isClosed) {}
}
