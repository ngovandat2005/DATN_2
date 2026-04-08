// Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.currentTarget as HTMLFormElement).email.value;
    const password = (e.currentTarget as HTMLFormElement).password.value;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) throw new Error('Login failed');
      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/client/customer');
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
    }
  };

  const handleGoogleLoginSuccess = async (response: any) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential })
      });

      if (!res.ok) throw new Error('Google login failed');

      const data = await res.json();
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/client/customer');
    } catch (err) {
      console.error('Lỗi đăng nhập Google:', err);
    }
  };

  const handleGoogleLoginError = () => {
    console.error('Đăng nhập Google thất bại');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-left">
          <h2>ĐĂNG NHẬP</h2>
          <hr className="underline" />
        </div>
        <div className="login-right">
          <form onSubmit={handleLogin} className="login-form">
            <input type="email" name="email" placeholder="Email" required className="input-field" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Mật khẩu"
              required
              className="input-field"
            />
            <button type="submit" className="submit-btn">ĐĂNG NHẬP</button>
            <div className="forgot-register">
              <button type="button" className="link-btn" onClick={(e) => e.preventDefault()}>Quên mật khẩu?</button>
              <a href="/client/register">Đăng ký</a>
            </div>
          </form>
          <div className="separator">Hoặc</div>
          <div className="social-login">
            <button className="facebook-btn">Đăng nhập bằng tài khoản facebook</button>
            <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginError} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;