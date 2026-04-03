-- --------------------------------------------------------
-- SCRIPT TẠO DATABASE KINGSTEPP3 HOÀN CHỈNH (KÈM DATA MẪU)
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

-- ==========================================
-- BẢNG DANH MỤC CƠ BẢN (KHÔNG CÓ KHÓA NGOẠI)
-- ==========================================

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

-- ==========================================
-- BẢNG CÓ KHÓA NGOẠI
-- ==========================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SanPham]') AND type in (N'U'))
CREATE TABLE [dbo].[SanPham] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY, [TenSanPham] NVARCHAR(255), [NgayTao] DATE, [IdThuongHieu] INT, [IdXuatXu] INT, [IdChatLieu] INT, [IdDanhMuc] INT, [Images] NVARCHAR(MAX), [TrangThai] INT,
    FOREIGN KEY ([IdThuongHieu]) REFERENCES [dbo].[ThuongHieu]([Id]), FOREIGN KEY ([IdXuatXu]) REFERENCES [dbo].[XuatXu]([Id]), FOREIGN KEY ([IdChatLieu]) REFERENCES [dbo].[ChatLieu]([Id]), FOREIGN KEY ([IdDanhMuc]) REFERENCES [dbo].[DanhMuc]([Id])
);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SanPhamChiTiet]') AND type in (N'U'))
CREATE TABLE [dbo].[SanPhamChiTiet] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY, [SoLuong] INT, [NgaySanXuat] DATE, [IdSanPham] INT, [IdKichThuoc] INT, [IdMauSac] INT, [IdKhuyenMai] INT, [NgayTao] DATETIME, [TrangThai] INT, [GiaBan] FLOAT, [GiaBanGiamGia] FLOAT,
    FOREIGN KEY ([IdSanPham]) REFERENCES [dbo].[SanPham]([Id]), FOREIGN KEY ([IdKichThuoc]) REFERENCES [dbo].[KichThuoc]([Id]), FOREIGN KEY ([IdMauSac]) REFERENCES [dbo].[MauSac]([Id]), FOREIGN KEY ([IdKhuyenMai]) REFERENCES [dbo].[KhuyenMai]([Id])
);
GO

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

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GioHangChiTiet]') AND type in (N'U'))
CREATE TABLE [dbo].[GioHangChiTiet] (
    [id] INT IDENTITY(1,1) PRIMARY KEY, [idSanPhamChiTiet] INT, [idKhachHang] INT, [soLuong] INT, [gia] FLOAT,
    FOREIGN KEY ([idSanPhamChiTiet]) REFERENCES [dbo].[SanPhamChiTiet]([Id]), FOREIGN KEY ([idKhachHang]) REFERENCES [dbo].[KhachHang]([id])
);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DanhGia]') AND type in (N'U'))
CREATE TABLE [dbo].[DanhGia] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY, 
    [IdKhachHang] INT, 
    [IdSanPham] INT, 
    [SoSao] INT, 
    [BinhLuan] NVARCHAR(MAX), 
    [NgayDanhGia] DATETIME, 
    [TrangThai] INT,
    FOREIGN KEY ([IdKhachHang]) REFERENCES [dbo].[KhachHang]([id]),
    FOREIGN KEY ([IdSanPham]) REFERENCES [dbo].[SanPham]([Id])
);
GO

-- ==========================================
-- SEED DATA (THÊM 10 DÒNG CHO MỖI BẢNG)
-- ==========================================

-- 1. ThuongHieu
INSERT INTO [dbo].[ThuongHieu] ([TenThuongHieu], [TrangThai]) VALUES 
(N'Nike', 1), (N'Adidas', 1), (N'Puma', 1), (N'Reebok', 1), (N'Under Armour', 1),
(N'New Balance', 1), (N'Asics', 1), (N'Vans', 1), (N'Converse', 1), (N'Fila', 1);

