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
-- I. CẤU TRÚC BẢNG (CHUẨN HÓA & HỢP NHẤT MIGRATIONS)
-----------------------------------------------------------------------

CREATE TABLE [dbo].[ChatLieu](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[Ma] [nvarchar](50) NOT NULL UNIQUE,
	[TenChatLieu] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

CREATE TABLE [dbo].[DanhMuc](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[Ma] [nvarchar](50) NOT NULL UNIQUE,
	[TenDanhMuc] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

CREATE TABLE [dbo].[ThuongHieu](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[Ma] [nvarchar](50) NOT NULL UNIQUE,
	[TenThuongHieu] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

CREATE TABLE [dbo].[XuatXu](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[Ma] [nvarchar](50) NOT NULL UNIQUE,
	[TenXuatXu] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

CREATE TABLE [dbo].[MauSac](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[Ma] [nvarchar](50) NOT NULL UNIQUE,
	[TenMauSac] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

CREATE TABLE [dbo].[KichThuoc](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[Ma] [nvarchar](50) NOT NULL UNIQUE,
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
	[TrangThai] [int] NULL,
	[GiamGiaToiDa] [float] NULL
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
	[NgayTao] [datetime2] NULL,
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
	[MaVanDon] [varchar](255) NULL,
	[GhiChu] [nvarchar](max) NULL
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

CREATE TABLE [dbo].[DanhGia](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[IdKhachHang] [int] REFERENCES [KhachHang](Id),
	[IdSanPham] [int] REFERENCES [SanPham](Id),
	[SoSao] [int] NULL,
	[BinhLuan] [nvarchar](max) NULL,
	[NgayDanhGia] [datetime] NULL,
	[TrangThai] [int] NULL
)
GO

CREATE TABLE [dbo].[TraHang](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[IdDonHang] [int] REFERENCES [DonHang](id),
	[IdKhachHang] [int] REFERENCES [KhachHang](id),
	[NgayYeuCau] [datetime] NULL,
	[LyDo] [nvarchar](max) NULL,
	[TrangThai] [int] NULL,
	[TongTienHoan] [float] NULL
)
GO

-----------------------------------------------------------------------
-- II. CHÈN DỮ LIỆU CƠ BẢN (KHÔNG BỊ THIẾU CỘT VÀ KHÓA NGOẠI)
-----------------------------------------------------------------------

-- 1. Danh Mục
INSERT INTO DanhMuc (Ma, TenDanhMuc, TrangThai) VALUES 
('DM01', N'Sneaker', 1), 
('DM02', N'Running', 1), 
('DM03', N'Basketball', 1), 
('DM04', N'Style', 1), 
('DM05', N'Training', 1), 
('DM06', N'Dép', 1), 
('DM07', N'Football', 1), 
('DM08', N'Walking', 1), 
('DM09', N'Limited', 1), 
('DM10', N'Sandal', 1);

-- 2. Thương Hiệu
INSERT INTO ThuongHieu (Ma, TenThuongHieu, TrangThai) VALUES 
('TH01', N'Nike', 1), 
('TH02', N'Adidas', 1), 
('TH03', N'Puma', 1), 
('TH04', N'Vans', 1), 
('TH05', N'Converse', 1), 
('TH06', N'New Balance', 1), 
('TH07', N'Asics', 1), 
('TH08', N'Reebok', 1), 
('TH09', N'Mizuno', 1), 
('TH10', N'Balenciaga', 1);

-- 3. Chất Liệu
INSERT INTO ChatLieu (Ma, TenChatLieu, TrangThai) VALUES 
('CL01', N'Da Bò', 1), 
('CL02', N'Vải Mesh', 1), 
('CL03', N'Da Lộn', 1), 
('CL04', N'Cao Su', 1), 
('CL05', N'Canvas', 1), 
('CL06', N'Recycle', 1), 
('CL07', N'Da Tổng Hợp', 1), 
('CL08', N'Primeknit', 1), 
('CL09', N'TPU', 1), 
('CL10', N'Sợi Carbon', 1);

-- 4. Xuất Xứ
INSERT INTO XuatXu (Ma, TenXuatXu, TrangThai) VALUES 
('XX01', N'Việt Nam', 1), 
('XX02', N'USA', 1), 
('XX03', N'Trung Quốc', 1), 
('XX04', N'Indonesia', 1), 
('XX05', N'Thái Lan', 1), 
('XX06', N'Nhật Bản', 1), 
('XX07', N'Hàn Quốc', 1), 
('XX08', N'Đức', 1), 
('XX09', N'Italy', 1), 
('XX10', N'Đài Loan', 1);

-- 5. Màu Sắc
INSERT INTO MauSac (Ma, TenMauSac, TrangThai) VALUES 
('MS01', N'Trắng', 1), 
('MS02', N'Đen', 1), 
('MS03', N'Xám', 1), 
('MS04', N'Đỏ', 1), 
('MS05', N'Xanh', 1), 
('MS06', N'Vàng', 1), 
('MS07', N'Hồng', 1), 
('MS08', N'Lá', 1), 
('MS09', N'Cam', 1), 
('MS10', N'Tím', 1);

-- 6. Kích Thước
INSERT INTO KichThuoc (Ma, TenKichThuoc, TrangThai) VALUES 
('KT01', '36', 1), 
('KT02', '37', 1), 
('KT03', '38', 1), 
('KT04', '39', 1), 
('KT05', '40', 1), 
('KT06', '41', 1), 
('KT07', '42', 1), 
('KT08', '43', 1), 
('KT09', '44', 1), 
('KT10', '45', 1);

-- 7. Nhân Viên (10)
INSERT INTO NhanVien (TenNhanVien, Email, SoDienThoai, NgaySinh, DiaChi, VaiTro, MatKhau, CCCD, TrangThai)
VALUES 
(N'Quản Lý KingStep', 'admin@kingstep.com', '0912345001', '1990-01-01', N'Hà Nội', 1, '123456', '123456789001', 1),
(N'NV Bán Hàng A', 'nvA@kingstep.com', '0912345002', '1995-02-02', N'TP HCM', 0, '123456', '123456789002', 1),
(N'NV Bán Hàng B', 'nvB@kingstep.com', '0912345003', '1996-03-03', N'Đà Nẵng', 0, '123456', '123456789003', 1),
(N'NV Bán Hàng C', 'nvC@kingstep.com', '0912345004', '1997-04-04', N'Hải Phòng', 0, '123456', '123456789004', 1),
(N'NV Bán Hàng D', 'nvD@kingstep.com', '0912345005', '1998-05-05', N'Cần Thơ', 0, '123456', '123456789005', 1),
(N'NV Bán Hàng E', 'nvE@kingstep.com', '0912345006', '1999-06-06', N'Nha Trang', 0, '123456', '123456789006', 1),
(N'NV Bán Hàng F', 'nvF@kingstep.com', '0912345007', '2000-07-07', N'Bắc Ninh', 0, '123456', '123456789007', 1),
(N'NV Bán Hàng G', 'nvG@kingstep.com', '0912345008', '2001-08-08', N'Thanh Hóa', 0, '123456', '123456789008', 1),
(N'NV Bán Hàng H', 'nvH@kingstep.com', '0912345009', '2002-09-09', N'Quảng Ninh', 0, '123456', '123456789009', 1),
(N'NV Bán Hàng I', 'nvI@kingstep.com', '0912345010', '2003-10-10', N'Huế', 0, '123456', '123456789010', 1);

-- 8. Khách Hàng (10)
INSERT INTO KhachHang (TenKhachHang, Email, SoDienThoai, NgaySinh, DiaChi, matKhau, TrangThai)
VALUES 
(N'Khách Lẻ', 'khachle@gmail.com', '0000000000', NULL, NULL, NULL, 1),
(N'Nguyễn Văn An', 'an@gmail.com', '0988000001', '1992-01-01', N'Hà Nội', '123456', 1),
(N'Trần Thị Bình', 'binh@gmail.com', '0988000002', '1995-02-02', N'HCM', '123456', 1),
(N'Lê Văn Cường', 'cuong@gmail.com', '0988000003', '1990-03-03', N'Đà Nẵng', '123456', 1),
(N'Phạm Thị Dung', 'dung@gmail.com', '0988000004', '1998-04-04', N'Hải Phòng', '123456', 1),
(N'Hoàng Văn Em', 'em@gmail.com', '0988000005', '2000-05-05', N'Cần Thơ', '123456', 1),
(N'Vũ Thị Phương', 'phuong@gmail.com', '0988000006', '1994-06-06', N'Bắc Ninh', '123456', 1),
(N'Đỗ Văn Giang', 'giang@gmail.com', '0988000007', '1993-07-07', N'Hà Nội', '123456', 1),
(N'Bùi Thị Hoa', 'hoa@gmail.com', '0988000008', '1997-08-08', N'TP HCM', '123456', 1),
(N'Lý Văn Hùng', 'hung@gmail.com', '0988000009', '1991-09-09', N'Đồng Nai', '123456', 1);

-- 9. Voucher & Khuyến Mãi
INSERT INTO Voucher (MaVoucher, TenVoucher, LoaiVoucher, MoTa, SoLuong, DonToiThieu, GiaTri, NgayBatDau, NgayKetThuc, TrangThai, GiamGiaToiDa)
VALUES 
('SALE10', N'Siêu Sale 10%', 'PERCENT', N'Giảm 10%', 100, 500000, 10, '2026-01-01', '2026-12-31', 1, 100000),
('GIA100', N'Giảm 100k', 'CASH', N'Giảm thẳng 100k', 100, 1000000, 100000, '2026-01-01', '2026-12-31', 1, NULL),
('FREESHIP', N'Freeship', 'CASH', N'Giảm 30k ship', 1000, 200000, 30000, '2026-01-01', '2026-12-31', 1, NULL),
('VIP20', N'Ưu Đãi VIP', 'PERCENT', N'Giảm 20%', 10, 2000000, 20, '2026-01-01', '2026-12-31', 1, 500000),
('KMT12', N'Mừng Tân Sửu', 'PERCENT', N'Giảm 5%', 500, 0, 5, '2026-01-01', '2026-12-31', 1, 50000),
('LÊ304', N'Giải Phóng', 'PERCENT', N'Giảm 15%', 100, 500000, 15, '2026-04-20', '2026-05-05', 1, 150000),
('HE2026', N'Hè Rực Rỡ', 'CASH', N'Giảm 50k', 500, 300000, 50000, '2026-05-01', '2026-08-31', 1, NULL),
('SINHNHAT', N'Sinh Nhật Shop', 'PERCENT', N'Giảm 25%', 50, 1000000, 25, '2026-01-01', '2026-12-31', 1, 200000),
('MAYMAN', N'Ngày May Mắn', 'CASH', N'Giảm 20k', 1000, 100000, 20000, '2026-01-01', '2026-12-31', 1, NULL),
('CHAOXUAN', N'Chào Xuân', 'PERCENT', N'Giảm 30%', 10, 3000000, 30, '2026-01-01', '2026-02-28', 1, 1000000);

INSERT INTO KhuyenMai (TenKhuyenMai, GiaTri, NgayBatDau, NgayKetThuc, TrangThai)
VALUES 
(N'Xả Kho Hè', 30, '2026-04-01', '2026-08-31', 1),
(N'Black Friday', 50, '2026-11-20', '2026-11-30', 1),
(N'Giáng Sinh', 25, '2026-12-15', '2026-12-31', 1),
(N'Ngày Hội Nike', 10, '2026-04-01', '2026-12-31', 1),
(N'Tuần Lễ Adidas', 15, '2026-04-01', '2026-12-31', 1),
(N'Ưu đãi Puma', 12, '2026-04-01', '2026-12-31', 1),
(N'Voucher Vans', 20, '2026-04-01', '2026-12-31', 1),
(N'Converse Day', 18, '2026-04-01', '2026-12-31', 1),
(N'NB Special', 8, '2026-04-01', '2026-12-31', 1),
(N'Flash Sale', 40, '2026-04-01', '2026-12-31', 1);

-- 10. Sản Phẩm
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
(N'Adidas Forum Low Blue', GETDATE(), 2, 4, 1, 1, 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f', 1, 'AD15');

-- 11. Biến Thể Sản Phẩm
INSERT INTO SanPhamChiTiet (SoLuong, NgaySanXuat, IdSanPham, IdKichThuoc, IdMauSac, IdKhuyenMai, NgayTao, TrangThai, GiaBan, GiaBanGiamGia, Ma)
SELECT 
    100, '2026-01-01', s.Id, k.Id, 1, NULL, GETDATE(), 1, 1800000 + (s.Id * 10000), NULL, s.Ma + '-' + k.TenKichThuoc
FROM SanPham s 
CROSS JOIN (SELECT Id, TenKichThuoc FROM KichThuoc WHERE TenKichThuoc IN ('39','40','41','42','43')) k;

PRINT 'THANH CONG! DA KHOI TAO CSDL VOI DAY DU CAC COT VA DU LIEU MAU CHUAN!';
GO
