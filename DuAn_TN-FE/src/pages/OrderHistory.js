import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  Avatar,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  AccountBalanceWallet as WalletIcon,
  ErrorOutline as ErrorOutlineIcon,
  Inventory as InventoryIcon,
  AccessTime as AccessTimeIcon,
  ShoppingBagOutlined as ShoppingBagIcon,
} from "@mui/icons-material";

const TRANG_THAI = [
  {
    value: -1,
    label: "Tất cả",
    color: "primary",
    hex: "#1976d2",
    bg: "#e3f2fd",
  },
  {
    value: 0,
    label: "Chờ xác nhận",
    color: "warning",
    hex: "#ff9800",
    bg: "#fff3e0",
    icon: <AccessTimeIcon fontSize="small" />,
  },
  {
    value: 1,
    label: "Đã xác nhận",
    color: "info",
    hex: "#43b244",
    bg: "#e8f5e9",
    icon: <CheckCircleIcon fontSize="small" />,
  },
  {
    value: 2,
    label: "Đang chuẩn bị",
    color: "secondary",
    hex: "#1976d2",
    bg: "#e3f2fd",
    icon: <InventoryIcon fontSize="small" />,
  },
  {
    value: 3,
    label: "Đang giao",
    color: "info",
    hex: "#1976d2",
    bg: "#e3f2fd",
    icon: <LocalShippingIcon fontSize="small" />,
  },
  {
    value: 4,
    label: "Hoàn thành",
    color: "success",
    hex: "#009688",
    bg: "#e0f2f1",
    icon: <CheckCircleIcon fontSize="small" />,
  },
  {
    value: 5,
    label: "Đã hủy",
    color: "error",
    hex: "#e53935",
    bg: "#ffebee",
    icon: <CancelIcon fontSize="small" />,
  },
  {
    value: 7,
    label: "Giao không thành công",
    color: "error",
    hex: "#9c27b0",
    bg: "#f3e5f5",
    icon: <ErrorOutlineIcon fontSize="small" />,
  },
];

const OrderHistory = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // State cho filter và search
  const [filterStatus, setFilterStatus] = useState(-1); // Mặc định hiển thị tất cả
  const [searchText, setSearchText] = useState('');

=======
  const [error, setError] = useState("");
>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424

  const [filterStatus, setFilterStatus] = useState(-1);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
<<<<<<< HEAD
      setError('');

      // Lấy customerId từ localStorage
      const customerId = localStorage.getItem('customerId') || localStorage.getItem('userId') || 1;

      let response;

      // Sử dụng API mới theo trạng thái cụ thể
      if (filterStatus === -1) {
        // Lấy tất cả đơn hàng của khách hàng
        response = await axios.get(`http://localhost:8080/api/donhang/khach/${customerId}`);
      } else {
        // Lấy đơn hàng theo trạng thái cụ thể (bao gồm cả trạng thái 7)
        response = await axios.get(`http://localhost:8080/api/donhang/khach/${customerId}/trangthai/${filterStatus}`);
      }

      console.log('Orders response:', response.data);
      // ✅ DEBUG: Log để kiểm tra dữ liệu ghiChu
      if (filterStatus === 7) {
        console.log('🔍 === DEBUG GIAO HÀNG KHÔNG THÀNH CÔNG ===');
        console.log('📡 API Response:', response.data);
        console.log('📊 Response type:', typeof response.data);
        console.log('📊 Response length:', response.data?.length);
        console.log('🔗 API URL:', `http://localhost:8080/api/donhang/khach/${customerId}/trangthai/${filterStatus}`);

        if (Array.isArray(response.data)) {
          response.data.forEach((order, idx) => {
            console.log(`📊 Đơn hàng ${idx + 1}:`, {
              id: order.id,
              trangThai: order.trangThai,
              ghiChu: order.ghiChu,
              hasGhiChu: !!order.ghiChu,
              ghiChuType: typeof order.ghiChu,
              // ✅ THÊM: Log toàn bộ object để kiểm tra
              fullOrder: order,
              // ✅ THÊM: Log tất cả keys để kiểm tra cấu trúc
              allKeys: Object.keys(order)
            });
          });
        } else {
          console.log('⚠️ Response không phải array:', response.data);
        }
        console.log('🔍 === END DEBUG ===');
      }

      let filteredOrders = response.data || [];

      // ✅ SỬA: Tab "Tất cả" chỉ hiển thị đơn hàng có trạng thái 0,1,2,3 (không bao gồm trạng thái 7)
      if (filterStatus === -1) {
        filteredOrders = filteredOrders.filter(order => [0, 1, 2, 3].includes(order.trangThai));
      }

      // ✅ THÊM: Sắp xếp theo ID từ cao xuống thấp
      filteredOrders.sort((a, b) => (b.id || 0) - (a.id || 0));

      // Tìm kiếm theo mã đơn hoặc tên khách hàng
      if (searchText.trim()) {
        const search = searchText.trim().toLowerCase();
        filteredOrders = filteredOrders.filter(order =>
          (order.id?.toString().includes(search) || '') ||
          (order.tenKhachHang?.toLowerCase().includes(search) || '') ||
          (order.tenNguoiNhan?.toLowerCase().includes(search) || '')
        );
      }