-- 2. XuatXu
INSERT INTO [dbo].[XuatXu] ([TenXuatXu], [TrangThai]) VALUES 
(N'Việt Nam', 1), (N'Mỹ', 1), (N'Trung Quốc', 1), (N'Hàn Quốc', 1), (N'Nhật Bản', 1),
(N'Ý', 1), (N'Đức', 1), (N'Pháp', 1), (N'Anh', 1), (N'Thái Lan', 1);

-- 3. ChatLieu
INSERT INTO [dbo].[ChatLieu] ([TenChatLieu], [TrangThai]) VALUES 
(N'Vải Mesh', 1), (N'Da thật', 1), (N'Da PU', 1), (N'Cao su', 1), (N'Canvas', 1),
(N'Nỉ', 1), (N'Sợi tổng hợp', 1), (N'Microfiber', 1), (N'GORE-TEX', 1), (N'Primeknit', 1);

-- 4. DanhMuc
INSERT INTO [dbo].[DanhMuc] ([TenDanhMuc], [TrangThai]) VALUES 
(N'Giày chạy bộ', 1), (N'Giày bóng đá', 1), (N'Giày tập gym', 1), (N'Giày bóng rổ', 1), (N'Giày tennis', 1),
(N'Giày đạp xe', 1), (N'Giày leo núi', 1), (N'Giày cầu lông', 1), (N'Giày bơi', 1), (N'Giày thể thao nữ', 1);

-- 5. MauSac
INSERT INTO [dbo].[MauSac] ([TenMauSac], [TrangThai]) VALUES 
(N'Đen', 1), (N'Trắng', 1), (N'Xanh dương', 1), (N'Đỏ', 1), (N'Xám', 1),
(N'Cam', 1), (N'Xanh lá', 1), (N'Vàng', 1), (N'Hồng', 1), (N'Nâu', 1);

-- 6. KichThuoc
INSERT INTO [dbo].[KichThuoc] ([TenKichThuoc], [TrangThai]) VALUES 
(N'36', 1), (N'37', 1), (N'38', 1), (N'39', 1), (N'40', 1),
(N'41', 1), (N'42', 1), (N'43', 1), (N'44', 1), (N'45', 1);

-- 7. KhuyenMai
INSERT INTO [dbo].[KhuyenMai] ([TenKhuyenMai], [GiaTri], [NgayBatDau], [NgayKetThuc], [TrangThai]) VALUES 
(N'Khai trương', 10.0, '2025-01-01', '2025-12-31', 1),
(N'Mùa hè', 15.0, '2025-06-01', '2025-08-31', 1),
(N'Black Friday', 20.0, '2025-11-20', '2025-11-30', 1),
(N'Trung Thu', 5.0, '2025-09-01', '2025-09-15', 1),
(N'Lễ Tình Nhân', 12.0, '2025-02-10', '2025-02-15', 1),
(N'Giải phóng 30/4', 30.0, '2025-04-20', '2025-05-05', 1),
(N'Kỷ niệm 1 năm', 25.0, '2025-07-01', '2025-07-15', 1),
(N'Cuối năm', 40.0, '2025-12-01', '2025-12-31', 1),
(N'Tri ân khách hàng', 8.0, '2025-03-01', '2025-03-31', 1),
(N'Flash Sale', 50.0, '2025-05-01', '2025-05-02', 1);

