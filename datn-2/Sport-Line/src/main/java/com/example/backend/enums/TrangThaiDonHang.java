package com.example.backend.enums;
public enum TrangThaiDonHang {

    CHO_XAC_NHAN(0, "Chờ xác nhận"),
    XAC_NHAN(1, "Xác nhận"),
    DANG_CHUAN_BI(2, "Đang chuẩn bị"),
    DANG_GIAO(3, "Đang giao"),
    DA_GIAO(4, "Đã giao"),
    DA_HUY(5, "Đã hủy"),
    TRA_HANG_HOAN_TIEN(6, "Trả hàng / Hoàn tiền"),
    GIAO_HANG_THAT_BAI(7, "Giao hàng thất bại");

    private final int value;
    private final String displayName;

    TrangThaiDonHang(int value, String displayName) {
        this.value = value;
        this.displayName = displayName;
    }

    public int getValue() {
        return value;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static TrangThaiDonHang fromValue(int value) {
        for (TrangThaiDonHang t : values()) {
            if (t.getValue() == value) return t;
        }
        throw new IllegalArgumentException("Trạng thái không hợp lệ: " + value);
    }
}

