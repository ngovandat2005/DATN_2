-- --------------------------------------------------------
-- SCRIPT TẠO DATABASE KINGSTEP_NEW HOÀN CHỈNH (ĐÃ TÍCH HỢP MÃ SẢN PHẨM)
-- --------------------------------------------------------

USE [master];
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'KingStepp3')
BEGIN
    CREATE DATABASE [KingStepp3];
END
GO

USE [KingStepp3];
GO

-- 1. BẢNG DANH MỤC CƠ BẢN
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ThuongHieu]') AND type in (N'U'))
CREATE TABLE [dbo].[ThuongHieu] ([Id] INT IDENTITY(1,1) PRIMARY KEY, [TenThuongHieu] NVARCHAR(255), [TrangThai] INT);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[XuatXu]') AND type in (N'U'))
CREATE TABLE [dbo].[XuatXu] ([Id] INT IDENTITY(1,1) PRIMARY KEY, [TenXuatXu] NVARCHAR(255), [TrangThai] INT);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ChatLieu]') AND type in (N'U'))
CREATE TABLE [dbo].[ChatLieu] ([Id] INT IDENTITY(1,1) PRIMARY KEY, [TenChatLieu] NVARCHAR(255), [TrangThai] INT);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DanhMuc]') AND type in (N'U'))
CREATE TABLE [dbo].[DanhMuc] ([Id] INT IDENTITY(1,1) PRIMARY KEY, [TenDanhMuc] NVARCHAR(255), [TrangThai] INT);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MauSac]') AND type in (N'U'))
CREATE TABLE [dbo].[MauSac] ([Id] INT IDENTITY(1,1) PRIMARY KEY, [TenMauSac] NVARCHAR(255), [TrangThai] INT);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[KichThuoc]') AND type in (N'U'))
CREATE TABLE [dbo].[KichThuoc] ([Id] INT IDENTITY(1,1) PRIMARY KEY, [TenKichThuoc] NVARCHAR(255), [TrangThai] INT);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[KhuyenMai]') AND type in (N'U'))
CREATE TABLE [dbo].[KhuyenMai] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY, [TenKhuyenMai] NVARCHAR(255) UNIQUE, [GiaTri] FLOAT, [NgayBatDau] DATETIME, [NgayKetThuc] DATETIME, [TrangThai] INT
);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Voucher]') AND type in (N'U'))
CREATE TABLE [dbo].[Voucher] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY, [MaVoucher] NVARCHAR(255), [TenVoucher] NVARCHAR(255), [LoaiVoucher] NVARCHAR(255),
    [MoTa] NVARCHAR(MAX), [SoLuong] INT, [DonToiThieu] FLOAT, [GiaTri] FLOAT, [NgayBatDau] DATETIME, [NgayKetThuc] DATETIME, [TrangThai] INT
);
GO

-- 2. BẢNG NGƯỜI DÙNG
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NhanVien]') AND type in (N'U'))
CREATE TABLE [dbo].[NhanVien] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY, [TenNhanVien] NVARCHAR(255) NOT NULL, [Email] NVARCHAR(255) UNIQUE NOT NULL, [SoDienThoai] NVARCHAR(255) UNIQUE NOT NULL,
    [NgaySinh] DATE NOT NULL, [GioiTinh] BIT NOT NULL, [DiaChi] NVARCHAR(MAX) NOT NULL, [VaiTro] BIT, [MatKhau] NVARCHAR(255), [CCCD] NVARCHAR(255) UNIQUE, [TrangThai] BIT NOT NULL
);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[KhachHang]') AND type in (N'U'))
CREATE TABLE [dbo].[KhachHang] (
    [id] INT IDENTITY(1,1) PRIMARY KEY, [TenKhachHang] NVARCHAR(255), [Email] NVARCHAR(255), [NgaySinh] DATE, [GioiTinh] BIT, [DiaChi] NVARCHAR(MAX),
    [SoDienThoai] NVARCHAR(255), [matKhau] NVARCHAR(255), [TrangThai] BIT, [MaThongBao] NVARCHAR(255), [ThoiGianThongBao] DATE
);
GO

-- 3. BẢNG SẢN PHẨM (CÓ CỘT MA)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SanPham]') AND type in (N'U'))
CREATE TABLE [dbo].[SanPham] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY, 
    [Ma] NVARCHAR(100), -- ✅ ĐÃ THÊM MÃ SẢN PHẨM
    [TenSanPham] NVARCHAR(255), 
    [NgayTao] DATE, 
    [IdThuongHieu] INT, 
    [IdXuatXu] INT, 
    [IdChatLieu] INT, 
    [IdDanhMuc] INT, 
    [Images] NVARCHAR(MAX), 
    [TrangThai] INT,
    FOREIGN KEY ([IdThuongHieu]) REFERENCES [dbo].[ThuongHieu]([Id]), 
    FOREIGN KEY ([IdXuatXu]) REFERENCES [dbo].[XuatXu]([Id]), 
    FOREIGN KEY ([IdChatLieu]) REFERENCES [dbo].[ChatLieu]([Id]), 
    FOREIGN KEY ([IdDanhMuc]) REFERENCES [dbo].[DanhMuc]([Id])
);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SanPhamChiTiet]') AND type in (N'U'))
CREATE TABLE [dbo].[SanPhamChiTiet] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY, 
    [Ma] NVARCHAR(100), -- ✅ ĐÃ THÊM SKU (MÃ BIẾN THỂ)
    [SoLuong] INT, 
    [NgaySanXuat] DATE, 
    [IdSanPham] INT, 
    [IdKichThuoc] INT, 
    [IdMauSac] INT, 
    [IdKhuyenMai] INT, 
    [NgayTao] DATETIME, 
    [TrangThai] INT, 
    [GiaBan] FLOAT, 
    [GiaBanGiamGia] FLOAT,
    FOREIGN KEY ([IdSanPham]) REFERENCES [dbo].[SanPham]([Id]), 
    FOREIGN KEY ([IdKichThuoc]) REFERENCES [dbo].[KichThuoc]([Id]), 
    FOREIGN KEY ([IdMauSac]) REFERENCES [dbo].[MauSac]([Id]), 
    FOREIGN KEY ([IdKhuyenMai]) REFERENCES [dbo].[KhuyenMai]([Id])
);
GO

