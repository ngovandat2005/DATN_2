import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { getCustomerId } from "../utils/authUtils";
import config from "../config/config";

// ✅ THÊM: Function kiểm tra số lượng đơn hàng hiện tại của khách hàng
const checkCustomerOrderLimit = async (customerId) => {
  if (!customerId || customerId === 'null' || customerId === 'undefined') {
    console.error('❌ [CheckPayment] customerId không hợp lệ:', customerId);
    return {
      success: false,
      currentOrderCount: 0,
      canCreateOrder: false,
      message: 'Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại!'
    };
  }

  const apiUrl = config.getApiUrl(`api/donhang/khach/${customerId}`);
  try {
    console.log('🚀 [CheckPayment] Đang kiểm tra giới hạn đơn hàng tại URL:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [CheckPayment] API Trả về lỗi (${response.status}):`, errorText);
      
      let errorMessage = 'Lỗi kiểm tra giới hạn.';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) errorMessage = errorJson.message;
      } catch (e) {
        if (errorText && errorText.length < 100) errorMessage = errorText;
      }

      return {
        success: false,
        currentOrderCount: 0,
        canCreateOrder: false,
        message: `Lỗi server (${response.status}) khi kiểm tra giới hạn: ${errorMessage}`
      };
    }

    const orders = await response.json();
    const activeOrders = orders.filter(order => ![4, 5, 6].includes(Number(order.trangThai)));
    console.log('📊 [CheckPayment] Đơn hàng đang hoạt động:', activeOrders.length);

    return {
      success: true,
      currentOrderCount: activeOrders.length,
      canCreateOrder: activeOrders.length < 10,
      message: activeOrders.length >= 10
        ? `Bạn đã đạt giới hạn tối đa 10 đơn hàng đang xử lý.`
        : `Hợp lệ.`
    };
  } catch (error) {
    console.error('❌ [CheckPayment] Lỗi kết nối API:', apiUrl, error);
    return {
      success: false,
      currentOrderCount: 0,
      canCreateOrder: false,
      message: `Lỗi kết nối máy chủ! URL: ${apiUrl}. Lỗi: ${error.message}`
    };
  }
};

const CheckPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("info");
  const [title, setTitle] = useState("Đang xử lý thanh toán...");
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessed = useRef(false); // ✅ Guard against double processing
  const [completedOrderInfo, setCompletedOrderInfo] = useState(null);

  // ✅ Function xử lý cart item
  const processCartItem = (item, index) => {
    console.log(`🔄 === XỬ LÝ ITEM ${index + 1} ===`);
    console.log(`📦 Item gốc:`, item);
    console.log(`🔑 Keys của item:`, Object.keys(item));
    console.log(`🆔 idSanPhamChiTiet:`, item.idSanPhamChiTiet);
    console.log(`🆔 id:`, item.id);
    console.log(`💰 giaBan:`, item.giaBan);
    console.log(`💰 giaBanGiamGia:`, item.giaBanGiamGia);
    console.log(`💰 gia:`, item.gia);
    console.log(`📊 soLuong:`, item.soLuong);
    console.log(`📝 tenSanPham:`, item.tenSanPham);

    let processedItem = null;

    // ✅ Cấu trúc từ giỏ hàng với sanPhamChiTiet
    if (item.sanPhamChiTiet && item.sanPhamChiTiet.id) {
      console.log(`🛒 Item ${index + 1} từ giỏ hàng chi tiết:`, item.sanPhamChiTiet);

      const hasDiscount = item.sanPhamChiTiet.giaBanGiamGia &&
        item.sanPhamChiTiet.giaBanGiamGia > 0 &&
        item.sanPhamChiTiet.giaBanGiamGia < item.sanPhamChiTiet.giaBan;
      const giaBan = hasDiscount ? item.sanPhamChiTiet.giaBanGiamGia : item.sanPhamChiTiet.giaBan;

      processedItem = {
        idSanPhamChiTiet: item.sanPhamChiTiet.id,
        soLuong: item.soLuong || 1,
        gia: giaBan,
        thanhTien: giaBan * (item.soLuong || 1),
        source: 'cart_sanPhamChiTiet'
      };

      console.log(`✅ Tạo processedItem từ cart sanPhamChiTiet:`, processedItem);
    }
    // ✅ Cấu trúc từ MUA NGAY
    else if (item.id && item.tenSanPham && item.giaBan !== undefined) {
      console.log(`🛒 Item ${index + 1} từ MUA NGAY:`,
        `hinhAnh=${item.hinhAnh}, giaBan=${item.giaBan}, giaBanGiamGia=${item.giaBanGiamGia}, soLuong=${item.soLuong}`);

      const hasDiscount = item.giaBanGiamGia && item.giaBanGiamGia > 0 && item.giaBanGiamGia < item.giaBan;
      const finalPrice = hasDiscount ? item.giaBanGiamGia : item.giaBan;

      console.log(`💰 Kết quả: hasDiscount=${hasDiscount}, finalPrice=${finalPrice}`);

      processedItem = {
        idSanPhamChiTiet: item.idSanPhamChiTiet || item.id,  // ✅ Ưu tiên idSanPhamChiTiet
        soLuong: item.soLuong || 1,
        gia: finalPrice,
        thanhTien: finalPrice * (item.soLuong || 1),
        source: 'buy_now'
      };

      console.log(`✅ Tạo processedItem từ MUA NGAY:`, processedItem);
    }
    // ✅ Cấu trúc từ giỏ hàng
    else if (item.idSanPhamChiTiet && item.tenSanPham && item.giaBan !== undefined) {
      console.log(`🛒 Item ${index + 1} từ giỏ hàng:`,
        `hinhAnh=${item.hinhAnh}, giaBan=${item.giaBan}, giaBanGiamGia=${item.giaBanGiamGia}, soLuong=${item.soLuong}`);

      const hasDiscount = item.giaBanGiamGia && item.giaBanGiamGia > 0 && item.giaBanGiamGia < item.giaBan;
      const finalPrice = hasDiscount ? item.giaBanGiamGia : item.giaBan;

      console.log(`💰 Kết quả: hasDiscount=${hasDiscount}, finalPrice=${finalPrice}`);

      processedItem = {
        idSanPhamChiTiet: item.idSanPhamChiTiet,
        soLuong: item.soLuong || 1,
        gia: finalPrice,
        thanhTien: finalPrice * (item.soLuong || 1),
        source: 'cart'
      };

      console.log(`✅ Tạo processedItem từ giỏ hàng:`, processedItem);
    }
    // ✅ Cấu trúc từ backend
    else if (item.idSanPhamChiTiet && item.gia !== undefined) {
      console.log(`🛒 Item ${index + 1} từ backend:`,
        `gia=${item.gia}, soLuong=${item.soLuong}`);

      processedItem = {
        idSanPhamChiTiet: item.idSanPhamChiTiet,
        soLuong: item.soLuong || 1,
        gia: item.gia,
        thanhTien: item.gia * (item.soLuong || 1),
        source: 'backend'
      };

      console.log(`✅ Tạo processedItem từ backend:`, processedItem);
    }
    // ✅ Cấu trúc trực tiếp với giá
    else if (item.gia !== undefined && item.soLuong !== undefined) {
      console.log(`🛒 Item ${index + 1} với giá trực tiếp:`,
        `gia=${item.gia}, soLuong=${item.soLuong}`);

      processedItem = {
        idSanPhamChiTiet: item.idSanPhamChiTiet || item.id,  // ✅ Ưu tiên idSanPhamChiTiet
        soLuong: item.soLuong,
        gia: item.gia,
        thanhTien: item.gia * item.soLuong,
        source: 'direct_price'
      };

      console.log(`✅ Tạo processedItem từ giá trực tiếp:`, processedItem);
    }

    if (!processedItem) {
      console.error(`❌ === KHÔNG THỂ XỬ LÝ ITEM ${index + 1} ===`);
      console.error(`📦 Item gốc:`, item);
      console.error(`❌ Cấu trúc không hợp lệ:`, {
        hasId: !!item.id,
        hasIdSanPhamChiTiet: !!item.idSanPhamChiTiet,
        hasTenSanPham: !!item.tenSanPham,
        hasGiaBan: item.giaBan !== undefined,
        hasGia: item.gia !== undefined,
        hasSoLuong: item.soLuong !== undefined
      });
    } else {
      console.log(`✅ === HOÀN THÀNH XỬ LÝ ITEM ${index + 1} ===`);
      console.log(`📦 Kết quả cuối cùng:`, processedItem);
    }

    return processedItem;
  };

  // ✅ Function xử lý đơn hàng thành công
  const processSuccessfulOrder = async (orderInfo) => {
    if (isProcessing || hasProcessed.current) {
      console.log('⚠️ Đơn hàng đang được xử lý hoặc đã xử lý xong, bỏ qua...');
      return;
    }

    hasProcessed.current = true;
    setIsProcessing(true);

    try {
      console.log('🔄 === XỬ LÝ ĐƠN HÀNG THÀNH CÔNG ===');
      console.log('📋 Thông tin đơn hàng:', orderInfo);

      // ✅ BƯỚC 1: Tạo đơn hàng mới
      console.log('📦 Tạo đơn hàng mới với trạng thái 0...');

      const customerId = getCustomerId();
      if (!customerId) {
        throw new Error('Không tìm thấy ID khách hàng');
      }

      // ✅ THÊM: Kiểm tra giới hạn đơn hàng trước khi tạo đơn mới
      console.log('🔍 Kiểm tra giới hạn đơn hàng cho khách hàng:', customerId);
      const orderLimitCheck = await checkCustomerOrderLimit(customerId);

      if (!orderLimitCheck.success) {
        throw new Error(orderLimitCheck.message);
      }

      if (!orderLimitCheck.canCreateOrder) {
        // ✅ Hiển thị thông báo lỗi đẹp giống Payment.js
        if (window.Swal) {
          window.Swal.fire({
            icon: 'warning',
            title: '⚠️ Đã đạt giới hạn đơn hàng!',
            html: `
              <div style="text-align: left; padding: 16px;">
                <p style="margin-bottom: 12px; color: #666;">
                  <strong>Bạn đã đạt giới hạn tối đa 10 đơn hàng đang xử lý.</strong>
                </p>
                <p style="margin-bottom: 12px; color: #666;">
                  Hiện tại: <span style="color: #f5222d; font-weight: bold;">${orderLimitCheck.currentOrderCount}/10 đơn hàng</span>
                </p>
                <div style="background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px; padding: 12px; margin: 12px 0;">
                  <p style="margin: 0; color: #389e0d;">
                    💡 <strong>Gợi ý:</strong> Vui lòng chờ các đơn hàng hiện tại hoàn thành hoặc bị hủy trước khi tạo đơn mới.
                  </p>
                </div>
                <p style="margin: 0; color: #666; font-size: 14px;">
                  Bạn có thể kiểm tra trạng thái đơn hàng trong mục "Lịch sử đơn hàng".
                </p>
              </div>
            `,
            confirmButtonText: 'Xem lịch sử đơn hàng',
            showCancelButton: true,
            cancelButtonText: 'Đóng',
            confirmButtonColor: '#1890ff',
            cancelButtonColor: '#d9d9d9',
            width: '500px'
          }).then((result) => {
            if (result.isConfirmed) {
              navigate('/orders');
            }
          });
        } else {
          // Fallback nếu không có SweetAlert2
          const detailedMessage = `Đã đạt giới hạn đơn hàng! Bạn hiện có ${orderLimitCheck.currentOrderCount}/10 đơn hàng đang xử lý. Vui lòng chờ các đơn hàng hiện tại hoàn thành trước khi tạo đơn mới.`;
          throw new Error(detailedMessage);
        }
        return; // Dừng xử lý nếu đã hiển thị SweetAlert2
      }

      console.log('✅ Khách hàng có thể tạo đơn hàng mới:', orderLimitCheck.message);

      // Chuyển đổi cart sang định dạng backend SanPhamDatDTO
      const sanPhamDat = orderInfo.cart.map((item, idx) => {
        const processed = processCartItem(item, idx);
        return {
          idSanPhamChiTiet: processed.idSanPhamChiTiet,
          soLuong: processed.soLuong
        };
      });

      const orderData = {
        idKhachHang: customerId, // ✅ SỬA: idkhachHang -> idKhachHang
        tenNguoiNhan: orderInfo.tenNguoiNhan,
        soDienThoaiGiaoHang: orderInfo.soDienThoaiGiaoHang,
        emailGiaoHang: orderInfo.emailGiaoHang,
        diaChiGiaoHang: orderInfo.diaChiGiaoHang,
        idVoucher: orderInfo.selectedVoucherId || null,
        tongTien: Number(orderInfo.tongTien || 0) - Number(orderInfo.phiVanChuyen || 0), // ✅ SỬA: Đảm bảo là số
        phiVanChuyen: Number(orderInfo.phiVanChuyen || 0), // ✅ SỬA: Đảm bảo là số
        sanPhamDat: sanPhamDat // ✅ SỬA: cart -> sanPhamDat
      };

      console.log('🚀 Gửi dữ liệu tạo đơn hàng:', orderData);
      console.log('🔍 DEBUG - orderInfo.phiVanChuyen:', orderInfo.phiVanChuyen);
      console.log('🔍 DEBUG - orderInfo.tongTien:', orderInfo.tongTien);
      console.log('🔍 DEBUG - Final phiVanChuyen in orderData:', orderData.phiVanChuyen);
      console.log('🔍 DEBUG - Final tongTien in orderData:', orderData.tongTien);

      console.log('💰 Chi tiết tiền:');
      console.log('   - Tiền hàng (sau voucher):', orderInfo.tongTien);
      console.log('   - Phí vận chuyển:', orderInfo.phiVanChuyen);
      console.log('   - Tổng thanh toán (dự kiến):', orderInfo.tongTien + orderInfo.phiVanChuyen);
      if (orderInfo.selectedVoucherId) {
        console.log('   - Voucher ID:', orderInfo.selectedVoucherId);
      }

      const orderRes = await fetch(config.getApiUrl('api/donhang/online'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!orderRes.ok) {
        const errorText = await orderRes.text();
        console.error('❌ Chi tiết lỗi từ backend:', errorText);
        throw new Error(`Không thể tạo đơn hàng: ${errorText}`);
      }

      const createdOrder = await orderRes.json();
      const finalOrderId = createdOrder.id;
      console.log('✅ Đã tạo đơn hàng thành công qua backend (đã bao gồm chi tiết và voucher):', finalOrderId);

      // ✅ BƯỚC 5: Xử lý giỏ hàng
      console.log('Bước 5: Xử lý giỏ hàng...');

      if (orderInfo.cart && orderInfo.cart.length > 0) {
        const firstItem = orderInfo.cart[0];
        const source = processCartItem(firstItem, 0)?.source;

        console.log('📊 Nguồn sản phẩm đầu tiên:', source);
        console.log('🔍 Kiểm tra giỏ hàng:', orderInfo.cart);

        // ✅ SỬA: Luôn xóa giỏ hàng khi thanh toán thành công, bất kể source
        console.log('🗑️ Xóa giỏ hàng sau khi thanh toán thành công...');

        try {
          // ✅ GỌI API XÓA TẤT CẢ GIỎ HÀNG TRÊN BACKEND
          console.log('🔄 Gọi API xóa tất cả giỏ hàng...');
          const customerId = getCustomerId();
          console.log('👤 Customer ID:', customerId);

          if (customerId) {
            const clearCartRes = await fetch(config.getApiUrl(`api/gio-hang-chi-tiet/xoa-tat-ca/${customerId}`), {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' }
            });

            if (clearCartRes.ok) {
              console.log('✅ Đã xóa tất cả giỏ hàng trên backend');
            } else {
              const errorText = await clearCartRes.text();
              console.warn('⚠️ Không thể xóa giỏ hàng trên backend:', errorText);
            }
          } else {
            console.warn('⚠️ Không tìm thấy customerId, bỏ qua xóa giỏ hàng backend');
          }
        } catch (clearCartError) {
          console.warn('⚠️ Lỗi khi xóa giỏ hàng backend:', clearCartError);
        }

        // ✅ Xóa giỏ hàng trên localStorage
        localStorage.removeItem('cart');
        console.log('✅ Đã xóa giỏ hàng trên localStorage');

        // ✅ Xóa giỏ hàng trên sessionStorage (nếu có)
        sessionStorage.removeItem('cart');
        console.log('✅ Đã xóa giỏ hàng trên sessionStorage');

        // ✅ Dispatch event để cập nhật UI
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: [] } }));
        console.log('✅ Đã dispatch event cartUpdated');
      } else {
        console.log('ℹ️ Không có giỏ hàng để xóa');
      }

      console.log('✅ Hoàn tất tạo đơn hàng!');

    } catch (error) {
      console.error('❌ Lỗi khi xử lý đơn hàng:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (isProcessing) {
      console.log('⚠️ Đang xử lý, bỏ qua...');
      return;
    }

    const processPayment = async () => {
      setIsProcessing(true);

      try {
        const vnpResponseCode = searchParams.get('vnp_ResponseCode');
        const vnpTxnRef = searchParams.get('vnp_TxnRef');
        const vnpAmount = searchParams.get('vnp_Amount');

        console.log('🔄 === XỬ LÝ CALLBACK VNPAY TỪ CHECK-PAYMENT ===');
        console.log('📊 Response Code:', vnpResponseCode);
        console.log('📊 Transaction Ref:', vnpTxnRef);
        console.log('📊 Amount:', vnpAmount);
        console.log('📍 Full URL:', window.location.href);

        if (vnpResponseCode === '00') {
          console.log('✅ VNPAY thanh toán thành công!');
          setStatus("success");
          setTitle("Thanh toán thành công");

          try {
            const { data } = await axios.get(
              config.getApiUrl(`api/payment/vnpay-return?${searchParams.toString()}`)
            );
            console.log('✅ Backend response:', data);
          } catch (backendError) {
            console.warn('⚠️ Không thể gọi backend, nhưng VNPAY đã thành công');
            toast.warning('⚠️ VNPAY thành công nhưng không thể xác nhận với backend');
          }

          const pendingOrderInfo = localStorage.getItem('pendingOrderInfo');
          if (pendingOrderInfo) {
            console.log('🔄 Phát hiện đơn hàng chờ, đang xử lý...');

            try {
              const orderInfo = JSON.parse(pendingOrderInfo);
              console.log('📋 Thông tin đơn hàng chờ:', orderInfo);
              setCompletedOrderInfo(orderInfo); // ✅ Lưu vào state để hiển thị sau khi xóa localStorage

              toast.info('⚙️ Đang tạo đơn hàng...', {
                position: "top-center",
                autoClose: 2000,
              });

              await processSuccessfulOrder(orderInfo);

              localStorage.removeItem('pendingOrderInfo');

              toast.success('🎉 Thanh toán VNPAY thành công! Đơn hàng đã được tạo.', {
                position: "top-center",
                autoClose: 5000,
              });

              setTimeout(() => {
                navigate('/orders');
              }, 3000);

            } catch (error) {
              console.error('❌ Lỗi khi xử lý đơn hàng:', error);
              toast.error('❌ Lỗi khi xử lý đơn hàng: ' + error.message);

              setTimeout(() => {
                navigate('/payment');
              }, 3000);
            }
          } else {
            console.log('⚠️ Không có đơn hàng chờ');
            toast.success('🎉 Đơn hàng đã được ghi nhận thành công!', {
              position: "top-center",
              autoClose: 2000,
            });
          }

        } else if (vnpResponseCode) {
          console.log('❌ VNPAY thanh toán thất bại với code:', vnpResponseCode);
          setStatus("error");
          setTitle("Thanh toán thất bại");

          localStorage.removeItem('pendingOrderInfo');

          let errorMessage = 'Thanh toán VNPAY thất bại';
          switch (vnpResponseCode) {
            case '07':
              errorMessage = 'Giao dịch bị nghi ngờ gian lận';
              break;
            case '09':
              errorMessage = 'Giao dịch không thành công';
              break;
            case '10':
              errorMessage = 'Giao dịch bị hủy';
              break;
            case '11':
              errorMessage = 'Giao dịch bị từ chối';
              break;
            case '12':
              errorMessage = 'Giao dịch bị lỗi';
              break;
            case '13':
              errorMessage = 'Giao dịch bị từ chối';
              break;
            case '24':
              errorMessage = 'Khách hàng hủy giao dịch';
              break;
            default:
              errorMessage = `Thanh toán thất bại với mã lỗi: ${vnpResponseCode}`;
          }

          toast.error('❌ ' + errorMessage, {
            position: "top-center",
            autoClose: 5000,
          });

          setTimeout(() => {
            navigate('/payment');
          }, 3000);

        } else {
          console.log('⚠️ Không có response code từ VNPAY');
          setStatus("error");
          setTitle("Không thể xác nhận trạng thái");

          toast.warning('⚠️ Không thể xác nhận trạng thái thanh toán', {
            position: "top-center",
            autoClose: 5000,
          });

          setTimeout(() => {
            navigate('/payment');
          }, 3000);
        }

      } catch (error) {
        console.error('❌ Lỗi khi xử lý callback VNPAY:', error);
        setStatus("error");
        setTitle("Có lỗi xảy ra khi xác thực thanh toán");

        toast.error('❌ Lỗi khi xử lý thanh toán VNPAY', {
          position: "top-center",
          autoClose: 5000,
        });

        setTimeout(() => {
          navigate('/payment');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [isProcessing, navigate, searchParams, processSuccessfulOrder]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>⏳</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Đang xử lý thanh toán...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Vui lòng đợi trong giây lát</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Result
        status={status}
        title={title}
        subTitle={status === 'success' ? 'Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng của chúng tôi!' : 'Rất tiếc, đã có lỗi xảy ra trong quá trình thanh toán.'}
        extra={[
          <Button key="orders" type="primary" onClick={() => navigate("/orders")}>Xem đơn hàng</Button>,
          <Button key="home" onClick={() => navigate("/")}>Về trang chủ</Button>,
        ]}
      >
        {status === 'success' && completedOrderInfo && (
          <div style={{ marginTop: '30px', textAlign: 'left', padding: '20px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid #e8e8e8', paddingBottom: '10px' }}>Chi tiết đơn hàng vừa thanh toán</h3>
            <div className="order-summary-list">
              {completedOrderInfo.cart?.map((rawItem, index) => {
                const item = {
                  name: rawItem.tenSanPham || rawItem.name || rawItem.sanPhamChiTiet?.sanPham?.tenSanPham || 'Sản phẩm',
                  imageUrl: rawItem.hinhAnh || rawItem.image || rawItem.images || rawItem.sanPhamChiTiet?.sanPham?.images?.split(',')[0],
                  qty: rawItem.soLuong || rawItem.quantity || 1,
                  price: rawItem.giaBanGiamGia || rawItem.giaBan || rawItem.gia || rawItem.price || rawItem.sanPhamChiTiet?.giaBan,
                  variant: [
                    rawItem.mauSac || rawItem.tenMauSac || rawItem.sanPhamChiTiet?.mauSac?.tenMauSac ? `Màu: ${rawItem.mauSac || rawItem.tenMauSac || rawItem.sanPhamChiTiet?.mauSac?.tenMauSac}` : null,
                    rawItem.kichThuoc || rawItem.tenKichThuoc || rawItem.sanPhamChiTiet?.kichThuoc?.tenKichThuoc ? `Size: ${rawItem.kichThuoc || rawItem.tenKichThuoc || rawItem.sanPhamChiTiet?.kichThuoc?.tenKichThuoc}` : null
                  ].filter(Boolean).join(' • ')
                };

                const buildImgUrl = (raw) => {
                  if (!raw) return 'https://via.placeholder.com/60';
                  if (typeof raw === 'string' && (raw.startsWith('http://') || raw.startsWith('https://'))) return raw;
                  
                  // ✅ SỬA: Lấy ảnh đầu tiên nếu là chuỗi nhiều ảnh (ngăn cách bởi dấu phẩy)
                  let firstImg = typeof raw === 'string' ? raw.split(',')[0].trim() : String(raw).trim();
                  
                  // ✅ Xử lý dấu gạch chéo ở đầu hoặc prefix "images/" nếu có
                  if (firstImg.startsWith('/')) {
                    firstImg = firstImg.substring(1);
                  }
                  if (firstImg.startsWith('images/')) {
                    firstImg = firstImg.substring(7);
                  }
                  
                  // ✅ SỬA: Sử dụng URL tuyệt đối trong phát triển
                  const encodedImg = encodeURIComponent(firstImg);
                  const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : '';
                  const fullUrl = `${baseUrl}/images/${encodedImg}`;
                  return fullUrl;
                };

                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', padding: '10px', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <img 
                      src={buildImgUrl(item.imageUrl)} 
                      alt={item.name} 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{item.name}</div>
                      <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>
                        {item.variant && (
                          <span style={{ backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '10px', marginRight: '8px' }}>
                            {item.variant}
                          </span>
                        )}
                        <span>Số lượng: {item.qty}</span>
                      </div>
                    </div>
                    <div style={{ fontWeight: '600', color: '#e74c3c' }}>
                      {(item.price * item.qty).toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                );
              })}
              
              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #d9d9d9', textAlign: 'right' }}>
                <div style={{ marginBottom: '5px' }}>
                  <span style={{ color: '#888' }}>Số tiền đã thanh toán: </span>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#e74c3c' }}>
                    {Number(completedOrderInfo.tongTien).toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#1890ff' }}>
                  Phương thức: {completedOrderInfo.paymentMethod === 'bank' ? 'VNPAY' : 'COD'}
                </div>
              </div>
            </div>
          </div>
        )}
      </Result>
      <ToastContainer />
    </>
  );
};

export default CheckPayment; 