-- 8. Voucher
INSERT INTO [dbo].[Voucher] ([MaVoucher], [TenVoucher], [LoaiVoucher], [MoTa], [SoLuong], [DonToiThieu], [GiaTri], [NgayBatDau], [NgayKetThuc], [TrangThai]) VALUES 
('VOUCHER01', N'Voucher 1', N'Giảm giá số tiền', N'Mô tả', 100, 200000, 50000, '2025-01-01', '2025-12-31', 1),
('VOUCHER02', N'Voucher 2', N'Giảm giá %', N'Mô tả', 50, 500000, 10, '2025-01-01', '2025-12-31', 1),
('VOUCHER03', N'Voucher 3', N'Giảm giá số tiền', N'Mô tả', 200, 300000, 30000, '2025-01-01', '2025-12-31', 1),
('VOUCHER04', N'Voucher 4', N'Giảm giá %', N'Mô tả', 150, 400000, 15, '2025-01-01', '2025-12-31', 1),
('VOUCHER05', N'Voucher 5', N'Giảm giá số tiền', N'Mô tả', 80, 100000, 20000, '2025-01-01', '2025-12-31', 1),
('VOUCHER06', N'Voucher 6', N'Giảm giá %', N'Mô tả', 60, 600000, 20, '2025-01-01', '2025-12-31', 1),
('VOUCHER07', N'Voucher 7', N'Giảm giá số tiền', N'Mô tả', 90, 800000, 100000, '2025-01-01', '2025-12-31', 1),
('VOUCHER08', N'Voucher 8', N'Giảm giá %', N'Mô tả', 30, 1000000, 25, '2025-01-01', '2025-12-31', 1),
('VOUCHER09', N'Voucher 9', N'Giảm giá số tiền', N'Mô tả', 120, 250000, 25000, '2025-01-01', '2025-12-31', 1),
('VOUCHER10', N'Voucher 10', N'Giảm giá %', N'Mô tả', 40, 700000, 18, '2025-01-01', '2025-12-31', 1);

-- 9. NhanVien
INSERT INTO [dbo].[NhanVien] ([TenNhanVien], [Email], [SoDienThoai], [NgaySinh], [GioiTinh], [DiaChi], [VaiTro], [MatKhau], [CCCD], [TrangThai]) VALUES 
(N'Nguyễn Văn Trưởng', 'truongnv@example.com', '0901234561', '1995-01-01', 1, N'Hà Nội', 1, '123456', '001095000001', 1),
(N'Trần Thị Bích', 'bicht@example.com', '0901234562', '1996-02-02', 0, N'Hồ Chí Minh', 0, '123456', '001095000002', 1),
(N'Lê Văn Cường', 'cuonglv@example.com', '0901234563', '1997-03-03', 1, N'Đà Nẵng', 0, '123456', '001095000003', 1),
(N'Phạm Thị Duyên', 'duyenpt@example.com', '0901234564', '1998-04-04', 0, N'Hải Phòng', 0, '123456', '001095000004', 1),
(N'Bùi Văn E', 'ebv@example.com', '0901234565', '1999-05-05', 1, N'Cần Thơ', 0, '123456', '001095000005', 1),
(N'Hoàng Thị Gấm', 'gamht@example.com', '0901234566', '2000-06-06', 0, N'Bình Dương', 0, '123456', '001095000006', 1),
(N'Đỗ Văn Hùng', 'hungdv@example.com', '0901234567', '2001-07-07', 1, N'Đồng Nai', 0, '123456', '001095000007', 1),
(N'Vũ Thị In', 'invt@example.com', '0901234568', '1994-08-08', 0, N'Vũng Tàu', 0, '123456', '001095000008', 1),
(N'Ngô Văn Kiên', 'kiennv@example.com', '0901234569', '1993-09-09', 1, N'Bắc Ninh', 0, '123456', '001095000009', 1),
(N'Đặng Thị Loan', 'loandt@example.com', '0901234510', '1992-10-10', 0, N'Quảng Ninh', 1, '123456', '001095000010', 1);

