import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { Card, Statistic, Row, Col, Typography, Space, Divider, Select, Table, Spin, Alert, Button, Progress, DatePicker, Segmented, Tooltip as AntTooltip } from 'antd';
import { 
  ShoppingCartOutlined, 
  DollarOutlined, 
  UserOutlined, 
  RiseOutlined, 
  FallOutlined, 
  ReloadOutlined, 
  CalendarOutlined,
  GlobalOutlined,
  ShopOutlined,
  ThunderboltOutlined,
  PieChartOutlined,
  BarChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import axios from 'axios';
import SimpleChart from './components/SimpleChart';
import '../styles/StatisticsPage.css';

const { Title, Text } = Typography;
const { Option } = Select;


function StatisticsPage() {
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]); // Default to current month
  const [activeFilter, setActiveFilter] = useState('month');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  // State cho dữ liệu thống kê
  const [statistics, setStatistics] = useState({
    // A. Tổng quan
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalProductsSold: 0,
    ordersCompleted: 0,
    // B. Theo kênh
    onlineRevenue: 0,
    offlineRevenue: 0,
    productsSoldOnline: 0,
    productsSoldOffline: 0,
    // C. Nâng cao
    revenueShare: { onlineRevenue: 0, offlineRevenue: 0, onlinePercent: 0, offlinePercent: 0 },
    statusDistribution: {},
    brandDistribution: {},
    categoryDistribution: {},
    categoryRevenue: {},
    bestSellers: []
  });


  // State cho dữ liệu biểu đồ doanh thu
  const [revenueChartData, setRevenueChartData] = useState([]);



  // Fetch dữ liệu biểu đồ số đơn hàng theo ngày
  const fetchOrderChartData = async () => {
    try {
      const data = [];
      const formatDateToLocalTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      let startOfPeriod, endOfPeriod;
      
      if (dateRange && dateRange[0] && dateRange[1]) {
        startOfPeriod = dateRange[0].toDate();
        endOfPeriod = dateRange[1].toDate();
      } else {
        const now = new Date();
        startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
        endOfPeriod = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }
      
      const currentDate = new Date(startOfPeriod);
      while (currentDate <= endOfPeriod) {
        const localDate = formatDateToLocalTime(currentDate);
        const response = await axios.get(`http://localhost:8080/api/thong-ke/orders-by-date?date=${localDate}`);
        const { count, revenue } = response.data || { count: 0, revenue: 0 };
        data.push({
          label: currentDate.toLocaleDateString('vi-VN'),
          value: count || 0,
          revenue: revenue || 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setRevenueChartData(data);
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu biểu đồ số đơn hàng:', err);
      setRevenueChartData([]);
    }
  };

  // Fetch dữ liệu thống kê
  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let params = "";
      if (dateRange && dateRange[0] && dateRange[1]) {
        const start = dateRange[0].format('YYYY-MM-DD');
        const end = dateRange[1].format('YYYY-MM-DD');
        params = `startDate=${start}&endDate=${end}`;
      } else {
        // Mặc định tháng hiện tại
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        params = `startDate=${startOfMonth}&endDate=${endOfMonth}`;
      }
      
      const [
        todayRevenueResponse,
        statsResponse,
        bestSellersResponse
      ] = await Promise.all([
        axios.get('http://localhost:8080/api/thong-ke/today-revenue'),
        axios.get(`http://localhost:8080/api/thong-ke/stats-range?${params}`),
        axios.get(`http://localhost:8080/api/thong-ke/best-sellers-range?${params}&limit=10`)
      ]);

      const stats = statsResponse.data || {};
      
      setStatistics({
        todayRevenue: todayRevenueResponse.data || 0,
        monthlyRevenue: stats.totalRevenue || 0,
        totalProductsSold: stats.totalProductsSold || 0,
        ordersCompleted: stats.ordersCompleted || 0,
        onlineRevenue: stats.onlineRevenue || 0,
        offlineRevenue: stats.offlineRevenue || 0,
        productsSoldOnline: stats.onlineProducts || 0,
        productsSoldOffline: stats.offlineProducts || 0,
        revenueShare: { 
          onlineRevenue: stats.onlineRevenue || 0, 
          offlineRevenue: stats.offlineRevenue || 0, 
          onlinePercent: stats.onlinePercent || 0, 
          offlinePercent: stats.offlinePercent || 0 
        },
        statusDistribution: stats.statusDistribution || {},
        brandDistribution: stats.brandDistribution || {},
        categoryDistribution: stats.categoryDistribution || {},
        categoryRevenue: stats.categoryRevenue || {},
        bestSellers: Array.isArray(bestSellersResponse.data) ? bestSellersResponse.data : []
      });

    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu thống kê:', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dữ liệu khi component mount và khi dateRange/selectedPeriod thay đổi
  useEffect(() => {
    fetchStatistics();
    fetchOrderChartData();
  }, [dateRange]);

  const handleRangeChange = (dates) => {
    setDateRange(dates || [null, null]);
    if (dates) setActiveFilter(null); // Reset quick filter when custom range is picked
  };

  const setQuickFilter = (type) => {
    let start, end;
    const now = dayjs();
    
    switch (type) {
      case 'today':
        start = now.startOf('day');
        end = now.endOf('day');
        break;
      case 'week':
        start = now.startOf('week');
        end = now.endOf('week');
        break;
      case 'month':
        start = now.startOf('month');
        end = now.endOf('month');
        break;
      default:
        start = null;
        end = null;
    }
    
    setDateRange([start, end]);
    setActiveFilter(type);
  };




  // Format số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Hàm xử lý đường dẫn ảnh giống như SanPhamPage
  const getImageUrl = (img) => {
    if (!img) return '/logo.png';
    // Nếu là mảng, lấy phần tử đầu
    if (Array.isArray(img)) img = img[0];
    // Nếu là chuỗi nhiều ảnh, lấy ảnh đầu
    if (typeof img === 'string' && img.includes(',')) img = img.split(',')[0];
    img = img.trim();
    if (!img) return '/logo.png';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return 'http://localhost:8080' + img;
    
    // Sử dụng API endpoint thay vì static resource
    return `http://localhost:8080/api/images/${encodeURIComponent(img)}`;
  };

  // Cột cho bảng sản phẩm bán chạy
  const bestSellersColumns = [
    {
      title: 'HẠNG',
      key: 'rank',
      render: (_, __, index) => {
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
        return (
          <div style={{ 
            width: 30, 
            height: 30, 
            borderRadius: '50%', 
            background: index < 3 ? colors[index] : '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: index < 3 ? 'white' : '#64748b',
            fontWeight: 'bold',
            fontSize: '12px'
          }}>
            {index + 1}
          </div>
        );
      },
      width: 70,
    },
    {
      title: 'SẢN PHẨM',
      key: 'product',
      render: (_, record) => (
        <Space size="middle">
          <div className="product-img-wrapper">
            <img
              src={getImageUrl(record.images || record.imanges)}
              alt={record.productName}
              onError={(e) => { e.target.src = "/logo.png"; }}
            />
          </div>
          <div>
            <Text strong block style={{ fontSize: '14px' }}>{record.productName}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.brandName}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'ĐÃ BÁN',
      dataIndex: 'totalSold',
      key: 'totalSold',
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          <Text strong style={{ color: '#0ea5e9' }}>
            {(value || 0).toLocaleString('vi-VN')}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px', marginLeft: '4px' }}>SP</Text>
        </div>
      ),
      sorter: (a, b) => a.totalSold - b.totalSold,
      defaultSortOrder: 'descend',
      width: 120,
    },
    {
      title: 'DOANH THU',
      key: 'revenue',
      render: (_, record) => {
        // Giả sử doanh thu = giá * số lượng nếu API không trả về
        const revenue = record.revenue || (record.totalSold * (record.price || 0));
        return (
          <div style={{ textAlign: 'right' }}>
            <Text strong style={{ color: '#10b981' }}>
              {formatCurrency(revenue || 0)}
            </Text>
          </div>
        );
      },
      width: 150,
    },
    {
      title: 'TỶ LỆ',
      key: 'percentage',
      render: (_, record) => {
        const total = statistics.bestSellers.reduce((sum, item) => sum + (item.totalSold || 0), 0);
        const percentage = total > 0 ? (((record.totalSold || 0) / total) * 100).toFixed(1) : 0;
        return (
          <div style={{ width: 100 }}>
            <Progress 
              percent={percentage} 
              size="small" 
              strokeColor={{
                '0%': '#10b981',
                '100%': '#34d399',
              }}
              showInfo={true}
            />
          </div>
        );
      },
      width: 120,
    },
  ];


  if (loading && !statistics.monthlyRevenue) {
    return (
      <div className="stats-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text strong style={{ color: '#64748b' }}>Đang tổng hợp dữ liệu thống kê...</Text>
        </Space>
      </div>
    );
  }

  const StatCard = ({ title, value, icon, gradientClass, trend, trendValue, prefix = "" }) => (
    <div className={`glass-card stat-card-premium ${gradientClass}`}>
      <div className="stat-card-content">
        <div className="stat-icon-wrapper">
          {icon}
        </div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">
          {prefix}{typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
        </div>
        {trend && (
          <div className="stat-trend">
            {trend === 'up' ? <ArrowUpOutlined className="trend-up" /> : <ArrowDownOutlined className="trend-down" />}
            <span className={trend === 'up' ? 'trend-up' : 'trend-down'}>{trendValue}%</span>
            <span style={{ opacity: 0.8, marginLeft: 4 }}>so với kỳ trước</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="stats-container">
      {/* Header Section */}
      <div className="stats-header">
        <div className="header-title-section">
          <h2>Thống Kê Kinh Doanh</h2>
          <div className="header-subtitle">
            Dữ liệu tổng quan {
              dateRange[0] && dateRange[1] && dateRange[0].isSame(dateRange[1], 'day')
                ? `từ ngày ${dateRange[0].format('DD/MM/YYYY')}`
                : `từ ${dateRange[0]?.format('DD/MM/YYYY')} đến ${dateRange[1]?.format('DD/MM/YYYY')}`
            }
          </div>
        </div>
        
        <div className="filter-section">
          <div className="quick-filters">
            <Segmented 
              options={[
                { label: 'Hôm nay', value: 'today' },
                { label: 'Tuần này', value: 'week' },
                { label: 'Tháng này', value: 'month' }
              ]} 
              value={activeFilter}
              onChange={setQuickFilter}
            />
          </div>
          <Divider type="vertical" style={{ height: 24 }} />
          <DatePicker.RangePicker 
            format="DD/MM/YYYY"
            value={dateRange}
            onChange={handleRangeChange}
            placeholder={['Bắt đầu', 'Kết thúc']}
            style={{ borderRadius: 10, border: 'none', background: '#f1f5f9' }}
          />
          <AntTooltip title="Làm mới dữ liệu">
            <Button 
              type="text" 
              icon={<ReloadOutlined spin={loading} />} 
              onClick={() => { fetchStatistics(); fetchOrderChartData(); }}
              style={{ borderRadius: '50%', background: '#f1f5f9' }}
            />
          </AntTooltip>
        </div>
      </div>

      {error && (
        <Alert
          message="Thông báo hệ thống"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24, borderRadius: 12 }}
        />
      )}

      {/* Main Stats Grid */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Doanh thu trong kỳ"
            value={statistics.monthlyRevenue}
            icon={<DollarOutlined />}
            gradientClass="card-revenue"
            prefix="₫ "
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Doanh thu hôm nay"
            value={statistics.todayRevenue}
            icon={<ThunderboltOutlined />}
            gradientClass="card-today"
            prefix="₫ "
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Sản phẩm đã bán"
            value={statistics.totalProductsSold}
            icon={<ShoppingCartOutlined />}
            gradientClass="card-products"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Đơn Hoàn Thành"
            value={statistics.ordersCompleted}
            icon={<RiseOutlined />}
            gradientClass="card-orders"
          />
        </Col>
      </Row>

      {/* Main Chart Section */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <div className="glass-card chart-card">
            <div className="section-title">
              <BarChartOutlined />
              <span>Phân Tích Đơn Hàng & Doanh Thu Theo Thời Gian</span>
            </div>
            <SimpleChart 
              data={revenueChartData} 
              title="" 
              type="area" // Changed to area for smoother look
            />
          </div>
        </Col>
      </Row>

      {/* Best Sellers & Channels */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <div className="glass-card chart-card">
            <div className="section-title">
              <ThunderboltOutlined style={{ color: '#f59e0b' }} />
              <span>Top 10 Sản Phẩm Bán Chạy Nhất</span>
            </div>
            {statistics.bestSellers.length > 0 ? (
              <Table
                dataSource={statistics.bestSellers}
                columns={bestSellersColumns}
                pagination={false}
                size="middle"
                rowKey="id"
                className="best-seller-table"
                scroll={{ x: 'max-content' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin spinning={loading} />
                {!loading && <Text type="secondary">Chưa có dữ liệu sản phẩm trong khoảng thời gian này</Text>}
              </div>
            )}
          </div>
        </Col>
        
        <Col xs={24} lg={8}>
          <Row gutter={[0, 24]}>
            <Col span={24}>
              <div className="glass-card chart-card" style={{ padding: '20px' }}>
                <div className="section-title" style={{ fontSize: '16px' }}>
                  <PieChartOutlined style={{ color: '#8b5cf6' }} />
                  <span>Trạng Thái Đơn Hàng</span>
                </div>
                <SimpleChart 
                  type="pie"
                  title=""
                  data={Object.keys(statistics.statusDistribution || {}).map(status => {
                    const statusLabels = {
                      '0': 'Chờ xác nhận',
                      '1': 'Đã xác nhận',
                      '2': 'Đang chuẩn bị',
                      '3': 'Đang giao',
                      '4': 'Đã giao',
                      '5': 'Hoàn thành',
                      '6': 'Đã hủy'
                    };
                    return {
                      label: statusLabels[status] || `Trạng thái ${status}`,
                      value: statistics.statusDistribution[status]
                    };
                  })}
                />
              </div>
            </Col>
            
            <Col span={24}>
              <div className="glass-card chart-card" style={{ padding: '20px' }}>
                <div className="section-title" style={{ fontSize: '16px' }}>
                  <GlobalOutlined style={{ color: '#0ea5e9' }} />
                  <span>Phân Bổ Kênh Bán Hàng</span>
                </div>
                <SimpleChart 
                  type="pie"
                  title=""
                  data={[
                    { label: 'ONLINE', value: statistics.onlineRevenue },
                    { label: 'OFFLINE', value: statistics.offlineRevenue }
                  ]}
                />
              </div>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Additional Analytics Section */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <div className="glass-card chart-card">
            <div className="section-title">
              <PieChartOutlined style={{ color: '#8b5cf6' }} />
              <span>Phân Bổ Doanh Thu Theo Danh Mục</span>
            </div>
            <SimpleChart 
              type="horizontalBar"
              data={Object.keys(statistics.categoryRevenue || {}).map(cat => ({
                label: cat,
                value: statistics.categoryRevenue[cat]
              })).sort((a, b) => b.value - a.value)}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="glass-card chart-card">
             <div className="section-title">
                <PieChartOutlined style={{ color: '#0ea5e9' }} />
                <span>Phân Bổ Sản Phẩm Theo Thương Hiệu</span>
             </div>
             <SimpleChart 
                type="pie"
                title=""
                data={Object.keys(statistics.brandDistribution || {}).map(brand => ({
                  label: brand,
                  value: statistics.brandDistribution[brand]
                }))}
              />
          </div>
        </Col>
      </Row>

      {/* Footer Stats */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Doanh Thu ONLINE"
            value={statistics.onlineRevenue}
            icon={<GlobalOutlined />}
            gradientClass="card-online"
            prefix="₫ "
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Doanh Thu OFFLINE"
            value={statistics.offlineRevenue}
            icon={<ShopOutlined />}
            gradientClass="card-offline"
            prefix="₫ "
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="glass-card chart-card" style={{ padding: '24px' }}>
             <div className="section-title" style={{ fontSize: '15px' }}>
                <ThunderboltOutlined />
                <span>Số Lượng Theo Kênh</span>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <Text type="secondary">Online</Text>
                    <Text strong>{statistics.productsSoldOnline} SP</Text>
                  </div>
                  <Progress percent={Math.round((statistics.productsSoldOnline / (statistics.totalProductsSold || 1)) * 100)} status="active" strokeColor="#0ea5e9" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <Text type="secondary">Offline</Text>
                    <Text strong>{statistics.productsSoldOffline} SP</Text>
                  </div>
                  <Progress percent={Math.round((statistics.productsSoldOffline / (statistics.totalProductsSold || 1)) * 100)} status="active" strokeColor="#f43f5e" />
                </div>
             </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="glass-card chart-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ textAlign: 'center' }}>
                <RiseOutlined style={{ fontSize: '40px', color: '#10b981', marginBottom: '10px' }} />
                <Title level={4} style={{ margin: 0 }}>Tăng Trưởng Ổn Định</Title>
                <Text type="secondary">Hệ thống đang hoạt động tốt</Text>
             </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default StatisticsPage; 
