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