-- 10. KhachHang
INSERT INTO [dbo].[KhachHang] ([TenKhachHang], [Email], [NgaySinh], [GioiTinh], [DiaChi], [SoDienThoai], [matKhau], [TrangThai], [MaThongBao], [ThoiGianThongBao]) VALUES 
(N'Khách Hàng A', 'khachA@example.com', '1990-01-01', 1, N'Hà Đông, Hà Nội', '0987654301', '123456', 1, '', '2025-01-01'),
(N'Khách Hàng B', 'khachB@example.com', '1991-01-02', 0, N'Quận 1, TP HCM', '0987654302', '123456', 1, '', '2025-01-01'),
(N'Khách Hàng C', 'khachC@example.com', '1992-01-03', 1, N'Cầu Giấy, Hà Nội', '0987654303', '123456', 1, '', '2025-01-01'),
(N'Khách Hàng D', 'khachD@example.com', '1993-01-04', 0, N'Đống Đa, Hà Nội', '0987654304', '123456', 1, '', '2025-01-01'),
(N'Khách Hàng E', 'khachE@example.com', '1994-01-05', 1, N'Quận 3, TP HCM', '0987654305', '123456', 1, '', '2025-01-01'),
(N'Khách Hàng F', 'khachF@example.com', '1995-01-06', 0, N'Thanh Xuân, Hà Nội', '0987654306', '123456', 1, '', '2025-01-01'),
(N'Khách Hàng G', 'khachG@example.com', '1996-01-07', 1, N'Quận 5, TP HCM', '0987654307', '123456', 1, '', '2025-01-01'),
(N'Khách Hàng H', 'khachH@example.com', '1997-01-08', 0, N'Hoàng Mai, Hà Nội', '0987654308', '123456', 1, '', '2025-01-01'),
(N'Khách Hàng I', 'khachI@example.com', '1998-01-09', 1, N'Hai Bà Trưng, Hà Nội', '0987654309', '123456', 1, '', '2025-01-01'),
(N'Khách Hàng K', 'khachK@example.com', '1999-01-10', 0, N'Tây Hồ, Hà Nội', '0987654310', '123456', 1, '', '2025-01-01');

-- 11. SanPham
INSERT INTO [dbo].[SanPham] ([TenSanPham], [NgayTao], [IdThuongHieu], [IdXuatXu], [IdChatLieu], [IdDanhMuc], [Images], [TrangThai]) VALUES 
(N'Giày Chạy Bộ Nam Nike Pegasus', '2025-01-01', 1, 1, 1, 1, 'image1.jpg', 1),
(N'Giày Thể Thao Nữ Adidas Ultraboost', '2025-01-02', 2, 2, 2, 2, 'image2.jpg', 1),
(N'Giày Bóng Đá Puma Future', '2025-01-03', 3, 3, 3, 3, 'image3.jpg', 1),
(N'Giày Tập Gym Reebok Nano', '2025-01-04', 4, 4, 4, 4, 'image4.jpg', 1),
(N'Giày Bóng Rổ Under Armour Curry', '2025-01-05', 5, 5, 5, 5, 'image5.jpg', 1),
(N'Giày Sneaker New Balance 574', '2025-01-06', 6, 6, 6, 6, 'image6.jpg', 1),
(N'Giày Tennis Asics Gel Resolution', '2025-01-07', 7, 7, 7, 7, 'image7.jpg', 1),
(N'Giày Lười Vans Slip-On', '2025-01-08', 8, 8, 8, 8, 'image8.jpg', 1),
(N'Giày Cổ Cao Converse Chuck Taylor', '2025-01-09', 9, 9, 9, 9, 'image9.jpg', 1),
(N'Giày Đạp Xe Thời Trang Fila', '2025-01-10', 10, 10, 10, 10, 'image10.jpg', 1);

-- 12. SanPhamChiTiet
INSERT INTO [dbo].[SanPhamChiTiet] ([SoLuong], [NgaySanXuat], [IdSanPham], [IdKichThuoc], [IdMauSac], [IdKhuyenMai], [NgayTao], [TrangThai], [GiaBan], [GiaBanGiamGia]) VALUES 
(100, '2025-01-01', 1, 1, 1, 1, '2025-01-01 10:00:00', 1, 1500000, 1350000),
(150, '2025-01-02', 2, 2, 2, 2, '2025-01-02 10:00:00', 1, 2000000, 1700000),
(200, '2025-01-03', 3, 3, 3, 3, '2025-01-03 10:00:00', 1, 1200000, 960000),
(50, '2025-01-04', 4, 4, 4, 4, '2025-01-04 10:00:00', 1, 1800000, 1710000),
(80, '2025-01-05', 5, 5, 5, 5, '2025-01-05 10:00:00', 1, 2500000, 2200000),
(120, '2025-01-06', 6, 6, 6, 1, '2025-01-06 10:00:00', 1, 900000, 810000),
(60, '2025-01-07', 7, 7, 7, 2, '2025-01-07 10:00:00', 1, 1300000, 1105000),
(90, '2025-01-08', 8, 8, 8, 3, '2025-01-08 10:00:00', 1, 750000, 600000),
(110, '2025-01-09', 9, 9, 9, 4, '2025-01-09 10:00:00', 1, 1100000, 1045000),
(70, '2025-01-10', 10, 10, 10, 5, '2025-01-10 10:00:00', 1, 1400000, 1232000);

