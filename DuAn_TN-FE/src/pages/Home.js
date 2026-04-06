import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Divider, Button, Spin, Carousel, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import ErrorBoundary from '../components/ErrorBoundary';
import config from '../config/config';
import '../styles/Home.css';

const { Title, Text } = Typography;

function ProductCard({ product, index }) {
  const navigate = useNavigate();
  if (!product) return null;

  const productName = product.tenSanPham || product.ten || 'SẢN PHẨM MỚI';
  
  // Tìm giá thấp nhất từ danh sách biến thể
  let displayPrice = 0;
  const variants = product.sanPhamChiTiets || [];
  
  if (variants.length > 0) {
    const prices = variants
      .map(v => v.giaBan || 0)
      .filter(p => p > 0);
      
    if (prices.length > 0) {
      displayPrice = Math.min(...prices);
    }
  }

  const PREMIUM_SNEAKER_IMAGES = [
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop"
  ];

  const getImageUrl = (img, index = 0) => {
    if (!img) return PREMIUM_SNEAKER_IMAGES[index % PREMIUM_SNEAKER_IMAGES.length];
    if (Array.isArray(img)) img = img[0];
    if (typeof img === "string" && img.includes(",")) img = img.split(",")[0];
    img = img.trim();
    if (!img) return PREMIUM_SNEAKER_IMAGES[index % PREMIUM_SNEAKER_IMAGES.length];
    if (img.startsWith("http")) return img;
    // Sửa đường dẫn chuẩn theo backend admin
    return `${config.baseUrl}images/${encodeURIComponent(img)}`;
  };

  const imageUrl = getImageUrl(product.images || product.hinhAnh, index);

  return (
    <Link to={`/products/${product.id}`} className="product-card-link">
      <div className="product-card">
        <div className="product-img-container">
          <img alt={productName} src={imageUrl} className="product-card-img" />
        </div>
        <div className="product-info">
          <span className="brand-label">{product.thuongHieu?.tenThuongHieu || 'PREMIUM'}</span>
          <h3 className="product-name">{productName}</h3>
          <div className="price-container">
            <span className="price-sale">
              {displayPrice > 0 ? displayPrice.toLocaleString() + '₫' : 'LIÊN HỆ'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [onSaleProducts, setOnSaleProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsResponse = await fetch(config.getApiUrl('api/san-pham/getAll'));
        if (productsResponse.ok) {
          const allProducts = await productsResponse.json();
          // Lọc sản phẩm nổi bật - CHỈ LẤY GIÀY NAM / UNISEX
          const featured = allProducts.filter(p => p.trangThai === 1 && p.gioiTinh !== 1).slice(0, 8);
          setFeaturedProducts(featured);
          
          // Lọc sản phẩm giảm giá - CHỈ LẤY GIÀY NAM / UNISEX
          const sales = allProducts.filter(p => 
            p.trangThai === 1 && 
            p.gioiTinh !== 1 && 
            ((p.giaBanGoc && p.giaBan && p.giaBanGoc > p.giaBan) || p.phanTramGiam > 0)
          ).slice(0, 4);
          setOnSaleProducts(sales);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Không thể tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

  return (
    <ErrorBoundary>
      <div className="home-page">
        <HeroSection />
        
        <div className="home-wrapper">
          <Title level={3}>FEATURED ARRIVALS</Title>
          <Row gutter={[32, 48]}>
            {featuredProducts.map((product, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                <ProductCard product={product} index={index} />
              </Col>
            ))}
          </Row>
          
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <Link to="/products">
              <Button 
                style={{ 
                  borderRadius: 0, 
                  height: '50px', 
                  padding: '0 40px', 
                  fontWeight: 700, 
                  letterSpacing: '2px',
                  background: '#000',
                  color: '#fff',
                  border: 'none'
                }}
              >
                VIEW ALL COLLECTIONS
              </Button>
            </Link>
          </div>
        </div>

        <div className="ambassador-section" style={{ background: '#fafafa', padding: '100px 0', overflow: 'hidden' }}>
          <div className="home-wrapper">
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <Title level={1} style={{ letterSpacing: '8px', fontWeight: 900, textTransform: 'uppercase' }}>
                Brand Ambassadors
              </Title>
              <Text type="secondary" style={{ fontSize: '16px', letterSpacing: '2px' }}>
                HỢP TÁC CÙNG NHỮNG HUYỀN THOẠI THỂ THAO TRÊN TOÀN THẾ GIỚI
              </Text>
            </div>
            
            <style>{`
              .ambassador-carousel .slick-dots li button { background: #000 !important; }
              .ambassador-card:hover img { transform: scale(1.1); }
              .ambassador-card:hover { box-shadow: 0 30px 60px rgba(0,0,0,0.1) !important; }
            `}</style>

            <Carousel 
              autoplay 
              slidesToShow={4} 
              dots={true} 
              draggable 
              className="ambassador-carousel"
              responsive={[
                { breakpoint: 1200, settings: { slidesToShow: 3 } },
                { breakpoint: 768, settings: { slidesToShow: 2 } },
                { breakpoint: 480, settings: { slidesToShow: 1 } }
              ]}
            >
              {[
                { 
                  name: 'CRISTIANO RONALDO', 
                  brand: 'NIKE', 
                  img: '/img/cr7_shoe.png',
                  desc: 'Huyền thoại Nike Mercurial CR7 bạc đế vàng.'
                },
                { 
                  name: 'LIONEL MESSI', 
                  brand: 'ADIDAS', 
                  img: '/img/messi_shoe.png',
                  desc: 'Phong cách Adidas Samba Hồng chuyên nghiệp.'
                },
                { 
                  name: 'STEPHEN CURRY', 
                  brand: 'UNDER ARMOUR', 
                  img: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=800&q=80',
                  desc: 'Chuyên gia 3 điểm cùng Under Armour Curry Flow.'
                },
                { 
                  name: 'NEYMAR JR', 
                  brand: 'PUMA', 
                  img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
                  desc: 'Vũ công Samba đưa phong cách Puma Future lên tầm cao.'
                },
                { 
                  name: 'TONY HAWK', 
                  brand: 'VANS', 
                  img: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
                  desc: 'Tinh thần tự do và văn hóa Skateboard của Vans.'
                },
                { 
                  name: 'JENNIE KIM', 
                  brand: 'ADIDAS ORIGINAL', 
                  img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
                  desc: 'Vẻ đẹp thời thượng cùng dòng Adidas Original.'
                }
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '0 15px' }}>
                  <div className="ambassador-card" style={{ 
                    background: '#fcfcfc', 
                    borderRadius: 8, 
                    overflow: 'hidden', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    transition: 'all 0.4s ease',
                    margin: '10px'
                  }}>
                    <div style={{ height: '350px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <img 
                        src={item.img} 
                        alt={item.name} 
                        style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', transition: '0.6s' }}
                      />
                    </div>
                    <div style={{ padding: '30px', textAlign: 'center' }}>
                      <Text style={{ fontSize: '11px', letterSpacing: '2px', color: '#888', fontWeight: 600 }}>
                        {item.brand}
                      </Text>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '8px 0', letterSpacing: '1px' }}>
                        {item.name}
                      </h3>
                      <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic', display: 'block', height: '40px' }}>
                        "{item.desc}"
                      </Text>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Home;
