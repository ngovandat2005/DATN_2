import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Spin, Alert, Statistic, Row, Col, Card } from 'antd';
import { EnvironmentOutlined, GlobalOutlined } from '@ant-design/icons';

// Fix Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Shop Location (Ba Đình, Hà Nội)
const SHOP_COORDS = [21.033, 105.815];

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MapSelector = ({ address, onDistanceCalculated }) => {
  const [userCoords, setUserCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address || address.length < 5) return;

    const geocodeAndRoute = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Geocoding (Address -> Cords) using Nominatim
        const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Việt Nam')}&limit=1`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (geoData && geoData.length > 0) {
          const lat = parseFloat(geoData[0].lat);
          const lon = parseFloat(geoData[0].lon);
          const coords = [lat, lon];
          setUserCoords(coords);

          // 2. Routing (Distance calculation) using OSRM
          const routeUrl = `https://router.project-osrm.org/route/v1/driving/${SHOP_COORDS[1]},${SHOP_COORDS[0]};${lon},${lat}?overview=false`;
          const routeRes = await fetch(routeUrl);
          const routeData = await routeRes.json();

          if (routeData.code === 'Ok' && routeData.routes.length > 0) {
            const distKm = routeData.routes[0].distance / 1000;
            setDistance(distKm);
            if (onDistanceCalculated) {
              onDistanceCalculated(distKm);
            }
          } else {
            // Fallback to straight line distance if OSRM fails
            const straightDist = L.latLng(SHOP_COORDS).distanceTo(L.latLng(coords)) / 1000;
            setDistance(straightDist);
            if (onDistanceCalculated) onDistanceCalculated(straightDist);
          }
        } else {
          setError("Không tìm thấy tọa độ cho địa chỉ này.");
        }
      } catch (err) {
        console.error("Geocoding/Routing error:", err);
        setError("Lỗi kết nối dịch vụ bản đồ.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(geocodeAndRoute, 800); // Debounce to avoid hitting API limit
    return () => clearTimeout(timer);
  }, [address]);

  return (
    <Card style={{ marginTop: 16, overflow: 'hidden' }} bodyStyle={{ padding: 0 }}>
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin tip="Đang định vị địa chỉ..." />
        </div>
      )}
      
      <div style={{ height: '300px', width: '100%' }}>
        <MapContainer center={SHOP_COORDS} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Shop Marker */}
          <Marker position={SHOP_COORDS}>
            <Popup>Cửa hàng KingStep (Điểm gửi hàng)</Popup>
          </Marker>

          {/* User Marker */}
          {userCoords && (
            <>
              <Marker position={userCoords}>
                <Popup>Địa chỉ của bạn (Điểm nhận hàng)</Popup>
              </Marker>
              <ChangeView center={userCoords} zoom={14} />
              <Polyline positions={[SHOP_COORDS, userCoords]} color="red" dashArray="5, 10" />
            </>
          )}
        </MapContainer>
      </div>

      <div style={{ padding: '12px', background: '#f5f5f5' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic 
              title="Khoảng cách" 
              value={distance ? distance.toFixed(1) : '---'} 
              suffix="km" 
              prefix={<EnvironmentOutlined />}
              valueStyle={{ fontSize: '18px' }}
            />
          </Col>
          <Col span={12}>
            <Statistic 
              title="Điểm đến" 
              value={address || 'Chưa xác định'} 
              prefix={<GlobalOutlined />}
              valueStyle={{ fontSize: '12px', color: '#666' }}
            />
          </Col>
        </Row>
      </div>
      
      {error && <Alert message={error} type="warning" showIcon style={{ border: 'none', borderRadius: 0 }} />}
    </Card>
  );
};

export default MapSelector;