-- 13. DonHang
INSERT INTO [dbo].[DonHang] ([idNhanVien], [idKhachHang], [idGiamGia], [NgayMua], [NgayTao], [LoaiDonHang], [TrangThai], [TongTien], [TongTienGiamGia], [DiaChiGiaoHang], [SoDienThoaiGiaoHang], [EmailGiaoHang], [TenNguoiNhan], [PhiVanChuyen]) VALUES 
(1, 1, 1, '2025-01-01', '2025-01-01', N'online', 1, 1370000, 50000, N'Hà Đông, Hà Nội', '0987654301', 'khachA@example.com', N'Khách Hàng A', 30000),
(2, 2, 2, '2025-01-02', '2025-01-02', N'Bán hàng tại quầy', 2, 1530000, 170000, N'Quận 1, TP HCM', '0987654302', 'khachB@example.com', N'Khách Hàng B', 0),
(3, 3, 3, '2025-01-03', '2025-01-03', N'online', 3, 930000, 30000, N'Cầu Giấy, Hà Nội', '0987654303', 'khachC@example.com', N'Khách Hàng C', 25000),
(4, 4, 4, '2025-01-04', '2025-01-04', N'online', 4, 1453500, 256500, N'Đống Đa, Hà Nội', '0987654304', 'khachD@example.com', N'Khách Hàng D', 35000),
(5, 5, 5, '2025-01-05', '2025-01-05', N'Bán hàng tại quầy', 1, 2180000, 20000, N'Quận 3, TP HCM', '0987654305', 'khachE@example.com', N'Khách Hàng E', 0),
(6, 6, 6, '2025-01-06', '2025-01-06', N'online', 2, 648000, 162000, N'Thanh Xuân, Hà Nội', '0987654306', 'khachF@example.com', N'Khách Hàng F', 15000),
(7, 7, 7, '2025-01-07', '2025-01-07', N'online', 3, 1005000, 100000, N'Quận 5, TP HCM', '0987654307', 'khachG@example.com', N'Khách Hàng G', 20000),
(8, 8, 8, '2025-01-08', '2025-01-08', N'Bán hàng tại quầy', 4, 450000, 150000, N'Hoàng Mai, Hà Nội', '0987654308', 'khachH@example.com', N'Khách Hàng H', 0),
(9, 9, 9, '2025-01-09', '2025-01-09', N'online', 1, 1020000, 25000, N'Hai Bà Trưng, Hà Nội', '0987654309', 'khachI@example.com', N'Khách Hàng I', 30000),
(10, 10, 10, '2025-01-10', '2025-01-10', N'online', 2, 1010240, 221760, N'Tây Hồ, Hà Nội', '0987654310', 'khachK@example.com', N'Khách Hàng K', 25000);

-- 14. donHangChiTiet
INSERT INTO [dbo].[donHangChiTiet] ([idDonHang], [idSanPhamChiTiet], [soLuong], [gia], [thanhTien]) VALUES 
(1, 1, 1, 1350000, 1350000),
(2, 2, 1, 1700000, 1700000),
(3, 3, 1, 960000, 960000),
(4, 4, 1, 1710000, 1710000),
(5, 5, 1, 2200000, 2200000),
(6, 6, 1, 810000, 810000),
(7, 7, 1, 1105000, 1105000),
(8, 8, 1, 600000, 600000),
(9, 9, 1, 1045000, 1045000),
(10, 10, 1, 1232000, 1232000);

