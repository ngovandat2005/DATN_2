import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import config from "../config/config";


const CheckPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("info");
  const [title, setTitle] = useState("Đang xử lý thanh toán...");
  const [loading, setLoading] = useState(true);
  const hasProcessed = useRef(false); // ✅ Guard against double processing



  useEffect(() => {
    // ✅ FIX: Dùng ref làm guard thực sự - không re-trigger khi ref thay đổi
    if (hasProcessed.current) {
      console.log('⚠️ Đã xử lý rồi, bỏ qua...');
      return;
    }
    hasProcessed.current = true;

    const processPayment = async () => {
      try {
        const vnpResponseCode = searchParams.get('vnp_ResponseCode');
        const vnpTxnRef = searchParams.get('vnp_TxnRef');

        console.log('🔄 === XỬ LÝ CALLBACK VNPAY ===');
        console.log('📊 Response Code:', vnpResponseCode);
        console.log('📊 Order ID:', vnpTxnRef);

        // Gọi backend để cập nhật trạng thái đơn hàng và DB (chỉ 1 lần)
        try {
            const { data } = await axios.get(
                config.getApiUrl(`api/payment/vnpay-return?${searchParams.toString()}`)
            );
            console.log('✅ Backend response:', data);
        } catch (backendError) {
            console.error('⚠️ Lỗi gọi backend vnpay-return:', backendError);
        }

        if (vnpResponseCode === '00') {
          console.log('✅ VNPAY thanh toán thành công!');
          setStatus("success");
          setTitle("Thanh toán thành công");

          toast.success('🎉 Thanh toán VNPAY thành công! Đơn hàng đã được xác nhận.', {
            position: "top-center",
            autoClose: 3000,
          });

          setTimeout(() => {
            navigate('/orders');
          }, 3000);

        } else if (vnpResponseCode) {
          console.log('❌ VNPAY thanh toán thất bại với code:', vnpResponseCode);
          setStatus("error");
          setTitle("Thanh toán thất bại");

          let errorMessage = 'Thanh toán VNPAY thất bại';
          switch (vnpResponseCode) {
            case '24': errorMessage = 'Khách hàng hủy giao dịch'; break;
            default: errorMessage = `Thanh toán thất bại với mã lỗi: ${vnpResponseCode}`;
          }

          toast.error('❌ ' + errorMessage + '. Đơn hàng vẫn ở trạng thái "Chờ thanh toán", bạn có thể thanh toán lại trong Lịch sử đơn hàng.', {
            position: "top-center",
            autoClose: 3000,
          });

          setTimeout(() => {
            navigate('/orders');
          }, 3000);

        } else {
          setStatus("error");
          setTitle("Không thể xác nhận trạng thái");
        }
      } catch (error) {
        console.error('❌ Lỗi khi xử lý callback VNPAY:', error);
        setStatus("error");
        setTitle("Có lỗi xảy ra khi xác thực thanh toán");
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ FIX: Empty deps - chỉ chạy 1 lần khi mount

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
      </Result>
      <ToastContainer />
    </>
  );
};

export default CheckPayment; 