package com.example.backend.enums;

public enum TrangThaiDonHang {

    CHO_XAC_NHAN(0),    // Mới đặt hàng
    XAC_NHAN(1),        // Admin đã duyệt
    DANG_CHUAN_BI(2),   // Đang đóng gói
    DANG_GIAO(3),       // Đã giao cho đơn vị vận chuyển
    DA_GIAO(4),         // Khách đã nhận hàng (Thành công - Được đánh giá)
    DA_HUY(5),          // Đơn bị hủy
    TRA_HANG_HOAN_TIEN(6); // Khách trả hàng

    private final int value;

    TrangThaiDonHang(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static TrangThaiDonHang fromValue(int value) {
        for (TrangThaiDonHang t : values()) {
            if (t.getValue() == value) return t;
        }
        throw new IllegalArgumentException("Trạng thái không hợp lệ: " + value);
    }

    // ✅ KIỂM TRA LUỒNG CHUYỂN TRẠNG THÁI (STATE TRANSITION)
    public boolean canTransitionTo(TrangThaiDonHang nextState) {
        return switch (this) {
            case CHO_XAC_NHAN -> nextState == XAC_NHAN || nextState == DA_HUY;
            case XAC_NHAN -> nextState == DANG_CHUAN_BI || nextState == DA_HUY;
            case DANG_CHUAN_BI -> nextState == DANG_GIAO || nextState == DA_HUY;
            case DANG_GIAO -> nextState == DA_GIAO || nextState == DA_HUY;
            case DA_GIAO -> nextState == TRA_HANG_HOAN_TIEN;
            case DA_HUY, TRA_HANG_HOAN_TIEN -> false; // Trạng thái cuối, không thể đi tiếp
        };
    }

    public String getDisplayName() {
        return switch (this) {
            case CHO_XAC_NHAN -> "Chờ xác nhận";
            case XAC_NHAN -> "Xác nhận";
            case DANG_CHUAN_BI -> "Đang chuẩn bị";
            case DANG_GIAO -> "Đang giao";
            case DA_GIAO -> "Đã giao";
            case DA_HUY -> "Đã hủy";
            case TRA_HANG_HOAN_TIEN -> "Trả hàng / Hoàn tiền";
        };
    }
}