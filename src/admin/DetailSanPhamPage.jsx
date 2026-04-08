import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import axios from "axios";
import { Switch } from "antd";
import "../styles/AdminPanel.css";
import "../styles/SalePage.css";

// Thêm CSS animation cho modal
const modalStyles = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .modal-content {
    animation: slideIn 0.3s ease-out;
  }
`;

const DetailSanPhamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chiTietList, setChiTietList] = useState([]);
  const [loadingChiTiet, setLoadingChiTiet] = useState(false);

  // State cho filter biến thể
  const [filterMauSac, setFilterMauSac] = useState('');
  const [filterKichThuoc, setFilterKichThuoc] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('');
  // Tổng số lượng tất cả biến thể
  const tongSoLuong = chiTietList.reduce(
    (tong, ct) => tong + (ct.soLuong || 0),
    0
  );

  // State cho thêm biến thể
  const [showAddSpctModal, setShowAddSpctModal] = useState(false);
  const [mauSacs, setMauSacs] = useState([]);
  const [kichThuocs, setKichThuocs] = useState([]);
  const [spctForm, setSpctForm] = useState({
    ma: "", // ✅ THÊM: Mã SKU
    idMauSac: "",
    idKichThuoc: "",
    giaBan: "",
    soLuong: ""
  });

  // State cho sửa biến thể
  const [editSpct, setEditSpct] = useState(null);
  const [showEditSpctModal, setShowEditSpctModal] = useState(false);

  // Lấy thông tin sản phẩm
  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`http://localhost:8080/api/san-pham/${id}`)
        .then(res => {
          setProduct(res.data);
          fetchChiTietList(res.data.id, filterMauSac, filterKichThuoc, filterTrangThai);
        })
        .catch(err => {
          console.error("Lỗi khi lấy thông tin sản phẩm:", err);
          Swal.fire({
            icon: 'error',
            title: 'Không thể tải thông tin sản phẩm',
            text: 'Sản phẩm không tồn tại hoặc đã bị xóa',
            confirmButtonText: 'Quay lại'
          }).then(() => {
            navigate('/admin/san-pham');
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

  // Lấy màu sắc và kích thước
  useEffect(() => {
    axios.get("http://localhost:8080/api/mau-sac/getAll")
      .then(res => setMauSacs(res.data))
      .catch(() => setMauSacs([]));

    axios.get("http://localhost:8080/api/kich-thuoc/getAllFull")
      .then(res => setKichThuocs(res.data))
      .catch(() => setKichThuocs([]));
  }, []);

  // Hàm lấy danh sách biến thể theo filter
  const fetchChiTietList = (productId, mauSacId, kichThuocId, trangThai) => {
    if (!productId) return;

    const params = [];
    if (mauSacId) params.push(`mauSacId=${mauSacId}`);
    if (kichThuocId) params.push(`kichThuocId=${kichThuocId}`);
    if (trangThai !== '') params.push(`trangThai=${trangThai}`);
    const query = params.length > 0 ? `&${params.join('&')}` : '';

    setLoadingChiTiet(true);
    axios.get(`http://localhost:8080/api/san-pham-chi-tiet/bo-loc?sanPhamId=${productId}${query}`)
      .then((res) => setChiTietList(Array.isArray(res.data) ? res.data : [res.data]))
      .catch(() => setChiTietList([]))
      .finally(() => setLoadingChiTiet(false));
  };

  // Hàm thêm biến thể
  const handleAddSpct = async (e) => {
    e.preventDefault();

    // 1. Kiểm tra định dạng SKU (nếu có nhập)
    if (spctForm.ma && !/^[a-zA-Z0-9-_]+$/.test(spctForm.ma)) {
      Swal.fire({
        icon: 'error',
        title: 'Mã SKU không hợp lệ!',
        text: 'Mã SKU chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_), không có khoảng trắng.',
        confirmButtonColor: '#1976d2'
      });
      return;
    }

    // 2. Kiểm tra trùng SKU trong danh sách hiện tại
    if (spctForm.ma) {
      const isSkuDuplicate = chiTietList.some(ct => ct.ma?.trim().toLowerCase() === spctForm.ma.trim().toLowerCase());
      if (isSkuDuplicate) {
        Swal.fire({
          icon: 'error',
          title: 'Mã SKU đã tồn tại!',
          text: `Mã SKU "${spctForm.ma}" đã được sử dụng cho một biến thể khác của sản phẩm này.`,
          confirmButtonColor: '#d32f2f'
        });
        return;
      }
    }

    // 3. Kiểm tra giá bán hợp lệ
    if (Number(spctForm.giaBan) <= 0) {
      Swal.fire({ icon: 'error', title: 'Giá bán không hợp lệ!', text: 'Giá bán phải lớn hơn 0.' });
      return;
    }

    // 4. Kiểm tra mã SKU đã tồn tại ở các sản phẩm khác (Thực tế nên gọi API, ở đây check local trước)
    // Để triệt để, ta sẽ thêm một lớp bảo vệ khi nhận lỗi từ Backend ở khối catch

    // Kiểm tra trùng bộ (Màu sắc + Kích thước) ở FE
    const isDuplicate = chiTietList.some(
      (ct) =>
        String(ct.mauSac?.id || ct.idMauSac) === String(spctForm.idMauSac) &&
        String(ct.kichThuoc?.id || ct.idKichThuoc) === String(spctForm.idKichThuoc)
    );

    if (isDuplicate) {
      Swal.fire({
        icon: 'error',
        title: 'Biến thể đã tồn tại!',
        text: 'Màu sắc và Kích thước này đã có trong danh sách chi tiết của sản phẩm.',
        confirmButtonColor: '#d32f2f'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Xác nhận thêm biến thể?',
      text: "Vui lòng kiểm tra kỹ các thông tin trước khi xác nhận.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
      await axios.post(`http://localhost:8080/api/san-pham-chi-tiet/them/${product.id}`, {
        ma: spctForm.ma, 
        idKichThuoc: spctForm.idKichThuoc,
        idMauSac: spctForm.idMauSac,
        soLuong: Number(spctForm.soLuong),
        giaBan: Number(spctForm.giaBan),
      });

      setSpctForm({ ma: '', idMauSac: '', idKichThuoc: '', giaBan: '', soLuong: '' });
      fetchChiTietList(product.id, filterMauSac, filterKichThuoc, filterTrangThai);

      Swal.fire({ icon: 'success', title: 'Thêm biến thể thành công', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
      setShowAddSpctModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Mã SKU này có thể đã tồn tại ở một sản phẩm khác!';
      Swal.fire({ icon: 'error', title: 'Thêm thất bại!', text: msg });
    }
  };

  // Hàm sửa biến thể
  const handleEditSpct = async (e) => {
    e.preventDefault();

    // 1. Kiểm tra định dạng SKU
    if (editSpct.ma && !/^[a-zA-Z0-9-_]+$/.test(editSpct.ma)) {
      Swal.fire({ icon: 'error', title: 'Mã SKU không hợp lệ!', text: 'Mã SKU không được chứa ký tự đặc biệt.' });
      return;
    }

    // 2. Kiểm tra trùng bộ (Màu sắc + Kích thước)
    const isDuplicate = chiTietList.some(
      (ct) =>
        ct.id !== editSpct.id &&
        String(ct.mauSac?.id || ct.idMauSac) === String(editSpct.mauSac?.id || editSpct.idMauSac) &&
        String(ct.kichThuoc?.id || ct.idKichThuoc) === String(editSpct.kichThuoc?.id || editSpct.idKichThuoc)
    );

    if (isDuplicate) {
      Swal.fire({ icon: 'error', title: 'Biến thể đã tồn tại!', text: 'Màu và size này đã được sử dụng.' });
      return;
    }

    const result = await Swal.fire({
      title: 'Xác nhận cập nhật?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
      const currentVariant = chiTietList.find(ct => ct.id === editSpct.id);
      const newPrice = Number(editSpct.giaBan);
      const promo = currentVariant?.khuyenMai;
      const isActivePromo = promo && promo.trangThai === 1 && promo.giaTri > 0;

      // THIẾT QUÂN LUẬT: Nếu không có KM đang chạy, giá giảm PHẢI bị xóa bỏ (null)
      let updatedGiaBanGiamGia = null;

      if (isActivePromo) {
        // Nếu có KM đang chạy, tính toán lại giá giảm dựa trên % khuyến mãi và giá mới
        updatedGiaBanGiamGia = Math.round(newPrice * (1 - promo.giaTri / 100));
      }

      await axios.put(`http://localhost:8080/api/san-pham-chi-tiet/sua/${editSpct.id}`, {
        ma: editSpct.ma,
        giaBan: newPrice,
        soLuong: editSpct.soLuong,
        idMauSac: editSpct.mauSac?.id || editSpct.idMauSac,
        idKichThuoc: editSpct.kichThuoc?.id || editSpct.idKichThuoc,
        giaBanGiamGia: updatedGiaBanGiamGia // Sẽ là null nếu không có KM
      });

      Swal.fire({ icon: 'success', title: 'Cập nhật thành công', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
      setShowEditSpctModal(false);
      fetchChiTietList(product.id, filterMauSac, filterKichThuoc, filterTrangThai);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Lỗi cập nhật dữ liệu!';
      Swal.fire({ icon: 'error', title: 'Thất bại', text: msg });
    }
  };

  // Hàm xóa biến thể
  const handleDeleteSpct = async (spctId) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa vĩnh viễn biến thể này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8080/api/san-pham-chi-tiet/${spctId}`);
      fetchChiTietList(product.id, filterMauSac, filterKichThuoc, filterTrangThai);
      Swal.fire({
        icon: 'success',
        title: 'Đã xóa biến thể thành công!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        width: 250
      });
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể xóa biến thể', 'error');
    }
  };

  // Hàm đổi trạng thái biến thể
  const handleChangeTrangThaiSpct = async (spct) => {
    const result = await Swal.fire({
      title: spct.trangThai === 1
        ? 'Bạn có chắc chắn muốn ngừng bán biến thể này?'
        : 'Bạn có chắc chắn muốn tiếp tục bán biến thể này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có',
      cancelButtonText: 'Không',
    });

    if (!result.isConfirmed) return;

    try {
      if (spct.trangThai === 1) {
        await axios.put(`http://localhost:8080/api/san-pham-chi-tiet/xoa/${spct.id}`);
      } else {
        await axios.put(`http://localhost:8080/api/san-pham-chi-tiet/khoi-phuc/${spct.id}`);
      }

      fetchChiTietList(product.id, filterMauSac, filterKichThuoc, filterTrangThai);

      Swal.fire({
        icon: 'success',
        title: 'Cập nhật trạng thái thành công!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        width: 250
      });
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể cập nhật trạng thái biến thể', 'error');
    }
  };

  // 🪄 HÀM DỌN DẸP DỮ LIỆU RÁC (THẦN TỐC)
  const handleCleanUpPrices = async () => {
    // 1. Log ra những biến thể "bị lỗi" (không có KM nhưng lại có giá giảm rác trong DB)
    const variantsToFix = chiTietList.filter(ct => {
      const promo = ct.khuyenMai;
      const isActivePromo = promo && promo.trangThai === 1 && promo.giaTri > 0;
      // Lỗi là khi không có KM mà giá giảm vẫn khác (null/0/giá gốc)
      return !isActivePromo && ct.giaBanGiamGia !== null && ct.giaBanGiamGia !== ct.giaBan;
    });

    if (variantsToFix.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Dữ liệu đã sạch!',
        text: 'Toàn bộ biến thể của sản phẩm này hiện tại đã chuẩn dữ liệu SQL.',
        timer: 1500,
        showConfirmButton: false
      });
      return;
    }

    const confirm = await Swal.fire({
      title: 'Xác nhận dọn dẹp?',
      text: `Hệ thống đã tìm thấy ${variantsToFix.length} biến thể có dữ liệu giá ảo trong SQL. Bạn có muốn dọn dẹp ngay?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff9800',
      confirmButtonText: '🪄 Dọn dẹp ngay!',
      cancelButtonText: 'Hủy'
    });

    if (!confirm.isConfirmed) return;

    Swal.fire({
      title: 'Đang thanh tẩy dữ liệu...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      // 2. Chạy dọn dẹp hàng loạt bằng Promise.all
      await Promise.all(variantsToFix.map(ct => 
        axios.put(`http://localhost:8080/api/san-pham-chi-tiet/sua/${ct.id}`, {
          ma: ct.ma,
          giaBan: ct.giaBan,
          soLuong: ct.soLuong,
          idMauSac: ct.mauSac?.id || ct.idMauSac,
          idKichThuoc: ct.kichThuoc?.id || ct.idKichThuoc,
          giaBanGiamGia: null // Đưa về null để SQL sạch bóng
        })
      ));

      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Thanh tẩy thành công!',
        text: `Đã dọn dẹp sạch ${variantsToFix.length} biến thể trong SQL.`,
        timer: 1500,
        showConfirmButton: false
      });
      
      // Tải lại danh sách
      fetchChiTietList(product.id, filterMauSac, filterKichThuoc, filterTrangThai);
    } catch (err) {
      Swal.fire('Lỗi dọn dẹp', 'Không thể cập nhật SQL hàng loạt!', 'error');
    }
  };

  // Hàm xử lý đường dẫn ảnh
  const getImageUrl = (img) => {
    if (!img) return '/default-image.png';
    if (Array.isArray(img)) img = img[0];
    if (typeof img === 'string' && img.includes(',')) img = img.split(',')[0];
    img = img.trim();
    if (!img) return '/default-image.png';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return 'http://localhost:8080' + img;

    // Sử dụng endpoint mới /api/images/
    return `http://localhost:8080/images/${encodeURIComponent(img)}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div>Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div>Sản phẩm không tồn tại</div>
      </div>
    );
  }

  return (
    <>
      <style>{modalStyles}</style>
      <div className="banhang-container" style={{ flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <button
              onClick={() => navigate('/admin-panel/products')}
              style={{
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '8px 16px',
                cursor: 'pointer',
                marginRight: 16
              }}
            >
              ← Quay lại
            </button>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>Chi tiết sản phẩm</h1>
          </div>
          <button
            onClick={() => setShowAddSpctModal(true)}
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '8px 16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + Thêm biến thể
          </button>
        </div>

        {/* Thông tin sản phẩm */}
        <div style={{
          background: '#fff',
          padding: 24,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: 24
        }}>
          <div style={{ flex: '0 0 200px' }}>
            <img
              src={getImageUrl(product.images)}
              alt={product.tenSanPham}
              style={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
                borderRadius: 8,
                border: '1px solid #eee'
              }}
              onError={e => {
                console.error(`Product image failed to load: ${product.images}`);
                e.target.src = "/logo.png";
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: 24, fontWeight: 600 }}>
              {product.tenSanPham}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <strong>Danh mục:</strong> {product.danhMuc?.tenDanhMuc || '-'}
              </div>
              <div>
                <strong>Thương hiệu:</strong> {product.thuongHieu?.tenThuongHieu || '-'}
              </div>
              <div>
                <strong>Chất liệu:</strong> {product.chatLieu?.tenChatLieu || '-'}
              </div>
              <div>
                <strong>Xuất xứ:</strong> {product.xuatXu?.tenXuatXu || '-'}
              </div>
              <div>
                <strong>Trạng thái:</strong>
                <span style={{
                  color: product.trangThai === 1 ? '#43a047' : '#e53935',
                  fontWeight: 600,
                  marginLeft: 8
                }}>
                  {product.trangThai === 1 ? 'Đang bán' : 'Ngừng bán'}
                </span>
              </div>
              <div>
                <strong>Tổng số lượng:</strong>
                <span style={{
                  fontWeight: 600,
                  marginLeft: 8,
                  color: '#1976d2'
                }}>
                  {tongSoLuong}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Bộ log biến thể */}
        <div style={{
          background: '#f9f9f9',
          padding: 16,
          borderRadius: 8,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <select
            value={filterMauSac}
            onChange={e => {
              setFilterMauSac(e.target.value);
              fetchChiTietList(product.id, e.target.value, filterKichThuoc, filterTrangThai);
            }}
            style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #ccc' }}
          >
            <option value="">Tất cả màu sắc</option>
            {mauSacs.map(ms => <option key={ms.id} value={ms.id}>{ms.tenMauSac}</option>)}
          </select>

          <select
            value={filterKichThuoc}
            onChange={e => {
              setFilterKichThuoc(e.target.value);
              fetchChiTietList(product.id, filterMauSac, e.target.value, filterTrangThai);
            }}
            style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #ccc' }}
          >
            <option value="">Tất cả kích thước</option>
            {kichThuocs.map(kt => <option key={kt.id} value={kt.id}>{kt.tenKichThuoc}</option>)}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontWeight: 500 }}>Trạng thái:</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="radio"
                name="filterTrangThai"
                value=""
                checked={filterTrangThai === ''}
                onChange={e => {
                  setFilterTrangThai('');
                  fetchChiTietList(product.id, filterMauSac, filterKichThuoc, '');
                }}
              /> Tất cả
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="radio"
                name="filterTrangThai"
                value="1"
                checked={filterTrangThai === '1'}
                onChange={e => {
                  setFilterTrangThai('1');
                  fetchChiTietList(product.id, filterMauSac, filterKichThuoc, '1');
                }}
              /> Đang bán
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="radio"
                name="filterTrangThai"
                value="0"
                checked={filterTrangThai === '0'}
                onChange={e => {
                  setFilterTrangThai('0');
                  fetchChiTietList(product.id, filterMauSac, filterKichThuoc, '0');
                }}
              /> Ngừng bán
            </label>
          </div>
        </div>

        {/* Bảng biến thể sản phẩm */}
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #eee' }}>
            <h3 style={{ margin: 0 }}>Danh sách biến thể sản phẩm</h3>
          </div>

          {loadingChiTiet ? (
            <div style={{ padding: 24, textAlign: 'center' }}>Đang tải...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="cart-table" style={{ minWidth: 800, width: '100%' }}>
                <thead>
                  <tr>
                    <th>Mã SKU</th>
                    <th>Màu sắc</th>
                    <th>Kích thước</th>
                    <th>Giá bán</th>
                    <th>Giá bán sau giảm</th>
                    <th>Số lượng</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {chiTietList.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>
                        Chưa có biến thể nào
                      </td>
                    </tr>
                  ) : (
                    chiTietList.map((ct) => (
                      <tr key={ct.id}>
                        <td style={{ fontWeight: 'bold', color: '#1976d2' }}>{ct.ma || "-"}</td>
                        <td>{ct.mauSac?.tenMauSac || "-"}</td>
                        <td>{ct.kichThuoc?.tenKichThuoc || "-"}</td>
                        <td>{ct.giaBan?.toLocaleString() || "-"}</td>
                        <td>
                          {(() => {
                            const promo = ct.khuyenMai;
                            const isActivePromo = promo && promo.trangThai === 1 && promo.giaTri > 0;
                            const salePrice = ct.giaBanGiamGia;

                            if (isActivePromo) {
                              // Nếu có KM đang chạy, tính toán giá giảm
                              const displaySalePrice = (salePrice > 0 && salePrice < ct.giaBan) 
                                ? salePrice 
                                : Math.round(ct.giaBan * (1 - promo.giaTri / 100));

                              return (
                                <>
                                  {displaySalePrice.toLocaleString()} ₫
                                  <span style={{ color: '#ff4d4f', marginLeft: 8, fontWeight: 'bold' }}>
                                    (-{promo.giaTri}%)
                                  </span>
                                </>
                              );
                            }
                            // Nếu không có KM, hiển thị đúng bằng giá gốc (2,000,000đ)
                            return `${(ct.giaBan || 0).toLocaleString()} ₫`;
                          })()}
                        </td>
                        <td>{ct.soLuong ?? "-"}</td>
                        <td>
                          <Switch
                            checked={ct.trangThai === 1}
                            checkedChildren=""
                            unCheckedChildren=""
                            style={{ backgroundColor: ct.trangThai === 1 ? '#43a047' : '#e53935' }}
                            onChange={() => handleChangeTrangThaiSpct(ct)}
                          />
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setEditSpct({ ...ct });
                              setShowEditSpctModal(true);
                            }}
                            style={{
                              background: "#43a047",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              padding: "4px 10px",
                              cursor: "pointer",
                              opacity: 0.8,
                              marginRight: 8
                            }}
                          >
                            Sửa
                          </button>
                          <button
                          onClick={() => handleDeleteSpct(ct.id)}
                          style={{ 
                            background: "#e53935", 
                            color: "#fff", 
                            border: "none", 
                            borderRadius: 4, 
                            padding: "4px 10px", 
                            cursor: "pointer", 
                            opacity: 0.8 
                          }}
                        >
                          Xóa
                        </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal thêm biến thể */}
        {showAddSpctModal && (
          <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="modal-content" style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '32px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid #f0f0f0'
              }}>
                <h3 style={{
                  margin: 0,
                  color: '#1976d2',
                  fontSize: '24px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '28px' }}>✨</span>
                  Thêm biến thể cho: {product.tenSanPham}
                </h3>
                <button
                  onClick={() => setShowAddSpctModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#999',
                    padding: '4px',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddSpct} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                    🆔 Mã SKU
                  </label>
                  <input 
                    type="text" 
                    placeholder="Nhập mã SKU (Tùy chọn)..." 
                    value={spctForm.ma} 
                    onChange={e => setSpctForm(f => ({ ...f, ma: e.target.value }))} 
                    style={{
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: '#fff',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '4px'
                  }}>
                    🎨 Màu sắc
                  </label>
                  <select
                    required
                    value={spctForm.idMauSac}
                    onChange={e => setSpctForm(f => ({ ...f, idMauSac: e.target.value }))}
                    style={{
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: '#fff',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  >
                    <option value="">Chọn màu sắc</option>
                    {mauSacs.map(ms => <option key={ms.id} value={ms.id}>{ms.tenMauSac}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '4px'
                  }}>
                    📏 Kích thước
                  </label>
                  <select
                    required
                    value={spctForm.idKichThuoc}
                    onChange={e => setSpctForm(f => ({ ...f, idKichThuoc: e.target.value }))}
                    style={{
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: '#fff',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  >
                    <option value="">Chọn kích thước</option>
                    {kichThuocs.map(kt => <option key={kt.id} value={kt.id}>{kt.tenKichThuoc}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '4px'
                  }}>
                    💰 Giá bán
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Nhập giá bán..."
                    value={spctForm.giaBan}
                    onChange={e => setSpctForm(f => ({ ...f, giaBan: e.target.value }))}
                    style={{
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: '#fff',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '4px'
                  }}>
                    📦 Số lượng
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Nhập số lượng..."
                    value={spctForm.soLuong}
                    onChange={e => setSpctForm(f => ({ ...f, soLuong: e.target.value }))}
                    style={{
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: '#fff',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{
                  display: "flex",
                  gap: "16px",
                  marginTop: "24px",
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={() => setShowAddSpctModal(false)}
                    style={{
                      background: "#f5f5f5",
                      color: "#666",
                      border: "2px solid #e0e0e0",
                      borderRadius: "12px",
                      padding: "14px 24px",
                      fontWeight: "600",
                      fontSize: "16px",
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#e0e0e0';
                      e.target.style.borderColor = '#ccc';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f5f5f5';
                      e.target.style.borderColor = '#e0e0e0';
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, #1976d2, #1565c0)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      padding: "14px 32px",
                      fontWeight: "700",
                      fontSize: "16px",
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(25, 118, 210, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)';
                    }}
                  >
                    ✨ Thêm biến thể
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal sửa biến thể */}
        {showEditSpctModal && editSpct && (
          <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="modal-content" style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '32px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid #f0f0f0'
              }}>
                <h3 style={{
                  margin: 0,
                  color: '#1976d2',
                  fontSize: '24px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '28px' }}>✏️</span>
                  Sửa biến thể
                </h3>
                <button
                  onClick={() => {
                    setShowEditSpctModal(false);
                    setEditSpct(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#999',
                    padding: '4px',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleEditSpct} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Thông báo về giá khuyến mãi */}
                {editSpct.giaBanGiamGia && (
                  <div style={{
                    background: '#e3f2fd',
                    border: '1px solid #1976d2',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#1976d2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '16px' }}>ℹ️</span>
                    <span>
                      <strong>Lưu ý:</strong> Khi thay đổi giá bán, giá khuyến mãi sẽ được tự động cập nhật
                      để duy trì tỷ lệ giảm giá hiện tại.
                    </span>
                  </div>
                )}

                {/* Thông báo về việc tự động cập nhật giá khuyến mãi */}
                {(editSpct.idKhuyenMai || editSpct.giaBanGiamGia) && (
                  <div style={{
                    background: '#e8f5e8',
                    border: '1px solid #4caf50',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#2e7d32',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '16px' }}>💡</span>
                    <span>
                      <strong>Thông tin:</strong> Khi thay đổi giá bán, giá khuyến mãi sẽ được tự động cập nhật
                      để duy trì tỷ lệ giảm giá hiện tại. Khuyến mãi sẽ được giữ nguyên.
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                    🆔 Mã SKU
                  </label>
                  <input 
                    type="text" 
                    placeholder="Nhập mã SKU..." 
                    value={editSpct.ma} 
                    onChange={e => setEditSpct(f => ({ ...f, ma: e.target.value }))} 
                    style={{
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: '#fff',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '4px'
                  }}>
                    🎨 Màu sắc
                  </label>
                  <select
                    value={editSpct.mauSac?.id || editSpct.idMauSac || ""}
                    onChange={e => setEditSpct(f => ({
                      ...f,
                      mauSac: mauSacs.find(ms => ms.id === Number(e.target.value))
                    }))}
                    required
                    style={{
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: '#fff',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  >
                    <option value="">Chọn màu sắc</option>
                    {mauSacs.map(ms => (
                      <option key={ms.id} value={ms.id}>{ms.tenMauSac}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '4px'
                  }}>
                    📏 Kích thước
                  </label>
                  <select
                    value={editSpct.kichThuoc?.id || editSpct.idKichThuoc || ""}
                    onChange={e => setEditSpct(f => ({
                      ...f,
                      kichThuoc: kichThuocs.find(kt => kt.id === Number(e.target.value))
                    }))}
                    required
                    style={{
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: '#fff',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  >
                    <option value="">Chọn kích thước</option>
                    {kichThuocs.map(kt => (
                      <option key={kt.id} value={kt.id}>{kt.tenKichThuoc}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '4px'
                  }}>
                    💰 Giá bán
                  </label>
                  <input
                    type="number"
                    required
                    value={editSpct.giaBan}
                    onChange={e => setEditSpct(f => ({ ...f, giaBan: e.target.value }))}
                    style={{
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: '#fff',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '4px'
                  }}>
                    📦 Số lượng
                  </label>
                  <input
                    type="number"
                    required
                    value={editSpct.soLuong}
                    onChange={e => setEditSpct(f => ({ ...f, soLuong: e.target.value }))}
                    style={{
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: '#fff',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{
                  display: "flex",
                  gap: "16px",
                  marginTop: "24px",
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditSpctModal(false);
                      setEditSpct(null);
                    }}
                    style={{
                      background: "#f5f5f5",
                      color: "#666",
                      border: "2px solid #e0e0e0",
                      borderRadius: "12px",
                      padding: "14px 24px",
                      fontWeight: "600",
                      fontSize: "16px",
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#e0e0e0';
                      e.target.style.borderColor = '#ccc';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f5f5f5';
                      e.target.style.borderColor = '#e0e0e0';
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, #1976d2, #1565c0)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      padding: "14px 32px",
                      fontWeight: "700",
                      fontSize: "16px",
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(25, 118, 210, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)';
                    }}
                  >
                    💾 Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DetailSanPhamPage; 