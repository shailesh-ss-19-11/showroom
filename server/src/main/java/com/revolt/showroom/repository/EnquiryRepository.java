package com.revolt.showroom.repository;

import com.revolt.showroom.entity.Enquiry;
import com.revolt.showroom.entity.EnquiryStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface EnquiryRepository extends JpaRepository<Enquiry, UUID>, JpaSpecificationExecutor<Enquiry> {
    long countByStatus(EnquiryStatus status);

    @Query(
        value = "select date_trunc('day', created_at)::date as day, count(*) as cnt " +
                "from enquiry where created_at >= :since group by day order by day asc",
        nativeQuery = true
    )
    List<Object[]> countByDaySince(@Param("since") Instant since);

    @Query(
        "select e.bike.id as bikeId, count(e) as cnt from Enquiry e " +
        "where e.bike is not null group by e.bike.id order by count(e) desc"
    )
    List<Object[]> topBikeCounts(Pageable pageable);

    @Query(
        "select e.assignedTo.id as adminId, count(e) as total, " +
        "sum(case when e.status = com.revolt.showroom.entity.EnquiryStatus.CONVERTED then 1 else 0 end) as converted " +
        "from Enquiry e where e.assignedTo is not null group by e.assignedTo.id"
    )
    List<Object[]> assignmentStatsByStaff();

    long countByAssignedToId(UUID adminId);
}
