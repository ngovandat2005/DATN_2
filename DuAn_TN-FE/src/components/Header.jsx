import React, { useState, useRef, useEffect } from 'react';
import { Layout, Menu, Input, Button, Dropdown, message, Row, Col, Badge } from 'antd';
import './Header.css';
import axios from 'axios';
import config from '../config/config';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  SearchOutlined,
  UserOutlined,
  HeartOutlined,
  LoginOutlined,
  LogoutOutlined,
  HistoryOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { getCustomerId, getCustomerName, isLoggedIn, getUserRole, logout } from '../utils/authUtils';
import CartBadge from './CartBadge';

const { Header: AntHeader } = Layout;

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [userMenuItems, setUserMenuItems] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);

  // GỌI API THÔNG MINH
  useEffect(() => {
    const fetchMenuData = async () => {
      axios.get(config.getApiUrl('api/thuong-hieu/getAll'))
        .then(res => setBrands(res.data))
        .catch(err => console.error("Lỗi lấy thương hiệu:", err));

      axios.get(config.getApiUrl('api/danh-muc/getAll'))
        .then(res => setCategories(res.data))
        .catch(err => console.error("Lỗi lấy danh mục:", err));

      axios.get(config.getApiUrl('api/san-pham/active'))
        .then(res => setFeaturedProducts(res.data.slice(0, 8)))
        .catch(err => console.error("Lỗi lấy sản phẩm:", err));
    };

    fetchMenuData();
  }, []);

  const handleLogout = () => {
    logout();
    message.success('Đăng xuất thành công!');
    navigate('/home');
  };

  const updateMenuItems = () => {
    if (isLoggedIn()) {
      const customerName = getCustomerName();
      const userRole = getUserRole();
      
      const items = [
        { key: 'welcome', label: `Chào, ${customerName}!`, disabled: true, style: { fontWeight: 'bold' } },
        { key: 'divider1', type: 'divider' },
        { key: 'profile', label: 'Tài khoản', icon: <UserOutlined /> },
        { key: 'orders', label: 'Lịch sử đơn hàng', icon: <HistoryOutlined /> },
        userRole === 'NHANVIEN' && { key: 'admin', label: 'Quản trị', icon: <UserOutlined /> },
        { key: 'divider2', type: 'divider' },
        { key: 'logout', label: 'Thoát', icon: <LogoutOutlined /> },
      ].filter(Boolean);
      setUserMenuItems(items);
    } else {
      setUserMenuItems([
        { key: 'login', label: 'Đăng nhập', icon: <LoginOutlined /> },
        { key: 'register', label: 'Tạo tài khoản', icon: <UserOutlined /> },
      ]);
    }
  };

  useEffect(() => {
    updateMenuItems();
  }, [location.pathname]);

  const renderMegaMenu = () => {
    const finalProducts = featuredProducts.slice(0, 8); // Trình bày lại 8 sản phẩm như cũ

    return (
      <div className="mega-menu-content">
        <div className="mega-menu-inner">
          <Row gutter={[40, 0]}>
            <Col span={5}>
              <h3 className="mega-title">THƯƠNG HIỆU</h3>
              <ul className="mega-list">
                {brands.length > 0 ? brands.map(brand => (
                  <li key={brand.id}>
                    <Link onClick={closeMenu} to={`/products?idThuongHieu=${brand.id}`}>{brand.tenThuongHieu}</Link>
                  </li>
                )) : <li>Đang cập nhật...</li>}
              </ul>
            </Col>
            <Col span={5}>
              <h3 className="mega-title">DANH MỤC</h3>
              <ul className="mega-list">
                {categories.length > 0 ? categories.map(cat => (
                  <li key={cat.id}>
                    <Link onClick={closeMenu} to={`/products?idDanhMuc=${cat.id}`}>{cat.tenDanhMuc}</Link>
                  </li>
                )) : <li>Đang cập nhật...</li>}
              </ul>
            </Col>
            <Col span={14}>
              <div className="mega-featured-section">
                <h3 className="mega-title">SẢN PHẨM BÁN CHẠY</h3>
                <div className="mega-products-grid">
                  {finalProducts.length > 0 ? finalProducts.map((p) => (
                    <Link onClick={closeMenu} to={`/products/${p.id}`} key={p.id} className="mega-product-card">
                      <div className="mega-product-img">
                        <img 
                          src={p.images ? (p.images.startsWith('http') ? p.images.split(',')[0].trim() : `${config.baseUrl}images/${p.images.split(',')[0].trim()}`) : `${config.baseUrl}images/logo.png`} 
                          alt={p.tenSanPham} 
                          onError={(e) => { e.target.src = '/img/logo.png' }}
                        />
                      </div>
                      <div className="mega-product-info">
                        <span className="brand-tag">{p.thuongHieu?.tenThuongHieu || 'KING STEP'}</span>
                        <p className="product-name">{p.tenSanPham}</p>
                      </div>
                    </Link>
                  )) : (
                    <p style={{ color: '#888', gridColumn: 'span 4', textAlign: 'center', padding: '40px' }}>
                       Đang cập nhật sản phẩm...
                    </p>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  const accessoryMenu = (
    <div className="mega-menu-content" style={{ padding: '20px 30px', minWidth: '200px' }}>
      <h3 className="mega-title">PHỤ KIỆN CHĂM SÓC</h3>
      <ul className="mega-list">
        <li><Link onClick={closeMenu} to="/products?search=Vớ">Vớ Nam Premium</Link></li>
        <li><Link onClick={closeMenu} to="/products?search=Dây">Dây Giày Sneaker</Link></li>
        <li><Link onClick={closeMenu} to="/products?search=Vệ sinh">Bộ Vệ Sinh Giày</Link></li>
        <li><Link onClick={closeMenu} to="/products?search=Lót">Lót Giày Êm Chân</Link></li>
      </ul>
    </div>
  );

  return (
    <AntHeader className="custom-header">
      <div className="header-top" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px' }}>
        <Link to="/home" className="logo-link">
          <span className="text-logo">KING STEP</span>
        </Link>
        
        <div className="header-actions" style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)' }}>
          <div className="action-icons-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            <div className="search-group" style={{ display: 'flex', alignItems: 'center' }}>
              {showSearch && (
                <Input
                  ref={inputRef}
                  placeholder="Bạn tìm gì?"
                  prefix={<SearchOutlined />}
                  className="header-search-input"
                  size="small"
                  style={{ width: '200px', marginRight: '10px' }}
                  autoFocus
                />
              )}
              <Button type="text" icon={<SearchOutlined style={{ fontSize: '20px' }} />} onClick={() => setShowSearch(!showSearch)} />
            </div>

            <Link to="/cart" className="action-btn">
              <CartBadge />
            </Link>

            <Dropdown 
              menu={{ 
                items: userMenuItems,
                onClick: ({ key }) => {
                  if (key === 'login') navigate('/login');
                  if (key === 'register') navigate('/register');
                  if (key === 'profile') navigate('/profile');
                  if (key === 'orders') navigate('/orders');
                  if (key === 'admin') navigate('/admin-panel');
                  if (key === 'logout') handleLogout();
                }
              }} 
              trigger={['click']}
            >
              <Button type="text" icon={<UserOutlined style={{ fontSize: '20px' }} />} />
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="header-bottom">
        <div className="header-container" style={{ display: 'flex', justifyContent: 'center' }}>
          <Menu mode="horizontal" className="main-menu" selectable={false}>
            <Menu.Item key="nam">
              <Dropdown 
                open={menuOpen}
                onOpenChange={setMenuOpen}
                dropdownRender={() => renderMegaMenu()} 
                placement="bottomCenter" 
                arrow
              >
                <Link to="/products" onClick={() => setMenuOpen(false)}>SẢN PHẨM</Link>
              </Dropdown>
            </Menu.Item>
            <Menu.Item key="sale">
              <Link to="/sale" style={{ color: '#e53935', fontWeight: 'bold' }}>SALE OFF</Link>
            </Menu.Item>
            <Menu.Item key="phukien">
               <Dropdown dropdownRender={() => accessoryMenu} placement="bottomCenter" arrow>
                <Link to="/products?search=Phụ kiện">PHỤ KIỆN</Link>
               </Dropdown>
            </Menu.Item>
            <Menu.Item key="contact">
              <Link to="/contact">HỖ TRỢ</Link>
            </Menu.Item>
          </Menu>
        </div>
      </div>
    </AntHeader>


  );
}

export default Header;
