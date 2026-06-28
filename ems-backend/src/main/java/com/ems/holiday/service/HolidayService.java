package com.ems.holiday.service;

import com.ems.common.exception.ConflictException;
import com.ems.common.exception.ResourceNotFoundException;
import com.ems.holiday.dto.HolidayRequest;
import com.ems.holiday.dto.HolidayResponse;
import com.ems.holiday.entity.Holiday;
import com.ems.holiday.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HolidayService {

    private final HolidayRepository holidayRepository;

    @Transactional
    public HolidayResponse createHoliday(HolidayRequest request) {
        if (holidayRepository.existsByHolidayDate(request.getHolidayDate())) {
            throw new ConflictException("A holiday already exists on " + request.getHolidayDate());
        }
        Holiday holiday = Holiday.builder()
                .name(request.getName())
                .holidayDate(request.getHolidayDate())
                .description(request.getDescription())
                .build();
        holiday = holidayRepository.save(holiday);
        return toResponse(holiday);
    }

    @Transactional
    public HolidayResponse updateHoliday(Long id, HolidayRequest request) {
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Holiday", "id", id));

        if (!holiday.getHolidayDate().equals(request.getHolidayDate())
                && holidayRepository.existsByHolidayDate(request.getHolidayDate())) {
            throw new ConflictException("A holiday already exists on " + request.getHolidayDate());
        }

        holiday.setName(request.getName());
        holiday.setHolidayDate(request.getHolidayDate());
        holiday.setDescription(request.getDescription());
        holiday = holidayRepository.save(holiday);
        return toResponse(holiday);
    }

    @Transactional
    public void deleteHoliday(Long id) {
        if (!holidayRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Holiday", "id", id);
        }
        holidayRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<HolidayResponse> getAllHolidays() {
        return holidayRepository.findAllByOrderByHolidayDateAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HolidayResponse> getHolidaysInRange(LocalDate start, LocalDate end) {
        return holidayRepository.findByHolidayDateBetweenOrderByHolidayDateAsc(start, end).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean isHoliday(LocalDate date) {
        return holidayRepository.existsByHolidayDate(date);
    }

    private HolidayResponse toResponse(Holiday h) {
        return HolidayResponse.builder()
                .id(h.getId())
                .name(h.getName())
                .holidayDate(h.getHolidayDate())
                .description(h.getDescription())
                .build();
    }
}