-- 4. BẢNG ĐƠN HÀNG
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DonHang]') AND type in (N'U'))
CREATE TABLE [dbo].[DonHang] (
    [id] INT IDENTITY(1,1) PRIMARY KEY, [idNhanVien] INT, [idKhachHang] INT, [idGiamGia] INT, [NgayMua] DATE, [NgayTao] DATE, [LoaiDonHang] NVARCHAR(255), [TrangThai] INT, [TongTien] FLOAT, [TongTienGiamGia] FLOAT,
    [DiaChiGiaoHang] NVARCHAR(MAX), [SoDienThoaiGiaoHang] NVARCHAR(255), [EmailGiaoHang] NVARCHAR(255), [TenNguoiNhan] NVARCHAR(255), [PhiVanChuyen] INT,
    FOREIGN KEY ([idNhanVien]) REFERENCES [dbo].[NhanVien]([Id]), FOREIGN KEY ([idKhachHang]) REFERENCES [dbo].[KhachHang]([id]), FOREIGN KEY ([idGiamGia]) REFERENCES [dbo].[Voucher]([Id])
);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[donHangChiTiet]') AND type in (N'U'))
CREATE TABLE [dbo].[donHangChiTiet] (
    [id] INT IDENTITY(1,1) PRIMARY KEY, [idDonHang] INT, [idSanPhamChiTiet] INT, [soLuong] INT, [gia] FLOAT, [thanhTien] FLOAT,
    FOREIGN KEY ([idDonHang]) REFERENCES [dbo].[DonHang]([id]), FOREIGN KEY ([idSanPhamChiTiet]) REFERENCES [dbo].[SanPhamChiTiet]([Id])
);
GO

-- 5. BẢNG PHỤ (ĐÁNH GIÁ, TRẢ HÀNG)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DanhGia]') AND type in (N'U'))
CREATE TABLE [dbo].[DanhGia] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY, [IdKhachHang] INT, [IdSanPham] INT, [SoSao] INT, [BinhLuan] NVARCHAR(MAX), [NgayDanhGia] DATETIME, [TrangThai] INT,
    FOREIGN KEY ([IdKhachHang]) REFERENCES [dbo].[KhachHang]([id]), FOREIGN KEY ([IdSanPham]) REFERENCES [dbo].[SanPham]([Id])
);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TraHang]') AND type in (N'U'))
CREATE TABLE [dbo].[TraHang] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY, [IdDonHang] INT, [IdKhachHang] INT, [NgayYeuCau] DATETIME, [LyDo] NVARCHAR(MAX), [TrangThai] INT, [TongTienHoan] FLOAT,
    FOREIGN KEY ([IdDonHang]) REFERENCES [dbo].[DonHang]([id]), FOREIGN KEY ([IdKhachHang]) REFERENCES [dbo].[KhachHang]([id])
);
GO

-- ==========================================
-- SEED DATA - DỮ LIỆU MẪU
-- ==========================================
INSERT INTO [dbo].[ThuongHieu] ([TenThuongHieu], [TrangThai]) VALUES (N'Nike', 1), (N'Adidas', 1);
INSERT INTO [dbo].[XuatXu] ([TenXuatXu], [TrangThai]) VALUES (N'Việt Nam', 1), (N'Mỹ', 1);
INSERT INTO [dbo].[ChatLieu] ([TenChatLieu], [TrangThai]) VALUES (N'Da thật', 1), (N'Vải Mesh', 1);
INSERT INTO [dbo].[DanhMuc] ([TenDanhMuc], [TrangThai]) VALUES (N'Giày chạy bộ', 1), (N'Giày tập gym', 1);
INSERT INTO [dbo].[MauSac] ([TenMauSac], [TrangThai]) VALUES (N'Trắng', 1), (N'Đen', 1);
INSERT INTO [dbo].[KichThuoc] ([TenKichThuoc], [TrangThai]) VALUES (N'40', 1), (N'41', 1);

-- Chèn Sản Phẩm với Mã
INSERT INTO [dbo].[SanPham] ([Ma], [TenSanPham], [NgayTao], [IdThuongHieu], [IdXuatXu], [IdChatLieu], [IdDanhMuc], [Images], [TrangThai]) 
VALUES (N'SP001', N'Giày Nike Pegasus', GETDATE(), 1, 1, 1, 1, 'nike.jpg', 1);

INSERT INTO [dbo].[SanPhamChiTiet] ([Ma], [SoLuong], [NgaySanXuat], [IdSanPham], [IdKichThuoc], [IdMauSac], [NgayTao], [TrangThai], [GiaBan], [GiaBanGiamGia])
VALUES (N'SKU001', 100, GETDATE(), 1, 1, 1, GETDATE(), 1, 1500000, 1500000);

PRINT 'DATABASE ĐÃ TẠO VÀ CẬP NHẬT MÃ SẢN PHẨM THÀNH CÔNG!'
