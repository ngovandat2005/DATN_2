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
  InputAdornment,
  Divider,
  Chip,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  AccessTimeFilled as AccessTimeIcon,
  ErrorOutline as ErrorOutlineIcon,
  ArrowForwardIos as ArrowForwardIcon,
  Payments as PaymentsIcon,
} from "@mui/icons-material";

const TRANG_THAI = [
  { value: -1, label: "Tất cả", color: "#6366f1", bg: "#eef2ff", icon: <ReceiptIcon fontSize="small" /> },
  { value: 0, label: "Chờ xác nhận", color: "#f59e0b", bg: "#fffbeb", icon: <AccessTimeIcon fontSize="small" /> },
  { value: 1, label: "Chờ vận chuyển", color: "#10b981", bg: "#ecfdf5", icon: <CheckCircleIcon fontSize="small" /> },
  { value: "cho-nhan", label: "Chờ nhận", color: "#3b82f6", bg: "#eff6ff", icon: <LocalShippingIcon fontSize="small" /> },
  { value: 4, label: "Đã giao", color: "#0ea5e9", bg: "#f0f9ff", icon: <CheckCircleIcon fontSize="small" /> },
  { value: 5, label: "Đã hủy", color: "#ef4444", bg: "#fef2f2", icon: <CancelIcon fontSize="small" /> },
];

const GET_STATUS_INFO = (value) => {
  switch (value) {
    case 0: return { label: "Chờ xác nhận", color: "#f59e0b", icon: <AccessTimeIcon fontSize="small" />, shadow: "0 4px 14px 0 rgba(245, 158, 11, 0.3)" };
    case 1: return { label: "Chờ vận chuyển", color: "#10b981", icon: <CheckCircleIcon fontSize="small" />, shadow: "0 4px 14px 0 rgba(16, 185, 129, 0.3)" };
    case 2:
    case 3: return { label: "Chờ nhận", color: "#3b82f6", icon: <LocalShippingIcon fontSize="small" />, shadow: "0 4px 14px 0 rgba(59, 130, 246, 0.3)" };
    case 4: return { label: "Đã giao", color: "#0ea5e9", icon: <CheckCircleIcon fontSize="small" />, shadow: "0 4px 14px 0 rgba(14, 165, 233, 0.3)" };
    case 5: return { label: "Đã hủy", color: "#ef4444", icon: <CancelIcon fontSize="small" />, shadow: "0 4px 14px 0 rgba(239, 68, 68, 0.3)" };
    default: return { label: "Không xác định", color: "#94a3b8", icon: <ErrorOutlineIcon fontSize="small" />, shadow: "none" };
  }
};

