package com.example.backend.repository;

import com.example.backend.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Integer> {

    /** Kiểm tra mã voucher đã tồn tại chưa (dùng khi tạo mới) */
    boolean existsByMaVoucher(String maVoucher);

    /** Kiểm tra mã voucher đã tồn tại ở voucher khác chưa (dùng khi cập nhật) */
    boolean existsByMaVoucherAndIdNot(String maVoucher, Integer id);


}
