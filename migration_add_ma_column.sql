-- SQL Migration Script
-- Run this on your KingStep database to add the product code fields

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[SanPham]') AND name = 'Ma'
)
BEGIN
    ALTER TABLE [dbo].[SanPham] ADD [Ma] NVARCHAR(100);
END
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[SanPhamChiTiet]') AND name = 'Ma'
)
BEGIN
    ALTER TABLE [dbo].[SanPhamChiTiet] ADD [Ma] NVARCHAR(100);
END
GO



-- 1. Bù đắp Ngày Tạo từ Ngày Mua (cho các đơn hàng cũ bị thiếu)
UPDATE DonHang 
SET NgayTao = NgayMua 
WHERE NgayTao IS NULL AND NgayMua IS NOT NULL;

-- 2. Ngược lại, nếu thiếu Ngày Mua thì lấy Ngày Tạo (để báo cáo doanh thu không bị sót)
UPDATE DonHang 
SET NgayMua = NgayTao 
WHERE NgayMua IS NULL AND NgayTao IS NOT NULL;

-- 3. Đảm bảo tiền giảm giá không bị NULL (tránh lỗi cộng dồn)
UPDATE DonHang 
SET TongTienGiamGia = 0 
WHERE TongTienGiamGia IS NULL;
