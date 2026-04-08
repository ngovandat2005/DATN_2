USE [master]
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'KingStepp3')
BEGIN
    ALTER DATABASE [KingStepp3] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [KingStepp3];
END
GO

CREATE DATABASE [KingStepp3]
GO

USE [KingStepp3]
GO

-----------------------------------------------------------------------
-- I. CẤU TRÚC BẢNG (CHUẨN)
-----------------------------------------------------------------------

CREATE TABLE [dbo].[ChatLieu](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenChatLieu] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

CREATE TABLE [dbo].[DanhMuc](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenDanhMuc] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

CREATE TABLE [dbo].[ThuongHieu](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenThuongHieu] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

CREATE TABLE [dbo].[XuatXu](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenXuatXu] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

CREATE TABLE [dbo].[MauSac](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenMauSac] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

CREATE TABLE [dbo].[KichThuoc](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenKichThuoc] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

CREATE TABLE [dbo].[KhachHang](
	[id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenKhachHang] [nvarchar](255) NULL,
	[Email] [nvarchar](255) NULL,
	[NgaySinh] [date] NULL,
	[DiaChi] [nvarchar](255) NULL,
	[SoDienThoai] [varchar](10) NULL,
	[matKhau] [nvarchar](255) NULL,
	[TrangThai] [bit] NULL,
	[MaThongBao] [nvarchar](255) NULL,
	[ThoiGianThongBao] [date] NULL
)
GO

CREATE TABLE [dbo].[NhanVien](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenNhanVien] [nvarchar](255) NOT NULL,
	[Email] [nvarchar](255) NOT NULL UNIQUE,
	[SoDienThoai] [varchar](10) NULL,
	[NgaySinh] [date] NULL,
	[DiaChi] [nvarchar](255) NULL,
	[VaiTro] [bit] NULL,
	[MatKhau] [nvarchar](255) NULL,
	[CCCD] [nvarchar](255) NULL UNIQUE,
	[TrangThai] [bit] NOT NULL
)
GO

CREATE TABLE [dbo].[Voucher](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[MaVoucher] [nvarchar](255) NULL,
	[TenVoucher] [nvarchar](255) NULL,
	[LoaiVoucher] [nvarchar](255) NULL,
	[MoTa] [nvarchar](255) NULL,
	[SoLuong] [int] NULL,
	[DonToiThieu] [float] NULL,
	[GiaTri] [float] NULL,
	[NgayBatDau] [datetime] NULL,
	[NgayKetThuc] [datetime] NULL,
	[TrangThai] [int] NULL
)
GO

CREATE TABLE [dbo].[KhuyenMai](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenKhuyenMai] [nvarchar](255) NULL UNIQUE,
	[GiaTri] [float] NULL,
	[NgayBatDau] [datetime] NULL,
	[NgayKetThuc] [datetime] NULL,
	[TrangThai] [int] NULL
)
GO

CREATE TABLE [dbo].[SanPham](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenSanPham] [nvarchar](255) NULL,
	[NgayTao] [date] NULL,
	[IdThuongHieu] [int] REFERENCES [ThuongHieu](Id),
	[IdXuatXu] [int] REFERENCES [XuatXu](Id),
	[IdChatLieu] [int] REFERENCES [ChatLieu](Id),
	[IdDanhMuc] [int] REFERENCES [DanhMuc](Id),
	[Images] [varchar](max) NULL,
	[TrangThai] [int] NULL,
	[Ma] [varchar](255) NULL
)
GO

CREATE TABLE [dbo].[SanPhamChiTiet](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[SoLuong] [int] NULL,
	[NgaySanXuat] [date] NULL,
	[IdSanPham] [int] REFERENCES [SanPham](Id),
	[IdKichThuoc] [int] REFERENCES [KichThuoc](Id),
	[IdMauSac] [int] REFERENCES [MauSac](Id),
	[IdKhuyenMai] [int] REFERENCES [KhuyenMai](Id),
	[NgayTao] [datetime] NULL,
	[TrangThai] [int] NULL,
	[GiaBan] [float] NULL,
	[GiaBanGiamGia] [float] NULL,
	[Ma] [varchar](255) NULL
)
GO

