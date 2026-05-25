import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  alpha,
} from "@mui/material";
import {
  Search as SearchIcon,
  ChevronRight as ArrowForwardIcon,
} from "@mui/icons-material";

const TRANG_THAI_MAP = [
  { value: -1, label: "Tất cả" },
  { value: 8, label: "Chờ thanh toán" },
  { value: 0, label: "Chờ xác nhận" },
  { value: 1, label: "Chờ vận chuyển" },
  { value: "cho-nhan", label: "Chờ nhận" },
  { value: 4, label: "Đã giao" },
  { value: 6, label: "Trả hàng / Hoàn tiền" },
  { value: 5, label: "Đã hủy" },
];

const GET_STATUS_STYLE = (value) => {
  switch (value) {
    case 0: return { label: "Chờ xác nhận", color: "#f59e0b" };
    case 1: return { label: "Chờ vận chuyển", color: "#059669" };
    case 2:
    case 3: return { label: "Chờ nhận", color: "#2563eb" };
    case 4: return { label: "Đã giao", color: "#10b981" };
    case 5: return { label: "Đã hủy", color: "#ef4444" };
    case 6: return { label: "Trả hàng / Hoàn tiền", color: "#ec4899" };

    case 7: return { label: "Thất bại", color: "#6366f1" };
    case 8: return { label: "Chờ thanh toán", color: "#d97706" };
    default: return { label: "Không rõ", color: "#6b7280" };
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const OrderHistory = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState(-1);
  const [searchText, setSearchText] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const customerId = localStorage.getItem("customerId") || localStorage.getItem("userId");

      if (!customerId) {
        setOrders([]);
        setLoading(false);
        return;
      }

      let url = `http://localhost:8080/api/donhang/khach/${customerId}`;
      if (filterStatus !== -1 && filterStatus !== "cho-nhan") {
        url = `http://localhost:8080/api/donhang/khach/${customerId}/trangthai/${filterStatus}`;
      }

      const response = await axios.get(url);
      let data = response.data || [];

      if (filterStatus === "cho-nhan") {
        data = data.filter(o => [2, 3].includes(o.trangThai));
      }

      data.sort((a, b) => b.id - a.id);
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối với máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Local, instant filtering to prevent layout flashes when typing
  const filteredOrders = useMemo(() => {
    const s = searchText.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter(o => 
      o.id.toString().includes(s) || 
      (o.tenNguoiNhan && o.tenNguoiNhan.toLowerCase().includes(s))
    );
  }, [orders, searchText]);

  const totalSpent = useMemo(() => orders.reduce((sum, o) => sum + (o.tongTien || 0), 0), [orders]);

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh", pb: 8, pt: 4 }}>
      <Container maxWidth="lg">
        {/* Simple Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
              Lịch sử đơn hàng
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Quản lý danh sách đơn hàng của bạn
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => navigate('/products')}
            sx={{ textTransform: 'none', borderRadius: 2, color: "#111827", borderColor: "#d1d5db" }}
          >
            Mua sắm thêm
          </Button>
        </Box>

        {/* Simplified Stats Row */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#f9fafb", boxShadow: 'none' }}>
              <Typography variant="caption" color="textSecondary">Tổng cộng đơn</Typography>
              <Typography variant="h6" fontWeight={700}>{orders.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#f9fafb", boxShadow: 'none' }}>
              <Typography variant="caption" color="textSecondary">Tổng chi tiêu</Typography>
              <Typography variant="h6" fontWeight={700}>{formatCurrency(totalSpent)}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filter Controls */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={filterStatus} 
            onChange={(e, val) => setFilterStatus(val)} 
            variant="scrollable"
            scrollButtons={false}
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minWidth: 'fit-content', px: 2 },
              '& .Mui-selected': { color: '#111827 !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#111827' }
            }}
          >
            {TRANG_THAI_MAP.map(item => (
              <Tab key={item.value} value={item.value} label={item.label} />
            ))}
          </Tabs>
        </Box>

        {/* Minimal Search bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm theo mã đơn..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
          }}
        />

        {/* Simple Table */}
        {loading ? (
          <Box textAlign="center" py={4}><CircularProgress size={24} sx={{ color: '#111827' }}/></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (!localStorage.getItem("customerId") && !localStorage.getItem("userId")) ? (
          <Box textAlign="center" py={6} sx={{ bgcolor: '#f9fafb', borderRadius: 2, border: '1px dashed #d1d5db' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>Vui lòng đăng nhập</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>Bạn cần đăng nhập để xem lịch sử mua hàng của mình.</Typography>
            <Button variant="contained" onClick={() => navigate('/login')} sx={{ bgcolor: '#111827', textTransform: 'none' }}>Đăng nhập ngay</Button>
          </Box>
        ) : filteredOrders.length === 0 ? (
          <Box textAlign="center" py={6} sx={{ bgcolor: '#f9fafb', borderRadius: 2, border: '1px dashed #d1d5db' }}>
            <Typography variant="body1" color="textSecondary">Không tìm thấy đơn hàng nào.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, boxShadow: 'none !important' }}>
            <Table size="medium" sx={{ borderCollapse: 'collapse !important' }}>
              <TableHead sx={{ 
                backgroundColor: "#f9fafb !important", 
                background: "none !important", // Explicitly wipe out linear-gradient from AdminPanel.css
                backgroundImage: "none !important", 
                '& tr': { backgroundColor: "#f9fafb !important", background: "none !important" }
              }}>
                <TableRow sx={{ background: "none !important" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#374151 !important", backgroundColor: "#f9fafb !important", background: "none !important", borderBottom: "1px solid #e5e7eb !important", boxShadow: "none !important" }}>Mã Đơn</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151 !important", backgroundColor: "#f9fafb !important", background: "none !important", borderBottom: "1px solid #e5e7eb !important", boxShadow: "none !important" }}>Ngày Mua</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151 !important", backgroundColor: "#f9fafb !important", background: "none !important", borderBottom: "1px solid #e5e7eb !important", boxShadow: "none !important" }}>Người Nhận</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151 !important", backgroundColor: "#f9fafb !important", background: "none !important", borderBottom: "1px solid #e5e7eb !important", boxShadow: "none !important" }} align="right">Tổng Tiền</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151 !important", backgroundColor: "#f9fafb !important", background: "none !important", borderBottom: "1px solid #e5e7eb !important", boxShadow: "none !important" }} align="center">Trạng Thái</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151 !important", backgroundColor: "#f9fafb !important", background: "none !important", borderBottom: "1px solid #e5e7eb !important", boxShadow: "none !important" }} align="center">Chi tiết</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => {
                  const statusStyle = GET_STATUS_STYLE(order.trangThai);
                  return (
                    <TableRow 
                      key={order.id} 
                      hover 
                      sx={{ 
                        transition: "none !important", // Disable transition flashes
                        '&:hover': { backgroundColor: '#f9fafb !important' } 
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#111827 !important" }}>#{order.id}</TableCell>
                      <TableCell>
                        {order.ngayTao ? new Date(order.ngayTao).toLocaleDateString('vi-VN') : "N/A"}
                      </TableCell>
                      <TableCell>{order.tenNguoiNhan || "-"}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#111827 !important" }}>{formatCurrency(order.tongTien)}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={statusStyle.label} 
                          size="small" 
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: '0.75rem',
                            bgcolor: alpha(statusStyle.color, 0.1),
                            color: statusStyle.color,
                            border: `1px solid ${alpha(statusStyle.color, 0.2)}`
                          }} 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => navigate(`/orders/${order.id}`)} sx={{ color: '#6b7280' }}>
                          <ArrowForwardIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
};

export default OrderHistory;