const OrderHistory = () => {
  const navigate = useNavigate();
  const theme = useTheme();

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
        data = data.filter(o => [2, 3].includes(o.trangThai));
      }

      data.sort((a, b) => b.id - a.id);

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
      setError("Không thể kết nối với máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + (o.tongTien || 0), 0);
  const activeOrders = orders.filter(o => [0, 1, 2, 3].includes(o.trangThai)).length;

  return (
    <Box sx={{ 
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", 
      minHeight: "100vh", 
      pb: 10,
      pt: 4 
    }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                    <Avatar sx={{ 
                        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", 
                        width: 56, 
                        height: 56, 
                        mr: 3, 
                        boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.4)" 
                    }}>
                        <ReceiptIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: "-1px", color: "#1e293b" }}>
                            Lịch Sử <span style={{ color: "#6366f1" }}>Đơn Hàng</span>
                        </Typography>
                        <Typography variant="body1" color="textSecondary" sx={{ mt: -0.5 }}>
                            Quản lý tất cả giao dịch và theo dõi đơn hàng của bạn
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                     <Button 
                        variant="outlined" 
                        startIcon={<PaymentsIcon />}
                        onClick={() => navigate('/products')}
                        sx={{ 
                            borderRadius: '12px', 
                            textTransform: 'none', 
                            height: 48,
                            px: 3,
                            borderColor: alpha('#6366f1', 0.2),
                            color: '#6366f1',
                            '&:hover': { borderColor: '#6366f1', bgcolor: alpha('#6366f1', 0.04) }
                        }}
                    >
                        Tiếp tục mua sắm
                    </Button>
                </Box>
            </Box>
        </Box>

        <Grid container spacing={4} mb={6}>
            <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                    p: 3, 
                    borderRadius: 5, 
                    bgcolor: "#fff", 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    border: "1px solid #f1f5f9",
                    position: "relative",
                    overflow: "hidden",
                    height: "100%"
                }}>
                    <Box sx={{ position: "absolute", top: -10, right: -10, opacity: 0.05 }}>
                        <ReceiptIcon sx={{ fontSize: 100 }} />
                    </Box>
                    <Typography variant="overline" sx={{ fontWeight: 700, color: "#94a3b8" }}>Tổng Số Đơn</Typography>
                    <Typography variant="h4" fontWeight="800" color="#1e293b">{orders.length}</Typography>
                    <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 600 }}>Cập nhật ngay bây giờ</Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                    p: 3, 
                    borderRadius: 5, 
                    bgcolor: "#fff", 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    border: "1px solid #f1f5f9",
                    position: "relative",
                    overflow: "hidden",
                    height: "100%"
                }}>
                    <Box sx={{ position: "absolute", top: -10, right: -10, opacity: 0.05 }}>
                        <AccessTimeIcon sx={{ fontSize: 100 }} />
                    </Box>
                    <Typography variant="overline" sx={{ fontWeight: 700, color: "#94a3b8" }}>Đang Xử Lý</Typography>
                    <Typography variant="h4" fontWeight="800" color="#f59e0b">{activeOrders}</Typography>
                    <Typography variant="caption" sx={{ color: "#f59e0b", fontWeight: 600 }}>Chờ xác nhận & giao</Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                    p: 3, 
                    borderRadius: 5, 
                    bgcolor: "#fff", 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    border: "1px solid #f1f5f9",
                    position: "relative",
                    overflow: "hidden",
                    height: "100%"
                }}>
                    <Box sx={{ position: "absolute", top: -10, right: -10, opacity: 0.05 }}>
                        <CheckCircleIcon sx={{ fontSize: 100, color: "#10b981" }} />
                    </Box>
                    <Typography variant="overline" sx={{ fontWeight: 700, color: "#94a3b8" }}>Đã Giao</Typography>
                    <Typography variant="h4" fontWeight="800" color="#10b981">
                        {orders.filter(o => o.trangThai === 4).length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 600 }}>Giao hàng thành công</Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                    p: 3, 
                    borderRadius: 5, 
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", 
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    color: "#fff",
                    position: "relative",
                    overflow: "hidden",
                    height: "100%"
                }}>
                    <Box sx={{ position: "absolute", top: -10, right: -10, opacity: 0.1 }}>
                        <PaymentsIcon sx={{ fontSize: 100 }} />
                    </Box>
                    <Typography variant="overline" sx={{ fontWeight: 700, opacity: 0.7 }}>Tổng Chi Tiêu</Typography>
                    <Typography variant="h4" fontWeight="800">
                        {totalSpent.toLocaleString()} ₫
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Khách hàng thân thiết</Typography>
                </Paper>
            </Grid>
        </Grid>

        <Paper sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 5, 
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            border: "1px solid #f1f5f9"
        }}>
            <Box display="flex" gap={2} mb={3} sx={{ overflowX: "auto", pb: 1, '&::-webkit-scrollbar': { height: 4 } }}>
                {TRANG_THAI.map(tt => (
                    <Button
                        key={tt.value}
                        variant="text"
                        onClick={() => setFilterStatus(tt.value)}
                        startIcon={tt.icon}
                        sx={{
                            borderRadius: 3,
                            px: 3,
                            py: 1,
                            minWidth: "fit-content",
                            textTransform: "none",
                            fontWeight: 700,
                            bgcolor: filterStatus === tt.value ? alpha(tt.color, 0.1) : "transparent",
                            color: filterStatus === tt.value ? tt.color : "#64748b",
                            border: "1px solid",
                            borderColor: filterStatus === tt.value ? tt.color : "transparent",
                            '&:hover': { bgcolor: alpha(tt.color, 0.08) }
                        }}
                    >
                        {tt.label}
                    </Button>
                ))}
            </Box>
            <TextField
                fullWidth
                placeholder="Tìm theo mã đơn hàng hoặc tên người nhận..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ 
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 4,
                        bgcolor: "#f8fafc",
                        '& fieldset': { borderColor: '#e2e8f0' }
                    }
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: "#94a3b8" }} />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <Button 
                                variant="contained" 
                                onClick={fetchOrders}
                                sx={{ borderRadius: 3, boxShadow: "none", bgcolor: "#6366f1" }}
                            >
                                Tìm kiếm
                            </Button>
                        </InputAdornment>
                    )
                }}
            />
        </Paper>

        {loading ? (
            <Box textAlign="center" py={12}>
                <CircularProgress sx={{ color: "#6366f1" }} />
                <Typography color="textSecondary" sx={{ mt: 2, fontWeight: 600 }}>Đang cập nhật dữ liệu...</Typography>
            </Box>
        ) : error ? (
            <Alert sx={{ borderRadius: 4 }} severity="error" icon={<ErrorOutlineIcon />}>{error}</Alert>
        ) : orders.length === 0 ? (
            <Box textAlign="center" py={15} bgcolor="#fff" borderRadius={5} border="1px dashed #cbd5e1">
                <ReceiptIcon sx={{ fontSize: 80, color: "#e2e8f0", mb: 2 }} />
                <Typography variant="h5" color="#64748b" fontWeight="700">Chưa có đơn hàng nào</Typography>
                <Typography variant="body1" color="#94a3b8">Bắt đầu mua sắm để lấp đầy lịch sử của bạn</Typography>
                <Button 
                    variant="contained" 
                    sx={{ mt: 3, borderRadius: 3, bgcolor: "#6366f1" }}
                    onClick={() => navigate('/products')}
                >
                    Khám phá ngay
                </Button>
            </Box>
        ) : (
            <Grid container spacing={3}>
                {orders.map(order => {
                    const status = GET_STATUS_INFO(order.trangThai);
                    return (
                        <Grid item xs={12} md={6} key={order.id}>
                            <Card
                                sx={{
                                    borderRadius: 6,
                                    height: '100%',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '1px solid #f1f5f9',
                                    boxShadow: "0 10px 25px -15px rgba(0,0,0,0.05)",
                                    '&:hover': { 
                                        boxShadow: "0 20px 40px -20px rgba(0,0,0,0.12)", 
                                        borderColor: alpha(status.color, 0.2),
                                        bgcolor: '#fff',
                                        transform: 'translateY(-2px)'
                                    },
                                    overflow: 'hidden'
                                }}
                            >
                                <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    {/* Card Header: ID & Status */}
                                    <Box sx={{ 
                                        p: 2.5, 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        bgcolor: alpha(status.color, 0.03),
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 800, display: "block", mb: 0.5, letterSpacing: '1px' }}>
                                                MÃ ĐƠN HÀNG
                                            </Typography>
                                            <Typography variant="h6" fontWeight="900" sx={{ color: "#1e293b", fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                #{order.id}
                                                <Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                                                <Typography component="span" sx={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                                                    {order.ngayTao || "2026-04-08"}
                                                </Typography>
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            label={status.label} 
                                            size="small"
                                            sx={{ 
                                                bgcolor: status.color, 
                                                color: '#fff', 
                                                fontWeight: 800,
                                                fontSize: '0.65rem',
                                                height: 26,
                                                borderRadius: 2,
                                                boxShadow: status.shadow,
                                                px: 1
                                            }} 
                                        />
                                    </Box>
                                    
                                    {/* Card Body: Info Segments */}
                                    <Box sx={{ p: 3, flexGrow: 1 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                    <Avatar sx={{ bgcolor: alpha("#6366f1", 0.08), color: "#6366f1", width: 36, height: 36 }}>
                                                        <LocalShippingIcon sx={{ fontSize: 18 }} />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 800, fontSize: '0.6rem' }}>NGƯỜI NHẬN</Typography>
                                                        <Typography variant="body2" fontWeight="700" color="#475569" noWrap>
                                                            {order.tenNguoiNhan || "Khách hàng"}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                    <Avatar sx={{ bgcolor: alpha("#10b981", 0.08), color: "#10b981", width: 36, height: 36 }}>
                                                        <PaymentsIcon sx={{ fontSize: 18 }} />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 800, fontSize: '0.6rem' }}>THANH TOÁN</Typography>
                                                        <Typography variant="body2" fontWeight="700" color="#475569">
                                                            {order.hinhThucThanhToan || "COD"}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                        
                                        <Box sx={{ 
                                            mt: 3, 
                                            p: 2, 
                                            borderRadius: 4, 
                                            bgcolor: '#f8fafc',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2
                                        }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, fontSize: '0.7rem' }}>TỔNG THANH TOÁN</Typography>
                                                <Typography variant="h5" fontWeight="900" sx={{ color: "#1e293b", letterSpacing: '-0.5px' }}>
                                                    {(order.tongTien || 0).toLocaleString()} ₫
                                                </Typography>
                                            </Box>
                                            
                                            <Button 
                                                variant="contained" 
                                                fullWidth
                                                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                                                onClick={() => navigate(`/orders/${order.id}`)}
                                                sx={{ 
                                                    borderRadius: 3, 
                                                    bgcolor: "#1e293b", 
                                                    textTransform: "none",
                                                    fontWeight: 800,
                                                    py: 1.5,
                                                    fontSize: '0.9rem',
                                                    boxShadow: "0 8px 20px -6px rgba(30, 41, 59, 0.4)",
                                                    '&:hover': { bgcolor: "#000", transform: 'translateY(-2px)' }
                                                }}
                                            >
                                                Xem chi tiết đơn hàng
                                            </Button>
                                        </Box>
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
