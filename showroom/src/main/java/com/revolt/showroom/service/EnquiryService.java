package com.revolt.showroom.service;

import com.revolt.showroom.dto.EnquiryCreateRequest;
import com.revolt.showroom.dto.EnquiryResponse;
import com.revolt.showroom.entity.Admin;
import com.revolt.showroom.entity.Bike;
import com.revolt.showroom.entity.Enquiry;
import com.revolt.showroom.entity.EnquiryStatus;
import com.revolt.showroom.exception.ApiException;
import com.revolt.showroom.repository.AdminRepository;
import com.revolt.showroom.repository.BikeRepository;
import com.revolt.showroom.repository.EnquiryRepository;
import com.revolt.showroom.spec.EnquirySpecifications;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class EnquiryService {

    private final EnquiryRepository enquiryRepository;
    private final BikeRepository bikeRepository;
    private final AdminRepository adminRepository;

    public EnquiryService(EnquiryRepository enquiryRepository, BikeRepository bikeRepository, AdminRepository adminRepository) {
        this.enquiryRepository = enquiryRepository;
        this.bikeRepository = bikeRepository;
        this.adminRepository = adminRepository;
    }

    @Transactional
    public EnquiryResponse create(EnquiryCreateRequest request) {
        if (isBlank(request.name()) || isBlank(request.phone())) {
            throw ApiException.badRequest("name and phone are required");
        }

        Enquiry enquiry = new Enquiry();
        enquiry.setName(request.name());
        enquiry.setPhone(request.phone());
        enquiry.setEmail(request.email());
        enquiry.setMessage(request.message());
        enquiry.setSource(request.source() != null ? request.source() : "contact");
        if (request.bikeId() != null) {
            bikeRepository.findById(request.bikeId()).ifPresent(enquiry::setBike);
        }

        return EnquiryResponse.from(enquiryRepository.save(enquiry));
    }

    @Transactional(readOnly = true)
    public List<EnquiryResponse> list(UUID bikeId, String status, UUID assignedTo) {
        EnquiryStatus parsedStatus = parseStatus(status);
        return enquiryRepository
            .findAll(EnquirySpecifications.filter(bikeId, parsedStatus, assignedTo), Sort.by(Sort.Direction.DESC, "createdAt"))
            .stream()
            .map(EnquiryResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public String exportCsv(UUID bikeId, String status) {
        List<Enquiry> enquiries = enquiryRepository.findAll(
            EnquirySpecifications.filter(bikeId, parseStatus(status), null),
            Sort.by(Sort.Direction.DESC, "createdAt")
        );

        StringBuilder csv = new StringBuilder();
        csv.append("Name,Phone,Email,Bike,Message,Source,Status,Date\n");
        for (Enquiry e : enquiries) {
            Bike bike = e.getBike();
            String bikeLabel = bike != null ? bike.getBrand() + " " + bike.getName() : "";
            csv.append(csvField(e.getName())).append(',')
                .append(csvField(e.getPhone())).append(',')
                .append(csvField(e.getEmail())).append(',')
                .append(csvField(bikeLabel)).append(',')
                .append(csvField(e.getMessage())).append(',')
                .append(csvField(e.getSource())).append(',')
                .append(csvField(e.getStatus().name())).append(',')
                .append(csvField(DateTimeFormatter.ISO_INSTANT.format(e.getCreatedAt())))
                .append('\n');
        }
        return csv.toString();
    }

    @Transactional
    public EnquiryResponse updateStatus(UUID id, String status) {
        EnquiryStatus parsed = parseStatusStrict(status);
        Enquiry enquiry = enquiryRepository.findById(id).orElseThrow(() -> ApiException.notFound("Enquiry not found"));
        enquiry.setStatus(parsed);
        return EnquiryResponse.from(enquiryRepository.save(enquiry));
    }

    @Transactional
    public void delete(UUID id) {
        if (!enquiryRepository.existsById(id)) {
            throw ApiException.notFound("Enquiry not found");
        }
        enquiryRepository.deleteById(id);
    }

    @Transactional
    public EnquiryResponse assign(UUID id, UUID adminId) {
        Enquiry enquiry = enquiryRepository.findById(id).orElseThrow(() -> ApiException.notFound("Enquiry not found"));
        if (adminId == null) {
            enquiry.setAssignedTo(null);
        } else {
            Admin admin = adminRepository.findById(adminId).orElseThrow(() -> ApiException.notFound("Admin not found"));
            enquiry.setAssignedTo(admin);
        }
        return EnquiryResponse.from(enquiryRepository.save(enquiry));
    }

    private static EnquiryStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return null;
        try {
            return EnquiryStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private static EnquiryStatus parseStatusStrict(String status) {
        try {
            return EnquiryStatus.valueOf(status);
        } catch (Exception e) {
            throw ApiException.badRequest("status must be one of NEW, CONTACTED, CONVERTED, CLOSED");
        }
    }

    private static String csvField(String value) {
        String str = value == null ? "" : value;
        if (str.matches(".*[\",\\n].*")) {
            return "\"" + str.replace("\"", "\"\"") + "\"";
        }
        return str;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
