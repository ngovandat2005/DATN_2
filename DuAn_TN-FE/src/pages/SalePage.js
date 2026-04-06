import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Spin, Badge, Empty, Button, Tag } from 'antd';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config/config';
import '../styles/SalePage.css';

const { Title, Text } = Typography;

const SalePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchSaleProducts = async () => {
            try {
                // 1. Lấy tất cả sản phẩm
                const response = await axios.get(config.getApiUrl('api/san-pham/getAll'));
                const rawData = Array.isArray(response.data) ? response.data : (response.data.content || []);
                
                // 2. Với mỗi sản phẩm, lấy chi tiết biến thể và thông tin khuyến mãi
                const productsWithPrices = await Promise.all(
                    rawData.map(async (product) => {
                        try {
                            const variantsResponse = await axios.get(config.getApiUrl(`api/san-pham-chi-tiet/${product.id}`));
                            const variants = variantsResponse.data;
                            
                            if (Array.isArray(variants) && variants.length > 0) {
                                let minPrice = null;
                                let minDiscountPrice = null;
                                let maxDiscountPercent = 0;
                                let hasActivePromo = false;

                                for (const variant of variants) {
                                    const originalPrice = variant.giaBan || 0;
                                    const promo = variant.khuyenMai;
                                    const isActivePromo = promo && promo.trangThai === 1 && promo.giaTri > 0;
                                    
                                    if (originalPrice > 0 && isActivePromo) {
                                        hasActivePromo = true;
                                        const discountPercent = promo.giaTri;
                                        const calculatedPrice = (variant.giaBanGiamGia > 0 && variant.giaBanGiamGia < originalPrice) 
                                           ? variant.giaBanGiamGia 
                                           : Math.round(originalPrice * (1 - discountPercent / 100));
                                        
                                        if (minDiscountPrice === null || calculatedPrice < minDiscountPrice) {
                                            minDiscountPrice = calculatedPrice;
                                            minPrice = originalPrice;
                                        }
                                        if (discountPercent > maxDiscountPercent) {
                                            maxDiscountPercent = discountPercent;
                                        }
                                    }
                                }

                                if (hasActivePromo && minDiscountPrice !== null) {
                                    return {
                                        ...product,
                                        giaBanGoc: minPrice,
                                        giaBanSauGiam: minDiscountPrice,
                                        phanTramGiam: maxDiscountPercent,
                                        isOnSale: true
                                    };
                                }
                            }
                        } catch (error) {
                            console.warn(`Lỗi lấy giá khuyến mãi cho sp ${product.id}`, error);
                        }
                        return { ...product, giaBanGoc: 0, giaBanSauGiam: null, isOnSale: false };
                    })
                );

                // Lọc quyết liệt: Chỉ những sản phẩm CÓ KHUYẾN MÃI THỰC SỰ và là GIÀY NAM / UNISEX mới được hiện lên
                const saleProducts = productsWithPrices.filter(p => p.isOnSale === true && String(p.gioiTinh) !== '1');
                setProducts(saleProducts);
            } catch (error) {
                console.error("Lỗi lấy sản phẩm khuyến mãi:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSaleProducts();
    }, []);

    const getProductImage = (product) => {
        if (!product?.images) return "/img/logo.png";
        const firstImage = product.images.split(",")[0].trim();
        // Sửa đường dẫn chuẩn theo backend admin
        return `${config.baseUrl}images/${firstImage}`;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px', flexDirection: 'column' }}>
                <Spin size="large" />
                <Text style={{ marginTop: '20px', fontSize: '16px', color: '#888' }}>Đang kết nối với kho hàng khuyến mãi...</Text>
            </div>
        );
    }

    return (
        <div className="sale-page" style={{ padding: '40px 50px', backgroundColor: '#fff' }}>
            <div style={{ marginBottom: '40px' }}>
                <Title level={2} style={{ color: '#222', fontSize: '32px', fontWeight: '800', borderBottom: '4px solid #f5222d', display: 'inline-block', paddingBottom: '8px' }}>
                    SẢN PHẨM KHUYẾN MÃI
                </Title>
            </div>

            {products.length > 0 ? (
                <Row gutter={[32, 48]}>
                    {products.map(product => {
                        const finalPrice = product.giaBanSauGiam || product.giaBanGoc;
                        const hasRealDiscount = product.giaBanSauGiam && product.giaBanSauGiam < product.giaBanGoc;
                        
                        return (
                            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                                <Link to={`/products/${product.id}`}>
                                    <Badge.Ribbon text={`-${product.phanTramGiam}%`} color="#f5222d">
                                        <Card
                                            hoverable
                                            className="sale-card"
                                            cover={
                                                <div style={{ height: '320px', background: '#fcfcfc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
                                                    <img 
                                                        alt={product.tenSanPham} 
                                                        src={getProductImage(product)} 
                                                        style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', transition: '0.6s all ease' }}
                                                        onError={(e) => { e.target.src = "/img/logo.png"; }}
                                                    />
                                                </div>
                                            }
                                            style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', overflow: 'hidden' }}
                                        >
                                            <div style={{ textAlign: 'center', padding: '5px' }}>
                                                <Title level={5} style={{ margin: '0 0 15px', fontSize: '17px', height: '48px', overflow: 'hidden', lineHeight: '1.4' }}>
                                                    {product.tenSanPham}
                                                </Title>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff9f9', padding: '12px', borderRadius: '12px' }}>
                                                    {hasRealDiscount ? (
                                                        <>
                                                            <Text delete style={{ color: '#bfbfbf', fontSize: '14px', marginBottom: '2px' }}>
                                                                {product.giaBanGoc.toLocaleString()}đ
                                                            </Text>
                                                            <Text style={{ color: '#f5222d', fontSize: '24px', fontWeight: '900' }}>
                                                                {product.giaBanSauGiam.toLocaleString()}đ
                                                            </Text>
                                                        </>
                                                    ) : (
                                                        <Text style={{ color: '#f5222d', fontSize: '24px', fontWeight: '900' }}>
                                                            {product.giaBanGoc.toLocaleString()}đ
                                                        </Text>
                                                    )}
                                                </div>
                                                <Button type="primary" danger size="large" style={{ 
                                                    width: '100%', 
                                                    marginTop: '20px', 
                                                    borderRadius: '12px', 
                                                    fontWeight: 'bold',
                                                    height: '45px',
                                                    background: 'linear-gradient(90deg, #ff4d4f 0%, #f5222d 100%)',
                                                    border: 'none',
                                                    boxShadow: '0 8px 15px rgba(245, 34, 45, 0.2)'
                                                }}>
                                                    XEM CHI TIẾT
                                                </Button>
                                            </div>
                                        </Card>
                                    </Badge.Ribbon>
                                </Link>
                            </Col>
                        );
                    })}
                </Row>
            ) : (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Empty 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                                <Title level={4} style={{ color: '#8c8c8c' }}>Chưa tìm thấy hàng khuyến mãi</Title>
                                <p style={{ color: '#bfbfbf' }}>Hãy chắc chắn bạn đã áp dụng khuyến mãi cho sản phẩm chi tiết trong Admin nhé!</p>
                                <Button type="primary" onClick={() => window.location.reload()} style={{ marginTop: '20px', borderRadius: '8px' }}>
                                    THỬ LẠI NGAY
                                </Button>
                            </div>
                        } 
                    />
                </div>
            )}
        </div>
    );
};

export default SalePage;
