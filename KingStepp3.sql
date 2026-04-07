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

-- 1. Table ChatLieu
CREATE TABLE [dbo].[ChatLieu](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenChatLieu] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

-- 2. Table DanhMuc
CREATE TABLE [dbo].[DanhMuc](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenDanhMuc] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

-- 3. Table ThuongHieu
CREATE TABLE [dbo].[ThuongHieu](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenThuongHieu] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

-- 4. Table XuatXu
CREATE TABLE [dbo].[XuatXu](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenXuatXu] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

-- 5. Table MauSac
CREATE TABLE [dbo].[MauSac](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenMauSac] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

-- 6. Table KichThuoc
CREATE TABLE [dbo].[KichThuoc](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenKichThuoc] [nvarchar](255) NULL,
	[TrangThai] [int] NULL
)
GO

-- 7. Table KhachHang (NO GENDER)
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

-- 8. Table NhanVien (NO GENDER)
CREATE TABLE [dbo].[NhanVien](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenNhanVien] [nvarchar](255) NOT NULL,
	[Email] [nvarchar](255) NOT NULL UNIQUE,
	[SoDienThoai] [varchar](10) NULL,
	[NgaySinh] [date] NULL,
	[DiaChi] [nvarchar](255) NULL,
	[VaiTro] [bit] NULL, -- 1: Admin, 0: NhanVien
	[MatKhau] [nvarchar](255) NULL,
	[CCCD] [nvarchar](255) NULL UNIQUE,
	[TrangThai] [bit] NOT NULL
)
GO

-- 9. Table Voucher
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

-- 10. Table KhuyenMai
CREATE TABLE [dbo].[KhuyenMai](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[TenKhuyenMai] [nvarchar](255) NULL UNIQUE,
	[GiaTri] [float] NULL,
	[NgayBatDau] [datetime] NULL,
	[NgayKetThuc] [datetime] NULL,
	[TrangThai] [int] NULL
)
GO

-- 11. Table SanPham (NO GENDER)
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

-- 12. Table SanPhamChiTiet
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

-- 13. Table DonHang
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

