import React, { useEffect, useState, useRef } from "react";
import {
  Row,
  Col,
  Image,
  Button,
  InputNumber,
  Typography,
  Tag,
  message,
  Modal,
  Tabs,
  Badge,
  Rate,
  List,
  Avatar,
  Input,
  Card
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { getCustomerId, isLoggedIn } from "../utils/authUtils";
import config from '../config/config';
import '../styles/Home.css';
import '../styles/ProductDetail.css';
import { 
  FileTextOutlined, 
  CommentOutlined, 
  StarFilled,
  HomeOutlined,
  ShoppingOutlined,
  ThunderboltFilled,
  CheckCircleFilled
} from "@ant-design/icons";
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]); // danh sách biến thể từ API
  const [colorList, setColorList] = useState([]); // lấy từ API màu sắc
  const [sizeList, setSizeList] = useState([]); // lấy từ API kích thước
  const [selectedColor, setSelectedColor] = useState();
  const [selectedSize, setSelectedSize] = useState();
  const [quantity, setQuantity] = useState(1);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // ⭐ SẢN PHẨM LIÊN QUAN
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  const reviewRef = useRef(null);

  const scrollToReviews = () => {
    setActiveTab("2");
    setTimeout(() => {
      reviewRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  // ⭐ REVIEW
  const [reviews, setReviews] = useState([]);

  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [cartItems, setCartItems] = useState([]); // ✅ THÊM: Theo dõi giỏ hàng để tính tồn kho thực tế
  const [imageList, setImageList] = useState([]); // ✅ THÊM: Danh sách ảnh
  const [mainImage, setMainImage] = useState(""); // ✅ THÊM: Ảnh chính

  // ✅ THÊM: Lấy ID khách hàng từ localStorage
  const customerId = getCustomerId();

  // Lấy chi tiết sản phẩm và các biến thể từ API chuẩn
  useEffect(() => {
    setSelectedColor(undefined);
    setSelectedSize(undefined);
    setCurrentVariant(null);
    setQuantity(1);
    setLoading(true);
    setError(null);

    // CALL 1: Lấy thông tin sản phẩm chính (để có tên, danh mục, thương hiệu...)
    const fetchProductInfo = axios.get(config.getApiUrl(`api/san-pham/${id}`));
    
    // CALL 2: Lấy danh sách sản phẩm chi tiết (để có màu, size, giá...)
    const fetchVariantsInfo = axios.get(config.getApiUrl(`api/san-pham-chi-tiet/${id}`));

    Promise.all([fetchProductInfo, fetchVariantsInfo])
      .then(([productRes, variantsRes]) => {
        // Gắn dữ liệu sản phẩm
        if (productRes.data) {
          setProduct(productRes.data);
        }

        // Gắn dữ liệu biến thể
        if (productRes.data && productRes.data.images) {
          const images = productRes.data.images.split(",").map((img) => img.trim());
          setImageList(images);
          setMainImage(`${config.baseUrl}images/${images[0]}`);
        }

        if (Array.isArray(variantsRes.data)) {
          setVariants(variantsRes.data);
        } else {
          setVariants([]);
        }
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Lỗi đồng bộ API sản phẩm:", error);
        setError("Không lấy được thông tin từ hệ thống!");
        setLoading(false);
        message.error("Lỗ kết nối máy chủ!");
      });
  }, [id]);

  // Lấy danh sách màu từ API
  useEffect(() => {
    fetch(config.getApiUrl('api/mau-sac/getAll'))
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setColorList(Array.isArray(data) ? data : data.data || []);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách màu:", error);
        setColorList([]);
      });

    fetch(config.getApiUrl('api/kich-thuoc/getAll'))
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setSizeList(Array.isArray(data) ? data : data.data || []);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách kích thước:", error);
        setSizeList([]);
      });
  }, []);


  // ⭐ LẤY SẢN PHẨM KHÁC (THÊM NGAY DƯỚI ĐÂY)
  useEffect(() => {
    const loadProducts = async () => {
      try {

        const res = await fetch(config.getApiUrl("api/san-pham/getAll"));
        const data = await res.json();

        const productList = Array.isArray(data) ? data : data.data || [];

        const filtered = productList
          .filter(p => p.id !== Number(id))
          .slice(0, 4);

        const productsWithPrice = await Promise.all(
          filtered.map(async (p) => {

            const variantRes = await fetch(
              config.getApiUrl(`api/san-pham-chi-tiet/${p.id}`)
            );

            const variantData = await variantRes.json();

            const price = variantData?.[0]?.giaBan || 0;

            return {
              ...p,
              giaBan: price
            };

          })
        );

        setRelatedProducts(productsWithPrice);

      } catch (err) {
        console.error("Lỗi load sản phẩm:", err);
      }
    };

    loadProducts();

  }, [id]);

  // ✅ FETCH REVIEWS FROM BACKEND
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(config.getApiUrl(`api/danh-gia/san-pham/${id}`));
        setReviews(res.data || []);
      } catch (err) {
        console.error("Lỗi lấy đánh giá:", err);
      }
    };
    fetchReviews();
  }, [id]);

  // ✅ THÊM: Lấy giỏ hàng khi load trang để tính tồn kho khả dụng
  useEffect(() => {
    if (isLoggedIn() && customerId) {
      axios.get(config.getApiUrl(`api/gio-hang-chi-tiet/${customerId}`))
        .then(res => setCartItems(res.data))
        .catch(err => console.error("Lỗi khi lấy giỏ hàng:", err));
    }
  }, [customerId]);

  // Log màu sắc và size có sẵn cho sản phẩm này
  const availableColors = colorList.filter(color => {
    // Kiểm tra xem màu này có trong bất kỳ variant nào không
    const hasColor = variants.some(variant => {
      const variantColor = variant.mauSac?.tenMauSac;
      const match = variantColor === color.tenMauSac;
      return match;
    });
    return hasColor;
  });

  const availableSizes = sizeList.filter(size => {
    // Kiểm tra xem size này có trong bất kỳ variant nào không
    const hasSize = variants.some(variant => {
      const variantSize = variant.kichThuoc?.tenKichThuoc;
      const match = variantSize === size.tenKichThuoc;
      return match;
    });
    return hasSize;
  });


  // Tự động chọn biến thể có giá tốt nhất (hoặc đầu tiên nếu không có biến thể)
  useEffect(() => {
    if (variants && variants.length > 0 && !selectedColor && !selectedSize) {
      let bestVariant = variants[0];
      let minEffectivePrice = Infinity;

      for (const v of variants) {
        const originalPrice = v.giaBan || 0;
        const discountedPrice = v.giaBanGiamGia || 0;
        const effectivePrice = (discountedPrice > 0 && discountedPrice < originalPrice) 
          ? discountedPrice 
          : originalPrice;

        if (effectivePrice > 0 && effectivePrice < minEffectivePrice) {
          minEffectivePrice = effectivePrice;
          bestVariant = v;
        }
      }

      if (bestVariant) {
        setSelectedColor(bestVariant.mauSac?.tenMauSac);
        setSelectedSize(bestVariant.kichThuoc?.tenKichThuoc);
      }
    }
  }, [variants, selectedColor, selectedSize]);

  // Xác định biến thể hiện tại dựa trên các lựa chọn
  useEffect(() => {
    const found = variants.find((v) => {
      const variantColor = v.mauSac?.tenMauSac;
      const variantSize = v.kichThuoc?.tenKichThuoc;
      return variantColor === selectedColor && variantSize === selectedSize;
    });
    setCurrentVariant(found || null);
    
    // ✅ CẬP NHẬT: Reset số lượng về 1 (hoặc 0 nếu hết hàng)
    const currentStock = found?.soLuong || 0;
    const itemsInCart = cartItems.find(item => 
      (item.sanPhamChiTiet?.id === found?.id) || 
      (item.idSanPhamChiTiet === found?.id)
    )?.soLuong || 0;
    
    setQuantity(currentStock - itemsInCart > 0 ? 1 : 0);
  }, [selectedColor, selectedSize, variants, cartItems]);

  // Lấy số lượng còn lại của biến thể hiện tại
  const stock = currentVariant?.soLuong || 0;
  
  // ✅ THÊM: Tính số lượng đã có trong giỏ hàng của biến thể này
  const currentInCart = cartItems.find(item => 
    (item.sanPhamChiTiet?.id === currentVariant?.id) || 
    (item.idSanPhamChiTiet === currentVariant?.id)
  )?.soLuong || 0;

  const availableToBuy = Math.max(0, stock - currentInCart);

  // ✅ THÊM: Hàm kiểm tra đăng nhập
  const checkLoginAndRedirect = () => {
    if (!isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Cần đăng nhập',
        text: 'Bạn cần đăng nhập để mua hàng!',
        showCancelButton: true,
        confirmButtonText: 'Đăng nhập ngay',
        cancelButtonText: 'Hủy',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return false;
    }
    return true;
  };

  // ✅ CẬP NHẬT: Hàm mua ngay - kiểm tra đăng nhập trước
  const handleBuy = () => {
    if (!checkLoginAndRedirect()) return;

    if (!selectedColor || !selectedSize) {
      message.warning("Vui lòng chọn đủ màu và size!");
      return;
    }

    if (!currentVariant) {
      message.warning("Vui lòng chọn đủ màu và size!");
      return;
    }

    if (stock <= 0) {
      message.warning("Sản phẩm đã hết hàng!");
      return;
    }

    if (quantity <= 0) {
      message.error("Số lượng không hợp lệ!");
      return;
    }

    if (quantity > availableToBuy) {
      Swal.fire({
        icon: 'error',
        title: 'Vượt quá tồn kho',
        text: availableToBuy > 0 
          ? `Bạn chỉ có thể mua thêm tối đa ${availableToBuy} sản phẩm (đã có ${currentInCart} trong giỏ)!` 
          : `Bạn đã đạt giới hạn tối đa trong giỏ hàng (Tồn kho: ${stock})!`,
      });
      return;
    }

    // ✅ SỬA: Chuyển đến trang payment thay vì checkout
    // Giống như thanh toán qua giỏ hàng
    navigate('/payment', {
      state: {
        cart: [{
          id: currentVariant.id,
          tenSanPham: product?.tenSanPham,
          giaBan: currentVariant.giaBan,
          giaBanGiamGia: currentVariant.giaBanGiamGia,
          soLuong: quantity,
          mauSac: selectedColor,
          kichThuoc: selectedSize,
          hinhAnh: getProductImage(currentVariant),
          idSanPhamChiTiet: currentVariant.id
        }],
        buyNow: true
      }
    });
  };

  // ✅ CẬP NHẬT: Hàm thêm vào giỏ hàng - kiểm tra đăng nhập trước
  const handleAddToCart = () => {
    if (!checkLoginAndRedirect()) return;

    if (!selectedColor || !selectedSize) {
      message.warning("Vui lòng chọn đủ màu và size!");
      return;
    }

    if (!currentVariant) {
      message.warning("Vui lòng chọn đủ màu và size!");
      return;
    }

    if (stock <= 0) {
      message.warning("Sản phẩm đã hết hàng!");
      return;
    }

    if (quantity <= 0) {
      message.error("Số lượng không hợp lệ!");
      return;
    }

    if (availableToBuy <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Hết hàng khả dụng',
        text: `Bạn đã có ${currentInCart} sản phẩm trong giỏ hàng, đã đạt giới hạn tồn kho (${stock})!`,
      });
      return;
    }

    if (quantity > availableToBuy) {
      Swal.fire({
        icon: 'error',
        title: 'Vượt quá tồn kho',
        text: `Bạn chỉ có thể thêm tối đa ${availableToBuy} sản phẩm nữa (đã có ${currentInCart} sản phẩm trong giỏ)!`,
      });
      return;
    }

    Swal.fire({
      title: "Xác nhận",
      text: "Bạn có muốn thêm sản phẩm này vào giỏ hàng?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ SỬ DỤNG ID KHÁCH HÀNG THỰC TẾ THAY VÌ HARDCODE
        axios
          .post(config.getApiUrl('api/gio-hang-chi-tiet/them'), {
            idKhachHang: customerId, // ✅ Sử dụng customerId thực tế
            idSanPhamChiTiet: currentVariant?.id,
            soLuong: quantity,
          })
          .then(() => {
            // ✅ CẬP NHẬT: Lấy lại giỏ hàng để cập nhật số lượng khả dụng hiển thị
            if (customerId) {
              axios.get(config.getApiUrl(`api/gio-hang-chi-tiet/${customerId}`))
                .then(res => setCartItems(res.data))
                .catch(err => console.error("Lỗi khi cập nhật giỏ hàng:", err));
            }

            // ✅ TRIGGER: Thông báo cho các component khác (Header/CartBadge) biết để cập nhật số lượng
            window.dispatchEvent(new Event('cartChanged'));

            Swal.fire({
              icon: "success",
              title: "Thành công",
              text: "Đã thêm vào giỏ hàng!",
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000,
              width: 300
            });
          })
          .catch((error) => {
            console.error('❌ Lỗi khi thêm vào giỏ hàng:', error);
            const errorMsg = error.response?.data?.message || error.response?.data || error.message;
            Swal.fire({
              icon: "error",
              title: "Thất bại",
              text: `Thêm vào giỏ hàng thất bại: ${errorMsg}`,
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              width: 350
            });
          });
      }
    });
  };

  // Hàm lấy ảnh từ biến thể - sử dụng cùng logic như admin
  const getProductImage = (variant) => {
    if (!variant) return '/logo.png';

    let img = variant?.sanPham?.images || variant?.images || variant?.images;
    if (!img) return '/logo.png';

    if (Array.isArray(img)) img = img[0];
    if (typeof img === 'string' && img.includes(',')) img = img.split(',')[0];

    img = img.trim();
    if (!img) return '/logo.png';

    if (img.startsWith('http')) return img;

    return `${config.baseUrl}images/${encodeURIComponent(img)}`;
  };

  const handleSubmitReview = async () => {
    if (!isLoggedIn()) {
      checkLoginAndRedirect();
      return;
    }

    if (!newReview.trim()) {
      message.warning("Vui lòng nhập đánh giá!");
      return;
    }

    try {
      const reviewRequest = {
        idKhachHang: customerId,
        idSanPham: Number(id),
        soSao: newRating,
        binhLuan: newReview.trim()
      };

      await axios.post(config.getApiUrl('api/danh-gia/them'), reviewRequest);
      
      // Refresh reviews list
      const res = await axios.get(config.getApiUrl(`api/danh-gia/san-pham/${id}`));
      setReviews(res.data || []);
      
      setNewReview("");
      setNewRating(5);
      message.success("Cảm ơn bạn đã đánh giá!");
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err);
      message.error("Gửi đánh giá thất bại: " + (err.response?.data || err.message));
    }
  };
  // ✅ THÊM: Helper function để xác định giá hiển thị
  const getDisplayPrice = (variant) => {
    if (!variant) return { originalPrice: 0, discountedPrice: 0, finalPrice: 0, hasDiscount: false };

    const originalPrice = variant.giaBan || 0;
    const discountedPrice = variant.giaBanGiamGia || 0;
    const hasDiscount = discountedPrice > 0 && discountedPrice < originalPrice;
    const finalPrice = hasDiscount ? discountedPrice : originalPrice;

    return {
      originalPrice,
      discountedPrice,
      finalPrice,
      hasDiscount
    };
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 18, marginBottom: 16 }}>Đang tải thông tin sản phẩm...</div>
        <div>Vui lòng đảm bảo backend đang chạy trên port 8080</div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#f5222d', marginBottom: 16 }}>{error}</div>
        <div style={{ marginBottom: 16 }}>Có thể backend chưa được khởi động hoặc có lỗi kết nối</div>
        <Button type="primary" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    );
  }

  // Hiển thị nội dung chính
  return (
    <div className="product-detail-page">
      <div className="product-detail-card">
        <Row gutter={[48, 48]}>
          <Col xs={24} lg={11} className="product-detail-image-col">
            <div className="product-detail-image">
              <Image
                src={getProductImage(currentVariant || variants[0])}
                alt={currentVariant?.tenSanPham || variants[0]?.tenSanPham || 'Sản phẩm'}
                preview={true}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/logo.png";
                }}
              />
            </div>
          </Col>
          <Col xs={24} lg={13} className="product-detail-info">
            {/* 1. Tên Sản Phẩm */}
            <Title level={1} className="product-title">
              {product?.tenSanPham || product?.name || variants[0]?.sanPham?.tenSanPham || "Hệ thống đang tải tên..."}
            </Title>

            {/* 2. Giá Tiền */}
            <div className="price-container">
              {(() => {
                const variant = currentVariant || variants[0];
                const originalPrice = variant?.giaBan || 0;
                const promo = variant?.khuyenMai;
                const isActivePromo = (promo && promo.trangThai === 1 && promo.giaTri > 0);
                
                let finalPrice = originalPrice;
                let hasDiscount = false;

                if (isActivePromo) {
                  const calculatedPrice = Math.round(originalPrice * (1 - promo.giaTri / 100));
                  if (calculatedPrice > 0 && calculatedPrice < originalPrice) {
                    finalPrice = calculatedPrice;
                    hasDiscount = true;
                  }
                }

                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    {hasDiscount ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Text className="old-price">{originalPrice.toLocaleString()}₫</Text>
                        <Text className="current-price">{finalPrice.toLocaleString()}₫</Text>
                        <span className="discount-tag">-{promo.giaTri}% OFF</span>
                      </div>
                    ) : (
                      <Text className="current-price">{originalPrice.toLocaleString()}₫</Text>
                    )}

                    <div 
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: 'auto' }} 
                      onClick={scrollToReviews}
                    >
                      <Rate disabled value={5} style={{ fontSize: 14, color: '#fadb14' }} />
                      <Text type="secondary" style={{ marginLeft: 8, fontSize: 14, fontWeight: '600' }}>
                        {reviews.length} đánh giá
                      </Text>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 3. Danh Mục (Loại) */}
            <div style={{ marginBottom: '12px' }}>
              <Tag color="blue" style={{ fontSize: '13px', padding: '2px 10px', borderRadius: '4px' }}>
                Loại: {product?.danhMuc?.tenDanhMuc || variants[0]?.danhMuc?.tenDanhMuc || "---"}
              </Tag>
            </div>

            <div className="stock-info" style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircleFilled style={{ color: stock > 0 ? '#52c41a' : '#ff4d4f' }} />
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: stock > 0 ? '#52c41a' : '#ff4d4f' }}>
                  {selectedColor && selectedSize
                    ? stock > 0
                      ? availableToBuy > 0
                        ? `CÒN HÀNG (${availableToBuy} đôi có sẵn)`
                        : `VỪA HẾT (Đã có trong giỏ hàng)`
                      : `HẾT HÀNG`
                    : "VUI LÒNG CHỌN SIZE & MÀU"}
                </span>
              </div>
            </div>

            <div className="variant-selector">
              <span className="variant-label">Chọn Màu Sắc</span>
              <div className="variant-options">
                {availableColors.map((color) => {
                  const isActive = selectedColor === color.tenMauSac;
                  return (
                    <Button
                      key={color.id}
                      className={`pill-option ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        if (isActive) {
                          setSelectedColor(null);
                          setSelectedSize(null);
                        } else {
                          setSelectedColor(color.tenMauSac);
                          // Auto-select first compatible size if only ONE size exists
                          const compatibleSizes = variants.filter(v => v.mauSac?.tenMauSac === color.tenMauSac);
                          if (compatibleSizes.length === 1) {
                            setSelectedSize(compatibleSizes[0].kichThuoc?.tenKichThuoc);
                          } else {
                            setSelectedSize(null);
                          }
                        }
                      }}
                    >
                      {color.tenMauSac}
                    </Button>
                  );
                })}
              </div>
            </div>

            {selectedColor && (
              <div className="variant-selector" style={{ marginTop: 24, animation: 'fadeIn 0.3s ease' }}>
                <span className="variant-label">Chọn Kích Thước ({selectedColor})</span>
                <div className="variant-options">
                  {availableSizes
                    .filter(size => variants.some(v => v.mauSac?.tenMauSac === selectedColor && v.kichThuoc?.tenKichThuoc === size.tenKichThuoc))
                    .map((size) => (
                      <Button
                        key={size.id}
                        className={`pill-option ${selectedSize === size.tenKichThuoc ? 'active' : ''}`}
                        onClick={() => {
                          if (selectedSize === size.tenKichThuoc) {
                            setSelectedSize(null);
                          } else {
                            setSelectedSize(size.tenKichThuoc);
                          }
                        }}
                      >
                        {size.tenKichThuoc}
                      </Button>
                    ))}
                </div>
              </div>
            )}
            <div className="quantity-selector" style={{ marginTop: 30 }}>
              <span className="variant-label">Số Lượng</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <InputNumber
                  min={availableToBuy > 0 ? 1 : 0}
                  value={quantity}
                  onChange={(val) => setQuantity(val)}
                  style={{ 
                    width: 100, 
                    height: 45, 
                    borderRadius: 12, 
                    display: 'flex', 
                    alignItems: 'center',
                    borderColor: quantity > availableToBuy ? '#ff4d4f' : '' 
                  }}
                />
                {quantity > availableToBuy && (
                  <Text type="danger" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                    ✕ Vượt quá số lượng có sẵn ({availableToBuy})
                  </Text>
                )}
              </div>
            </div>

            <div className="product-actions" style={{ marginTop: 40 }}>
              <Button 
                type="primary" 
                size="large" 
                className="btn-buy-now" 
                icon={<ThunderboltFilled />}
                onClick={handleBuy}
                disabled={availableToBuy <= 0 || quantity > availableToBuy}
              >
                Mua Ngay
              </Button>
              <Button 
                size="large" 
                className="btn-add-cart" 
                icon={<ShoppingOutlined />}
                onClick={handleAddToCart}
                disabled={availableToBuy <= 0 || quantity > availableToBuy}
              >
                Giỏ Hàng
              </Button>
            </div>
          </Col>
        </Row>

        <div className="product-info-tabs" style={{ marginTop: 50 }} ref={reviewRef}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            type="card"
            items={[
              {
                key: "1",
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileTextOutlined /> Mô tả & Đặc điểm
                  </span>
                ),
                children: (
                  <div className="product-description-box" style={{ padding: '20px', background: '#fff', borderRadius: 8 }}>
                    <Paragraph>
                      {product?.moTa || "Giày thể thao cao cấp với thiết kế hiện đại, phù hợp chạy bộ và hoạt động hàng ngày."}
                    </Paragraph>
                    <ul className="product-features">
                      <li>✔ Chất liệu vải thoáng khí, mang lại cảm giác thoải mái</li>
                      <li>✔ Đế cao su chống trượt, tăng độ bám</li>
                      <li>✔ Thiết kế thể thao hiện đại</li>
                      <li>✔ Phù hợp chạy bộ, tập gym và đi chơi</li>
                      <li>✔ Form giày ôm chân, dễ phối đồ</li>
                    </ul>
                  </div>
                )
              },
              {
                key: "2",
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CommentOutlined /> Đánh giá <Badge count={reviews.length} offset={[10, -5]} size="small" style={{ backgroundColor: '#ff6600' }} />
                  </span>
                ),
                children: (
                  <div className="product-review-section" style={{ padding: '20px', background: '#fff', borderRadius: 8 }}>
                    <Title level={3}>Đánh giá sản phẩm</Title>
                    <div className="review-form" style={{ marginBottom: 40, padding: 20, background: '#f9f9f9', borderRadius: 12 }}>
                      <div style={{ marginBottom: 15 }}>
                        <Text strong>Viết đánh giá của bạn: </Text>
                        <Rate value={newRating} onChange={setNewRating} style={{ marginLeft: 15 }} />
                      </div>
                      <TextArea
                        rows={3}
                        placeholder="Hãy chia sẻ cảm nhận về sản phẩm này nhé..."
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        style={{ borderRadius: 8 }}
                      />
                      <Button
                        type="primary"
                        style={{ marginTop: 15, height: 40, borderRadius: 8, padding: '0 30px' }}
                        onClick={handleSubmitReview}
                      >
                        Gửi đánh giá ngay
                      </Button>
                    </div>

                    <List
                      itemLayout="horizontal"
                      dataSource={reviews}
                      renderItem={(item) => (
                        <List.Item style={{ padding: '20px 0' }}>
                          <List.Item.Meta
                            avatar={<Avatar size={50} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.khachHang?.id}`}/>}
                            title={
                              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                                <Text strong style={{ fontSize: 16 }}>{item.khachHang?.tenKhachHang || "Khách hàng ẩn danh"}</Text>
                                <Rate disabled value={item.soSao} style={{ fontSize: 12 }} />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {item.ngayDanhGia ? new Date(item.ngayDanhGia).toLocaleDateString() : ""}
                                </Text>
                              </div>
                            }
                            description={
                              <Text style={{ color: '#444', fontSize: 15 }}>{item.binhLuan}</Text>
                            }
                          />
                        </List.Item>
                      )}
                      locale={{ emptyText: "Chưa có đánh giá nào cho sản phẩm này." }}
                    />
                  </div>
                )
              }
            ]}
          />
        </div>

        {/* ⭐ SẢN PHẨM KHÁC */}
        <div className="related-products" style={{ marginTop: 100 }}>
          <div className="related-products-header">
            <Title level={2} style={{ fontSize: '2.5rem', fontWeight: 800 }}>DÀNH RIÊNG CHO BẠN</Title>
            <Text type="secondary" style={{ fontSize: 16 }}>Khám phá các mẫu giày thể thao tương tự đang được ưa chuộng</Text>
          </div>

          <Row gutter={[32, 32]}>
            {relatedProducts.map((item) => (
              <Col xs={12} sm={12} md={8} lg={6} key={item.id}>
                <Card
                  className="premium-product-card"
                  hoverable
                  onClick={() => navigate(`/products/${item.id}`)}
                  cover={
                    <div style={{ padding: 20, background: '#f8f9fa', display: 'flex', justifyContent: 'center' }}>
                      <img
                        src={
                          item.images 
                            ? (item.images.startsWith('http') ? item.images.split(',')[0].trim() : `${config.baseUrl}images/${item.images.split(',')[0].trim()}`)
                            : '/logo.png'
                        }
                        alt={item.tenSanPham}
                        style={{ width: '85%', aspectRatio: '1/1', objectFit: 'contain' }}
                      />
                    </div>
                  }
                >
                  <Card.Meta 
                    title={<Text strong style={{ fontSize: 16 }}>{item.tenSanPham}</Text>}
                    description={
                      <div>
                        <Text type="danger" style={{ fontSize: 18, fontWeight: 800 }}>{item.giaBan?.toLocaleString()}₫</Text>
                        <div style={{ marginTop: 5 }}>
                          <Rate disabled value={5} style={{ fontSize: 10 }} />
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

      </div>

    </div>
  );
}

export default ProductDetail; 