CREATE TABLE [dbo].[DonHang](
	[id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[idNhanVien] [int] REFERENCES [NhanVien](Id),
	[idKhachHang] [int] REFERENCES [KhachHang](Id),
	[idGiamGia] [int] REFERENCES [Voucher](Id),
	[NgayMua] [date] NULL,
	[NgayTao] [date] NULL,
	[LoaiDonHang] [nvarchar](255) NULL,
	[TrangThai] [int] NULL,
	[TongTien] [float] NULL,
	[TongTienGiamGia] [float] NULL,
	[DiaChiGiaoHang] [nvarchar](255) NULL,
	[SoDienThoaiGiaoHang] [nvarchar](255) NULL,
	[EmailGiaoHang] [nvarchar](255) NULL,
	[TenNguoiNhan] [nvarchar](255) NULL,
	[PhiVanChuyen] [int] NULL,
	[IdService] [int] NULL,
	[MaVanDon] [varchar](255) NULL
)
GO

CREATE TABLE [dbo].[donHangChiTiet](
	[id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[idDonHang] [int] REFERENCES [DonHang](id),
	[idSanPhamChiTiet] [int] REFERENCES [SanPhamChiTiet](Id),
	[soLuong] [int] NULL,
	[gia] [float] NULL,
	[thanhTien] [float] NULL
)
GO

CREATE TABLE [dbo].[GioHangChiTiet](
	[id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[idSanPhamChiTiet] [int] REFERENCES [SanPhamChiTiet](Id),
	[idKhachHang] [int] REFERENCES [KhachHang](id),
	[soLuong] [int] NULL,
	[gia] [float] NULL
)
GO

-----------------------------------------------------------------------
-- II. CHÈN DỮ LIỆU CƠ BẢN (KHÔNG BỊ THIẾU ID)
-----------------------------------------------------------------------

INSERT INTO DanhMuc (TenDanhMuc, TrangThai) VALUES (N'Sneaker', 1), (N'Running', 1), (N'Basketball', 1), (N'Style', 1), (N'Training', 1), (N'Dép', 1), (N'Football', 1), (N'Walking', 1), (N'Limited', 1), (N'Sandal', 1);
INSERT INTO ThuongHieu (TenThuongHieu, TrangThai) VALUES (N'Nike', 1), (N'Adidas', 1), (N'Puma', 1), (N'Vans', 1), (N'Converse', 1), (N'New Balance', 1), (N'Asics', 1), (N'Reebok', 1), (N'Mizuno', 1), (N'Balenciaga', 1);
INSERT INTO ChatLieu (TenChatLieu, TrangThai) VALUES (N'Da Bò', 1), (N'Vải Mesh', 1), (N'Da Lộn', 1), (N'Cao Su', 1), (N'Canvas', 1), (N'Recycle', 1), (N'Da Tổng Hợp', 1), (N'Primeknit', 1), (N'TPU', 1), (N'Sợi Carbon', 1);
INSERT INTO XuatXu (TenXuatXu, TrangThai) VALUES (N'Việt Nam', 1), (N'USA', 1), (N'Trung Quốc', 1), (N'Indonesia', 1), (N'Thái Lan', 1), (N'Nhật Bản', 1), (N'Hàn Quốc', 1), (N'Đức', 1), (N'Italy', 1), (N'Đài Loan', 1);
INSERT INTO MauSac (TenMauSac, TrangThai) VALUES (N'Trắng', 1), (N'Đen', 1), (N'Xám', 1), (N'Đỏ', 1), (N'Xanh', 1), (N'Vàng', 1), (N'Hồng', 1), (N'Lá', 1), (N'Cam', 1), (N'Tím', 1);
INSERT INTO KichThuoc (TenKichThuoc, TrangThai) VALUES ('36', 1), ('37', 1), ('38', 1), ('39', 1), ('40', 1), ('41', 1), ('42', 1), ('43', 1), ('44', 1), ('45', 1);

-- 10 Nhân Viên
INSERT INTO NhanVien (TenNhanVien, Email, SoDienThoai, NgaySinh, DiaChi, VaiTro, MatKhau, CCCD, TrangThai)
VALUES (N'Quản Lý KingStep', 'admin@kingstep.com', '0912345001', '1990-01-01', N'Hà Nội', 1, '123456', '123456789001', 1),
(N'NV Bán Hàng A', 'nvA@kingstep.com', '0912345002', '1995-02-02', N'TP HCM', 0, '123456', '123456789002', 1),
(N'NV Bán Hàng B', 'nvB@kingstep.com', '0912345003', '1996-03-03', N'Đà Nẵng', 0, '123456', '123456789003', 1),
(N'NV Bán Hàng C', 'nvC@kingstep.com', '0912345004', '1997-04-04', N'Hải Phòng', 0, '123456', '123456789004', 1),
(N'NV Bán Hàng D', 'nvD@kingstep.com', '0912345005', '1998-05-05', N'Cần Thơ', 0, '123456', '123456789005', 1),
(N'NV Bán Hàng E', 'nvE@kingstep.com', '0912345006', '1999-06-06', N'Nha Trang', 0, '123456', '123456789006', 1),
(N'NV Bán Hàng F', 'nvF@kingstep.com', '0912345007', '2000-07-07', N'Bắc Ninh', 0, '123456', '123456789007', 1),
(N'NV Bán Hàng G', 'nvG@kingstep.com', '0912345008', '2001-08-08', N'Thanh Hóa', 0, '123456', '123456789008', 1),
(N'NV Bán Hàng H', 'nvH@kingstep.com', '0912345009', '2002-09-09', N'Quảng Ninh', 0, '123456', '123456789009', 1),
(N'NV Bán Hàng I', 'nvI@kingstep.com', '0912345010', '2003-10-10', N'Huế', 0, '123456', '123456789010', 1);

-- 10 Khách Hàng (Tạo mã ID từ 1-10 để tránh lỗi không tìm thấy)
INSERT INTO KhachHang (TenKhachHang, Email, SoDienThoai, NgaySinh, DiaChi, matKhau, TrangThai)
VALUES (N'Khách Lẻ', 'khachle@gmail.com', '0000000000', NULL, NULL, NULL, 1),
(N'Nguyễn Văn An', 'an@gmail.com', '0988000001', '1992-01-01', N'Hà Nội', '123456', 1),
(N'Trần Thị Bình', 'binh@gmail.com', '0988000002', '1995-02-02', N'HCM', '123456', 1),
(N'Lê Văn Cường', 'cuong@gmail.com', '0988000003', '1990-03-03', N'Đà Nẵng', '123456', 1),
(N'Phạm Thị Dung', 'dung@gmail.com', '0988000004', '1998-04-04', N'Hải Phòng', '123456', 1),
(N'Hoàng Văn Em', 'em@gmail.com', '0988000005', '2000-05-05', N'Cần Thơ', '123456', 1),
(N'Vũ Thị Phương', 'phuong@gmail.com', '0988000006', '1994-06-06', N'Bắc Ninh', '123456', 1),
(N'Đỗ Văn Giang', 'giang@gmail.com', '0988000007', '1993-07-07', N'Hà Nội', '123456', 1),
(N'Bùi Thị Hoa', 'hoa@gmail.com', '0988000008', '1997-08-08', N'TP HCM', '123456', 1),
(N'Lý Văn Hùng', 'hung@gmail.com', '0988000009', '1991-09-09', N'Đồng Nai', '123456', 1);

-- 10 Voucher & Khuyến Mãi
INSERT INTO Voucher (MaVoucher, TenVoucher, LoaiVoucher, MoTa, SoLuong, DonToiThieu, GiaTri, NgayBatDau, NgayKetThuc, TrangThai)
VALUES ('SALE10', N'Siêu Sale 10%', 'PERCENT', N'Giảm 10%', 100, 500000, 10, '2026-01-01', '2026-12-31', 1),
('GIA100', N'Giảm 100k', 'CASH', N'Giảm thẳng 100k', 100, 1000000, 100000, '2026-01-01', '2026-12-31', 1),
('FREESHIP', N'Freeship', 'CASH', N'Giảm 30k ship', 1000, 200000, 30000, '2026-01-01', '2026-12-31', 1),
('VIP20', N'Ưu Đãi VIP', 'PERCENT', N'Giảm 20%', 10, 2000000, 20, '2026-01-01', '2026-12-31', 1),
('KMT12', N'Mừng Tân Sửu', 'PERCENT', N'Giảm 5%', 500, 0, 5, '2026-01-01', '2026-12-31', 1),
('LÊ304', N'Giải Phóng', 'PERCENT', N'Giảm 15%', 100, 500000, 15, '2026-04-20', '2026-05-05', 1),
('HE2026', N'Hè Rực Rỡ', 'CASH', N'Giảm 50k', 500, 300000, 50000, '2026-05-01', '2026-08-31', 1),
('SINHNHAT', N'Sinh Nhật Shop', 'PERCENT', N'Giảm 25%', 50, 1000000, 25, '2026-01-01', '2026-12-31', 1),
('MAYMAN', N'Ngày May Mắn', 'CASH', N'Giảm 20k', 1000, 100000, 20000, '2026-01-01', '2026-12-31', 1),
('CHAOXUAN', N'Chào Xuân', 'PERCENT', N'Giảm 30%', 10, 3000000, 30, '2026-01-01', '2026-02-28', 1);

INSERT INTO KhuyenMai (TenKhuyenMai, GiaTri, NgayBatDau, NgayKetThuc, TrangThai)
VALUES (N'Xả Kho Hè', 30, '2026-04-01', '2026-08-31', 1),
(N'Black Friday', 50, '2026-11-20', '2026-11-30', 1),
(N'Giáng Sinh', 25, '2026-12-15', '2026-12-31', 1),
(N'Ngày Hội Nike', 10, '2026-04-01', '2026-12-31', 1),
(N'Tuần Lễ Adidas', 15, '2026-04-01', '2026-12-31', 1),
(N'Ưu đãi Puma', 12, '2026-04-01', '2026-12-31', 1),
(N'Voucher Vans', 20, '2026-04-01', '2026-12-31', 1),
(N'Converse Day', 18, '2026-04-01', '2026-12-31', 1),
(N'NB Special', 8, '2026-04-01', '2026-12-31', 1),
(N'Flash Sale', 40, '2026-04-01', '2026-12-31', 1);

-----------------------------------------------------------------------
-- III. CHÈN 60 SẢN PHẨM KHÁC NHAU (ẢNH SIÊU ĐẸP)
-----------------------------------------------------------------------

INSERT INTO SanPham (TenSanPham, NgayTao, IdThuongHieu, IdXuatXu, IdChatLieu, IdDanhMuc, Images, TrangThai, Ma)
VALUES 
-- Nike (1-10)
(N'Nike Air Force 1 07', GETDATE(), 1, 1, 1, 1, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a', 1, 'NI01'),
(N'Nike Jordan High Mid', GETDATE(), 1, 2, 1, 3, 'https://images.unsplash.com/photo-1552346154-21d32810aba3', 1, 'NI02'),
(N'Nike Dunk Low Panda', GETDATE(), 1, 3, 1, 1, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519', 1, 'NI03'),
(N'Nike Pegasus 39 Running', GETDATE(), 1, 1, 2, 2, 'https://images.unsplash.com/photo-1538233412730-cd84181f4961', 1, 'NI04'),
(N'Nike Air Max 90 White', GETDATE(), 1, 1, 4, 1, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 1, 'NI05'),
(N'Nike Blazer Mid Vintage', GETDATE(), 1, 1, 1, 5, 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1', 1, 'NI06'),
(N'Nike React Infinity Pro', GETDATE(), 1, 1, 1, 2, 'https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717', 1, 'NI07'),
(N'Nike Court Vision Low', GETDATE(), 1, 1, 1, 1, 'https://images.unsplash.com/photo-1605405748313-a416a1b84491', 1, 'NI08'),
(N'Nike Precision 6 Black', GETDATE(), 1, 1, 2, 3, 'https://images.unsplash.com/photo-1514441340265-1544410a285d', 1, 'NI09'),
(N'Nike Air Max 97 OG', GETDATE(), 1, 3, 2, 1, 'https://images.unsplash.com/photo-1549298916-b41d501d3772', 1, 'NI10'),

-- Adidas (11-20)
(N'Adidas Ultraboost 22 Black', GETDATE(), 2, 1, 2, 2, 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb', 1, 'AD11'),
(N'Adidas Stan Smith White', GETDATE(), 2, 1, 1, 5, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa', 1, 'AD12'),
(N'Adidas Superstar Shell Toe', GETDATE(), 2, 1, 1, 5, 'https://images.unsplash.com/photo-1512374382149-4332c6c0326e', 1, 'AD13'),
(N'Adidas NMD R1 V2 Grey', GETDATE(), 2, 3, 2, 2, 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2', 1, 'AD14'),
(N'Adidas Forum Low Blue', GETDATE(), 2, 4, 1, 1, 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f', 1, 'AD15'),
(N'Adidas Samba OG Black White', GETDATE(), 2, 1, 1, 5, 'https://images.unsplash.com/photo-1520639889313-7da7205bb274', 1, 'AD16'),
(N'Adidas Gazelle Navy White', GETDATE(), 2, 1, 3, 5, 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06', 1, 'AD17'),
(N'Adidas Yeezy Boost 350', GETDATE(), 2, 3, 5, 5, 'https://images.unsplash.com/photo-1575537302964-98cd47c0f39d', 1, 'AD18'),
(N'Adidas Ozweego Beige White', GETDATE(), 2, 1, 1, 5, 'https://images.unsplash.com/photo-1582588673385-2638848483ba', 1, 'AD19'),
(N'Adidas Questar Flow Blue', GETDATE(), 2, 1, 2, 2, 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2', 1, 'AD20'),

-- Puma (21-30)
(N'Puma Cali Dream White Pink', GETDATE(), 3, 4, 1, 5, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86', 1, 'PU21'),
(N'Puma Suede Classic Red', GETDATE(), 3, 1, 1, 5, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5', 1, 'PU22'),
(N'Puma RS-X3 Puzzle Gradient', GETDATE(), 3, 3, 4, 1, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f', 1, 'PU23'),
(N'Puma MB.02 LaMelo Ball', GETDATE(), 3, 1, 5, 3, 'https://images.unsplash.com/photo-1512111195641-a67554410a28', 1, 'PU24'),
(N'Puma Future FG Blue', GETDATE(), 3, 1, 5, 7, 'https://images.unsplash.com/photo-1512435422891-b937e95585b6', 1, 'PU25'),
(N'Puma Cali Star White Shine', GETDATE(), 3, 4, 1, 5, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86', 1, 'PU26'),
(N'Puma Roma Heritage Black', GETDATE(), 3, 1, 1, 5, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5', 1, 'PU27'),
(N'Puma RS-Fast Multi Color', GETDATE(), 3, 1, 4, 1, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f', 1, 'PU28'),
(N'Puma Muse Metal Satin Pink', GETDATE(), 3, 1, 1, 5, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86', 1, 'PU29'),
(N'Puma Slipstream Retro', GETDATE(), 3, 1, 1, 1, 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1', 1, 'PU30'),

-- Vans (31-40)
(N'Vans Old Skool Blue Classic', GETDATE(), 4, 1, 3, 5, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77', 1, 'VA31'),
(N'Vans Slip-On Checkerboard', GETDATE(), 4, 1, 3, 5, 'https://images.unsplash.com/photo-1605348532760-6753d2c43329', 1, 'VA32'),
(N'Vans Sk8-Hi High Top Black', GETDATE(), 4, 1, 3, 5, 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2', 1, 'VA33'),
(N'Vans Authentic Canvas Navy', GETDATE(), 4, 1, 3, 5, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77', 1, 'VA34'),
(N'Vans Half Cab Tan Suede', GETDATE(), 4, 1, 3, 5, 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2', 1, 'VA35'),
(N'Vans Knu Skool Big Tongue', GETDATE(), 4, 1, 1, 5, 'https://images.unsplash.com/photo-1605348532760-6753d2c43329', 1, 'VA36'),
(N'Vans Era White Red Print', GETDATE(), 4, 1, 3, 5, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77', 1, 'VA37'),
(N'Vans Skate Low Grey White', GETDATE(), 4, 1, 2, 5, 'https://images.unsplash.com/photo-1605348532760-6753d2c43329', 1, 'VA38'),
(N'Vans Slip-Er Slipper Black', GETDATE(), 4, 1, 3, 5, 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2', 1, 'VA39'),
(N'Vans Rowley Classic OG', GETDATE(), 4, 1, 3, 1, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77', 1, 'VA40'),

-- Converse (41-50)
(N'Converse Chuck 70 Hi Top', GETDATE(), 5, 1, 3, 5, 'https://images.unsplash.com/photo-1594467022941-4c6e91129656', 1, 'CO41'),
(N'Converse Chuck Taylor Mid', GETDATE(), 5, 1, 3, 5, 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06', 1, 'CO42'),
(N'Converse Run Star Hike', GETDATE(), 5, 2, 3, 5, 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06', 1, 'CO43'),
(N'Converse One Star Suede Blue', GETDATE(), 5, 1, 1, 5, 'https://images.unsplash.com/photo-1579338559194-a162d19bf842', 1, 'CO44'),
(N'Converse Jack Purcell White', GETDATE(), 5, 1, 1, 5, 'https://images.unsplash.com/photo-1594467022941-4c6e91129656', 1, 'CO45'),
(N'Converse Weapon Lo Metallic', GETDATE(), 5, 1, 1, 3, 'https://images.unsplash.com/photo-1579338559194-a162d19bf842', 1, 'CO46'),
(N'Converse Chuck 70 Low Sage', GETDATE(), 5, 1, 3, 5, 'https://images.unsplash.com/photo-1594467022941-4c6e91129656', 1, 'CO47'),
(N'Converse ERX 260 Mid Retro', GETDATE(), 5, 1, 3, 3, 'https://images.unsplash.com/photo-1579338559194-a162d19bf842', 1, 'CO48'),
(N'Converse CPX 70 Multi Color', GETDATE(), 5, 1, 1, 5, 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06', 1, 'CO49'),
(N'Converse Breakpoint Pro Tan', GETDATE(), 5, 1, 3, 1, 'https://images.unsplash.com/photo-1579338559194-a162d19bf842', 1, 'CO50'),

-- New Balance (51-60)
(N'New Balance 550 White Grey', GETDATE(), 6, 2, 1, 1, 'https://images.unsplash.com/photo-1539185441755-769473a23570', 1, 'NB51'),
(N'New Balance 2002R Steel Blue', GETDATE(), 6, 1, 1, 2, 'https://images.unsplash.com/photo-1562183241-b937e95585b6', 1, 'NB52'),
(N'New Balance 990v5 Core Grey', GETDATE(), 6, 2, 1, 2, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f', 1, 'NB53'),
(N'New Balance 327 Sea Salt Blue', GETDATE(), 6, 2, 1, 5, 'https://images.unsplash.com/photo-1539185441755-769473a23570', 1, 'NB54'),
(N'New Balance 530 Silver Metallic', GETDATE(), 6, 1, 2, 2, 'https://images.unsplash.com/photo-1562183241-b937e95585b6', 1, 'NB55'),
(N'New Balance 574 Legacy Green', GETDATE(), 6, 2, 1, 2, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f', 1, 'NB56'),
(N'New Balance 9060 Quartz Grey', GETDATE(), 6, 1, 1, 2, 'https://images.unsplash.com/photo-1539185441755-769473a23570', 1, 'NB57'),
(N'New Balance 1906R White Gold', GETDATE(), 6, 2, 2, 2, 'https://images.unsplash.com/photo-1562183241-b937e95585b6', 1, 'NB58'),
(N'New Balance 650 High Top Cream', GETDATE(), 6, 1, 1, 3, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f', 1, 'NB59'),
(N'New Balance Fresh Foam X Blue', GETDATE(), 6, 1, 2, 2, 'https://images.unsplash.com/photo-1539185441755-769473a23570', 1, 'NB60');

-----------------------------------------------------------------------
-- IV. KHỞI TẠO BIẾN THỂ (60 SP x 5 SIZE = 300 DÒNG)
-----------------------------------------------------------------------

INSERT INTO SanPhamChiTiet (SoLuong, NgaySanXuat, IdSanPham, IdKichThuoc, IdMauSac, IdKhuyenMai, NgayTao, TrangThai, GiaBan, GiaBanGiamGia, Ma)
SELECT 
    100, '2026-01-01', s.Id, k.Id, 1, NULL, GETDATE(), 1, 1800000 + (s.Id * 10000), NULL, s.Ma + '-' + k.TenKichThuoc
FROM SanPham s 
CROSS JOIN (SELECT Id, TenKichThuoc FROM KichThuoc WHERE TenKichThuoc IN ('39','40','41','42','43')) k;

PRINT 'THANH CONG! DA KHOI TAO LAI TOAN BO DU LIEU VA FIX LOI KHACH HANG!';
GO
