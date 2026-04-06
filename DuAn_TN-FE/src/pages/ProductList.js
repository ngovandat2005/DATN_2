import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Select,
  Input,
  Typography,
  Spin,
  Tag,
  Pagination,
  Space,
  Slider,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import config from "../config/config";
import "../styles/Home.css";

const { Option } = Select;
const { Title, Text } = Typography;

// Ảnh mẫu cho từng loại sản phẩm
const categoryImages = {
  Sneaker:
    "https://images.unsplash.com/photo-1517260911205-8a3b66e655a4?auto=format&fit=crop&w=400&q=80",
  "Thể thao":
    "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
  "Chạy bộ":
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
  "Thời trang":
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  "Bóng rổ":
    "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
  Adidas:
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
  Nike: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
};

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Hàm lấy ảnh sản phẩm:
// - Luôn sử dụng ảnh local trong publog/products theo brand + tên sản phẩm
const getProductImage = (product) => {
  if (!product?.images) return "/logo.png";
  // nếu có nhiều ảnh thì lấy ảnh đầu tiên
  const firstImage = product.images.split(",")[0].trim();
  // Sửa đường dẫn chuẩn theo backend admin
  return `${config.baseUrl}images/${firstImage}`;
};

// Hàm hiển thị giá với giá gạch đi
const renderPrice = (product) => {
  const giaBanGoc =
    product.giaBanGoc ??
    (product.giaBan && product.giaBan > 0 ? product.giaBan : null) ??
    product.price ??
    0;

  const giaBanGiamGia = product.giaBanSauGiam ?? product.giaBanGiamGia ?? null;

  const phanTramGiam = product.phanTramGiam || 0;

  let displayPrice = giaBanGoc;
  let hasDiscount = false;

  if (giaBanGiamGia && giaBanGiamGia > 0 && giaBanGiamGia < giaBanGoc) {
    displayPrice = giaBanGiamGia;
    hasDiscount = true;
  } else if (phanTramGiam > 0 && giaBanGoc > 0) {
    displayPrice = Math.round(giaBanGoc * (1 - phanTramGiam / 100));
    hasDiscount = true;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        marginBottom: 16,
      }}
    >
      <Text strong style={{ color: "#f5222d", fontSize: 18, margin: 0 }}>
        {displayPrice.toLocaleString()}đ
      </Text>
      {hasDiscount && (
        <Text delete style={{ color: "#8c8c8c", fontSize: 13, margin: 0 }}>
          {giaBanGoc.toLocaleString()}đ
        </Text>
      )}
    </div>
  );
};