-- 14. Table donHangChiTiet
CREATE TABLE [dbo].[donHangChiTiet](
	[id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[idDonHang] [int] REFERENCES [DonHang](id),
	[idSanPhamChiTiet] [int] REFERENCES [SanPhamChiTiet](Id),
	[soLuong] [int] NULL,
	[gia] [float] NULL,
	[thanhTien] [float] NULL
)
GO

-- 15. Table GioHangChiTiet
CREATE TABLE [dbo].[GioHangChiTiet](
	[id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[idSanPhamChiTiet] [int] REFERENCES [SanPhamChiTiet](Id),
	[idKhachHang] [int] REFERENCES [KhachHang](id),
	[soLuong] [int] NULL,
	[gia] [float] NULL
)
GO

-- 16. Table DanhGia
CREATE TABLE [dbo].[DanhGia](
	[Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[IdKhachHang] [int] REFERENCES [KhachHang](id),
	[IdSanPham] [int] REFERENCES [SanPham](Id),
	[SoSao] [int] NULL,
	[BinhLuan] [nvarchar](max) NULL,
	[NgayDanhGia] [datetime] NULL,
	[TrangThai] [int] NULL
)
GO

-- INSERT DATA
-- Chat Lieu
INSERT INTO ChatLieu (TenChatLieu, TrangThai) VALUES (N'Da Bò', 1), (N'Vải Mesh', 1), (N'Vải Canvas', 1), (N'Da Tổng Hợp', 1), (N'Sợi Tổng Hợp', 1);

-- Danh Muc
INSERT INTO DanhMuc (TenDanhMuc, TrangThai) VALUES (N'Sneaker', 1), (N'Running', 1), (N'Basketball', 1), (N'Training', 1), (N'Lifestyle', 1);

-- Thuong Hieu
INSERT INTO ThuongHieu (TenThuongHieu, TrangThai) VALUES (N'Nike', 1), (N'Adidas', 1), (N'Puma', 1), (N'Vans', 1), (N'Converse', 1), (N'New Balance', 1);

-- Xuat Xu
INSERT INTO XuatXu (TenXuatXu, TrangThai) VALUES (N'Vietnam', 1), (N'USA', 1), (N'China', 1), (N'Indonesia', 1), (N'Thailand', 1);

-- Mau Sac
INSERT INTO MauSac (TenMauSac, TrangThai) VALUES (N'Trắng', 1), (N'Đen', 1), (N'Xám', 1), (N'Đỏ', 1), (N'Xanh Blue', 1);

-- Kich Thuoc
INSERT INTO KichThuoc (TenKichThuoc, TrangThai) VALUES ('38', 1), ('39', 1), ('40', 1), ('41', 1), ('42', 1), ('43', 1), ('44', 1);

-- Nhan Vien (NO GENDER)
INSERT INTO NhanVien (TenNhanVien, Email, SoDienThoai, NgaySinh, DiaChi, VaiTro, MatKhau, CCCD, TrangThai)
VALUES 
(N'Nguyễn Văn Admin', 'admin@kingstep.com', '0912345678', '1990-01-01', N'Hà Nội', 1, '123456', '123456789012', 1),
(N'Trần Thị Nhân Viên', 'nhanvien@kingstep.com', '0922345678', '1995-05-05', N'TP HCM', 0, '123456', '123456789013', 1),
(N'Lê Bảo Khang', 'khang@gmail.com', '0933456789', '2000-10-10', N'Đà Nẵng', 0, '123456', '123456789014', 1);

-- Khach Hang (NO GENDER)
INSERT INTO KhachHang (TenKhachHang, Email, SoDienThoai, NgaySinh, DiaChi, matKhau, TrangThai)
VALUES 
(N'Khách Lẻ', 'khachle@gmail.com', '0000000000', NULL, NULL, NULL, 1),
(N'Phạm Văn A', 'phama@gmail.com', '0988777666', '1992-02-02', N'Hà Nội', '123456', 1),
(N'Hoàng Thị B', 'hoangb@gmail.com', '0977666555', '1994-04-04', N'Nam Định', '123456', 1),
(N'Nguyễn Văn C', 'vanc@gmail.com', '0966555444', '1996-06-06', N'Bắc Ninh', '123456', 1);

-- Voucher
INSERT INTO Voucher (MaVoucher, TenVoucher, LoaiVoucher, MoTa, SoLuong, DonToiThieu, GiaTri, NgayBatDau, NgayKetThuc, TrangThai)
VALUES 
('KINGSTEP10', N'Giảm 10%', 'PERCENT', N'Giảm 10% cho đơn hàng', 100, 500000, 10, '2026-01-01', '2026-12-31', 1),
('WELCOME100K', N'Giảm 100k', 'CASH', N'Giảm thẳng 100k', 100, 1000000, 100000, '2026-01-01', '2026-12-31', 1);

-- Khuyen Mai
INSERT INTO KhuyenMai (TenKhuyenMai, GiaTri, NgayBatDau, NgayKetThuc, TrangThai)
VALUES 
(N'Xả Hàng Hè', 20, '2026-04-01', '2026-05-01', 1),
(N'Mừng Lễ 30/4', 15, '2026-04-25', '2026-05-05', 1);

-- SanPham (30 San Pham)
INSERT INTO SanPham (TenSanPham, NgayTao, IdThuongHieu, IdXuatXu, IdChatLieu, IdDanhMuc, Images, TrangThai, Ma)
VALUES 
(N'Nike Air Force 1 07', '2026-04-07', 1, 1, 1, 1, 'af1_white.jpg', 1, 'SP001'),
(N'Adidas Ultraboost 22', '2026-04-07', 2, 1, 2, 2, 'ub22_black.jpg', 1, 'SP002'),
(N'Nike Air Jordan 1 Low', '2026-04-07', 1, 2, 1, 1, 'aj1_low.jpg', 1, 'SP003'),
(N'Vans Old Skool Classic', '2026-04-07', 4, 1, 3, 5, 'vans_old.jpg', 1, 'SP004'),
(N'Converse Chuck 70', '2026-04-07', 5, 1, 3, 5, 'cv_chuck.jpg', 1, 'SP005'),
(N'Nike Dunk Low Panda', '2026-04-07', 1, 3, 1, 1, 'dunk_panda.jpg', 1, 'SP006'),
(N'Adidas Forum Low', '2026-04-07', 2, 4, 1, 1, 'forum_low.jpg', 1, 'SP007'),
(N'Puma Suede Classic', '2026-04-07', 3, 1, 1, 5, 'puma_suede.jpg', 1, 'SP008'),
(N'New Balance 550', '2026-04-07', 6, 2, 1, 1, 'nb550.jpg', 1, 'SP009'),
(N'Nike Air Max 90', '2026-04-07', 1, 1, 4, 1, 'am90.jpg', 1, 'SP010'),
(N'Adidas Stan Smith', '2026-04-07', 2, 1, 1, 5, 'stansmith.jpg', 1, 'SP011'),
(N'Nike Air Force 1 Shadow', '2026-04-07', 1, 1, 1, 1, 'af1_shadow.jpg', 1, 'SP012'),
(N'Adidas NMD R1', '2026-04-07', 2, 3, 2, 2, 'nmd_r1.jpg', 1, 'SP013'),
(N'Vans Slip-On Checkerboard', '2026-04-07', 4, 1, 3, 5, 'vans_slipon.jpg', 1, 'SP014'),
(N'Converse Run Star Hike', '2026-04-07', 5, 2, 3, 5, 'cv_hike.jpg', 1, 'SP015'),
(N'Nike Blazer Mid 77', '2026-04-07', 1, 1, 1, 5, 'blazer77.jpg', 1, 'SP016'),
(N'Adidas Superstar', '2026-04-07', 2, 1, 1, 5, 'superstar.jpg', 1, 'SP017'),
(N'Puma Cali Dream', '2026-04-07', 3, 4, 1, 5, 'puma_cali.jpg', 1, 'SP018'),
(N'New Balance 2002R', '2026-04-07', 6, 1, 1, 2, 'nb2002r.jpg', 1, 'SP019'),
(N'Nike Air Zoom Pegasus 39', '2026-04-07', 1, 1, 2, 2, 'pegasus39.jpg', 1, 'SP020'),
(N'Adidas Yeezy Boost 350 V2', '2026-04-07', 2, 3, 5, 5, 'yeezy350.jpg', 1, 'SP021'),
(N'Nike Lebron 19', '2026-04-07', 1, 2, 5, 3, 'lebron19.jpg', 1, 'SP022'),
(N'Adidas Dame 8', '2026-04-07', 2, 3, 2, 3, 'dame8.jpg', 1, 'SP023'),
(N'Vans Sk8-Hi Black', '2026-04-07', 4, 1, 3, 5, 'sk8hi.jpg', 1, 'SP024'),
(N'Converse One Star Pro', '2026-04-07', 5, 1, 1, 5, 'onestar.jpg', 1, 'SP025'),
(N'Nike Air Max 270', '2026-04-07', 1, 3, 2, 1, 'am270.jpg', 1, 'SP026'),
(N'Adidas Ozweego', '2026-04-07', 2, 1, 1, 5, 'ozweego.jpg', 1, 'SP027'),
(N'Puma RS-X3', '2026-04-07', 3, 3, 4, 5, 'rsx3.jpg', 1, 'SP028'),
(N'New Balance 990v5', '2026-04-07', 6, 2, 1, 2, 'nb990.jpg', 1, 'SP029'),
(N'Nike React Vision', '2026-04-07', 1, 5, 2, 2, 'reactvision.jpg', 1, 'SP030');

-- SanPhamChiTiet (Bien the cho 30 san pham)
-- Mỗi sản phẩm có vài size/màu để test
INSERT INTO SanPhamChiTiet (SoLuong, NgaySanXuat, IdSanPham, IdKichThuoc, IdMauSac, IdKhuyenMai, NgayTao, TrangThai, GiaBan, GiaBanGiamGia, Ma)
SELECT 50, '2026-01-01', s.Id, k.Id, m.Id, NULL, GETDATE(), 1, 2500000, NULL, s.Ma + '-' + k.TenKichThuoc + '-' + m.TenMauSac
FROM SanPham s 
CROSS JOIN (SELECT Id, TenKichThuoc FROM KichThuoc WHERE TenKichThuoc IN ('40','41','42')) k
CROSS JOIN (SELECT Id, TenMauSac FROM MauSac WHERE TenMauSac IN (N'Trắng', N'Đen')) m;

-- Done!
PRINT 'KHOI TAO DATABASE KINGSTEP3 THANH CONG! KHONG CON GIOI TINH!';
