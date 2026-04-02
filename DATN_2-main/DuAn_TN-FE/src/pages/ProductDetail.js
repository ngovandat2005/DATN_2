import React, { useEffect, useState } from "react";
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
  App,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { getCustomerId, isLoggedIn } from "../utils/authUtils";
import config from '../config/config';
import '../styles/Home.css';
import { Rate, List, Avatar, Input } from "antd";
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
  const { message } = App.useApp();
  // ⭐ SẢN PHẨM LIÊN QUAN
  const [relatedProducts, setRelatedProducts] = useState([]);
  // ⭐ REVIEW
  const [reviews, setReviews] = useState([]);

  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [cartItems, setCartItems] = useState([]); // ✅ THÊM: Theo dõi giỏ hàng để tính tồn kho thực tế



  // ✅ THÊM: Lấy ID khách hàng từ localStorage
  const customerId = getCustomerId();

  // Lấy chi tiết sản phẩm và biến thể từ API
  useEffect(() => {
    let isMounted = true; // Phòng trường hợp người dùng click chuyển trang liên tục

    setProduct(null);
    setVariants([]);
    setCurrentVariant(null);
    setLoading(true);

    fetch(config.getApiUrl(`api/san-pham-chi-tiet/${id}`))
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi mạng");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setVariants(data);
          const firstVariant = data[0];
          setProduct(firstVariant?.sanPham || null);
          // Tự động chọn biến thể đầu tiên để hiện ảnh chính ngay lập tức
          setCurrentVariant(firstVariant || null);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error(err);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
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

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // ✅ SỬA: Dùng config.getApiUrl để trỏ đúng về port 8080
        const res = await axios.get(`http://localhost:8080/api/danh-gia/san-pham/${id}`);
        setReviews(res.data);
      } catch (err) {
        console.error("Lỗi khi load đánh giá:", err);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);
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

        // Trong loadProducts
        const productsWithPrice = await Promise.all(
          filtered.map(async (p) => {
            const variantRes = await fetch(config.getApiUrl(`api/san-pham-chi-tiet/${p.id}`));
            const variantData = await variantRes.json();

            return {
              ...p,
              giaBan: variantData?.[0]?.giaBan || 0,
              hinhAnh: variantData?.[0]?.hinhAnh // Lấy ảnh của biến thể đầu tiên gán cho sản phẩm
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


  // Tự động chọn màu và size đầu tiên có sẵn
  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0].tenMauSac);
    }
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0].tenKichThuoc);
    }
  }, [availableColors, availableSizes, selectedColor, selectedSize]);

  // Xác định biến thể hiện tại dựa trên các lựa chọn
  useEffect(() => {
    const found = variants.find((v) => {
      const variantColor = v.mauSac?.tenMauSac;
      const variantSize = v.kichThuoc?.tenKichThuoc;
      return variantColor === selectedColor && variantSize === selectedSize;
    });
    setCurrentVariant(found || null);

    setQuantity(1); // reset số lượng khi đổi biến thể
  }, [selectedColor, selectedSize, variants]);

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
  // Thay thế hàm getProductImage cũ của bạn bằng hàm này
  // Thay thế hàm getProductImage cũ bằng hàm này
  // Thay thế hàm getProductImage cũ bằng hàm này
  const getProductImage = (data) => {
    if (!data) return '/logo.png'; // Ảnh mặc định nếu không có dữ liệu

    // 1. Lấy chuỗi hình ảnh từ object
    // Ưu tiên lấy hinhAnh của biến thể (currentVariant), sau đó đến images của sản phẩm gốc (product)
    let rawImages = data.hinhAnh || data.images || "";

    if (!rawImages) return '/logo.png'; // Ảnh mặc định nếu trường hình ảnh trống

    // 2. Xử lý nếu dữ liệu là mảng hoặc chuỗi JSON hoặc chuỗi phân cách bởi dấu phẩy
    let firstImage = "";
    if (Array.isArray(rawImages)) {
      firstImage = rawImages[0];
    } else if (typeof rawImages === 'string') {
      if (rawImages.startsWith('[')) {
        try {
          const imagesArray = JSON.parse(rawImages);
          firstImage = imagesArray[0];
        } catch (e) {
          firstImage = rawImages.split(',')[0].trim();
        }
      } else {
        firstImage = rawImages.split(',')[0].trim();
      }
    }

    if (!firstImage) return '/logo.png';

    // 3. Cắt lấy tên file cuối cùng (loại bỏ C:\path\...)
    const fileName = firstImage.split('\\').pop().split('/').pop();

    // 4. Trả về URL tuyệt đối qua Port 8080 (ví dụ: http://localhost:8080/images/giay.jpg)
    return config.getApiUrl(`images/${fileName}`);
  };
  const handleSubmitReview = async () => {
    // 1. Kiểm tra đăng nhập
    if (!isLoggedIn()) {
      return Swal.fire("Thông báo", "Vui lòng đăng nhập để đánh giá!", "warning");
    }

    // 2. Kiểm tra customerId (Tránh lỗi 400 id must not be null)
    if (!customerId) {
      console.error("Lỗi: customerId lấy từ authUtils bị null");
      return message.error("Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại!");
    }

    // 3. Kiểm tra nội dung
    if (!newReview || newReview.trim() === "") {
      return message.warning("Vui lòng nhập nội dung bình luận!");
    }

    // 4. Chuẩn bị Payload (ép kiểu số để chắc chắn)
    const reviewPayload = {
      idKhachHang: Number(customerId),
      idSanPham: Number(id),
      soSao: newRating,
      binhLuan: newReview.trim()
    };

    try {
      // Gọi API (Đảm bảo URL port 8080)
      await axios.post("http://localhost:8080/api/danh-gia/them", reviewPayload);

      message.success("Cảm ơn bạn đã đánh giá!");
      setNewReview("");
      setNewRating(5);

      // 5. Load lại danh sách đánh giá sau khi thêm thành công
      const res = await axios.get(`http://localhost:8080/api/danh-gia/san-pham/${id}`);
      setReviews(res.data);
    } catch (error) {
      console.error("Lỗi gửi đánh giá:", error.response?.data);
      const backendError = error.response?.data;
      message.error(typeof backendError === 'string' ? backendError : "Không thể gửi đánh giá!");
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
        <Row gutter={32}>
          <Col span={10} className="product-detail-image">
            <div style={{
              position: 'relative',
              width: '100%',
              paddingTop: '100%',
              overflow: 'hidden',
              borderRadius: '10px',
              backgroundColor: '#f5f5f5' // Thêm nền nhẹ để biết khung ảnh nằm đâu
            }}>
              {/* Logic: Ưu tiên chọn Biến thể đang click, nếu chưa click thì lấy Biến thể thứ 1 */}
              {(currentVariant || (variants && variants.length > 0)) && (
                <Image
                  key={currentVariant?.id || (variants[0]?.id)} // Thêm key để React render lại khi đổi biến thể
                  src={getProductImage(currentVariant || variants[0])}
                  alt={product?.tenSanPham || "Sản phẩm"}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  fallback="https://via.placeholder.com/400x400.png?text=Hinh+Anh+Khong+Ton+Tai"
                  preview={true}
                />
              )}
            </div>
          </Col>
          <Col span={14} className="product-detail-info">
            <Title level={2}>{product?.tenSanPham || product?.name}</Title>
            <div style={{ marginBottom: 8 }}>
              {/* ✅ SỬA LẠI: Hiển thị giá khuyến mãi và giá gốc */}
              {(() => {
                const priceInfo = getDisplayPrice(currentVariant || variants[0]);

                if (priceInfo.hasDiscount) {
                  return (
                    <div>
                      <Text
                        delete
                        style={{
                          fontSize: 18,
                          color: '#666',
                          marginRight: 12
                        }}
                      >
                        {priceInfo.originalPrice.toLocaleString()}₫
                      </Text>
                      <Text
                        strong
                        style={{
                          color: "#f5222d",
                          fontSize: 22
                        }}
                      >
                        {priceInfo.finalPrice.toLocaleString()}₫
                      </Text>
                      <Tag
                        color="red"
                        style={{
                          marginLeft: 8,
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}
                      >
                        -{Math.round(((priceInfo.originalPrice - priceInfo.finalPrice) / priceInfo.originalPrice) * 100)}%
                      </Tag>
                    </div>
                  );
                } else {
                  return (
                    <Text strong style={{ color: "#f5222d", fontSize: 22 }}>
                      {priceInfo.finalPrice.toLocaleString()}₫
                    </Text>
                  );
                }
              })()}
            </div>
            <div style={{ marginBottom: 8 }}>
              <Tag color="blue">
                Loại:{" "}
                {currentVariant?.danhMuc?.tenDanhMuc ||
                  product?.danhMuc?.tenDanhMuc ||
                  "---"}
              </Tag>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Tag color={stock > 0 ? (availableToBuy > 0 ? "green" : "orange") : "red"}>
                {selectedColor && selectedSize
                  ? stock > 0
                    ? availableToBuy > 0
                      ? `Tình trạng: Còn ${availableToBuy} sản phẩm có thể thêm (Tổng kho: ${stock}${currentInCart > 0 ? `, đã có ${currentInCart} trong giỏ` : ""})`
                      : `Tình trạng: Đã đạt giới hạn tối đa trong giỏ hàng (Tổng kho: ${stock})`
                    : `Tình trạng: Màu ${selectedColor}, Size ${selectedSize} đã hết hàng`
                  : "Vui lòng chọn đủ màu và size"}
              </Tag>
            </div>
            <div className="product-description-box">
              <Title level={4}>Mô tả sản phẩm</Title>

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
            <div className="product-service">
              <div>🚚 Giao hàng toàn quốc</div>
              <div>💰 Thanh toán khi nhận hàng</div>
              <div>🔄 Đổi trả trong 7 ngày</div>
            </div>
            <div style={{ margin: "16px 0" }}>
              <div style={{ marginBottom: 8 }}>
                <span>Chọn màu: </span>

                {availableColors.map((color) => {

                  return (
                    <Button
                      key={color.id}
                      type={
                        selectedColor === color.tenMauSac ? "primary" : "default"
                      }
                      style={{
                        marginRight: 8,
                        background:
                          color.tenMauSac &&
                            color.tenMauSac.toLowerCase() !== "trắng"
                            ? color.tenMauSac
                            : undefined,
                        color:
                          color.tenMauSac &&
                            ["đen", "black"].includes(color.tenMauSac.toLowerCase())
                            ? "#fff"
                            : "#222",
                        border:
                          selectedColor === color.tenMauSac
                            ? "2px solid #1890ff"
                            : undefined,
                      }}
                      onClick={() => {
                        setSelectedColor(color.tenMauSac);
                        setTimeout(() => {
                          if (!selectedSize) {
                            message.info("Vui lòng chọn đủ size!");
                          }
                        }, 0);
                      }}
                    >
                      {color.tenMauSac}
                    </Button>
                  );
                })}
              </div>
              <div style={{ marginBottom: 8 }}>
                <span>Chọn size: </span>
                {availableSizes.map((size) => (
                  <Button
                    key={size.id}
                    type={
                      selectedSize === size.tenKichThuoc ? "primary" : "default"
                    }
                    style={{
                      marginRight: 8,
                      border:
                        selectedSize === size.tenKichThuoc
                          ? "2px solid #1890ff"
                          : undefined,
                    }}
                    onClick={() => setSelectedSize(size.tenKichThuoc)}
                  >
                    {size.tenKichThuoc}
                  </Button>
                ))}
              </div>
              <div style={{ marginBottom: 8 }}>
                <span>Số lượng: </span>
                <InputNumber
                  min={1}
                  value={quantity}
                  onChange={(val) => setQuantity(val)}
                  style={{ width: 80, marginLeft: 8 }}
                />
              </div>
              <div className="product-detail-actions">
                <Button type="primary" size="large" onClick={handleBuy}>
                  Mua ngay
                </Button>
                <Button size="large" onClick={handleAddToCart}>
                  Thêm vào giỏ hàng
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* ⭐ PHẦN ĐÁNH GIÁ */}
        <div className="product-review-section">

          <Title level={3}>Đánh giá sản phẩm</Title>

          {/* FORM REVIEW */}
          <div className="review-form">

            <div style={{ marginBottom: 10 }}>
              <span>Đánh giá của bạn: </span>
              <Rate value={newRating} onChange={setNewRating} />
            </div>

            <TextArea
              rows={3}
              placeholder="Viết đánh giá của bạn..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
            />

            <Button
              type="primary"
              style={{ marginTop: 10 }}
              onClick={handleSubmitReview}
            >
              Gửi đánh giá
            </Button>

          </div>

          {/* DANH SÁCH REVIEW */}
          {/* DANH SÁCH REVIEW - Tìm đến dòng này trong code của bạn */}
          <List
            itemLayout="horizontal"
            dataSource={reviews}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  /* SỬA TẠI ĐÂY: Đổi hoTen thành tenKhachHang */
                  avatar={<Avatar>{item.khachHang?.tenKhachHang ? item.khachHang.tenKhachHang[0] : "U"}</Avatar>}
                  title={
                    <div>
                      {/* SỬA TẠI ĐÂY: Đổi hoTen thành tenKhachHang */}
                      <Text strong>{item.khachHang?.tenKhachHang || "Người dùng"}</Text>
                      <Rate disabled value={item.soSao} style={{ marginLeft: 10, fontSize: 12 }} />
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {item.ngayDanhGia ? new Date(item.ngayDanhGia).toLocaleString('vi-VN') : "Vừa xong"}
                      </Text>
                    </div>
                  }
                  description={item.binhLuan}
                />
              </List.Item>
            )}
          />

        </div>
        {/* ⭐ SẢN PHẨM KHÁC */}
        <div className="related-products" style={{ marginTop: '40px' }}>
          <Title level={3}>Sản phẩm khác</Title>
          <Row gutter={[20, 20]}>
            {relatedProducts.map((item) => (
              <Col span={6} key={item.id}>
                <div
                  className="product-card"
                  onClick={() => navigate(`/products/${item.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ width: '100%', height: '200px', overflow: 'hidden', borderRadius: '8px' }}>
                    <img
                      // TRUYỀN CẢ ITEM VÀO HÀM (KHÔNG PHẢI ITEM.HINHANH)
                      src={getProductImage(item)}
                      alt={item.tenSanPham}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/logo.png";
                      }}
                    />
                  </div>
                  <h4 style={{ marginTop: '10px' }}>{item.tenSanPham}</h4>
                  <p className="price" style={{ color: '#f5222d', fontWeight: 'bold' }}>
                    {(item.giaBan || 0).toLocaleString()}₫
                  </p>
                </div>
              </Col>
            ))}
          </Row>
        </div>


      </div>

    </div >
  );
}

export default ProductDetail; 
