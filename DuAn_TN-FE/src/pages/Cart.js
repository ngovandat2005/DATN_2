import React, { useState, useEffect } from 'react';
import { Button, InputNumber, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCustomerId, isLoggedIn } from '../utils/authUtils';
import config from '../config/config';
import './Cart.css';

function Cart() {
  const [cart, setCart] = useState([]);
  const customerId = getCustomerId();
  const navigate = useNavigate();

  // 1. Kiểm tra đăng nhập
  useEffect(() => {
    if (!isLoggedIn() || !customerId) {
      message.warning('Vui lòng đăng nhập để xem giỏ hàng!');
      navigate('/login');
    }
  }, [customerId, navigate]);

  // 2. Fetch giỏ hàng
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(config.getApiUrl(`api/gio-hang-chi-tiet/${customerId}`));
        setCart(response.data);
      } catch (error) {
        console.error('Lỗi khi fetch giỏ hàng:', error);
        message.error('Không thể tải dữ liệu giỏ hàng.');
      }
    };
    if (customerId) fetchCart();
  }, [customerId]);

  // 3. Thay đổi số lượng
  const handleQuantityChange = async (item, newQuantity) => {
    const stock = item.sanPhamChiTiet?.soLuong || 0;
    if (newQuantity > stock) {
      message.warning(`Trong kho chỉ còn ${stock} sản phẩm.`);
      return;
    }

    try {
      await axios.put(config.getApiUrl(`api/gio-hang-chi-tiet/cap-nhat`), null, {
        params: { id: item.id, soLuongMoi: newQuantity }
      });
      setCart(prev => prev.map(i => i.id === item.id ? { ...i, soLuong: newQuantity } : i));
    } catch (error) {
      message.error('Cập nhật số lượng thất bại.');
    }
  };

  // 4. Xóa toàn bộ
  const handleDeleteAll = async () => {
    try {
      await axios.delete(config.getApiUrl(`api/gio-hang-chi-tiet/xoa-tat-ca/${customerId}`));
      setCart([]);
      message.success('Đã làm trống giỏ hàng.');
    } catch (error) {
      message.error('Xóa giỏ hàng thất bại.');
    }
  };

  // 5. Xóa từng món
  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(config.getApiUrl(`api/gio-hang-chi-tiet/xoa/${id}`));
      setCart(prev => prev.filter(item => item.id !== id));
      message.success('Đã xóa sản phẩm.');
    } catch (error) {
      message.error('Xóa sản phẩm thất bại.');
    }
  };

  // 6. Tính tổng tiền
  const calculateItemPrice = (item) => {
    const spct = item.sanPhamChiTiet;
    if (!spct) return 0;
    // Chốt hạ giá: Chỉ sử dụng giá giảm nếu nó > 1000đ và nhỏ hơn giá gốc
    return (spct.giaBanGiamGia && spct.giaBanGiamGia > 1000 && spct.giaBanGiamGia < spct.giaBan)
      ? spct.giaBanGiamGia
      : spct.giaBan;
  };

  const total = cart.reduce((sum, item) => sum + (calculateItemPrice(item) * item.soLuong), 0);

  return (
    <div className="gx-cart-root gx-cart-full-bg">
      <div className="gx-cart-title-row">
        <ShoppingCartOutlined style={{ fontSize: 32, color: '#ff6600', marginRight: 12 }} />
        <span className="gx-cart-title">Giỏ hàng của bạn</span>
      </div>

      <div className="gx-cart-table-wrap">
        <table className="gx-cart-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Thuộc tính</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Thành tiền</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cart.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>
                  Giỏ hàng của bạn đang trống. <Link to="/products">Mua ngay!</Link>
                </td>
              </tr>
            ) : cart.map(item => {
              const spct = item.sanPhamChiTiet;
              const sp = spct?.sanPham;
              const productPrice = calculateItemPrice(item);

              return (
                <tr key={item.id} className="gx-cart-row">
                  <td className="gx-cart-product">
                    <img
                      src={sp?.images ? `${config.baseUrl}images/${sp.images.split(',')[0].trim()}` : `${config.baseUrl}images/logo.png`}
                      alt={sp?.tenSanPham}
                      onError={(e) => { e.target.src = `${config.baseUrl}images/logo.png` }}
                      style={{ width: 80, height: 80, objectFit: 'cover', marginRight: 12, borderRadius: 8 }}
                    />
                    <div className="gx-cart-info">
                      <Link to={`/products/${sp?.id || '#'}`} className="gx-cart-name">
                        <b>{sp?.tenSanPham || 'Đang tải...'}</b>
                      </Link>
                    </div>
                  </td>
                  <td className="gx-cart-variant">
                    <span>Màu: {spct?.mauSac?.tenMauSac || '--'}</span><br />
                    <span>Size: {spct?.kichThuoc?.tenKichThuoc || '--'}</span>
                  </td>
                  <td className="gx-cart-price">
                    {/* Chốt hạ giá: Chỉ hiện giá giảm nếu nó > 1000đ và thực sự nhỏ hơn giá gốc */}
                    {spct?.giaBanGiamGia > 1000 && spct?.giaBanGiamGia < spct?.giaBan ? (
                      <div>
                        <div className="old-price">{spct.giaBan.toLocaleString()}đ</div>
                        <div className="new-price">{spct.giaBanGiamGia.toLocaleString()}đ</div>
                      </div>
                    ) : (
                      <span>{spct?.giaBan?.toLocaleString()}đ</span>
                    )}
                  </td>
                  <td className="gx-cart-quantity">
                    <div className="qty-control">
                      <Button size="small" onClick={() => handleQuantityChange(item, item.soLuong - 1)} disabled={item.soLuong <= 1}>-</Button>
                      <InputNumber min={1} max={spct?.soLuong || 100} value={item.soLuong} onChange={(val) => handleQuantityChange(item, val)} style={{ width: 50, margin: '0 5px' }} />
                      <Button size="small" onClick={() => handleQuantityChange(item, item.soLuong + 1)}>+</Button>
                    </div>
                  </td>
                  <td className="gx-cart-total">
                    <b>{(productPrice * item.soLuong).toLocaleString()}đ</b>
                  </td>
                  <td className="gx-cart-action">
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteItem(item.id)} shape="circle" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="gx-cart-bottom-row">
        <Button danger onClick={handleDeleteAll} disabled={cart.length === 0} style={{ borderRadius: 8 }}>
          Xóa tất cả
        </Button>

        {cart.length > 0 && (
          <div className="gx-cart-summary-box">
            <div className="summary-total">
              <span>Tổng thanh toán:</span>
              <span className="total-amount">{total.toLocaleString()} ₫</span>
            </div>
            <Button type="primary" className="checkout-btn" onClick={() => navigate('/payment', { state: { cart, total } })}>
              TIẾN HÀNH THANH TOÁN
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
