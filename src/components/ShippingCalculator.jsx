import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  InputNumber, 
  Typography, 
  Space, 
  Divider, 
  Alert, 
  Spin,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  message
} from 'antd';
import { 
  TruckOutlined, 
  CalculatorOutlined, 
  DollarOutlined, 
  GlobalOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import AddressSelector from './AddressSelector';
import MapSelector from './MapSelector';
import config from '../config/config';

const { Title, Text, Paragraph } = Typography;

const ShippingCalculator = ({ 
  onShippingFeeCalculated,
  defaultWeight = 500,
  showDetails = true,
  compact = false 
}) => {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  
  // New state for names (for Map Search)
  const [provinceName, setProvinceName] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [wardName, setWardName] = useState('');

  const [weight, setWeight] = useState(defaultWeight);
  const [shippingFee, setShippingFee] = useState(null);
  const [actualDistance, setActualDistance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastCalculation, setLastCalculation] = useState(null);

  // Reset shipping fee when address changes
  useEffect(() => {
    setShippingFee(null);
    setError(null);
  }, [selectedProvince, selectedDistrict, selectedWard, weight]);

  const calculateShippingFee = async () => {
    if (!selectedDistrict || !selectedWard || !weight) {
      message.error('Vui lòng chọn đầy đủ địa chỉ giao hàng và cân nặng!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(config.getApiUrl('api/ghn/calculate-fee'), {
        toDistrict: selectedDistrict,
        toProvinceId: selectedProvince,
        toWardCode: selectedWard,
        weight: weight,
        actualDistance: actualDistance > 0 ? actualDistance : null
      });

      if (response.status === 200) {
        setShippingFee(response.data);
        setLastCalculation({
          timestamp: new Date(),
          address: `${wardName}, ${districtName}, ${provinceName}`,
          weight: weight,
          distance: response.data.distance_km
        });

        if (onShippingFeeCalculated) {
          onShippingFeeCalculated(response.data);
        }

        message.success('Tính phí vận chuyển thành công!');
      }
    } catch (error) {
      console.error('❌ Lỗi tính phí vận chuyển:', error);
      setError(error.response?.data?.message || error.message);
      message.error(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getFullAddress = () => {
    const parts = [];
    if (wardName) parts.push(wardName);
    if (districtName) parts.push(districtName);
    if (provinceName) parts.push(provinceName);
    return parts.join(', ');
  };

  const getAddressDisplay = () => {
    if (!selectedProvince && !selectedDistrict && !selectedWard) {
      return 'Chưa chọn địa chỉ';
    }
    
    const parts = [];
    if (selectedProvince) parts.push(selectedProvince);
    if (selectedDistrict) parts.push(selectedDistrict);
    if (selectedWard) parts.push(selectedWard);
    
    return parts.join(', ');
  };

  const renderShippingFeeDetails = () => {
    if (!shippingFee) return null;

    return (
      <Card 
        title={
          <Space>
            <DollarOutlined style={{ color: '#52c41a' }} />
            <span>Kết quả tính phí vận chuyển</span>
          </Space>
        }
        style={{ marginTop: 16 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Tổng phí vận chuyển"
              value={shippingFee.total_fee}
              precision={0}
              valueStyle={{ color: '#3f8600', fontSize: '24px' }}
              suffix="VNĐ"
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Khoảng cách tính phí"
              value={shippingFee.distance_km}
              precision={1}
              valueStyle={{ color: '#1890ff' }}
              suffix="km"
            />
          </Col>
        </Row>

        {showDetails && (
          <>
            <Divider />
            <div style={{ fontSize: '14px', color: '#666' }}>
              <Text strong>Thông tin chi tiết:</Text>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>Địa chỉ: {getAddressDisplay()}</li>
                <li>Phân loại: {shippingFee.status === 'calculated_by_distance' ? 'Tính theo KM thực tế' : 'Ước tính theo vùng'}</li>
                <li>Cân nặng: {weight}g</li>
                <li>Công thức: Phí phân tầng (Tiered Pricing)</li>
              </ul>
            </div>
          </>
        )}
      </Card>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <Alert
        message="Lỗi tính phí"
        description={error}
        type="error"
        showIcon
        style={{ marginTop: 16 }}
      />
    );
  };

  return (
    <Card
      title={
        <Space>
          <GlobalOutlined style={{ color: '#1890ff' }} />
          <span>Vận chuyển KingStep - Tính phí theo bản đồ</span>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Address Selection */}
        <div>
          <Title level={5}>📍 Địa chỉ giao hàng</Title>
          <AddressSelector
            selectedProvince={selectedProvince}
            selectedDistrict={selectedDistrict}
            selectedWard={selectedWard}
            onProvinceChange={(id, name) => { setSelectedProvince(id); setProvinceName(name); }}
            onDistrictChange={(id, name) => { setSelectedDistrict(id); setDistrictName(name); }}
            onWardChange={(id, name) => { setSelectedWard(id); setWardName(name); }}
            showWard={true}
          />
        </div>

        {/* Map Display and Distance Calculation */}
        {(provinceName || districtName) && (
          <MapSelector 
            address={getFullAddress()} 
            onDistanceCalculated={(km) => setActualDistance(km)} 
          />
        )}

        {/* Weight Input */}
        <div>
          <Title level={5}>📦 Thông tin hàng hóa</Title>
          <Space>
            <Text>Cân nặng:</Text>
            <InputNumber
              value={weight}
              onChange={setWeight}
              min={1}
              max={30000}
              addonAfter="gram"
              style={{ width: 150 }}
            />
          </Space>
        </div>

        {/* Action Buttons */}
        <div>
          <Space>
            <Button
              type="primary"
              size="large"
              icon={<CalculatorOutlined />}
              onClick={calculateShippingFee}
              loading={loading}
              disabled={!selectedDistrict || !selectedWard || !actualDistance}
              style={{ paddingLeft: 40, paddingRight: 40 }}
            >
              Xác nhận và tính phí ship
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setShippingFee(null);
                setActualDistance(0);
                setError(null);
              }}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Results */}
        {renderShippingFeeDetails()}
        {renderError()}

        <Alert
          message="Chính sách phí vận chuyển KingStep (Shopee-style)"
          description={
            <div style={{ fontSize: '13px' }}>
              • <b>Miễn phí vận chuyển</b> cho đơn hàng trên <b>2.000.000đ</b>.<br/>
              • <b>Nội thành Hà Nội</b>: 15.000đ — 22.000đ.<br/>
              • <b>Các tỉnh Miền Bắc</b>: Đồng giá <b>35.000đ</b>.<br/>
              • <b>Miền Trung & Miền Nam</b>: Tối đa <b>55.000đ</b> (Áp dụng toàn quốc).
            </div>
          }
          type="info"
          showIcon
        />
      </Space>
    </Card>
  );
};

export default ShippingCalculator; 