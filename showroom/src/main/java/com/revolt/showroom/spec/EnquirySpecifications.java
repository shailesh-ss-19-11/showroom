package com.revolt.showroom.spec;

import com.revolt.showroom.entity.Enquiry;
import com.revolt.showroom.entity.EnquiryStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class EnquirySpecifications {

    private EnquirySpecifications() {
    }

    public static Specification<Enquiry> filter(UUID bikeId, EnquiryStatus status, UUID assignedTo) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (bikeId != null) {
                predicates.add(cb.equal(root.get("bike").get("id"), bikeId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (assignedTo != null) {
                predicates.add(cb.equal(root.get("assignedTo").get("id"), assignedTo));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
