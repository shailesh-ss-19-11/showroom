package com.revolt.showroom.repository;

import com.revolt.showroom.entity.Booking;
import com.revolt.showroom.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID>, JpaSpecificationExecutor<Booking> {
    long countByStatus(BookingStatus status);

    @org.springframework.data.jpa.repository.Query(
        "select b.assignedTo.id as adminId, count(b) as total, " +
        "sum(case when b.status = com.revolt.showroom.entity.BookingStatus.COMPLETED then 1 else 0 end) as completed " +
        "from Booking b where b.assignedTo is not null group by b.assignedTo.id"
    )
    java.util.List<Object[]> assignmentStatsByStaff();

    long countByAssignedToId(UUID adminId);

    long countBySlotIdAndStatusNot(UUID slotId, BookingStatus excludedStatus);

    @org.springframework.data.jpa.repository.Query(
        "select b.slot.id as slotId, count(b) as cnt from Booking b " +
        "where b.slot is not null and b.status <> com.revolt.showroom.entity.BookingStatus.CANCELLED " +
        "group by b.slot.id"
    )
    java.util.List<Object[]> activeCountsBySlot();
}
