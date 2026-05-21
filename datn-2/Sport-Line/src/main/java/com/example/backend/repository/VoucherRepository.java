package com.example.backend.repository;

import com.example.backend.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Integer> {

    /** Kiểm tra mã voucher đã tồn tại chưa (dùng khi tạo mới) */
    boolean existsByMaVoucher(String maVoucher);

    /** Kiểm tra mã voucher đã tồn tại ở voucher khác chưa (dùng khi cập nhật) */
    boolean existsByMaVoucherAndIdNot(String maVoucher, Integer id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM Voucher v WHERE v.id = :id")
    Optional<Voucher> findByIdWithLock(@Param("id") Integer id);

}
