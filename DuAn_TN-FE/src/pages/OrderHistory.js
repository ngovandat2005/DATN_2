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
  Button,
  Avatar,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  TextField,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Inventory as InventoryIcon,
  AccessTime as AccessTimeIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";

const TRANG_THAI = [
  { value: -1, label: "Tất cả", color: "#1976d2", bg: "#e3f2fd", icon: <ReceiptIcon fontSize="small" /> },
  { value: 0, label: "Chờ thanh toán", color: "#ff9800", bg: "#fff3e0", icon: <AccessTimeIcon fontSize="small" /> },
  { value: 1, label: "Chờ vận chuyển", color: "#43b244", bg: "#e8f5e9", icon: <CheckCircleIcon fontSize="small" /> },
  { value: "cho-nhan", label: "Chờ nhận", color: "#1976d2", bg: "#e3f2fd", icon: <LocalShippingIcon fontSize="small" /> },
  { value: 5, label: "Đã hủy", color: "#e53935", bg: "#ffebee", icon: <CancelIcon fontSize="small" /> },
];

const GET_STATUS_INFO = (value) => {
  switch (value) {
    case 0: return { label: "Chờ thanh toán", color: "#ff9800", icon: <AccessTimeIcon fontSize="small" /> };
    case 1: return { label: "Chờ vận chuyển", color: "#43b244", icon: <CheckCircleIcon fontSize="small" /> };
    case 2:
    case 3:
    case 4: return { label: "Chờ nhận", color: "#1976d2", icon: <LocalShippingIcon fontSize="small" /> };
    case 5: return { label: "Đã hủy", color: "#e53935", icon: <CancelIcon fontSize="small" /> };
    default: return { label: "Không xác định", color: "#757575", icon: <ErrorOutlineIcon fontSize="small" /> };
  }
};

const OrderHistory = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState(-1);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const customerId = localStorage.getItem("customerId") || localStorage.getItem("userId") || 1;

      let url = `http://localhost:8080/api/donhang/khach/${customerId}`;
      if (filterStatus !== -1 && filterStatus !== "cho-nhan") {
        url = `http://localhost:8080/api/donhang/khach/${customerId}/trangthai/${filterStatus}`;
      }

      const response = await axios.get(url);
      let data = response.data || [];

      if (filterStatus === "cho-nhan") {
        data = data.filter(o => [2, 3, 4].includes(o.trangThai));
      }

      // Sắp xếp ID giảm dần
      data.sort((a, b) => b.id - a.id);

      // Filter theo search
      if (searchText.trim()) {
        const s = searchText.toLowerCase();
        data = data.filter(o =>
          o.id.toString().includes(s) ||
          (o.tenNguoiNhan && o.tenNguoiNhan.toLowerCase().includes(s))
        );
      }

      setOrders(data);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = orders.reduce((sum, o) => sum + (o.tongTien || 0), 0);
  const pendingCount = orders.filter(o => [0, 1, 2, 3].includes(o.trangThai)).length;

  return (
    <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        <Box display="flex" alignItems="center" mb={4}>
          <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}><ReceiptIcon /></Avatar>
          <Typography variant="h4" fontWeight="bold">Lịch sử đơn hàng</Typography>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>TỔNG ĐƠN HÀNG</Typography>
                <Typography variant="h4" fontWeight="bold">{orders.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>ĐANG XỬ LÝ</Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">{pendingCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>TỔNG CHI TIÊU</Typography>
                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                  {totalAmount.toLocaleString()} ₫
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
            {TRANG_THAI.map(tt => (
              <Button
                key={tt.value}
                variant={filterStatus === tt.value ? "contained" : "text"}
                onClick={() => setFilterStatus(tt.value)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  bgcolor: filterStatus === tt.value ? tt.color : "transparent",
                  color: filterStatus === tt.value ? "#fff" : tt.color,
                  '&:hover': { bgcolor: filterStatus === tt.value ? tt.color : alpha(tt.color, 0.1) }
                }}
              >
                {tt.label}
              </Button>
            ))}
          </Box>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm mã đơn hàng..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button variant="contained" onClick={fetchOrders}>Tìm</Button>
          </Box>
        </Paper>

        {/* List */}
        {loading ? (
          <Box textAlign="center" py={5}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : orders.length === 0 ? (
          <Box textAlign="center" py={10} bgcolor="#fff" borderRadius={2}>
            <Typography variant="h6" color="textSecondary">Không tìm thấy đơn hàng nào</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {orders.map(order => {
              const status = GET_STATUS_INFO(order.trangThai);
              return (
                <Grid item xs={12} key={order.id}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: '0.3s',
                      '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
                    }}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">Đơn hàng #{order.id}</Typography>
                        <Typography variant="body2" color="textSecondary">{order.ngayTao || "Ngày không xác định"}</Typography>
                        <Box display="flex" alignItems="center" mt={1} gap={1}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: status.color, fontSize: 10 }}>{status.icon}</Avatar>
                          <Typography variant="body2" fontWeight="600" sx={{ color: status.color }}>{status.label}</Typography>
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {(order.tongTien || 0).toLocaleString()} ₫
                        </Typography>
                        <Button size="small" variant="outlined" sx={{ mt: 1, borderRadius: 2 }}>Chi tiết</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default OrderHistory;
