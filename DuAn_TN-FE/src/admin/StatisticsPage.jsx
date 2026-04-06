import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { Card, Statistic, Row, Col, Typography, Space, Divider, Select, Table, Spin, Alert, Button, Progress, DatePicker, Segmented } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, UserOutlined, RiseOutlined, FallOutlined, ReloadOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';
import SimpleChart from './components/SimpleChart';

const { Title, Text } = Typography;
const { Option } = Select;


function StatisticsPage() {
  const [dateRange, setDateRange] = useState([null, null]); // [startDate, endDate]
  const [activeFilter, setActiveFilter] = useState('month'); // Default to month

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
    return `http://localhost:8080/images/${encodeURIComponent(img)}`;
  };

  // Cột cho bảng sản phẩm bán chạy
  const bestSellersColumns = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: 'Ảnh Sản Phẩm',
      key: 'image',
      render: (_, record) => (
        <img
          src={getImageUrl(record.images || record.imanges)} // Hỗ trợ cả 2 field
          alt={record.productName || "Không có ảnh"}
          style={{
            width: 60,
            height: 60,
            borderRadius: 6,
            objectFit: "cover",
            display: "block",
            margin: "auto",
            background: "#f6f8fa"
          }}
          onError={(e) => {
            console.error(`Product image failed to load: ${record.images || record.imanges}`);
            e.target.src = "/logo.png";
          }}
        />
      ),
      width: 80,
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text) => <Text strong>{text}</Text>,
      ellipsis: true,
    },
    {
      title: 'Thương Hiệu',
      dataIndex: 'brandName',
      key: 'brandName',
      ellipsis: true,
    },
    {
      title: 'Số Lượng Đã Bán',
      dataIndex: 'totalSold',
      key: 'totalSold',
      render: (value) => (
        <Text type="success" strong>
          {(value || 0).toLocaleString('vi-VN')}
        </Text>
      ),
      sorter: (a, b) => a.totalSold - b.totalSold,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Tỷ Lệ',
      key: 'percentage',
      render: (_, record, index) => {
        const total = statistics.bestSellers.reduce((sum, item) => sum + (item.totalSold || 0), 0);
        const percentage = total > 0 ? (((record.totalSold || 0) / total) * 100).toFixed(1) : 0;
        return (
          <Text type="secondary">
            {percentage}%
          </Text>
        );
      },
    },
  ];


  if (loading) {
    return (
      <div className="admin-content-page" style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px' }}>
          <Text>Đang tải dữ liệu thống kê...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content-page">
      <div className="page-header">
        <Title className="page-title" level={2}>
          <RiseOutlined style={{ marginRight: '8px' }} />
          Thống Kê Tổng Quan
        </Title>
        <Space wrap size="large">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <Text strong style={{ marginRight: 12 }}>LỌC NHANH:</Text>
            <Segmented 
              options={[
                { label: 'Hôm nay', value: 'today' },
                { label: 'Tuần này', value: 'week' },
                { label: 'Tháng này', value: 'month' }
              ]} 
              value={activeFilter}
              onChange={setQuickFilter}
              style={{ padding: '4px', borderRadius: '8px' }}
            />
          </div>
          <Divider type="vertical" style={{ height: '32px' }} />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text strong style={{ marginRight: 12 }}>TUỲ CHỌN:</Text>
            <DatePicker.RangePicker 
              format="DD/MM/YYYY"
              value={dateRange}
              onChange={handleRangeChange}
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ width: 280, borderRadius: '8px' }}
            />
          </div>
        </Space>
      </div>

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
        />
      )}

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable size="small">
            <Statistic
              title="Doanh thu trong kỳ"
              value={statistics.monthlyRevenue}
              precision={0}
              valueStyle={{ color: '#3f8600', fontSize: '24px' }}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable size="small">
            <Statistic
              title="Doanh thu hôm nay"
              value={statistics.todayRevenue}
              precision={0}
              valueStyle={{ color: '#1890ff', fontSize: '24px' }}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable size="small">
            <Statistic
              title="Sản phẩm đã bán"
              value={statistics.totalProductsSold}
              precision={0}
              valueStyle={{ color: '#eb2f96', fontSize: '24px' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable size="small">
            <Statistic
              title="Đơn Hoàn Thành"
              value={statistics.ordersCompleted}
              precision={0}
              valueStyle={{ color: '#722ed1', fontSize: '24px' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">
        <Title level={4}>Thống Kê Chi Tiết</Title>
      </Divider>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card size="small"
            title={
              <Space>
                <RiseOutlined />
                <span>Số Đơn Hàng Theo Ngày {dateRange[0] ? `(${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')})` : `(Tháng này)`}</span>
              </Space>
            }
            hoverable
          >
            <SimpleChart 
              data={revenueChartData} 
              title="Số Đơn Hàng Theo Ngày"
              type="bar"
            />
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">
        <Title level={4}>Sản Phẩm Bán Chạy Nhất</Title>
      </Divider>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card size="small"
            title={
              <Space>
                <ShoppingCartOutlined />
                <span>Top Sản Phẩm Bán Chạy {dateRange[0] ? `(${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')})` : `(Tháng này)`}</span>
              </Space>
            }
            hoverable
          >
            {statistics.bestSellers.length > 0 ? (
              <div>
                <Table
                  dataSource={statistics.bestSellers}
                  columns={bestSellersColumns}
                  pagination={false}
                  size="small"
                  rowKey="id"
                  scroll={{ y: 260 }}
                  style={{ marginBottom: '16px' }}
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">Chưa có dữ liệu sản phẩm bán chạy</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">
        <Title level={4}>Thống Kê Kênh & Phân Bổ</Title>
      </Divider>

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable size="small">
            <Statistic
              title="Doanh Thu ONLINE"
              value={statistics.onlineRevenue}
              precision={0}
              valueStyle={{ color: '#08979c', fontSize: '20px' }}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable size="small">
            <Statistic
              title="Doanh Thu OFFLINE"
              value={statistics.offlineRevenue}
              precision={0}
              valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable size="small">
            <Statistic
              title="SP bán ra ONLINE"
              value={statistics.productsSoldOnline}
              precision={0}
              valueStyle={{ color: '#0958d9', fontSize: '20px' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable size="small">
            <Statistic
              title="SP bán ra OFFLINE"
              value={statistics.productsSoldOffline}
              precision={0}
              valueStyle={{ color: '#d4380d', fontSize: '20px' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={8}>
          <Card hoverable size="small" title="Phân Bổ Theo Thương Hiệu">
            <SimpleChart 
              type="pie"
              title=""
              data={Object.keys(statistics.brandDistribution || {}).map(brand => ({
                label: brand,
                value: statistics.brandDistribution[brand]
              }))}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card hoverable size="small" title="Tỉ Trọng Doanh Thu ONLINE / OFFLINE">
            <SimpleChart 
              type="pie"
              title=""
              data={[
                { label: 'ONLINE', value: statistics.onlineRevenue },
                { label: 'OFFLINE', value: statistics.offlineRevenue }
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card hoverable size="small" title="Trạng Thái Đơn Hàng">
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
          </Card>
        </Col>
      </Row>
      
    </div>
  );
}

export default StatisticsPage; 