function ProductList() {
  const navigate = useNavigate();
  const location = useLocation();
  // Parse query string
  const params = new URLSearchParams(location.search);
  const initialBrandId = params.get("idThuongHieu");
  const initialCategoryId = params.get("idDanhMuc");
  const initialGender = params.get("gioiTinh");

  // State cho filter
  const [sizeList, setSizeList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [filters, setFilters] = useState({
    size: undefined,
    brandId: initialBrandId || undefined,
    name: "",
    categoryId: initialCategoryId || undefined,
    gender: initialGender || undefined,
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [priceRange, setPriceRange] = useState([null, null]);

  // Lấy dữ liệu filter từ API
  useEffect(() => {
    fetch(config.getApiUrl("api/kich-thuoc/getAll"))
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSizeList(data);
        else if (Array.isArray(data.data)) setSizeList(data.data);
      });
    fetch(config.getApiUrl("api/thuong-hieu/getAll"))
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBrandList(data);
        else if (Array.isArray(data.data)) setBrandList(data.data);
      });
    fetch(config.getApiUrl("api/danh-muc/getAll"))
      .then((res) => res.json())
      .then((data) => {
        console.log("Danh mục:", data);
        if (Array.isArray(data)) setCategoryList(data);
        else if (Array.isArray(data.data)) setCategoryList(data.data);
      });
  }, []);

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    setLoading(true);
    fetch(config.getApiUrl("api/san-pham/getAll"))
      .then((res) => res.json())
      .then(async (data) => {
        let productsData = [];
        if (Array.isArray(data)) productsData = data;
        else if (Array.isArray(data.products)) productsData = data.products;
        else productsData = [];

        // ✅ THÊM: Fetch giá từ biến thể cho từng sản phẩm
        const productsWithPrices = await Promise.all(
          productsData.map(async (product) => {
            try {
              const variantsResponse = await fetch(
                config.getApiUrl(`api/san-pham-chi-tiet/${product.id}`),
              );
              if (variantsResponse.ok) {
                const variants = await variantsResponse.json();
                if (variants && variants.length > 0) {
                  // Tìm giá thấp nhất từ tất cả biến thể (hoặc giá đầu tiên nếu không có giá hợp lệ)
                  let minPrice = null;
                  let minDiscountPrice = null;

                  for (const variant of variants) {
                    const vPrice = variant.giaBan || 0;
                    const promo = variant.khuyenMai;
                    const isActivePromo = promo && promo.trangThai === 1 && promo.giaTri > 0;
                    
                    // Ưu tiên giá giảm từ backend nếu có KM đang chạy
                    let vDiscountPrice = (variant.giaBanGiamGia > 0 && variant.giaBanGiamGia < vPrice && isActivePromo) 
                      ? variant.giaBanGiamGia 
                      : (isActivePromo ? Math.round(vPrice * (1 - promo.giaTri / 100)) : 0);

                    // Chỉ lấy giá > 0
                    if (vPrice > 0) {
                      // Tìm giá gốc thấp nhất (cho hiển thị "Từ ...đ")
                      if (minPrice === null || vPrice < minPrice) {
                        minPrice = vPrice;
                      }
                      
                      // Kiểm tra xem biến thể này có thực sự là sale hợp lệ không
                      if (vDiscountPrice > 0 && vDiscountPrice < vPrice) {
                        // Tìm giá sale thấp nhất bộ sưu tập
                        if (minDiscountPrice === null || vDiscountPrice < minDiscountPrice) {
                          minDiscountPrice = vDiscountPrice;
                        }
                      }
                    }
                  }

                  if (minPrice !== null && minPrice > 0) {
                    return {
                      ...product,
                      giaBan: minPrice,
                      giaBanGoc: minPrice,
                      giaBanSauGiam: minDiscountPrice,
                      phanTramGiam: minDiscountPrice ? Math.round((1 - minDiscountPrice / minPrice) * 100) : 0
                    };
                  }
                }
              }
            } catch (error) {
              console.warn(
                `⚠️ Không thể lấy giá cho sản phẩm ${product.id}:`,
                error,
              );
            }
            return product;
          }),
        );

        setProducts(productsWithPrices);
        setLoading(false);
        console.log("data", productsWithPrices);
      })
      .catch(() => setLoading(false));
  }, []);

  // Lọc sản phẩm theo filter
  const filteredProducts = products.filter((product) => {
    const matchSize =
      !filters.size ||
      (product.kichThuoc &&
        (product.kichThuoc.tenKichThuoc === filters.size ||
          product.kichThuoc.size === filters.size));
    
    // Lọc theo Brand ID
    const matchBrandId =
      !filters.brandId ||
      (product.thuongHieu && String(product.thuongHieu.id) === String(filters.brandId));
    
    // Lọc theo Category ID
    const matchCategoryId =
      !filters.categoryId ||
      (product.danhMuc && String(product.danhMuc.id) === String(filters.categoryId));

    // Lọc theo Giới tính
    const matchGender =
      !filters.gender ||
      String(product.gioiTinh) === String(filters.gender);

    const matchName =
      !filters.name ||
      (product.tenSanPham || product.name || "")
        .toLowerCase()
        .includes(filters.name.toLowerCase());

    const price =
      product.giaBanSauGiam ??
      product.giaBanGiamGia ??
      (product.giaBan && product.giaBan > 0 ? product.giaBan : null) ??
      product.price ??
      0;
    const matchPrice =
      (!priceRange[0] || price >= priceRange[0]) &&
      (!priceRange[1] || price <= priceRange[1]);

    return matchSize && matchBrandId && matchCategoryId && matchGender && matchName && matchPrice && String(product.gioiTinh) !== '1';
  });

  // Reset về trang 1 khi filter hoặc giá thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, priceRange]);

  // ✅ THÊM: Cập nhật bộ lọc khi URL thay đổi (VD: bấm Nike -> Adidas ở Header)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFilters(f => ({
      ...f,
      brandId: params.get("idThuongHieu") || undefined,
      categoryId: params.get("idDanhMuc") || undefined,
      gender: params.get("gioiTinh") || undefined
    }));
  }, [location.search]);

  // Tính toán sản phẩm hiển thị theo trang
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pagedProducts = filteredProducts.slice(startIdx, endIdx);

  return (
    <div className="product-list-page" style={{ padding: 0, overflowX: 'hidden' }}>
      {/* Banner Full Width phá vỡ mọi khung lề */}
      <div
        className="product-list-banner"
        style={{
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${
            String(filters.gender) === '0' ? 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop' : 
            'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=2000&auto=format&fit=crop'
          })`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          height: '550px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: '#fff',
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          marginBottom: '60px'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, padding: '0 20px' }}>
          <Title
            level={1}
            style={{
              color: "#fff",
              fontSize: 'clamp(32px, 6vw, 72px)',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '6px',
              marginBottom: 16,
              textShadow: "0 4px 15px rgba(0, 0, 0, 0.6)",
            }}
          >
            {filters.gender === '0' ? 'COLLECTION GIÀY NAM' : 'TẤT CẢ SẢN PHẨM'}
          </Title>
          <Text
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: "rgba(255, 255, 255, 0.95)",
              textShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
              letterSpacing: '1.5px',
              display: 'block',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6,
              fontWeight: 300,
              textTransform: 'uppercase'
            }}
          >
            Khẳng định phong cách riêng cùng bộ sưu tập {filters.gender === '0' ? 'Nam' : filters.gender === '1' ? 'Nữ' : 'chính hãng'} độc quyền tại KING STEP.
          </Text>
        </div>
      </div>

      <div className="product-list-inner" style={{ padding: '40px 32px' }}>
        {/* Bộ lọc hiện đại hai tầng */}
        <div
          style={{
            background: "#fff",
            padding: "32px",
            borderRadius: 24,
            marginBottom: 40,
            boxShadow: "0 10px 40px rgba(0,0,0,0.03)",
            border: "1px solid #f0f0f0",
          }}
        >
          <Row gutter={[24, 32]}>
            {/* Hàng 1: Tìm kiếm và khoảng giá */}
            <Col xs={24} lg={12}>
              <Text
                strong
                style={{
                  display: "block",
                  marginBottom: 12,
                  color: "#1a1a1a",
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Tìm kiếm sản phẩm
              </Text>
              <Input
                placeholder="Nhập tên giày bạn muốn tìm..."
                size="large"
                allowClear
                value={filters.name}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, name: e.target.value }))
                }
                style={{ borderRadius: 8, padding: "8px 16px", fontSize: 15 }}
              />
            </Col>

            <Col xs={24} lg={12}>
              <Text
                strong
                style={{
                  display: "block",
                  marginBottom: 12,
                  color: "#1a1a1a",
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Khoảng giá
              </Text>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    flex: "0 0 auto",
                    minWidth: 80,
                    textAlign: "center",
                    background: "#e6f4ff",
                    border: "1px solid #91caff",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#0958d9",
                  }}
                >
                  {priceRange[0]
                    ? `${(priceRange[0] / 1000).toLocaleString()}k`
                    : "0đ"}
                </div>

                <div style={{ flex: "1 1 auto", paddingTop: 6 }}>
                  <Slider
                    range
                    min={0}
                    max={10000000}
                    step={100000}
                    value={priceRange}
                    onChange={setPriceRange}
                    tooltip={{
                      formatter: (value) =>
                        value ? value.toLocaleString() + "đ" : "0đ",
                    }}
                    style={{ margin: 0 }}
                  />
                </div>

                <div
                  style={{
                    flex: "0 0 auto",
                    minWidth: 80,
                    textAlign: "center",
                    background: "#e6f4ff",
                    border: "1px solid #91caff",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#0958d9",
                  }}
                >
                  {priceRange[1]
                    ? `${(priceRange[1] / 1000).toLocaleString()}k`
                    : "Max"}
                </div>
              </div>
            </Col>



            <Col xs={24} sm={12} lg={6}>
              <Text
                strong
                style={{
                  display: "block",
                  marginBottom: 12,
                  color: "#1a1a1a",
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Thương hiệu
              </Text>
              <Select
                placeholder="Tất cả thương hiệu"
                style={{ width: "100%" }}
                allowClear
                size="large"
                value={filters.brandId}
                onChange={(value) =>
                  setFilters((f) => ({ ...f, brandId: value }))
                }
              >
                {brandList.map((brand) => (
                  <Option key={brand.id} value={String(brand.id)}>
                    {brand.tenThuongHieu}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Text
                strong
                style={{
                  display: "block",
                  marginBottom: 12,
                  color: "#1a1a1a",
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Danh mục
              </Text>
              <Select
                placeholder="Tất cả danh mục"
                style={{ width: "100%" }}
                allowClear
                size="large"
                value={filters.categoryId}
                onChange={(value) =>
                  setFilters((f) => ({ ...f, categoryId: value }))
                }
              >
                {categoryList.map((cat) => (
                  <Option key={cat.id} value={String(cat.id)}>
                    {cat.tenDanhMuc}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Text
                strong
                style={{
                  display: "block",
                  marginBottom: 12,
                  color: "#1a1a1a",
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Kích cỡ (Size)
              </Text>
              <Select
                placeholder="Chọn size chân của bạn"
                style={{ width: "100%" }}
                allowClear
                size="large"
                value={filters.size}
                onChange={(value) => setFilters((f) => ({ ...f, size: value }))}
              >
                {sizeList.map((size) => (
                  <Option
                    key={size.id || size}
                    value={size.tenKichThuoc || size.size || size}
                  >
                    {size.tenKichThuoc || size.size || size}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>
        <Row gutter={16}>
          <Col span={24}>
            {loading ? (
              <div style={{ textAlign: "center", marginTop: 80 }}>
                <Spin size="large" />
              </div>
            ) : (
              <>
                <Row gutter={[24, 24]} justify="start">
                  {pagedProducts.length === 0 && (
                    <Col
                      span={24}
                      style={{ textAlign: "center", marginTop: 40 }}
                    >
                      <Text type="secondary">Không có sản phẩm phù hợp.</Text>
                    </Col>
                  )}
                  {pagedProducts.map((product) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                      <Card
                        hoverable
                        style={{
                          borderRadius: 16,
                          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          border: "1px solid #f0f0f0",
                          overflow: "hidden",
                        }}
                        bodyStyle={{
                          display: "flex",
                          flexDirection: "column",
                          flexGrow: 1,
                          padding: "16px",
                          width: "100%",
                        }}
                        cover={
                          <div
                            style={{
                              position: "relative",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              height: 220,
                              background: "#fff",
                              borderRadius: 12,
                              cursor: "pointer",
                            }}
                            onClick={() => navigate(`/products/${product.id}`)}
                            onMouseOver={(e) => {
                              e.currentTarget.style.boxShadow =
                                "0 0 0 2px #1890ff";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <img
                              alt={product.tenSanPham || product.name}
                              src={getProductImage(product)}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/logo.png";
                              }}
                              style={{
                                maxHeight: 200,
                                maxWidth: "100%",
                                objectFit: "contain",
                                borderRadius: 8,
                                cursor: "pointer",
                              }}
                            />

                            {/* Tag giảm giá */}
                            {product.phanTramGiam > 0 && (
                              <Tag
                                color="red"
                                style={{
                                  position: "absolute",
                                  top: 12,
                                  left: 12,
                                  fontWeight: "bold",
                                  fontSize: 12,
                                  padding: "4px 8px",
                                  borderRadius: 12,
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                }}
                              >
                                -{product.phanTramGiam}%
                              </Tag>
                            )}

                            {/* Tag khuyến mãi nếu có */}
                            {product.tenKhuyenMai && (
                              <Tag
                                color="orange"
                                style={{
                                  position: "absolute",
                                  top: 12,
                                  right: 12,
                                  fontWeight: "bold",
                                  fontSize: 11,
                                  padding: "4px 8px",
                                  borderRadius: 12,
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                }}
                              >
                                {product.tenKhuyenMai}
                              </Tag>
                            )}
                          </div>
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            flexGrow: 1,
                          }}
                        >
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 12,
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              fontWeight: 600,
                              marginBottom: 6,
                            }}
                          >
                            {product.thuongHieu?.tenThuongHieu ||
                              product.brand ||
                              "Thương hiệu"}
                          </Text>
                          <Text
                            strong
                            style={{
                              fontSize: 16,
                              lineHeight: 1.4,
                              WebkitLineClamp: 2,
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              color: "#1a1a1a",
                              marginBottom: 12,
                            }}
                          >
                            {product.tenSanPham || product.name}
                          </Text>
                        </div>
                        <div style={{ marginTop: "auto", width: "100%" }}>
                          {renderPrice(product)}
                          <Button
                            block
                            type="primary"
                            size="large"
                            style={{
                              borderRadius: 12,
                              fontWeight: 700,
                              background: "#1890ff",
                              border: "none",
                              fontSize: 15,
                              height: 44,
                              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
                              transition: "all 0.3s ease",
                            }}
                            onClick={(e) => {
                              // Prevent navigation if already handling parent click
                              e.stopPropagation();
                              navigate(`/products/${product.id}`);
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = "#0050b3";
                              e.currentTarget.style.boxShadow =
                                "0 8px 24px rgba(24, 144, 255, 0.5)";
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = "#1890ff";
                              e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(24, 144, 255, 0.3)";
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <div style={{ textAlign: "center", marginTop: 32 }}>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredProducts.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                  />
                </div>
              </>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default ProductList;
