package com.revolt.showroom.repository;

import com.revolt.showroom.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface SaleRepository extends JpaRepository<Sale, UUID>, JpaSpecificationExecutor<Sale> {

    @Query("select coalesce(sum(s.salePrice), 0) from Sale s where s.saleDate >= :since")
    BigDecimal totalRevenueSince(@Param("since") Instant since);

    @Query("select coalesce(sum(s.salePrice), 0) from Sale s")
    BigDecimal totalRevenue();

    @Query("select s.soldBy.id as adminId, count(s) as cnt, coalesce(sum(s.salePrice), 0) as revenue " +
           "from Sale s where s.soldBy is not null group by s.soldBy.id")
    List<Object[]> revenueByStaff();
}
