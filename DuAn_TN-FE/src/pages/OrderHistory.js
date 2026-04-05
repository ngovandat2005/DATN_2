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
  const [error, setError] = useState("");

  const [filterStatus, setFilterStatus] = useState(-1);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
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

  const handleTabChange = (event, newValue) => {
    setFilterStatus(newValue);
  };

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

export default OrderHistory;
