import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Payment.css';
import { getCustomerId, getCustomerName, getUserInfo, isLoggedIn } from '../utils/authUtils';
import config from '../config/config';
import AddressSelector from '../components/AddressSelector';
import AddressManager from '../components/AddressManager';
import { parseGHNResponse } from '../utils/ghnUtils';  // ✅ THÊM: Import parseGHNResponse

// ✅ THÊM: Import Material-UI components (giống BanHangTaiQuay)
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// ✅ THÊM: Function kiểm tra số lượng đơn hàng hiện tại của khách hàng
const checkCustomerOrderLimit = async (customerId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/donhang/khach/${customerId}`);
    if (!response.ok) {
      throw new Error('Không thể kiểm tra đơn hàng của khách hàng');
    }

    const orders = await response.json();
    console.log('📋 Tất cả đơn hàng của khách hàng:', orders);

    // Log các đơn hàng không tính vào giới hạn (trạng thái 4: Hoàn thành, 5: Đã hủy, 6: Trả hàng)
    const activeOrders = orders.filter(order => ![4, 5, 6].includes(order.trangThai));
    console.log('📊 Đơn hàng đang hoạt động (không tính 4,5,6):', activeOrders);
    console.log('📈 Số lượng đơn hàng hiện tại:', activeOrders.length);

    return {
      success: true,
      currentOrderCount: activeOrders.length,
      canCreateOrder: activeOrders.length < 10,
      message: activeOrders.length >= 10
        ? `Bạn đã đạt giới hạn tối đa 10 đơn hàng đang xử lý (hiện tại: ${activeOrders.length}). Vui lòng chờ các đơn hàng hiện tại hoàn thành trước khi tạo đơn mới.`
        : `Bạn có thể tạo thêm ${10 - activeOrders.length} đơn hàng nữa.`
    };
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra giới hạn đơn hàng:', error);
    return {
      success: false,
      currentOrderCount: 0,
      canCreateOrder: false,
      message: 'Không thể kiểm tra giới hạn đơn hàng. Vui lòng thử lại sau.'
    };
  }
};

// Không cần constant SHIPPING_FEE nữa, sẽ tính từ GHN API

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const addressStorageKey = `savedAddresses_${getCustomerId() || 'guest'}`;
  const selectedAddressStorageKey = `selectedAddressId_${getCustomerId() || 'guest'}`;
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);         // Tổng tiền hàng (GIÁ GỐC)
  const [itemDiscountTotal, setItemDiscountTotal] = useState(0); // Tổng giảm giá từ sản phẩm (Tiết kiệm)
  const [orderDiscount, setOrderDiscount] = useState(0);  // Giảm giá từ Voucher
  const [finalTotal, setFinalTotal] = useState(0);       // Tổng thanh toán CUỐI CÙNG
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  // ✅ THÊM: States cho địa chỉ chi tiết
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [addressDetail, setAddressDetail] = useState('');

  // ✅ THÊM: States cho tính phí ship
  const [shippingFee, setShippingFee] = useState(0); // Khởi tạo 0, sẽ tính từ GHN API
  const [shippingFeeLoading, setShippingFeeLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // ✅ THÊM: State cho voucher (giống BanHangTaiQuay)
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);        // Tổng tiền sau voucher (tạm thời giữ lại nếu cần dùng)
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState('');

  // ✅ THÊM: State cho modal voucher (giống BanHangTaiQuay)
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // ✅ Sổ địa chỉ giao hàng (dùng cho popup chọn địa chỉ - giờ do AddressManager quản lý)
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressIsDefault, setAddressIsDefault] = useState(false);

  // ✅ THÊM: State cho khoảng cách thực tế (Map distance)
  const [actualDistance, setActualDistance] = useState(null);
  const [distanceLoading, setDistanceLoading] = useState(false);

  // Shop Location (Ba Đình, Hà Nội)
  const SHOP_COORDS = [21.033, 105.815];

  // Áp dụng một địa chỉ từ sổ địa chỉ vào state hiện tại
  const applyAddressFromBook = async (addr) => {
    if (!addr) return;
    setSelectedAddressId(addr.id);
    setCustomerName(addr.name || '');
    setCustomerPhone(addr.phone || '');
    setCustomerEmail(addr.email || '');
    setAddressDetail(addr.addressDetail || '');

    let pId = addr.provinceId;
    let dId = addr.districtId;
    let wCode = addr.wardCode;

    // Nếu thiếu ID nhưng có fullAddress, thử resolve từ text
    if (!(pId && dId && wCode) && addr.fullAddress) {
      console.log('🔍 IDs missing in address book entry, attempting text resolution for:', addr.fullAddress);
      const resolved = await resolveAddressFromText(addr.fullAddress);
      if (resolved) {
        pId = resolved.provinceId;
        dId = resolved.districtId;
        wCode = resolved.wardCode;
        console.log('✅ Resolved IDs from text:', resolved);
      }
    }

    setSelectedProvince(pId || null);
    setSelectedDistrict(dId || null);
    setSelectedWard(wCode || null);

    if (addr.fullAddress) {
      setCustomerAddress(addr.fullAddress);
    } else {
      // ✅ THÊM: Nếu thiếu fullAddress, cố gắng xây dựng tạm thời từ IDs/detail
      const detail = addr.addressDetail || '';
      if (pId && dId && wCode) {
        // Cố gắng lấy tên từ list đã load (nếu có)
        const p = provinces.find(p => Number(p.ProvinceID) === Number(pId));
        const d = districts.find(d => Number(d.DistrictID) === Number(dId));
        const w = wards.find(w => String(w.WardCode) === String(wCode));
        if (p && d && w) {
          setCustomerAddress(`${detail}, ${w.WardName}, ${d.DistrictName}, ${p.ProvinceName}`);
        } else {
          setCustomerAddress(`${detail} (Mã: ${wCode}, ${dId}, ${pId})`);
        }
      } else {
        setCustomerAddress(detail || 'Địa chỉ mới');
      }
    }

    setAddressIsDefault(!!addr.isDefault);
    try {
      localStorage.setItem(selectedAddressStorageKey, String(addr.id));
    } catch {
      // ignore
    }

    // handleAddressChange sẽ được useEffect tự động gọi khi states IDs thay đổi
  };

  // Load sổ địa chỉ từ localStorage khi vào trang để chọn địa chỉ mặc định
  useEffect(() => {
    try {
      const raw = localStorage.getItem(addressStorageKey);
      let list = raw ? JSON.parse(raw) : [];

      // Nếu chưa có sổ địa chỉ, thử lấy địa chỉ đã đăng ký (localStorage user) để seed vào sổ
      if (!Array.isArray(list) || list.length === 0) {
        const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
        const regAddress = userLocal.diaChi || userLocal.address || '';
        const regName = userLocal.ten || userLocal.name || '';
        const regPhone = userLocal.soDienThoai || userLocal.phone || '';
        const regEmail = userLocal.email || '';

        if (regAddress) {
          const seededId = Date.now();
          const seeded = [
            {
              id: seededId,
              name: regName,
              phone: regPhone,
              email: regEmail,
              addressDetail: '',
              fullAddress: regAddress,
              provinceId: null,
              districtId: null,
              wardCode: null,
              isDefault: true // Đặt làm mặc định nếu là cái duy nhất
            }
          ];
          list = seeded;
          localStorage.setItem(addressStorageKey, JSON.stringify(seeded));
          applyAddressFromBook(seeded[0]);

          if (isCodeAddressFormat(regAddress)) {
            resolveFullAddressFromCodes(regAddress).then((resolved) => {
              if (!resolved) return;
              const updatedList = [{ ...seeded[0], ...resolved, fullAddress: resolved.fullAddress }];
              localStorage.setItem(addressStorageKey, JSON.stringify(updatedList));
              applyAddressFromBook(updatedList[0]);
            });
          }
          return;
        }
      }

      if (list.length > 0) {
        const preferredIdRaw = localStorage.getItem(selectedAddressStorageKey);
        const preferredId = preferredIdRaw ? Number(preferredIdRaw) : null;
        const preferred = preferredId ? list.find(a => Number(a.id) === Number(preferredId)) : null;
        const def = preferred || list.find(a => a.isDefault) || list[0];
        if (def) applyAddressFromBook(def);
      }
    } catch (e) {
      console.error('Lỗi khởi tạo địa chỉ:', e);
    }
  }, [addressStorageKey]);

  // ✅ THÊM: Fetch giá khuyến mãi từ API sản phẩm nếu cần
  const [productPrices, setProductPrices] = useState({});

  const formatVnd = (value) => {
    const n = Number(value || 0);
    return `${n.toLocaleString('vi-VN').replaceAll(',', '.')} ₫`;
  };

  const prettyAddress = (value) => {
    if (!value) return '';
    return String(value)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .join(', ');
  };

  const formatPhone = (value) => {
    if (!value) return '';
    let s = String(value).trim();
    // Normalize common VN formats: +84xxxxxxxxx -> 0xxxxxxxxx
    if (s.startsWith('+84')) s = '0' + s.slice(3);
    s = s.replace(/\s+/g, '');
    return s;
  };

  const safeText = (value, fallback = '') => {
    const s = String(value || '').trim();
    return s ? s : fallback;
  };

  const buildImageUrl = (raw) => {
    if (!raw) return 'https://via.placeholder.com/80';
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

    // Thêm log để người dùng kiểm tra
    if (firstImg.length > 0) {
      console.log(`🖼️ Loading image: ${fullUrl}`);
    }
    return fullUrl;
  };

  const normalizeCartItem = (item) => {
    // returns: { imageUrl, name, variant, qty, unitPrice, originalUnitPrice }
    // originalUnitPrice is used for strike-through when discounted
    if (!item) {
      return {
        imageUrl: 'https://via.placeholder.com/80',
        name: 'Sản phẩm',
        variant: '',
        qty: 1,
        unitPrice: 0,
        originalUnitPrice: 0
      };
    }

    // 🛒 MUA NGAY (có hinhAnh, giaBan, giaBanGiamGia, soLuong)
    if (item.hinhAnh) {
      const qty = item.soLuong || 1;
      const originalUnitPrice = Number(item.giaBan || 0);
      const discounted = item.giaBanGiamGia && item.giaBanGiamGia > 0 && item.giaBanGiamGia < originalUnitPrice;
      const unitPrice = discounted ? Number(item.giaBanGiamGia) : originalUnitPrice;
      return {
        imageUrl: buildImageUrl(item.hinhAnh),
        name: item.tenSanPham || 'Sản phẩm',
        variant: [item.mauSac ? `Màu: ${item.mauSac}` : null, item.kichThuoc ? `Size: ${item.kichThuoc}` : null].filter(Boolean).join(' • '),
        qty,
        unitPrice,
        originalUnitPrice
      };
    }

    // 🆕 Backend item có giaBan, giaBanGiamGia, soLuong
    if (item.giaBan !== undefined && item.idSanPhamChiTiet) {
      const qty = item.soLuong || 1;
      const originalUnitPrice = Number(item.giaBan || 0);
      const discounted = item.giaBanGiamGia && item.giaBanGiamGia > 0 && item.giaBanGiamGia < originalUnitPrice;
      const unitPrice = discounted ? Number(item.giaBanGiamGia) : originalUnitPrice;
      return {
        imageUrl: buildImageUrl(item.images),
        name: item.tenSanPham || 'Sản phẩm',
        variant: [item.tenMauSac ? `Màu: ${item.tenMauSac}` : null, item.tenKichThuoc ? `Size: ${item.tenKichThuoc}` : null].filter(Boolean).join(' • '),
        qty,
        unitPrice,
        originalUnitPrice
      };
    }

    // 🔄 Item từ giỏ hàng có sanPhamChiTiet
    if (item.sanPhamChiTiet) {
      const qty = item.soLuong || 1;
      const originalUnitPrice = Number(item.sanPhamChiTiet.giaBan || item.giaBan || 0);
      const discountCandidate = item.giaBanGiamGia ?? item.sanPhamChiTiet.giaBanGiamGia;
      const discounted = discountCandidate && discountCandidate > 0 && discountCandidate < originalUnitPrice;
      const unitPrice = discounted ? Number(discountCandidate) : originalUnitPrice;
      const rawImg = item.sanPhamChiTiet?.sanPham?.images;
      return {
        imageUrl: buildImageUrl(rawImg),
        name: item.sanPhamChiTiet?.sanPham?.tenSanPham || item.tenSanPham || 'Sản phẩm',
        variant: [
          item.sanPhamChiTiet?.mauSac?.tenMauSac ? `Màu: ${item.sanPhamChiTiet.mauSac.tenMauSac}` : null,
          item.sanPhamChiTiet?.kichThuoc?.tenKichThuoc ? `Size: ${item.sanPhamChiTiet.kichThuoc.tenKichThuoc}` : null
        ].filter(Boolean).join(' • '),
        qty,
        unitPrice,
        originalUnitPrice
      };
    }

    // 🔍 Item có trường gia trực tiếp
    if (item.gia !== undefined && item.idSanPhamChiTiet) {
      const qty = item.soLuong || 1;
      const unitPrice = Number(item.gia || 0);
      return {
        imageUrl: buildImageUrl(item.images),
        name: item.tenSanPham || 'Sản phẩm',
        variant: [item.tenMauSac ? `Màu: ${item.tenMauSac}` : null, item.tenKichThuoc ? `Size: ${item.tenKichThuoc}` : null].filter(Boolean).join(' • '),
        qty,
        unitPrice,
        originalUnitPrice: unitPrice
      };
    }

    // Cấu trúc mua ngay (cũ): price/discountPrice/originalPrice/quantity
    const qty = item.quantity || 1;
    const originalUnitPrice = Number(item.originalPrice || item.price || 0);
    const discounted = item.discountPrice && item.discountPrice > 0 && item.discountPrice < originalUnitPrice;
    const unitPrice = discounted ? Number(item.discountPrice) : Number(item.price || 0);
    return {
      imageUrl: item.image || 'https://via.placeholder.com/80',
      name: item.name || 'Sản phẩm',
      variant: [item.color ? `Màu: ${item.color}` : null, item.size ? `Size: ${item.size}` : null].filter(Boolean).join(' • '),
      ma: item.ma || item.sanPhamChiTiet?.ma || item.sanPhamChiTiet?.sanPham?.ma || '',
      qty,
      unitPrice,
      originalUnitPrice
    };
  };

  useEffect(() => {
    if (!Array.isArray(location.state?.cart) || !location.state.cart.length) {
      toast.warning('Vui lòng chọn sản phẩm và vào trang thanh toán từ giỏ hàng!');
      navigate('/cart');
      return;
    }

    // Debug: Kiểm tra data từ giỏ hàng
    console.log('=== DEBUG PAYMENT PAGE ===');
    console.log('Location state:', location.state);
    console.log('Cart from state:', location.state?.cart);
    console.log('Cart length:', location.state?.cart?.length);

    // Xử lý data từ giỏ hàng
    const cartData = location.state.cart;
    setCart(cartData);

    // Tính tổng tiền dựa trên loại data
    let originalSubtotal = 0;
    let savingsTotal = 0;

    if (cartData.length > 0) {
      cartData.forEach(item => {
        let originalPrice = 0;
        let finalPrice = 0;
        let qty = item.soLuong || item.quantity || 1;

        if (item.giaBan !== undefined && item.idSanPhamChiTiet) {
          // Cấu trúc mới từ backend
          originalPrice = item.giaBan || 0;
          const hasDiscount = item.giaBanGiamGia && item.giaBanGiamGia > 0 && item.giaBanGiamGia < originalPrice;
          finalPrice = hasDiscount ? item.giaBanGiamGia : originalPrice;
        } else if (item.sanPhamChiTiet) {
          // Cấu trúc từ giỏ hàng
          originalPrice = item.sanPhamChiTiet.giaBan || item.giaBan || 0;
          const discountCandidate = item.giaBanGiamGia ?? item.sanPhamChiTiet.giaBanGiamGia;
          const hasDiscount = discountCandidate && discountCandidate > 0 && discountCandidate < originalPrice;
          finalPrice = hasDiscount ? discountCandidate : originalPrice;
        } else if (item.price !== undefined) {
          // Cấu trúc mua ngay
          originalPrice = item.originalPrice || item.price || 0;
          const hasDiscount = item.discountPrice && item.discountPrice < originalPrice;
          finalPrice = hasDiscount ? item.discountPrice : originalPrice;
        } else if (item.gia !== undefined) {
          originalPrice = item.gia;
          finalPrice = item.gia;
        }

        originalSubtotal += (originalPrice * qty);
        savingsTotal += ((originalPrice - finalPrice) * qty);
      });
    }

    setTotal(originalSubtotal);
    setItemDiscountTotal(savingsTotal);
  }, [location, navigate]);

  // ✅ THÊM: Tự động đồng bộ finalTotal khi các thành phần thay đổi
  useEffect(() => {
    const subTotal = total - itemDiscountTotal - orderDiscount;
    const effectiveShippingFee = subTotal >= 2000000 ? 0 : shippingFee;
    const newFinalTotal = subTotal + effectiveShippingFee;
    
    setFinalTotal(newFinalTotal);
    console.log('💰 Recalculated final total:', { 
      originalTotal: total, 
      savings: itemDiscountTotal, 
      voucher: orderDiscount, 
      ship: shippingFee,
      effectiveShip: effectiveShippingFee,
      final: newFinalTotal 
    });
  }, [total, itemDiscountTotal, orderDiscount, shippingFee]);

  // ✅ THÊM: Fetch voucher khả dụng từ API mới
  useEffect(() => {
    const fetchVouchers = async () => {
      setVoucherLoading(true);
      try {
        const response = await fetch(config.getApiUrl('api/voucher/available'));

        if (response.ok) {
          const data = await response.json();

          // ✅ Sử dụng trực tiếp data từ API (đã được backend log sẵn)
          setVouchers(data);
        } else {
          // Fallback: sử dụng API cũ nếu API mới lỗi
          // Fallback: sử dụng API cũ nếu API mới lỗi
          const fallbackResponse = await fetch(config.getApiUrl('api/voucher'));
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const availableVouchers = fallbackData.filter(voucher =>
              voucher.trangThai === 1 &&
              voucher.soLuong > 0 &&
              new Date(voucher.ngayBatDau) <= new Date() &&
              new Date(voucher.ngayKetThuc) >= new Date()
            );
            setVouchers(availableVouchers);

          }
        }
      } catch (error) {
        // Fallback: sử dụng API cũ nếu có lỗi
        try {
          const fallbackResponse = await fetch(config.getApiUrl('api/voucher'));
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const availableVouchers = fallbackData.filter(voucher =>
              voucher.trangThai === 1 &&
              voucher.soLuong > 0 &&
              new Date(voucher.ngayBatDau) <= new Date() &&
              new Date(voucher.ngayKetThuc) >= new Date()
            );
            setVouchers(availableVouchers);

          }
        } catch (fallbackError) {
          // Ignore fallback error
        }
      } finally {
        setVoucherLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  // ✅ THÊM: Functions xử lý thay đổi địa chỉ
  const handleProvinceChange = async (provinceId) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setShippingFee(0); // Reset phí ship khi thay đổi tỉnh

    // Load districts cho province này
    if (provinceId) {
      await fetchDistrictsForProvince(provinceId);
    }
  };

  const handleDistrictChange = async (districtId) => {
    setSelectedDistrict(districtId);
    setSelectedWard(null);
    setShippingFee(0); // Reset phí ship khi thay đổi quận

    // Load wards cho district này
    if (districtId) {
      await fetchWardsForDistrict(districtId);
    }
  };

  const handleWardChange = (wardId) => {
    setSelectedWard(wardId);
  };

  // ✅ THÊM: Tự động điền thông tin khách hàng và select địa chỉ
  useEffect(() => {
    const autoFillCustomerInfo = async () => {
      // Kiểm tra đăng nhập
      if (!isLoggedIn()) {
        return;
      }

      const customerId = getCustomerId();
      if (!customerId) {
        return;
      }

      try {
        // Nếu đã có sổ địa chỉ cho user này thì không lấy địa chỉ đăng ký để ghi đè
        let hasAddressBook = false;
        try {
          const rawBook = localStorage.getItem(addressStorageKey);
          const parsed = rawBook ? JSON.parse(rawBook) : [];
          hasAddressBook = Array.isArray(parsed) && parsed.length > 0;
        } catch {
          hasAddressBook = false;
        }

        // Nếu đã có sổ địa chỉ (và sẽ apply địa chỉ đã chọn/mặc định),
        // không auto-fill name/phone/email từ tài khoản để tránh ghi đè lên địa chỉ đang chọn.
        if (hasAddressBook) {
          return;
        }

        // Thử lấy thông tin từ localStorage trước
        // ✅ SỬA: Lấy thông tin từ localStorage với logic ưu tiên
        const userInfo = getUserInfo();
        const userLocal = JSON.parse(localStorage.getItem('user') || '{}');

        if (userInfo || Object.keys(userLocal).length > 0) {

          // Ưu tiên dữ liệu đã chỉnh sửa từ localStorage
          setCustomerName(userLocal.ten || userLocal.name || userInfo?.ten || userInfo?.name || '');
          setCustomerEmail(userLocal.email || userInfo?.email || '');
          setCustomerPhone(userLocal.soDienThoai || userLocal.phone || userInfo?.soDienThoai || userInfo?.phone || '');

          // ✅ SỬA: Xử lý địa chỉ từ localStorage (giống UserProfileCard)
          const addressLocal = userLocal.diaChi || userLocal.address || userInfo?.diaChi || userInfo?.address;
          if (addressLocal && !hasAddressBook) {
            setCustomerAddress(prettyAddress(addressLocal));

            // Parse địa chỉ để select trong AddressSelector (giống UserProfileCard)
            const addressParts = addressLocal.split(',').map(p => p.trim());
            if (addressParts.length >= 4) {
              const addressDetail = addressParts[0];
              const wardCode = addressParts[1];
              const districtId = addressParts[2];
              const provinceId = addressParts[3];

              console.log('📍 Parse địa chỉ từ localStorage:', { addressDetail, wardCode, districtId, provinceId });
              setAddressDetail(addressDetail);

              // Đợi provinces load xong rồi mới parse địa chỉ
              setTimeout(async () => {
                await parseAndSelectAddress(addressLocal);
              }, 2000);
            }
          }
        }

        // Fetch thông tin chi tiết từ API
        const response = await fetch(config.getApiUrl(`api/khachhang/${customerId}`));

        if (response.ok) {
          const customerData = await response.json();

          // ✅ SỬA: Ưu tiên dữ liệu đã chỉnh sửa từ localStorage nếu có
          const userLocal = JSON.parse(localStorage.getItem('user') || '{}');

          // Cập nhật thông tin với logic ưu tiên
          setCustomerName(userLocal.ten || userLocal.name || customerData.ten || customerData.hoTen || '');
          setCustomerEmail(userLocal.email || customerData.email || '');
          setCustomerPhone(userLocal.soDienThoai || userLocal.phone || customerData.soDienThoai || customerData.sdt || '');

          // Xử lý địa chỉ từ thông tin đã đăng ký
          const addressLocal = userLocal.diaChi || userLocal.address || customerData.diaChi;
          if (addressLocal && !hasAddressBook) {
            setCustomerAddress(prettyAddress(addressLocal));

            // Đợi provinces load xong rồi mới parse địa chỉ
            setTimeout(async () => {
              await parseAndSelectAddress(addressLocal);
            }, 2000);
          }

          // Đã tự động điền thông tin khách hàng
          toast.success('Đã tự động điền thông tin khách hàng!');
        } else {
          // Sử dụng thông tin từ localStorage nếu API không hoạt động
        }
      } catch (error) {
        // Sử dụng thông tin từ localStorage nếu có lỗi
      }
    };

    autoFillCustomerInfo();
  }, []);


  // ✅ THÊM: Load provinces khi component mount
  useEffect(() => {
    const loadProvinces = async () => {
      if (provinces.length === 0) {
        // Thử load từ API trước
        const provincesData = await fetchProvinces();

        // Nếu API không hoạt động, thử load từ localStorage
        if (!provincesData || provincesData.length === 0) {
          const cachedProvinces = localStorage.getItem('ghn_provinces');
          if (cachedProvinces) {
            try {
              const parsedProvinces = JSON.parse(cachedProvinces);
              setProvinces(parsedProvinces);
            } catch (error) {
              // Ignore parse error
            }
          } else {
            toast.warning('Không thể load danh sách tỉnh thành. Vui lòng thử lại sau!');
          }
        } else {
          // Cache provinces vào localStorage
          localStorage.setItem('ghn_provinces', JSON.stringify(provincesData));
        }
      }
    };

    loadProvinces();
  }, [provinces.length]); // ✅ SỬA: Thêm dependency

  // ✅ THÊM: Khởi tạo orderTotal và orderDiscount dựa trên giá sau khi đã giảm sản phẩm
  useEffect(() => {
    const subTotal = total - itemDiscountTotal;
    setOrderTotal(subTotal);
    // orderDiscount sẽ được set khi chọn voucher
  }, [total, itemDiscountTotal]);

  // ✅ THÊM: Tự động tính phí ship khi địa chỉ thay đổi
  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard) {
      // Đợi một chút để đảm bảo state đã được cập nhật hoàn toàn
      const timer = setTimeout(() => {
        handleAddressChange();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [selectedProvince, selectedDistrict, selectedWard]);

  // ✅ THÊM: Function xử lý voucher (TÍNH TOÁN GIẢM GIÁ NGAY KHI CHỌN)
  const handleVoucherChange = async (voucherId) => {
    setSelectedVoucherId(voucherId);
    setVoucherMessage('');

    if (voucherId) {
      const voucher = vouchers.find(v => v.id === Number(voucherId));
      console.log('🎫 Voucher được chọn:', voucher);

      if (voucher) {
        // ✅ SỬA: Tính dựa trên giá sau khi đã giảm giá sản phẩm (effectiveTotal)
        const effectiveTotal = total - itemDiscountTotal;

        // Kiểm tra điều kiện áp dụng voucher
        if (effectiveTotal >= voucher.donToiThieu) {
          // ✅ TÍNH TOÁN GIẢM GIÁ NGAY KHI CHỌN VOUCHER
          let discount = 0;
          if (voucher.loaiVoucher === 'Giảm giá %') {
            discount = (effectiveTotal * voucher.giaTri) / 100;
            console.log('🎯 Voucher %: giaTri=', voucher.giaTri, '%, discount=', discount);
          } else if (voucher.loaiVoucher === 'Giảm giá số tiền') {
            discount = voucher.giaTri;
            console.log('🎯 Voucher số tiền: giaTri=', voucher.giaTri, 'discount=', discount);
          }

          // Không cho giảm quá tổng tiền hiện tại
          const finalDiscount = Math.min(discount, effectiveTotal);
          console.log('🎯 Giảm giá cuối cùng:', finalDiscount);

          setOrderDiscount(finalDiscount);
          setOrderTotal(total - finalDiscount);

          // ✅ QUAN TRỌNG: Cập nhật finalTotal để hiển thị đúng
          const newFinalTotal = (total - finalDiscount) + shippingFee;
          setFinalTotal(newFinalTotal);

          console.log('💰 Sau khi áp dụng voucher: orderDiscount=', finalDiscount, 'orderTotal=', total - finalDiscount, 'finalTotal=', newFinalTotal);

          toast.success(`Đã chọn voucher: ${voucher.tenVoucher}`);
          setVoucherMessage(`Voucher đã được áp dụng! Giảm ${finalDiscount.toLocaleString()}₫`);

          // ✅ LƯU Ý: Logic kiểm tra voucher hết số lượng sẽ được xử lý trong applyVoucherToOrder
          // khi thanh toán thành công, không cần xử lý ở đây
        } else {
          console.log('❌ Voucher không đủ điều kiện: total=', total, 'donToiThieu=', voucher.donToiThieu);
          toast.warning(`Voucher yêu cầu đơn hàng tối thiểu ${voucher.donToiThieu.toLocaleString()}₫`);
          setVoucherMessage('Voucher không đủ điều kiện áp dụng!');
          setSelectedVoucherId(''); // Reset nếu không đủ điều kiện
        }
      }
    } else {
      // Bỏ chọn voucher
      console.log('🚫 Bỏ chọn voucher');
      setOrderDiscount(0);
      setOrderTotal(total);

      // ✅ QUAN TRỌNG: Cập nhật finalTotal về giá trị ban đầu
      const newFinalTotal = total + shippingFee;
      setFinalTotal(newFinalTotal);

      console.log('💰 Sau khi bỏ voucher: orderDiscount=0, orderTotal=', total, 'finalTotal=', newFinalTotal);

      toast.info('Đã bỏ chọn voucher');
      setVoucherMessage('Đã bỏ chọn voucher!');
    }

    // Tự động ẩn thông báo sau 2.5 giây
    setTimeout(() => setVoucherMessage(''), 2500);
  };

  // ✅ THÊM: Function tính phí ship từ GHN API với retry mechanism
  const calculateShippingFee = async (fromDistrict, toDistrict, toProvinceId, toWardCode, weight = 800, insuranceValue = 0, retryCount = 0, distance = null) => {
    if (!fromDistrict || !toDistrict || !toWardCode) {
      return;
    }

    setShippingFeeLoading(true);
    try {
      const requestBody = {
        fromDistrict: fromDistrict,
        toDistrict: toDistrict,
        toProvinceId: parseInt(toProvinceId),
        toWardCode: toWardCode,
        weight: weight,
        insuranceValue: insuranceValue,
        actualDistance: distance // ✅ THÊM: Gửi khoảng cách thực tế
      };

      const response = await fetch(config.getApiUrl('api/ghn/calculate-fee'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('🚚 GHN Fee Request Body:', requestBody);

      if (response.ok) {
        const feeData = await response.json();
        console.log('🚚 GHN Fee Response Data:', feeData);

        // ✅ SỬA: Kiểm tra nhiều cấu trúc response có thể có
        let shippingFeeValue = 0;

        if (feeData.data && feeData.data.total) {
          // Cấu trúc: {code: 200, data: {total: 34000, ...}, message: "Success"}
          shippingFeeValue = feeData.data.total;
        } else if (feeData.data && feeData.data.total_fee) {
          // Cấu trúc: {code: 200, data: {total_fee: 34000, ...}, message: "Success"}
          shippingFeeValue = feeData.data.total_fee;
        } else if (feeData.total_fee) {
          shippingFeeValue = feeData.total_fee;
        } else if (feeData.total) {
          shippingFeeValue = feeData.total;
        } else if (feeData.data && feeData.data.length > 0) {
          // Nếu response có dạng {data: [{total_fee: xxx}]}
          shippingFeeValue = feeData.data[0].total_fee || feeData.data[0].total || 0;
        } else if (Array.isArray(feeData) && feeData.length > 0) {
          // Nếu response là array
          shippingFeeValue = feeData[0].total_fee || feeData[0].total || 0;
        }

        if (shippingFeeValue > 0) {
          setShippingFee(shippingFeeValue);
          
          // ✅ KIỂM TRA: Nếu đơn trên 2tr thì thông báo miễn phí luôn
          const subTotal = total - itemDiscountTotal - orderDiscount;
          if (subTotal >= 2000000) {
            toast.success("🚚 Đơn hàng trên 2tr - MIỄN PHÍ VẬN CHUYỂN!", {
               position: "top-right",
               autoClose: 3000
            });
          } else {
            // Thông báo theo mức phí của khách hàng
            const kmFee = 5000;
            const possibleDistances = [5, 15, 50];
            const currentDistance = possibleDistances.find(d => d * kmFee === shippingFeeValue);
  
            if (currentDistance) {
              toast.info(`Phí ship theo khoảng cách: ${formatVnd(shippingFeeValue)} (~${currentDistance}km)`);
            } else {
              toast.success(`Phí ship: ${shippingFeeValue.toLocaleString()}₫`);
            }
          }
        } else {
          // Fallback nếu có lỗi: Giả định liên tỉnh 50km
          const fallbackFee = 250000;
          setShippingFee(fallbackFee);
          console.warn('⚠️ Backend returned 0 fee, using initial zone fallback.');
        }
      } else {
        const errorText = await response.text();

        // ✅ THÊM: Retry mechanism cho lỗi 403
        if (response.status === 403 && retryCount < 2) {
          setTimeout(() => {
            calculateShippingFee(fromDistrict, toDistrict, selectedProvince, toWardCode, weight, insuranceValue, retryCount + 1, distance);
          }, 2000);
          return;
        }

        // ✅ SỬA: Nếu API lỗi, dùng phí mặc định để không block người dùng
        setShippingFee(30000);
        toast.info('Sử dụng phí ship mặc định (ước tính): 30.000₫');
      }
    } catch (error) {
      // ✅ THÊM: Retry mechanism cho lỗi network
      if (retryCount < 2) {
        setTimeout(() => {
          calculateShippingFee(fromDistrict, toDistrict, toWardCode, weight, insuranceValue, retryCount + 1, distance);
        }, 2000);
        return;
      }

      // ✅ SỬA: Nếu lỗi kết nối, dùng phí mặc định
      setShippingFee(30000);
      toast.info('Lỗi kết nối GHN, sử dụng phí ship tạm tính: 30.000₫');
    } finally {
      setShippingFeeLoading(false);
    }
  };

  // ✅ THÊM: Function parse địa chỉ và select trong AddressSelector (sửa race condition)
  const parseAndSelectAddress = async (addressString) => {
    console.log('🔍 Đang parse địa chỉ:', addressString);

    if (!addressString) return;

    try {
      const addressParts = addressString.split(',').map(p => p.trim());
      console.log("📍 addressParts:", addressParts);

      // Format: [detail, wardCode, districtId, provinceId]
      if (addressParts.length < 4) {
        console.log('⚠️ Địa chỉ không đủ thông tin để parse, thử format khác...');

        // Thử format: [detail, wardName, districtName, provinceName]
        const addressDetail = addressParts[0] || '';
        setAddressDetail(addressDetail);

        // Không thể parse tự động, để user chọn thủ công
        toast.info('Không thể tự động parse địa chỉ. Vui lòng chọn địa chỉ giao hàng thủ công.');
        return;
      }

      let addressDetail = addressParts[0];
      let wardCode = addressParts[1];
      let districtId = addressParts[2];
      let provinceId = addressParts[3];

      console.log('📍 Parse địa chỉ:', { addressDetail, wardCode, districtId, provinceId });

      // ✅ SỬA: Đợi provinces load xong trước khi parse
      console.log('🔍 Kiểm tra provinces state:', { length: provinces.length, hasData: provinces.length > 0 });

      if (provinces.length === 0) {
        console.log('⏳ Provinces chưa load, đang đợi...');

        // Thử load provinces trước
        const provincesData = await fetchProvinces();
        if (provincesData.length === 0) {
          console.log('❌ Không thể load provinces từ API');
          toast.warning('Không thể load danh sách tỉnh thành. Vui lòng thử lại sau!');
          return;
        }

        console.log('✅ Đã load provinces từ API:', provincesData.length);
      } else {
        console.log('✅ Provinces đã có sẵn trong state:', provinces.length);
      }

      console.log('✅ Provinces đã sẵn sàng, bắt đầu parse địa chỉ');

      // Tìm province - sử dụng provinces từ state hoặc từ API
      const provincesToSearch = provinces.length > 0 ? provinces : await fetchProvinces();
      const province = provincesToSearch.find(p => Number(p.ProvinceID) === Number(provinceId));
      if (!province) {
        console.log('❌ Không tìm thấy tỉnh/thành:', provinceId);
        console.log('📋 Danh sách provinces có sẵn:', provincesToSearch.map(p => ({ id: p.ProvinceID, name: p.ProvinceName })));
        toast.warning(`Không tìm thấy tỉnh/thành: ${provinceId}`);
        return;
      }
      console.log('✅ Tìm thấy province:', province.ProvinceName);
      setSelectedProvince(province.ProvinceID);

      // Load districts
      console.log('🔄 Đang load districts cho province:', province.ProvinceID);
      const districtsData = await fetchDistrictsForProvince(province.ProvinceID);
      if (districtsData.length === 0) {
        console.log('❌ Không thể load districts');
        return;
      }

      const district = districtsData.find(d => Number(d.DistrictID) === Number(districtId));
      if (!district) {
        console.log('❌ Không tìm thấy quận/huyện:', districtId);
        toast.warning(`Không tìm thấy quận/huyện: ${districtId}`);
        return;
      }
      console.log('✅ Tìm thấy district:', district.DistrictName);
      setSelectedDistrict(district.DistrictID);

      // Load wards
      console.log('🔄 Đang load wards cho district:', district.DistrictID);
      const wardsData = await fetchWardsForDistrict(district.DistrictID);
      if (wardsData.length === 0) {
        console.log('❌ Không thể load wards');
        return;
      }

      const ward = wardsData.find(w => String(w.WardCode) === String(wardCode));
      if (!ward) {
        console.log('❌ Không tìm thấy phường/xã:', wardCode);
        toast.warning(`Không tìm thấy phường/xã: ${wardCode}`);
        return;
      }
      console.log('✅ Tìm thấy ward:', ward.WardName);
      setSelectedWard(ward.WardCode);

      // ✅ SỬA: Cập nhật địa chỉ chi tiết
      if (addressDetail) {
        setAddressDetail(addressDetail);
      }

      // ✅ SỬA: Cập nhật địa chỉ giao hàng đầy đủ
      const fullAddress = `${addressDetail}, ${ward.WardName}, ${district.DistrictName}, ${province.ProvinceName}`;
      setCustomerAddress(fullAddress);

      // ✅ THÊM: Đảm bảo địa chỉ chi tiết được lưu đúng
      console.log('📍 Địa chỉ chi tiết đã được set:', addressDetail);
      console.log('📍 Địa chỉ giao hàng đầy đủ:', fullAddress);

      console.log("✅ Parse địa chỉ thành công:", { addressDetail, province: province.ProvinceName, district: district.DistrictName, ward: ward.WardName });

      // ✅ THÊM: Tự động tính phí ship sau khi parse địa chỉ thành công
      setTimeout(() => {
        console.log('🚚 Tự động tính phí ship sau khi parse địa chỉ...');
        handleAddressChange();
      }, 1000);

    } catch (error) {
      console.error('❌ Lỗi khi parse địa chỉ:', error);

      // ✅ THÊM: Xử lý lỗi tốt hơn
      if (error.name === 'TypeError' && error.message.includes('toLowerCase')) {
        toast.warning('Địa chỉ không đúng định dạng. Vui lòng chọn địa chỉ giao hàng thủ công.');
      } else {
        toast.error('Có lỗi khi xử lý địa chỉ. Vui lòng thử lại sau!');
      }

      // Đặt địa chỉ chi tiết từ phần đầu của địa chỉ gốc
      const addressParts = addressString.split(',').map(p => p.trim());
      if (addressParts.length > 0) {
        setAddressDetail(addressParts[0]);
      }
    }
  };

  // ✅ THÊM: Function fetch provinces (sửa để match với UserProfileCard)
  const fetchProvinces = async () => {
    try {
      console.log('🔄 Đang fetch provinces...');
      console.log('📍 API URL:', config.getApiUrl('api/ghn/provinces'));

      const response = await fetch(config.getApiUrl('api/ghn/provinces'));
      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', response.headers);

      if (response.ok) {
        const responseData = await response.json();
        console.log('📥 Raw response data:', responseData);
        console.log('📥 Response data type:', typeof responseData);
        console.log('📥 Response data keys:', responseData ? Object.keys(responseData) : 'null');

        // ✅ SỬA: Sử dụng parseGHNResponse giống UserProfileCard
        const data = parseGHNResponse(responseData);
        console.log('🔧 Data sau khi parse:', data);
        console.log('🔧 Parsed data type:', typeof data);
        console.log('🔧 Parsed data is array:', Array.isArray(data));

        if (data && Array.isArray(data)) {
          console.log('✅ Parse thành công, đang set provinces...');
          setProvinces(data);
          console.log('✅ Đã load provinces:', data.length);
          console.log('📋 Sample provinces:', data.slice(0, 3));
          return data;
        } else {
          console.error('❌ Cấu trúc response không đúng sau khi parse:', data);
          return [];
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Lỗi fetch provinces:', response.status);
        console.error('❌ Error response:', errorText);
        return [];
      }
    } catch (error) {
      console.error('❌ Lỗi fetch provinces:', error);
      console.error('❌ Error details:', error.message);
      return [];
    }
  };

  // ✅ THÊM: Function fetch districts cho province (sửa để match với UserProfileCard)
  const fetchDistrictsForProvince = async (provinceId) => {
    try {
      console.log('🔄 Đang fetch districts cho province:', provinceId);
      const response = await fetch(config.getApiUrl(`api/ghn/districts/${provinceId}`));
      if (response.ok) {
        const responseData = await response.json();
        // ✅ SỬA: Sử dụng parseGHNResponse giống UserProfileCard
        const data = parseGHNResponse(responseData);
        if (data && Array.isArray(data)) {
          setDistricts(data);
          console.log('✅ Đã load districts:', data.length);
          return data;
        } else {
          console.error('❌ Cấu trúc districts không đúng sau khi parse:', data);
          return [];
        }
      } else {
        console.error('❌ Lỗi fetch districts:', response.status);
        return [];
      }
    } catch (error) {
      console.error('❌ Lỗi fetch districts:', error);
      return [];
    }
  };

  // ✅ THÊM: Function fetch wards cho district (sửa để match với UserProfileCard)
  const fetchWardsForDistrict = async (districtId) => {
    try {
      console.log('🔄 Đang fetch wards cho district:', districtId);
      const response = await fetch(config.getApiUrl(`api/ghn/wards/${districtId}`));
      if (response.ok) {
        const responseData = await response.json();
        // ✅ SỬA: Sử dụng parseGHNResponse giống UserProfileCard
        const data = parseGHNResponse(responseData);
        if (data && Array.isArray(data)) {
          setWards(data);
          console.log('✅ Đã load wards:', data.length);
          return data;
        } else {
          console.error('❌ Cấu trúc wards không đúng sau khi parse:', data);
          return [];
        }
      } else {
        console.error('❌ Lỗi fetch wards:', response.status);
        return [];
      }
    } catch (error) {
      console.error('❌ Lỗi fetch wards:', error);
      return [];
    }
  };

  const isCodeAddressFormat = (addressString) => {
    if (!addressString) return false;
    const parts = String(addressString).split(',').map(p => p.trim());
    if (parts.length < 4) return false;
    const districtId = parts[2];
    const provinceId = parts[3];
    return /^\d+$/.test(String(districtId)) && /^\d+$/.test(String(provinceId));
  };

  const resolveAddressFromText = async (addressString) => {
    if (!addressString) return null;
    const parts = String(addressString).split(',').map(p => p.trim());
    if (parts.length < 3) return null;

    // Lấy 3 phần cuối: xã, huyện, tỉnh
    const pName = parts[parts.length - 1];
    const dName = parts[parts.length - 2];
    const wName = parts[parts.length - 3];

    try {
      const provincesData = provinces.length > 0 ? provinces : await fetchProvinces();
      const province = provincesData.find(p =>
        p.ProvinceName.toLowerCase().includes(pName.toLowerCase()) ||
        pName.toLowerCase().includes(p.ProvinceName.toLowerCase())
      );
      if (!province) return null;

      const districtsData = await fetchDistrictsForProvince(province.ProvinceID);
      const district = districtsData.find(d =>
        d.DistrictName.toLowerCase().includes(dName.toLowerCase()) ||
        dName.toLowerCase().includes(d.DistrictName.toLowerCase())
      );
      if (!district) return { provinceId: province.ProvinceID };

      const wardsData = await fetchWardsForDistrict(district.DistrictID);
      const ward = wardsData.find(w =>
        w.WardName.toLowerCase().includes(wName.toLowerCase()) ||
        wName.toLowerCase().includes(w.WardName.toLowerCase())
      );

      return {
        provinceId: province.ProvinceID,
        districtId: district.DistrictID,
        wardCode: ward ? ward.WardCode : null
      };
    } catch (e) {
      console.error("❌ Lỗi resolve address from text:", e);
      return null;
    }
  };

  const resolveFullAddressFromCodes = async (addressString) => {
    const parts = String(addressString).split(',').map(p => p.trim());
    if (parts.length < 4) return null;

    const detail = parts[0] || '';
    const wardCode = parts[1];
    const districtId = Number(parts[2]);
    const provinceId = Number(parts[3]);

    const provincesData = provinces.length > 0 ? provinces : await fetchProvinces();
    const province = provincesData.find(p => Number(p.ProvinceID) === provinceId);
    if (!province) return null;

    const districtsData = await fetchDistrictsForProvince(province.ProvinceID);
    const district = districtsData.find(d => Number(d.DistrictID) === districtId);
    if (!district) return null;

    const wardsData = await fetchWardsForDistrict(district.DistrictID);
    const ward = wardsData.find(w => String(w.WardCode) === String(wardCode));
    if (!ward) return null;

    return {
      fullAddress: `${detail}, ${ward.WardName}, ${district.DistrictName}, ${province.ProvinceName}`,
      provinceId: province.ProvinceID,
      districtId: district.DistrictID,
      wardCode: ward.WardCode,
      addressDetail: detail
    };
  };

  // ✅ THÊM: Function tính khoảng cách qua Bản đồ (Nominatim + OSRM)
  const calculateDistanceByAddress = async (fullAddress) => {
    if (!fullAddress || fullAddress.length < 5) return null;
    
    setDistanceLoading(true);
    console.log('🗺️ Đang tính khoảng cách cho:', fullAddress);
    
    try {
      // 1. Geocoding (Address -> Cords) using Nominatim
      // Lần 1: Thử tìm địa chỉ đầy đủ
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress + ', Việt Nam')}&limit=1`;
      const geoRes = await fetch(geoUrl, {
        headers: { 'User-Agent': 'KingStep-Web-App' }
      });
      let geoData = await geoRes.json();

      // ✅ Lớp 1 (Phòng thủ): Nếu không tìm thấy địa chỉ chi tiết, thử tìm theo Huyện/Tỉnh
      if (!geoData || geoData.length === 0) {
        console.warn('⚠️ Không tìm thấy địa chỉ cụ thể, thử tìm theo Quận/Huyện...');
        // Tách lấy phần phía sau (Ward, District, Province)
        const parts = fullAddress.split(',');
        if (parts.length >= 3) {
          const fallbackQuery = parts.slice(-2).join(',') + ', Việt Nam'; // Ví dụ: "Huyện Văn Lâm, Hưng Yên, Việt Nam"
          const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQuery)}&limit=1`;
          const fallbackRes = await fetch(fallbackUrl, {
            headers: { 'User-Agent': 'KingStep-Web-App' }
          });
          geoData = await fallbackRes.json();
        }
      }

      if (geoData && geoData.length > 0) {
        const lat = parseFloat(geoData[0].lat);
        const lon = parseFloat(geoData[0].lon);
        
        // 2. Routing (Distance calculation) using OSRM
        const routeUrl = `https://router.project-osrm.org/route/v1/driving/${SHOP_COORDS[1]},${SHOP_COORDS[0]};${lon},${lat}?overview=false`;
        const routeRes = await fetch(routeUrl);
        const routeData = await routeRes.json();

        if (routeData.code === 'Ok' && routeData.routes.length > 0) {
          const distKm = routeData.routes[0].distance / 1000;
          console.log(`✅ Khoảng cách đường bộ tính được: ${distKm.toFixed(2)} km`);
          setActualDistance(distKm);
          return distKm;
        } else {
          const straightDist = calculateStraightDistance(SHOP_COORDS[0], SHOP_COORDS[1], lat, lon);
          setActualDistance(straightDist);
          return straightDist;
        }
      } else {
        console.error('❌ Không thể định vị địa chỉ này trên bản đồ.');
        setActualDistance(null);
        return null;
      }
    } catch (err) {
      console.error("❌ Lỗi dịch vụ bản đồ:", err);
      setActualDistance(null);
      return null;
    } finally {
      setDistanceLoading(false);
    }
  };

  // Hàm tính khoảng cách đường chim bay (Haversine formula)
  const calculateStraightDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ✅ THÊM: Function xử lý thay đổi địa chỉ
  const handleAddressChange = async () => {
    console.log('🔄 handleAddressChange được gọi');
    console.log('📍 selectedProvince:', selectedProvince);
    console.log('📍 selectedDistrict:', selectedDistrict);
    console.log('📍 selectedWard:', selectedWard);

    if (!(selectedProvince && selectedDistrict && selectedWard)) {
      console.log('❌ Thiếu thông tin địa chỉ:', { selectedProvince, selectedDistrict, selectedWard });
      return;
    }

    // Đảm bảo đã có đủ dữ liệu tỉnh/quận/phường, nếu chưa thỉ fetch bổ sung
    let provinceList = provinces;
    if (!provinceList || provinceList.length === 0) {
      provinceList = await fetchProvinces();
    }
    const province = provinceList.find(p => Number(p.ProvinceID) === Number(selectedProvince));

    let districtList = districts;
    // ✅ SỬA: Kiểm tra nếu district ID hiện tại không có trong list hiện tại thì fetch lại list mới
    if (selectedProvince && (!districtList.find(d => Number(d.DistrictID) === Number(selectedDistrict)))) {
      districtList = await fetchDistrictsForProvince(selectedProvince);
    }
    const district = districtList.find(d => Number(d.DistrictID) === Number(selectedDistrict));

    let wardList = wards;
    // ✅ SỬA: Kiểm tra nếu ward code hiện tại không có trong list hiện tại thì fetch lại list mới
    if (selectedDistrict && (!wardList.find(w => String(w.WardCode) === String(selectedWard)))) {
      wardList = await fetchWardsForDistrict(selectedDistrict);
    }
    const ward = wardList.find(w => String(w.WardCode) === String(selectedWard));

    console.log('📍 Tìm thấy province:', province?.ProvinceName);
    console.log('📍 Tìm thấy district:', district?.DistrictName);
    console.log('📍 Tìm thấy ward:', ward?.WardName);

    if (!(province && district && ward)) {
      console.log('❌ Không tìm thấy thông tin địa chỉ đầy đủ để tính phí ship (vẫn còn thiếu data)');
      return;
    }

    // ✅ Tính cân nặng từ cart (mỗi đôi giày + hộp ≈ 800g)
    let totalWeight = 0;
    cart.forEach(item => {
      const itemWeight = 800; // gram (tăng lên để chuẩn hơn)
      const quantity = item.soLuong || item.quantity || 1;
      totalWeight += itemWeight * quantity;
    });
    totalWeight = Math.max(totalWeight, 800);

    // ✅ Tính giá trị bảo hiểm (tổng tiền hàng)
    const insuranceValue = Math.min(total, 5000000); // GHN tối đa 5tr cho bảo hiểm cơ bản

    console.log('📦 Cân nặng tính toán:', totalWeight, 'g');
    console.log('🛡️ Giá trị bảo hiểm:', insuranceValue, '₫');
    console.log('🚚 Gọi calculateShippingFee với params:', {
      fromDistrict: 1484,
      toDistrict: selectedDistrict,
      toProvinceId: selectedProvince,
      toWardCode: selectedWard,
      weight: totalWeight,
      insuranceValue: insuranceValue
    });

    const fullAddress = `${addressDetail}, ${ward.WardName}, ${district.DistrictName}, ${province.ProvinceName}`;
    setCustomerAddress(fullAddress);

    if (addressDetail) {
      setAddressDetail(addressDetail);
    }

    // ✅ THÊM: Tính khoảng cách thực tế từ bản đồ trước khi tính phí ship
    const calculatedDistance = await calculateDistanceByAddress(fullAddress);

    console.log('🚚 Gọi calculateShippingFee với KM thực tế:', calculatedDistance);

    // Tính phí ship với cân nặng, bảo hiểm và KHOẢNG CÁCH THỰC TẾ
    calculateShippingFee(1484, selectedDistrict, selectedProvince, selectedWard, totalWeight, insuranceValue, 0, calculatedDistance);
  };

  // ✅ THÊM: Function fetch thông tin đơn hàng (giống BanHangTaiQuay)
  const fetchOrderInfo = async (orderId) => {
    if (!orderId) return null;

    try {
      console.log('🔄 Đang fetch thông tin đơn hàng...');
      const response = await fetch(config.getApiUrl(`api/donhang/${orderId}`));

      if (response.ok) {
        const orderData = await response.json();

        // Cập nhật state với thông tin từ backend
        if (orderData.tongTienGiamGia) {
          setOrderDiscount(orderData.tongTienGiamGia);
          setOrderTotal(orderData.tongTien);
        }

        return orderData;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  // ✅ THÊM: Function áp dụng voucher qua API mới (giống BanHangTaiQuay)
  const applyVoucherToOrder = async (orderId, voucherId) => {
    if (!orderId || !voucherId) return false;

    try {
      const response = await fetch(config.getApiUrl(`api/don-hang-chi-tiet/${orderId}/apply-voucher/${voucherId}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const updatedOrder = await response.json();

        // ✅ THÊM: Trừ số lượng voucher đi 1 sau khi áp dụng thành công
        try {
          console.log('🎫 Đang trừ số lượng voucher...');

          // ✅ SỬA: Sử dụng API update có sẵn thay vì tạo API mới
          // Tìm voucher hiện tại để lấy thông tin cập nhật
          const currentVoucher = vouchers.find(v => v.id === Number(voucherId));
          if (currentVoucher) {
            const newQuantity = Math.max(0, currentVoucher.soLuong - 1);

            const decreaseVoucherResponse = await fetch(config.getApiUrl(`api/voucher/update/${voucherId}`), {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...currentVoucher,
                soLuong: newQuantity
              })
            });

            if (decreaseVoucherResponse.ok) {
              console.log('✅ Đã trừ số lượng voucher thành công');

              // ✅ Cập nhật state vouchers để giảm số lượng hiển thị
              setVouchers(prevVouchers =>
                prevVouchers.map(v =>
                  v.id === Number(voucherId)
                    ? { ...v, soLuong: newQuantity }
                    : v
                )
              );

              // ✅ THÊM: Thông báo nếu voucher hết số lượng
              if (newQuantity === 0) {
                toast.info('🎫 Voucher đã hết số lượng!');

                // ✅ Tự động bỏ chọn voucher nếu hết số lượng
                setSelectedVoucherId('');
                setOrderDiscount(0);
                setOrderTotal(total);
                setFinalTotal(total + shippingFee);
              }
            } else {
              console.warn('⚠️ Không thể trừ số lượng voucher, nhưng voucher đã được áp dụng');
            }
          } else {
            console.warn('⚠️ Không tìm thấy voucher để cập nhật số lượng');
          }
        } catch (decreaseError) {
          console.warn('⚠️ Lỗi khi trừ số lượng voucher:', decreaseError);
        }

        // ✅ Fetch lại thông tin đơn hàng để lấy tổng tiền mới (giống BanHangTaiQuay)
        await fetchOrderInfo(orderId);

        return true;
      } else {
        const errorMessage = await response.text();
        toast.error(`Không thể áp dụng voucher: ${errorMessage}`);
        return false;
      }
    } catch (error) {
      toast.error('Lỗi kết nối khi áp dụng voucher');
      return false;
    }
  };


  const handlePayment = async () => {
    // ✅ SỬA: Validation chi tiết hơn
    if (!customerName.trim()) {
      toast.warning('Vui lòng nhập họ tên khách hàng!');
      return;
    }

    if (!customerPhone.trim()) {
      toast.warning('Vui lòng nhập số điện thoại!');
      return;
    }

    // Kiểm tra format số điện thoại
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      toast.warning('Số điện thoại không đúng định dạng!');
      return;
    }

    if (!customerEmail.trim()) {
      toast.warning('Vui lòng nhập email!');
      return;
    }

    // Kiểm tra format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) {
      toast.warning('Email không đúng định dạng!');
      return;
    }

    if (!customerAddress.trim()) {
      toast.warning('Vui lòng nhập địa chỉ giao hàng!');
      return;
    }

    // ✅ THÊM: Kiểm tra đã chọn địa chỉ để tính phí vận chuyển
    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      toast.warning('Vui lòng chọn địa chỉ giao hàng để tính phí vận chuyển!');
      return;
    }

    if (!addressDetail.trim()) {
      toast.warning('Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường, tòa nhà)!');
      return;
    }

    // ✅ THÊM: Kiểm tra đã tính được phí vận chuyển
    if (shippingFee <= 0) {
      toast.warning('Vui lòng chờ tính phí vận chuyển hoặc thử lại!');
      return;
    }

    // ✅ THÊM: Kiểm tra giới hạn đơn hàng TRƯỚC KHI xử lý bất kỳ phương thức thanh toán nào
    try {
      const customerId = getCustomerId();
      if (!customerId) {
        toast.error('Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại!');
        return;
      }

      console.log('🔍 Kiểm tra giới hạn đơn hàng cho khách hàng:', customerId);
      const orderLimitCheck = await checkCustomerOrderLimit(customerId);

      if (!orderLimitCheck.success) {
        toast.error(orderLimitCheck.message);
        return;
      }

      if (!orderLimitCheck.canCreateOrder) {
        // ✅ Hiển thị thông báo lỗi thân thiện với SweetAlert2 (nếu có) hoặc toast
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
              navigate('/order-history');
            }
          });
        } else {
          toast.error(orderLimitCheck.message, {
            position: "top-center",
            autoClose: 7000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
        return;
      }

      console.log('✅ Khách hàng có thể tạo đơn hàng mới:', orderLimitCheck.message);
    } catch (error) {
      toast.error('Lỗi khi kiểm tra giới hạn đơn hàng: ' + error.message);
      return;
    }

    setLoading(true);

    try {
      const customerId = getCustomerId();
      
      // BƯỚC 1: TẠO ĐƠN HÀNG (Dùng cho cả COD và VNPAY để validate Voucher/Stock ngay lập tức)
      const orderData = {
        idkhachHang: customerId,
        idnhanVien: null,
        idgiamGia: selectedVoucherId || null,
        ngayTao: null,
        // Backend create() sẽ tự trừ voucher thêm lần nữa: donHang.setTongTien(tongTien - giam)
        tongTien: total - itemDiscountTotal,
        tongTienGiamGia: orderDiscount, 
        phiVanChuyen: shippingFee, 
        tenNguoiNhan: customerName,
        soDienThoaiGiaoHang: customerPhone,
        emailGiaoHang: customerEmail,
        diaChiGiaoHang: customerAddress,
        loaiDonHang: 'online', 
        trangThai: 0 // Chờ xác nhận / Chờ thanh toán
      };

      console.log('📦 Đang gửi yêu cầu tạo đơn hàng Atomic:', orderData);

      const orderRes = await fetch(config.getApiUrl('api/donhang/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        // Ném lỗi Voucher/Stock từ Backend
        throw new Error(errorData.message || 'Lỗi khi tạo đơn hàng. Vui lòng kiểm tra lại Voucher hoặc Sản phẩm.');
      }

      const createdOrder = await orderRes.json();
      const newOrderId = createdOrder.id;
      console.log('✅ Đã tạo đơn hàng thành công, ID:', newOrderId);


      // BƯỚC 2: Tạo đơn hàng chi tiết cho từng sản phẩm (giống BanHangTaiQuay)

      for (let i = 0; i < cart.length; i++) {
        const item = cart[i];

        // Xử lý data từ giỏ hàng
        let chiTietData;

        // ✅ SỬA: Logic xử lý cấu trúc dữ liệu giỏ hàng
        if (item.sanPhamChiTiet && item.sanPhamChiTiet.id) {
          // 📦 Cấu trúc từ giỏ hàng với sanPhamChiTiet
          const hasDiscount = item.sanPhamChiTiet.giaBanGiamGia &&
            item.sanPhamChiTiet.giaBanGiamGia > 0 &&
            item.sanPhamChiTiet.giaBanGiamGia < item.sanPhamChiTiet.giaBan;
          const giaBan = hasDiscount ? item.sanPhamChiTiet.giaBanGiamGia : item.sanPhamChiTiet.giaBan;

          chiTietData = {
            idDonHang: newOrderId,
            idSanPhamChiTiet: item.sanPhamChiTiet.id,
            soLuong: item.soLuong || 1,
            gia: giaBan,
            thanhTien: giaBan * (item.soLuong || 1),
          };



        } else if (item.giaBan !== undefined && item.idSanPhamChiTiet) {
          // 🆕 Cấu trúc mới từ backend
          const hasDiscount = item.giaBanGiamGia && item.giaBanGiamGia > 0 && item.giaBanGiamGia < item.giaBan;
          const finalPrice = hasDiscount ? item.giaBanGiamGia : item.giaBan;

          chiTietData = {
            idDonHang: newOrderId,
            idSanPhamChiTiet: item.idSanPhamChiTiet,
            soLuong: item.soLuong || 1,
            gia: finalPrice,
            thanhTien: finalPrice * (item.soLuong || 1),
          };



        } else if (item.gia !== undefined && item.idSanPhamChiTiet) {
          // 🔍 Cấu trúc có trường gia trực tiếp
          chiTietData = {
            idDonHang: newOrderId,
            idSanPhamChiTiet: item.idSanPhamChiTiet,
            soLuong: item.soLuong || 1,
            gia: item.gia,
            thanhTien: item.gia * (item.soLuong || 1),
          };



        } else if (item.price !== undefined) {
          // 🛒 Data từ mua ngay
          const hasDiscount = item.discountPrice && item.discountPrice < item.originalPrice;
          const finalPrice = hasDiscount ? item.discountPrice : item.price;

          chiTietData = {
            idDonHang: newOrderId,
            idSanPhamChiTiet: item.id,
            soLuong: item.quantity || 1,
            gia: finalPrice,
            thanhTien: finalPrice * (item.quantity || 1),
          };



        } else {
          // ❌ Không nhận diện được cấu trúc
          console.error(`❌ Không thể xử lý item ${i + 1}:`, item);
          throw new Error(`Không thể xử lý sản phẩm ${i + 1}`);
        }

        console.log(`Tạo chi tiết sản phẩm ${i + 1}:`, chiTietData);

        // ✅ SỬA: Sử dụng API khác nhau cho COD và VNPAY
        let apiUrl;
        if (paymentMethod === 'cod') {
          // COD: Sử dụng API không trừ tồn kho -> SỬA: Dùng API mặc định /create vì create_k_tru_ton_kho không tồn tại
          apiUrl = config.getApiUrl('api/donhangchitiet/create');
          console.log(`🎯 COD - Sử dụng API không trừ tồn kho: ${apiUrl}`);
        } else {
          // VNPAY: Sử dụng API trừ tồn kho (giữ nguyên)
          apiUrl = config.getApiUrl('api/donhangchitiet/create');
          console.log(`💳 VNPAY - Sử dụng API trừ tồn kho: ${apiUrl}`);
        }

        const chiTietRes = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chiTietData)
        });

        if (!chiTietRes.ok) {
          console.error(`Lỗi tạo chi tiết sản phẩm ${i + 1}:`, await chiTietRes.text());
          throw new Error(`Lỗi khi tạo chi tiết sản phẩm ${i + 1}`);
        }

        console.log(`Đã tạo chi tiết sản phẩm ${i + 1} thành công`);
      }

      console.log('Hoàn thành tạo đơn hàng và chi tiết!');

      console.log('✅ Hoàn thành tạo đơn hàng và chi tiết sản phẩm.');

      // ✅ BƯỚC 5: Xóa giỏ hàng CHỈ KHI thanh toán từ giỏ hàng, KHÔNG xóa khi mua ngay
      console.log('Bước 5: Xử lý xóa giỏ hàng...');

      // ✅ BƯỚC 5: Xóa giỏ hàng CHỈ KHI thanh toán từ giỏ hàng, KHÔNG xóa khi mua ngay
      console.log('Bước 5: Xử lý xóa giỏ hàng...');

      // Kiểm tra xem có phải mua ngay không
      const isBuyNow = location.state?.buyNow === true;


      if (!isBuyNow && cart.length > 0) {
        console.log('🛒 Thanh toán từ giỏ hàng - Bắt đầu xóa giỏ hàng...');

        // ✅ SỬA LẠI: Lấy ID khách hàng từ user đang đăng nhập
        const customerId = getCustomerId();
        if (!customerId) {
          console.warn('⚠️ Không thể xác định ID khách hàng, bỏ qua xóa giỏ hàng');
        } else {
          try {

            const clearCartRes = await fetch(config.getApiUrl(`api/gio-hang-chi-tiet/xoa-tat-ca/${customerId}`), {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' }
            });

            if (clearCartRes.ok) {

              toast.success('Đã xóa giỏ hàng sau khi thanh toán!');
            } else {
              const errorText = await clearCartRes.text();
              console.warn('⚠️ Không thể xóa giỏ hàng trên backend:', errorText);
            }
          } catch (clearCartError) {
            console.warn('⚠️ Lỗi khi xóa giỏ hàng backend:', clearCartError);
          }
        }

        // ✅ LUÔN xóa localStorage cart khi thanh toán từ giỏ hàng (bất kể backend có thành công hay không)
        try {
          localStorage.removeItem('cart');
          console.log('✅ Đã xóa localStorage cart (thanh toán từ giỏ hàng)');

          // ✅ Dispatch event để cập nhật UI
          window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: [] } }));
          console.log('✅ Đã dispatch event cartUpdated');

        } catch (localStorageError) {
          console.warn('⚠️ Lỗi khi xóa localStorage cart:', localStorageError);
        }

      } else if (isBuyNow) {
        console.log('✅ Mua ngay - KHÔNG xóa giỏ hàng');
      } else {
        console.log('✅ Không có sản phẩm nào trong giỏ hàng để xóa');
      }

      setLoading(false);

      if (paymentMethod === 'cod') {
        // ✅ COD: Hiển thị thông báo thành công và chuyển trang sau delay
        toast.success('🎊 Đặt hàng thành công! Đơn hàng đang chờ xác nhận.', {
          position: "top-center",
          autoClose: 5000,
        });

        // ✅ COD: Chuyển trang sau 2 giây
        setTimeout(() => {
          navigate('/orders');
        }, 2000);
      } else if (paymentMethod === 'bank') {
        // ✅ VNPAY: Gọi API lấy URL thanh toán VNPAY
        console.log('💰 Đang tạo yêu cầu thanh toán VNPAY cho đơn hàng:', newOrderId);
        
        try {
          // Làm tròn tổng tiền cho VNPAY
          const vnpAmount = Math.round(finalTotal);
          const paymentRes = await fetch(config.getApiUrl(`api/payment/create?amount=${vnpAmount}`));
          
          if (!paymentRes.ok) throw new Error('Không thể khởi tạo thanh toán VNPAY');
          
          const vnpUrl = await paymentRes.text();
          console.log('🚀 Chuyển hướng đến VNPAY:', vnpUrl);
          
          // Chuyển hướng ngay lập tức đến VNPAY
          window.location.href = vnpUrl;
        } catch (paymentErr) {
          console.error('❌ Lỗi VNPAY:', paymentErr);
          toast.error('Đơn hàng đã tạo nhưng không thể chuyển sang trang thanh toán. Vui lòng thanh toán lại trong mục Lịch sử đơn hàng.');
          setTimeout(() => navigate('/orders'), 3000);
        }
      }

    } catch (error) {
      console.error('Lỗi trong quá trình đặt hàng:', error);
      // Fallback khi lỗi kết nối: Giả định liên tỉnh 50km (250k)
      setShippingFee(250000); // Assuming this is a state setter for shipping fee
      setShippingFeeLoading(false); // Assuming this is a state setter for shipping fee loading
      setLoading(false);
      toast.error(`Đặt hàng thất bại: ${error.message}`);
    }
  };





  return (
    <div className="gx-payment-root">
      <div className="gx-payment-main">
        {/* Cột trái: Form khách hàng */}
        <div className="gx-payment-form-col">
          {/* Khối địa chỉ kiểu Shopee */}
          <div className="gx-payment-address-card">
            <div className="gx-payment-address-header">
              <div className="gx-payment-address-title-wrapper">
                <span className="gx-payment-address-title">📍 Địa chỉ nhận hàng</span>
                {addressIsDefault && (
                  <span className="gx-payment-address-tag">Mặc định</span>
                )}
              </div>
              <button
                type="button"
                className="gx-payment-address-change"
                onClick={() => {
                  setAddressModalOpen(true);
                }}
              >
                Thay đổi
              </button>
            </div>
            <div className="gx-payment-address-body">
              <div className="gx-payment-address-name">
                {safeText(customerName, 'Chưa có tên')}
                <span className="gx-payment-address-phone"> | {safeText(formatPhone(customerPhone), 'Chưa có SĐT')}</span>
              </div>
              <div className="gx-payment-address-text">
                {prettyAddress(customerAddress) || 'Chưa có địa chỉ. Vui lòng nhập thông tin bên dưới.'}
              </div>
            </div>
          </div>

          {/* <div className="gx-payment-form-group">
            <label>Ghi chú</label>
            <textarea className="gx-payment-input" style={{ minHeight: 60 }} value={customerNote} onChange={e => setCustomerNote(e.target.value)} placeholder="Ghi chú cho đơn hàng (nếu có)" />
          </div> */}
          <div className="gx-payment-card">
            <div className="gx-payment-form-group" style={{ marginBottom: 0 }}>
              <label>Phương thức thanh toán</label>
              <select
                className="gx-payment-input"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
              >
                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                <option value="bank">Chuyển khoản ngân hàng</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cột phải: Đơn hàng */}
        <div className="gx-payment-order-col">
          <h2 className="gx-payment-title">Đơn hàng của bạn</h2>

          {/* ✅ THÊM: Phần chọn voucher (giống BanHangTaiQuay - Modal) */}
          <div className="gx-payment-voucher-section gx-payment-card">
            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#333' }}>🎫 Mã giảm giá</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                className="gx-payment-button"
                style={{
                  backgroundColor: '#1890ff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onClick={() => setShowVoucherModal(true)}
                disabled={voucherLoading}
              >
                {voucherLoading ? 'Đang tải...' : 'Chọn voucher'}
              </button>
              {selectedVoucherId && (
                <button
                  className="gx-payment-button"
                  style={{
                    backgroundColor: '#ff4d4f',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleVoucherChange('')}
                >
                  Bỏ voucher
                </button>
              )}
            </div>

            {/* Hiển thị thông tin voucher đã chọn */}
            {selectedVoucherId && (
              <div style={{
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ fontWeight: 'bold', color: '#52c41a', marginBottom: '4px' }}>
                  🎉 Voucher đã được áp dụng
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  {vouchers.find(v => v.id === Number(selectedVoucherId))?.tenVoucher}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                  {vouchers.find(v => v.id === Number(selectedVoucherId))?.moTa}
                </div>
                <div style={{ fontSize: '12px', color: '#52c41a', fontWeight: 'bold' }}>
                  💰 Giá trị: {
                    (() => {
                      const voucher = vouchers.find(v => v.id === Number(selectedVoucherId));
                      if (voucher?.loaiVoucher === 'Giảm giá %') {
                        return `Giảm ${voucher.giaTri}% (tối đa ${((total * voucher.giaTri) / 100).toLocaleString()}₫)`;
                      } else if (voucher?.loaiVoucher === 'Giảm giá số tiền') {
                        return `Giảm ${voucher.giaTri.toLocaleString()}₫`;
                      }
                      return '';
                    })()
                  }
                </div>
              </div>
            )}

            {/* Hiển thị thông báo voucher */}
            {voucherMessage && (
              <div style={{
                background: voucherMessage.includes('thành công') ? '#f6ffed' : '#fff2f0',
                border: voucherMessage.includes('thành công') ? '1px solid #b7eb8f' : '1px solid #ffccc7',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: '16px',
                fontSize: '14px',
                color: voucherMessage.includes('thành công') ? '#52c41a' : '#ff4d4f'
              }}>
                {voucherMessage}
              </div>
            )}
          </div>
          <div className="gx-payment-order-list gx-payment-card">
            {cart.length === 0 ? (
              <p>Không có sản phẩm nào!</p>
            ) : (
              <div className="gx-payment-order-table" role="table" aria-label="Danh sách sản phẩm">
                <div className="gx-payment-product-header">
                  <div className="gx-payment-product-item-head">Sản phẩm</div>
                  <div className="gx-payment-product-price-head">Đơn giá</div>
                  <div className="gx-payment-product-qty-head">Số lượng</div>
                  <div className="gx-payment-product-total-head">Thành tiền</div>
                </div>

                {cart.map((rawItem, index) => {
                  const item = normalizeCartItem(rawItem);
                  const hasDiscount = item.originalUnitPrice > 0 && item.unitPrice > 0 && item.unitPrice < item.originalUnitPrice;
                  const lineTotal = item.unitPrice * (item.qty || 1);

                  return (
                    <div key={index} className="gx-payment-product-row">
                      <div className="gx-payment-product-item">
                        <div className="gx-payment-image-container">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="gx-payment-product-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/100x100?text=S%E1%BA%A3n+Ph%E1%BA%A9m";
                            }}
                          />
                        </div>
                        <div className="gx-payment-product-detail">
                          <div className="gx-payment-product-name">{item.name}</div>
                          {item.variant && (
                            <div className="gx-payment-product-variants">
                              {item.variant.split(' • ').map((v, i) => (
                                <span key={i} className="gx-payment-variant-pill">
                                  {v}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="gx-payment-product-price">
                        {hasDiscount ? (
                          <div className="gx-payment-price-group">
                            <span className="gx-price-old">{formatVnd(item.originalUnitPrice)}</span>
                            <span className="gx-price-new">{formatVnd(item.unitPrice)}</span>
                          </div>
                        ) : (
                          <span className="gx-price-new">{formatVnd(item.unitPrice)}</span>
                        )}
                      </div>

                      <div className="gx-payment-product-qty">
                        x{item.qty}
                      </div>

                      <div className="gx-payment-product-total">
                        {formatVnd(lineTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="gx-payment-summary gx-payment-card">
            {/* ✅ TÓM TẮT CHI PHÍ (PREMIUM STYLE) */}
            <div className="gx-payment-summary-row">
              <span className="gx-payment-label">
                <span className="gx-summary-icon">📦</span> Tạm tính (Giá gốc):
              </span>
              <span className="gx-payment-value">{formatVnd(total)}</span>
            </div>

            {itemDiscountTotal > 0 && (
              <div className="gx-payment-summary-row" style={{ color: '#e74c3c' }}>
                <span className="gx-payment-label">
                  <span className="gx-summary-icon">💰</span> Tiết kiệm khuyến mãi:
                </span>
                <span className="gx-payment-value">-{formatVnd(itemDiscountTotal)}</span>
              </div>
            )}

            {selectedVoucherId && (
              <div className="gx-payment-summary-row" style={{ color: '#52c41a' }}>
                <span className="gx-payment-label">
                  <span className="gx-summary-icon">🎫</span> Voucher giảm giá:
                </span>
                <span className="gx-payment-value">-{formatVnd(orderDiscount)}</span>
              </div>
            )}

            <div className="gx-payment-summary-row">
              <span className="gx-payment-label">
                <span className="gx-summary-icon">🚚</span> Phí vận chuyển:
              </span>
              <span className="gx-payment-value">
                {shippingFeeLoading || distanceLoading ? (
                  <span className="gx-payment-loading-text">Đang tính...</span>
                ) : (
                  (total - itemDiscountTotal - orderDiscount) >= 2000000 ? (
                    <span className="gx-free-ship-badge">Miễn phí (Đơn trên 2tr)</span>
                  ) : (
                    <span className="gx-shipping-price-text">{formatVnd(shippingFee)}</span>
                  )
                )}
              </span>
            </div>

            {/* Thông báo hướng dẫn tính phí vận chuyển - Chỉ hiện khi chưa có đủ thông tin địa chỉ */}
            {(!selectedProvince || !selectedDistrict || !selectedWard) && (
              <div style={{
                background: '#fff7e6',
                border: '1px solid #ffd591',
                borderRadius: '6px',
                padding: '8px 12px',
                marginTop: '8px',
                fontSize: '14px',
                color: '#d46b08'
              }}>
                💡 Vui lòng chọn địa chỉ giao hàng để tính phí vận chuyển chính xác
              </div>
            )}

            <div className="gx-payment-summary-row" style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#e74c3c',
              borderTop: '2px solid #f0f0f0',
              paddingTop: '12px'
            }}>
              <span className="gx-payment-label">Tổng thanh toán:</span>
              <span className="gx-payment-value">{formatVnd(finalTotal)}</span>
            </div>
          </div>

          <button
            className="gx-payment-btn"
            onClick={handlePayment}
            disabled={loading || !selectedProvince || !selectedDistrict || !selectedWard || (shippingFee <= 0 && shippingFeeLoading)}
            style={{
              opacity: (loading || !selectedProvince || !selectedDistrict || !selectedWard || (shippingFee <= 0 && shippingFeeLoading)) ? 0.6 : 1,
              cursor: (loading || !selectedProvince || !selectedDistrict || !selectedWard || (shippingFee <= 0 && shippingFeeLoading)) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Đang xử lý...' :
              !selectedProvince || !selectedDistrict || !selectedWard ? 'Chọn địa chỉ giao hàng' :
                shippingFee <= 0 ? 'Đang tính phí vận chuyển...' : 'ĐẶT HÀNG'}
          </button>






        </div>
      </div>

      {/* ✅ THÊM: MODAL CHỌN VOUCHER (giống BanHangTaiQuay) */}
      <Dialog open={showVoucherModal} onClose={() => setShowVoucherModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chọn voucher</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell> {/* Cột icon đánh dấu */}
                <TableCell>Mã voucher</TableCell>
                <TableCell>Tên voucher</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Giá trị</TableCell>
                <TableCell>Đơn tối thiểu</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vouchers.map(v => {
                const effectiveTotal = total - itemDiscountTotal;
                return (
                  <TableRow
                    key={v.id}
                    selected={String(selectedVoucherId) === String(v.id)}
                    style={
                      effectiveTotal < v.donToiThieu
                        ? { background: '#f5f5f5', color: '#aaa' }
                        : String(selectedVoucherId) === String(v.id)
                          ? { background: '#e3f2fd' }
                          : {}
                    }
                  >
                    <TableCell>
                      {String(selectedVoucherId) === String(v.id) && (
                        <CheckCircleIcon color="primary" />
                      )}
                    </TableCell>
                    <TableCell>{v.maVoucher}</TableCell>
                    <TableCell>{v.tenVoucher}</TableCell>
                    <TableCell>{v.loaiVoucher}</TableCell>
                    <TableCell>{v.soLuong}</TableCell>
                    <TableCell>
                      {v.loaiVoucher?.toLowerCase().includes('%') ? `${v.giaTri}%` : v.giaTri?.toLocaleString() + ' ₫'}
                    </TableCell>
                    <TableCell>{v.donToiThieu?.toLocaleString() || 0} ₫</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => {
                          setShowVoucherModal(false);
                          handleVoucherChange(v.id);
                        }}
                        disabled={(total - itemDiscountTotal) < v.donToiThieu}
                      >
                        Chọn
                      </Button>
                      {(total - itemDiscountTotal) < v.donToiThieu && (
                        <span style={{ color: 'red', fontSize: 12, marginLeft: 8 }}>
                          Không đủ điều kiện
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowVoucherModal(false);
              handleVoucherChange('');
            }}
            color="error"
            variant="outlined"
          >
            Bỏ voucher
          </Button>
          <Button onClick={() => setShowVoucherModal(false)} color="primary">Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Popup chọn / lưu nhiều địa chỉ giao hàng (sử dụng AddressManager dùng chung) */}
      <Dialog open={addressModalOpen} onClose={() => setAddressModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Địa chỉ của tôi</DialogTitle>
        <DialogContent>
          <div style={{ padding: '8px 0' }}>
            <AddressManager
              customerId={getCustomerId()}
              selectedId={selectedAddressId}
              onSelect={(addr) => {
                applyAddressFromBook(addr);
                // Nếu đang ở chế độ chọn địa chỉ từ danh sách, thì đóng modal sau khi chọn
                // (Trong AddressManager, onSelect được gọi cả khi chọn radio và khi hoàn thành form thêm mới)
                setAddressModalOpen(false);
              }}
              showSelection={true}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddressModalOpen(false)} color="inherit">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>


      <ToastContainer />
    </div>
  );


};

export default Payment;