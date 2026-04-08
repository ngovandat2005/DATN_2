import React, { useState, useRef, useEffect } from 'react';
import { Layout, Menu, Input, Button, Dropdown, message } from 'antd';
import './Header.css';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  SearchOutlined,
  UserOutlined,
  HeartOutlined,
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { getCustomerId, getCustomerName, isLoggedIn, getUserRole, logout } from '../utils/authUtils';
import CartBadge from './CartBadge';

const { Header: AntHeader } = Layout;

const menuItems = [
  { key: 'home', label: <Link to="/home">Trang chủ</Link> },
  { key: 'products', label: <Link to="/products">Sản phẩm</Link> },
  { key: 'blog', label: <Link to="/blog">Tin tức</Link> },
  { key: 'contact', label: <Link to="/contact">Liên hệ</Link> },
];

// Menu user sẽ được cập nhật động dựa trên trạng thái đăng nhập

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedKey = menuItems.find(item => location.pathname.startsWith('/' + item.key))?.key || 'home';

  const [showSearch, setShowSearch] = useState(false);
  const [userMenuItems, setUserMenuItems] = useState([
    // Menu mặc định
    {
      key: 'default',
      label: 'Đang tải...',
      disabled: true
    }
  ]);
  const inputRef = useRef(null);

  // Hàm cập nhật menu user
  const updateMenuItems = () => {
    console.log('🔄 Header: Cập nhật menu user...');
    
    if (isLoggedIn()) {
      const customerName = getCustomerName();
      const userRole = getUserRole();
      
      if (userRole === 'KHACH') {
        const items = [
          { 
            key: 'welcome', 
            label: `Xin chào, ${customerName || 'Khách hàng'}!`,
            disabled: true,
            style: { color: '#1890ff', fontWeight: 'bold' }
          },
          { key: 'divider1', type: 'divider' },
          {
            key: 'profile',
            label: 'Thông tin cá nhân',
            icon: <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          },
          {
            key: 'orders',
            label: 'Đơn hàng của tôi',
            icon: <HeartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          },
          { key: 'divider2', type: 'divider' },
          { 
            key: 'logout', 
            label: 'Đăng xuất',
            icon: <LogoutOutlined />
          },
        ];
        setUserMenuItems(items);
      } else if (userRole === 'NHANVIEN') {
        const items = [
          { 
            key: 'welcome', 
            label: `Nhân viên: ${customerName || 'Admin'}`,
            disabled: true,
            style: { color: '#52c41a', fontWeight: 'bold' }
          },
          { key: 'divider1', type: 'divider' },
          {
            key: 'admin',
            label: 'Quản lý hệ thống',
            icon: <UserOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          },
          { key: 'divider2', type: 'divider' },
          { 
            key: 'logout', 
            label: 'Đăng xuất',
            icon: <LogoutOutlined />
          },
        ];
        setUserMenuItems(items);
      }
    } else {
      const items = [
        {
          key: 'login',
          label: 'Đăng nhập',
          icon: <LoginOutlined style={{ marginRight: 8 }} />
        },
        {
          key: 'register',
          label: 'Đăng ký',
          icon: <UserOutlined style={{ marginRight: 8 }} />
        },
        { key: 'divider1', type: 'divider' },
        {
          key: 'cart',
          label: 'Giỏ hàng',
          icon: <CartBadge />
        },
      ];
      setUserMenuItems(items);
    }
  };

  // Cập nhật khi mount và khi path thay đổi
  useEffect(() => {
    updateMenuItems();
  }, [location.pathname]);

  // Lắng nghe thay đổi localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 Header: localStorage changed, updating menu...');
      updateMenuItems();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Kiểm tra định kỳ để khắc phục race conditions khi login
    const interval = setInterval(() => {
      const loggedIn = isLoggedIn();
      const hasDefaultMenu = userMenuItems.length === 1 && userMenuItems[0].key === 'default';
      
      if (loggedIn && hasDefaultMenu) {
        updateMenuItems();
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [userMenuItems.length]);

  // ✅ XỬ LÝ ĐĂNG XUẤT
  const handleLogout = () => {
    logout();
    message.success('Đăng xuất thành công!');
    navigate('/home');
  };

  // Auto focus khi hiện input
  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch]);

  console.log('🔄 Header: userMenuItems hiện tại =', userMenuItems);
  console.log('🔄 Header: userMenuItems length =', userMenuItems.length);
  console.log('🔄 Header: userMenuItems[0] =', userMenuItems[0]);

  return (
    <AntHeader className="custom-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/home" className="logo-link">
          <img src="/logo.png" alt="Logo" className="header-logo" />
        </Link>

        {/* Menu chính */}
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className="main-menu"
        />

        {/* Hành động bên phải */}
        <div className="header-actions">
          {/* Toggle Search */}
          <div className="search-toggle">
            {showSearch ? (
              <Input
                ref={inputRef}
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined />}
                className="header-search-input"
                size="large"
                onBlur={() => setShowSearch(false)}
              />
            ) : (
              <Button
                type="text"
                icon={<SearchOutlined style={{ fontSize: '20px' }} />}
                onClick={() => setShowSearch(true)}
                size="large"
                className="search-toggle-btn"
              />
            )}
          </div>

          {/* ✅ GIỎ HÀNG - Đặt cạnh icon tìm kiếm */}
          {isLoggedIn() && getUserRole() === 'KHACH' && (
            <Link to="/cart" className="cart-link">
              <CartBadge />
            </Link>
          )}

          {/* Dropdown menu chính cho user */}
          <Dropdown 
            menu={{ 
              items: userMenuItems,
              onClick: ({ key }) => {
                console.log('🔄 Menu item clicked:', key);
                // Xử lý click menu item
                if (key === 'login') navigate('/login');
                if (key === 'register') navigate('/register');
                if (key === 'profile') navigate('/profile');
                if (key === 'orders') navigate('/orders');
                if (key === 'wishlist') navigate('/wishlist');
                if (key === 'admin') navigate('/admin-panel');
                if (key === 'logout') handleLogout();
              }
            }} 
            placement="bottomRight" 
            trigger={['click']}
          >
            <Button 
              type="text" 
              icon={<UserOutlined />} 
              size="large"
              style={{ cursor: 'pointer' }}
            />
          </Dropdown>
        </div>
      </div>
    </AntHeader>
  );
}

export default Header;
