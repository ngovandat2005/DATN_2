-- SQL Migration Script
-- Chuyển đổi kiểu dữ liệu của cột NgayTao trong bảng DonHang từ date thành datetime2
-- Điều này giúp ghi lại chính xác THỜI GIAN (giờ, phút) khách đặt hàng để Scheduler có thể đếm ngược 15 phút tự động hủy đơn hàng quá hạn.

IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[DonHang]') AND name = 'NgayTao'
)
BEGIN
    -- Thay đổi kiểu dữ liệu thành datetime2
    ALTER TABLE [dbo].[DonHang] ALTER COLUMN [NgayTao] DATETIME2 NULL;
    PRINT 'DA CAP NHAT THANH CONG COT NgayTao CUA BANG DonHang SANG DATETIME2!';
END
ELSE
BEGIN
    PRINT 'KHONG TIM THAY COT NgayTao TRONG BANG DonHang!';
END
GO