-- 15. GioHangChiTiet
INSERT INTO [dbo].[GioHangChiTiet] ([idSanPhamChiTiet], [idKhachHang], [soLuong], [gia]) VALUES 
(1, 1, 1, 1350000), (2, 2, 2, 1700000), (3, 3, 1, 960000), (4, 4, 1, 1710000), (5, 5, 2, 2200000),
(6, 6, 1, 810000), (7, 7, 1, 1105000), (8, 8, 3, 600000), (9, 9, 1, 1045000), (10, 10, 2, 1232000);

-- 16. DanhGia
INSERT INTO [dbo].[DanhGia] ([IdKhachHang], [IdSanPham], [SoSao], [BinhLuan], [NgayDanhGia], [TrangThai]) VALUES 
(1, 1, 5, N'Giày đi êm chân, rất hài lòng.', GETDATE(), 1),
(2, 2, 4, N'Sản phẩm tốt, giao hàng nhanh.', GETDATE(), 1),
(3, 3, 5, N'Màu sắc bên ngoài đẹp hơn trong ảnh luôn.', GETDATE(), 1),
(4, 4, 3, N'Đế hơi cứng, chắc phải đi vài lần mới mềm ra.', GETDATE(), 1),
(5, 5, 5, N'Sản phẩm tuyệt vời, sẽ ủng hộ shop tiếp.', GETDATE(), 1),
(6, 6, 2, N'Giao nhầm size cho mình rồi shop ơi.', GETDATE(), 1),
(7, 7, 5, N'Chất lượng tốt so với tầm giá.', GETDATE(), 1),
(8, 8, 4, N'Giày nhẹ, ôm chân, rất phù hợp chạy bộ.', GETDATE(), 1),
(9, 9, 5, N'Ưng ý cực kỳ, đóng gói rất cẩn thận.', GETDATE(), 1),
(10, 10, 1, N'Hàng không giống hình cho lắm, hơi thất vọng.', GETDATE(), 1);

PRINT 'Thêm dữ liệu vào các Bảng thành công!'


IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TraHang]') AND type in (N'U'))
CREATE TABLE [dbo].[TraHang] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [IdDonHang] INT,
    [IdKhachHang] INT,
    [NgayYeuCau] DATETIME,
    [LyDo] NVARCHAR(MAX),
    [TrangThai] INT, -- 0: chờ duyệt, 1: đã duyệt, 2: từ chối, 3: đã hoàn tiền
    [TongTienHoan] FLOAT,

    FOREIGN KEY ([IdDonHang]) REFERENCES [dbo].[DonHang]([id]),
    FOREIGN KEY ([IdKhachHang]) REFERENCES [dbo].[KhachHang]([id])
);
GO



IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TraHangChiTiet]') AND type in (N'U'))
CREATE TABLE [dbo].[TraHangChiTiet] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [IdTraHang] INT,
    [IdDonHangChiTiet] INT,
    [SoLuongTra] INT,
    [GiaHoan] FLOAT,

    FOREIGN KEY ([IdTraHang]) REFERENCES [dbo].[TraHang]([Id]),
    FOREIGN KEY ([IdDonHangChiTiet]) REFERENCES [dbo].[donHangChiTiet]([id])
);
GO



INSERT INTO [dbo].[TraHang] ([IdDonHang], [IdKhachHang], [NgayYeuCau], [LyDo], [TrangThai], [TongTienHoan]) VALUES
(1, 1, GETDATE(), N'Lỗi sản phẩm', 1, 1350000),
(2, 2, GETDATE(), N'Không đúng size', 0, 1700000),
(3, 3, GETDATE(), N'Không thích nữa', 2, 960000);

INSERT INTO [dbo].[TraHangChiTiet] ([IdTraHang], [IdDonHangChiTiet], [SoLuongTra], [GiaHoan]) VALUES
(1, 1, 1, 1350000),
(2, 2, 1, 1700000),
(3, 3, 1, 960000);


