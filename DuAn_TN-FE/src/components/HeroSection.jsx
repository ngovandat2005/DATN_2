import React from 'react';
import { Carousel, Typography } from 'antd';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const heroSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop',
    title: 'THE CORE',
    description: 'DEFINING THE FUTURE OF SPEED.',
    buttonText: 'COLLECTION',
    buttonLink: '/products',
    align: 'left'
  },
  {
    id: 2,
    image: '/banner1.png', // Giữ nguyên tấm ảnh 4K sang trọng mới
    title: 'LEGACY',
    description: 'FORGED FOR THE GREATNESS.',
    buttonText: 'EXPLORE',
    buttonLink: '/products',
    align: 'right'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=2000&auto=format&fit=crop',
    title: 'VANTAGE',
    description: 'NEW ARRIVALS 2025.',
    buttonText: 'SHOP NOW',
    buttonLink: '/products',
    align: 'center'
  },
];

function HeroSection() {
  return (
    <div className="hero-container">
      <Carousel autoplay effect="fade" speed={1000}>
        {heroSlides.map(slide => (
          <div key={slide.id} className="hero-slide-item">
            <div className="hero-slide">
              <img src={slide.image} alt={slide.title} className="hero-bg-img" />
              <div className="hero-overlay"></div>
              <div className={`hero-content-container align-${slide.align}`}>
                <div className="hero-text-content">
                  <h1 className="hero-title">{slide.title}</h1>
                  <p className="hero-subtitle">{slide.description}</p>
                  <Link to={slide.buttonLink} className="hero-button">
                    {slide.buttonText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      <div className="hero-info-bar">
        {[
          { t: 'FREE SHIPPING', d: 'Đơn từ 2.000.000đ' },
          { t: '30 DAYS RETURN', d: 'Đổi trả dễ dàng' },
          { t: 'GENUINE 100%', d: 'Cam kết chính hãng' }
        ].map((item, i) => (
          <div key={i} className="info-item">
            <h5 className="info-title">{item.t}</h5>
            <span className="info-desc">{item.d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HeroSection;