=======
      setError("");

      const customerId =
        localStorage.getItem("customerId") ||
        localStorage.getItem("userId") ||
        1;

      let response;
      if (filterStatus === -1) {
        response = await axios.get(
          `http://localhost:8080/api/donhang/khach/${customerId}`,
        );
      } else {
        response = await axios.get(
          `http://localhost:8080/api/donhang/khach/${customerId}/trangthai/${filterStatus}`,
        );
      }

      let filteredOrders = response.data || [];
      filteredOrders.sort((a, b) => (b.id || 0) - (a.id || 0));

      if (searchText.trim()) {
        const search = searchText.trim().toLowerCase();
        filteredOrders = filteredOrders.filter(
          (order) =>
            order.id?.toString().includes(search) ||
            "" ||
            order.tenKhachHang?.toLowerCase().includes(search) ||
            "" ||
            order.tenNguoiNhan?.toLowerCase().includes(search) ||
            "",
        );
      }

>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424
      setOrders(filteredOrders);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchOrders();
  };

  const handleResetSearch = () => {
    setSearchText("");
    setFilterStatus(-1);
    fetchOrders();
  };
<<<<<<< HEAD

=======
>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424

  const handleTabChange = (event, newValue) => {
    setFilterStatus(newValue);
  };

<<<<<<< HEAD
  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#1976d2', fontWeight: 800, marginBottom: 24, textAlign: 'center' }}>
          📋 Lịch sử đơn hàng
        </h2>

        {/* Thống kê tổng quan */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
          <div style={{ textAlign: 'center', background: '#e6f7ff', padding: 16, borderRadius: 8, border: '1px solid #91d5ff' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
              {totalStats.totalOrders}
            </div>
            <div style={{ color: '#666' }}>
              {filterStatus === -1 ? 'Đơn hàng đang xử lý' : 'Tổng đơn hàng'}
            </div>
          </div>

          <div style={{ textAlign: 'center', background: '#f6ffed', padding: 16, borderRadius: 8, border: '1px solid #b7eb8f' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
              {Number(totalStats.totalAmount).toLocaleString('vi-VN')} ₫
            </div>
            <div style={{ color: '#666' }}>Tổng giá trị (đã bao gồm phí ship)</div>
          </div>
        </div>

        {/* Bảng đơn hàng */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#1976d2' }}>
            <div style={{ fontSize: 18 }}>Đang tải dữ liệu...</div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#f5222d' }}>
            <div style={{ fontSize: 18 }}>❌ {error}</div>
            <button
              onClick={fetchOrders}
              style={{
                marginTop: 16,
                padding: '8px 16px',
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              Thử lại
            </button>
          </div>
        ) : (
          <>
            {/* Luôn hiển thị filter bar và bảng */}
            <div style={{ width: '100%', marginTop: 0, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(25,118,210,0.08)', overflow: 'hidden', borderCollapse: 'collapse' }}>
              {renderFilterBar()}

              {/* Hiển thị thông tin filter hiện tại */}
              {filterStatus !== -1 ? (
                <div style={{
                  background: '#e8f5e8',
                  padding: '12px 16px',
                  borderRadius: 8,
                  margin: '16px 24px',
                  border: '1px solid #4caf50',
                  color: '#2e7d32',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  🔍 Đang log theo trạng thái:
                  <span style={{
                    background: TRANG_THAI.find(t => t.value === filterStatus)?.color || '#999',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 12
                  }}>
                    {TRANG_THAI.find(t => t.value === filterStatus)?.label || 'Không xác định'}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 12 }}>
                    Tìm thấy {orders.length} đơn hàng
                  </span>
                </div>
              ) : (
                <div style={{
                  background: '#e3f2fd',
                  padding: '12px 16px',
                  borderRadius: 8,
                  margin: '16px 24px',
                  border: '1px solid #2196f3',
                  color: '#1565c0',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  📋 Hiển thị đơn hàng đang xử lý (Chờ xác nhận, Đã xác nhận, Đang chuẩn bị, Đang giao)
                  <span style={{ marginLeft: 'auto', fontSize: 12 }}>
                    Tìm thấy {orders.length} đơn hàng
                  </span>
                </div>
              )}

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#e3f0ff', color: '#1976d2', fontWeight: 700 }}>
                    <th style={{ padding: 12 }}>STT</th>
                    <th style={{ padding: 12 }}>Mã đơn hàng</th>
                    <th style={{ padding: 12 }}>Tên khách hàng</th>
                    <th style={{ padding: 12 }}>Ngày tạo</th>
                    <th style={{ padding: 12 }}>Số điện thoại</th>
                    <th style={{ padding: 12 }}>Thành tiền</th>
                    <th style={{ padding: 12 }}>Trạng thái</th>
                    {(filterStatus === 5 || filterStatus === 7) && (
                      <th style={{ padding: 12 }}>
                        {filterStatus === 5 ? 'Lý do hủy đơn' : 'Lý do giao hàng không thành công'}
                      </th>
                    )}
                    <th style={{ padding: 12 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={(filterStatus === 5 || filterStatus === 7) ? 9 : 8} style={{ textAlign: 'center', color: '#888', padding: 32 }}>
                        {filterStatus !== -1 ?
                          `Không có đơn hàng nào ở trạng thái "${TRANG_THAI.find(t => t.value === filterStatus)?.label}"` :
                          'Không có đơn hàng nào'
                        }
                      </td>
                    </tr>
                  ) : (
                    orders.map((order, idx) => {
                      const trangThaiObj = TRANG_THAI.find(t => t.value === order.trangThai) || TRANG_THAI[0];
                      return (
                        <tr key={order.id} style={{ borderBottom: '1px solid #e3e8ee', fontSize: 16 }}>
                          <td style={{ padding: 12, textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ padding: 12, fontWeight: 700, color: '#1976d2' }}>#{order.id}</td>
                          <td style={{ padding: 12 }}>{order.tenKhachHang || order.tenNguoiNhan || 'Chưa có thông tin'}</td>
                          <td style={{ padding: 12 }}>{order.ngayTao || '-'}</td>
                          <td style={{ padding: 12 }}>{order.soDienThoaiGiaoHang || '---'}</td>
                          <td style={{ padding: 12, fontWeight: 700 }}>{order.tongTienSauGiamGia?.toLocaleString() || order.tongTien?.toLocaleString() || 0}đ</td>
                          <td style={{ padding: 12 }}>
                            <span style={{
                              display: 'inline-block',
                              background: trangThaiObj.color,
                              color: '#fff',
                              borderRadius: 12,
                              padding: '4px 18px',
                              fontWeight: 600,
                              fontSize: 15,
                              whiteSpace: 'nowrap',
                              minWidth: 110,
                              textAlign: 'center',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                            }}>
                              {trangThaiObj.label}
                            </span>
                          </td>
                          {(filterStatus === 5 || filterStatus === 7) && (
                            <td style={{ padding: 12 }}>
                              <span style={{
                                color: filterStatus === 5 ? '#e53935' : '#9c27b0',
                                fontWeight: 600,
                                fontSize: 14,
                                padding: '4px 8px',
                                background: filterStatus === 5 ? '#ffebee' : '#f3e5f5',
                                borderRadius: 6,
                                border: `1px solid ${filterStatus === 5 ? '#ffcdd2' : '#e1bee7'}`
                              }}>
                                {(() => {
                                  // ✅ DEBUG: Log để kiểm tra từng order
                                  console.log('🔍 Order ghiChu:', {
                                    id: order.id,
                                    ghiChu: order.ghiChu,
                                    hasGhiChu: !!order.ghiChu,
                                    ghiChuType: typeof order.ghiChu,
                                    // ✅ THÊM: Log thêm thông tin để debug
                                    orderKeys: Object.keys(order),
                                    hasGhiChuKey: 'ghiChu' in order
                                  });

                                  // ✅ CẢI THIỆN: Xử lý nhiều trường hợp hơn
                                  if (order.ghiChu !== null && order.ghiChu !== undefined && order.ghiChu !== '') {
                                    const ghiChuStr = String(order.ghiChu).trim();
                                    if (ghiChuStr.length > 0) {
                                      return ghiChuStr;
                                    }
                                  }

                                  // Kiểm tra các trường khác có thể chứa lý do
                                  if (order.lyDo && order.lyDo.trim() !== '') {
                                    return order.lyDo;
                                  }

                                  if (order.ghiChuGiaoHang && order.ghiChuGiaoHang.trim() !== '') {
                                    return order.ghiChuGiaoHang;
                                  }

                                  return 'Chưa có lý do';
                                })()}
                              </span>
                            </td>
                          )}
                          <td style={{ padding: 12 }}>
                            <button
                              style={{
                                padding: '6px 16px',
                                background: '#1976d2',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              onClick={() => navigate(`/orders/${order.id}`)}
                            >
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Hiển thị thông báo khi không có dữ liệu */}
            {orders.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#666',
                background: '#fff',
                borderRadius: 12,
                marginTop: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
                <h3 style={{ color: '#999', marginBottom: '8px' }}>
                  {filterStatus !== -1 ?
                    `Không có đơn hàng nào ở trạng thái "${TRANG_THAI.find(t => t.value === filterStatus)?.label}"` :
                    'Chưa có đơn hàng nào'
                  }
                </h3>
                <p style={{ color: '#999', fontSize: '16px' }}>
                  {filterStatus !== -1 ?
                    'Hãy thử chọn trạng thái khác hoặc tạo đơn hàng mới!' :
                    'Bạn chưa có đơn hàng nào đang xử lý (Chờ xác nhận, Đã xác nhận, Đang chuẩn bị, Đang giao). Hãy mua sắm để tạo đơn hàng mới!'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>


    </div>
  );
}
=======
  const getStatusColor = (statusValue) => {
    const status = TRANG_THAI.find((t) => t.value === statusValue);
    return status ? status.color : "default";
  };

  const getStatusLabel = (statusValue) => {
    const status = TRANG_THAI.find((t) => t.value === statusValue);
    return status ? status.label : "Không xác định";
  };

  const getReason = (order) => {
    if (order.ghiChu && String(order.ghiChu).trim().length > 0)
      return String(order.ghiChu).trim();
    if (order.lyDo && String(order.lyDo).trim().length > 0)
      return String(order.lyDo).trim();
    if (order.ghiChuGiaoHang && String(order.ghiChuGiaoHang).trim().length > 0)
      return String(order.ghiChuGiaoHang).trim();
    return "Chưa có lý do";
  };

  // Tính tổng thống kê
  const totalAmount = orders.reduce(
    (sum, order) => sum + (order.tongTien || 0),
    0,
  );
  const completedOrders = orders.filter(
    (order) => order.trangThai === 4,
  ).length;
  const pendingOrders = orders.filter((order) =>
    [0, 1, 2, 3].includes(order.trangThai),
  ).length;

  return (
    <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", py: 5 }}>
      <Container maxWidth="xl">
        <Box display="flex" alignItems="center" mb={4}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            <ReceiptIcon />
          </Avatar>
          <Typography variant="h4" fontWeight="800" color="text.primary">
            Lịch sử đơn hàng
          </Typography>
        </Box>

        {/* Khối Thống kê */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
              }}
            >
              <CardContent>
                <Typography
                  color="text.secondary"
                  variant="subtitle2"
                  fontWeight="600"
                  gutterBottom
                >
                  TỔNG SỐ ĐƠN HÀNG
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {orders.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.1)} 100%)`,
              }}
            >
              <CardContent>
                <Typography
                  color="text.secondary"
                  variant="subtitle2"
                  fontWeight="600"
                  gutterBottom
                >
                  ĐƠN THÀNH CÔNG
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {completedOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
              }}
            >
              <CardContent>
                <Typography
                  color="text.secondary"
                  variant="subtitle2"
                  fontWeight="600"
                  gutterBottom
                >
                  ĐANG XỬ LÝ
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {pendingOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              }}
            >
              <CardContent>
                <Typography
                  color="text.secondary"
                  variant="subtitle2"
                  fontWeight="600"
                  gutterBottom
                >
                  TỔNG CHI TIÊU
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="secondary.main"
                >
                  {totalAmount.toLocaleString("vi-VN")} ₫
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 4px 24px 0 rgba(0,0,0,0.06)",
          }}
        >
          <Box p={3} bgcolor="#fff">
            {/* Hàng filter buttons và ô tìm kiếm */}
            <Box
              display="flex"
              flexWrap="wrap"
              gap={2}
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Box display="flex" flexWrap="wrap" gap={1}>
                {TRANG_THAI.map((tt) => {
                  const isActive = filterStatus === tt.value;
                  return (
                    <Button
                      key={tt.value}
                      onClick={() => setFilterStatus(tt.value)}
                      disableElevation
                      variant="contained"
                      sx={{
                        borderRadius: 1.5,
                        textTransform: "none",
                        fontWeight: 700,
                        px: 1.5,
                        py: 0.5,
                        fontSize: "0.85rem",
                        bgcolor: isActive ? "#1976d2" : tt.bg,
                        color: isActive ? "#fff" : tt.hex,
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: isActive ? "#1565c0" : alpha(tt.hex, 0.2),
                          boxShadow: "none",
                        },
                      }}
                    >
                      {tt.label}
                    </Button>
                  );
                })}
              </Box>

              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #e3e8ee",
                    borderRadius: 1.5,
                    height: 36,
                    px: 1.5,
                    bgcolor: "#fff",
                    width: 250,
                  }}
                >
                  <input
                    placeholder="Tìm kiếm mã đơn, tên khách hàng..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    style={{
                      border: "none",
                      outline: "none",
                      width: "100%",
                      background: "transparent",
                      fontSize: "13px",
                      color: "#333",
                    }}
                  />
                </Box>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  sx={{
                    bgcolor: "#1976d2",
                    borderRadius: 1.5,
                    fontWeight: 600,
                    height: 36,
                    textTransform: "none",
                    minWidth: "auto",
                    px: 2,
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#1565c0", boxShadow: "none" },
                  }}
                >
                  🔍 Tìm kiếm
                </Button>
                <Button
                  variant="contained"
                  onClick={handleResetSearch}
                  sx={{
                    bgcolor: "#6c757d",
                    borderRadius: 1.5,
                    fontWeight: 600,
                    height: 36,
                    textTransform: "none",
                    minWidth: "auto",
                    px: 2,
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#5a6268", boxShadow: "none" },
                  }}
                >
                  🔄 Reset
                </Button>
              </Box>
            </Box>

            {/* Thanh hiển thị trạng thái hiện tại */}
            <Box
              sx={{
                bgcolor:
                  filterStatus === -1
                    ? "#e3f2fd"
                    : TRANG_THAI.find((t) => t.value === filterStatus)?.bg,
                border: "1px solid",
                borderColor:
                  filterStatus === -1
                    ? "#2196f3"
                    : alpha(
                        TRANG_THAI.find((t) => t.value === filterStatus)?.hex,
                        0.4,
                      ),
                borderRadius: 1.5,
                p: 1.5,
                px: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
                color={
                  filterStatus === -1
                    ? "#1565c0"
                    : TRANG_THAI.find((t) => t.value === filterStatus)?.hex
                }
                display="flex"
                alignItems="center"
                gap={1}
              >
                📋{" "}
                {filterStatus === -1
                  ? "Hiển thị tất cả đơn hàng"
                  : `Hiển thị các đơn hàng: ${TRANG_THAI.find((t) => t.value === filterStatus)?.label}`}
              </Typography>
              <Typography variant="body2" color="#666" fontSize={13}>
                Tìm thấy {orders.length} đơn hàng
              </Typography>
            </Box>
          </Box>

          {/* Nội dung chính: Bảng hoặc Trạng thái trống */}
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              py={10}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box p={3}>
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={fetchOrders}>
                    Thử lại
                  </Button>
                }
              >
                {error}
              </Alert>
            </Box>
          ) : orders.length === 0 ? (
            <Box
              py={10}
              display="flex"
              flexDirection="column"
              alignItems="center"
              textAlign="center"
              bgcolor="#fafafa"
            >
              <ShoppingBagIcon
                sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
              />
              <Typography
                variant="h5"
                color="text.secondary"
                fontWeight="600"
                gutterBottom
              >
                Không tìm thấy đơn hàng
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                {filterStatus !== -1
                  ? `Chưa có đơn hàng nào chờ xử lý/thuộc trạng thái "${getStatusLabel(filterStatus)}".`
                  : "Cùng khám phá các sản phẩm tuyệt vời và tạo đơn hàng đầu tiên nhé!"}
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/products")}
                sx={{ borderRadius: 2 }}
              >
                Tiếp Tục Mua Sắm
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 900 }}>
                <TableHead sx={{ bgcolor: "#f4f6f8" }}>
                  <TableRow>
                    <TableCell
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      Mã Đơn
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      Khách Hàng
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      Ngày Tạo
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      Tổng Tiền
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      Trạng Thái
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      Thao Tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => {
                    const statusColor = getStatusColor(order.trangThai);
                    const isFailed =
                      order.trangThai === 5 || order.trangThai === 7;
                    const amount =
                      order.tongTienSauGiamGia || order.tongTien || 0;

                    return (
                      <TableRow
                        key={order.id}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          transition: "all 0.2s",
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant="subtitle2"
                            fontWeight="700"
                            color="primary"
                          >
                            #{order.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {order.tenKhachHang ||
                              order.tenNguoiNhan ||
                              "Khách vãng lai"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.soDienThoaiGiaoHang || "..."}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {order.ngayTao || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="subtitle2"
                            fontWeight="700"
                            color="error.main"
                          >
                            {amount.toLocaleString("vi-VN")} đ
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="flex-start"
                            gap={1}
                          >
                            <Chip
                              label={getStatusLabel(order.trangThai)}
                              color={statusColor}
                              size="small"
                              sx={{ fontWeight: 600, borderRadius: 1 }}
                            />
                            {isFailed && (
                              <Tooltip title={getReason(order)} placement="top">
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    maxWidth: 200,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "inline-block",
                                    bgcolor: "action.hover",
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                  }}
                                >
                                  Lý do: {getReason(order)}
                                </Typography>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              onClick={() => navigate(`/orders/${order.id}`)}
                              color="primary"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
};
>>>>>>> dbcc773015f481c98f8da0d3b9f78c0a448b6424

export default OrderHistory;
