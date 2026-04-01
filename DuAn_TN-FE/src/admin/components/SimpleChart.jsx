import React from 'react';
import { Card, Typography, Row, Col, Progress } from 'antd';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Brush } from 'recharts';

const { Text, Title } = Typography;

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96'];

const SimpleChart = ({ data, title, type = 'bar' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', background: '#fafafa', borderRadius: '8px' }}>
        <Text type="secondary">Chưa có dữ liệu cho biểu đồ này</Text>
      </div>
    );
  }

  const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const maxValue = type === 'bar' ? Math.max(...data.map(item => item.value || 0)) : 0;

  if (type === 'bar') {
    return (
      <div style={{ position: 'relative', padding: '10px' }}>
        <Title level={5} style={{ marginBottom: '24px', textAlign: 'center', color: '#595959' }}>{title}</Title>
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0050b3" stopOpacity={1}/>
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#237804" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="label" 
                axisLine={{ stroke: '#d9d9d9' }}
                tick={{ fontSize: 11, fill: '#8c8c8c' }}
                height={50}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#1890ff' }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Số lượng', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#1890ff' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#52c41a' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                label={{ value: 'Doanh thu (M)', angle: 90, position: 'insideRight', offset: 10, fontSize: 10, fill: '#52c41a' }}
              />
              <Tooltip 
                cursor={{ fill: '#f5f5f5' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    // Extract data from the payload (handles multiple bars)
                    const data = payload[0].payload;
                    return (
                      <div style={{ 
                        backgroundColor: '#fff', 
                        padding: '10px', 
                        border: 'none', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#595959', marginBottom: '8px' }}>{label}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <p style={{ margin: 0, color: '#1890ff', fontSize: '13px' }}>
                            Số lượng: <span style={{ fontWeight: 'bold' }}>{data.value.toLocaleString('vi-VN')}</span> đơn
                          </p>
                          {data.revenue !== undefined && (
                            <p style={{ margin: 0, color: '#52c41a', fontSize: '13px' }}>
                              Số tiền: <span style={{ fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.revenue)}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar 
                yAxisId="left"
                name="Số lượng đơn"
                dataKey="value" 
                fill="url(#colorBar)" 
                radius={[4, 4, 0, 0]}
                barSize={Math.min(25, 400 / data.length)}
              />
              <Bar 
                yAxisId="right"
                name="Doanh thu"
                dataKey="revenue" 
                fill="url(#colorRevenue)" 
                radius={[4, 4, 0, 0]}
                barSize={Math.min(25, 400 / data.length)}
              />
              {data.length > 15 && (
                <Brush 
                  dataKey="label" 
                  height={30} 
                  stroke="#1890ff" 
                  startIndex={data.length - 15}
                  endIndex={data.length - 1}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div style={{ position: 'relative', padding: '10px' }}>
        <Title level={5} style={{ marginBottom: '8px', textAlign: 'center', color: '#595959' }}>{title}</Title>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <Text type="secondary" style={{ fontSize: '12px', fontWeight: 'bold', color: '#8c8c8c' }}>TỔNG CỘNG: </Text>
          <Text style={{ fontSize: '18px', fontWeight: '800', color: '#262626' }}>
            {type === 'currency' || title.toLowerCase().includes('doanh thu') 
              ? `${totalValue.toLocaleString('vi-VN')}₫` 
              : totalValue.toLocaleString('vi-VN')}
          </Text>
        </div>
        <div style={{ height: '320px', width: '100%', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="85%"
                paddingAngle={5}
                dataKey="value"
                nameKey="label"
                animationBegin={0}
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => {
                  const percent = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0;
                  return [`${value.toLocaleString('vi-VN')} (${percent}%)`, `${name}`];
                }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000 }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={(value, entry) => {
                  const { payload } = entry;
                  const val = payload.value;
                  const percent = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : 0;
                  return <span style={{ color: '#595959', fontSize: '12px' }}>{value} ({percent}%)</span>;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Horizontal list of items with progress bars (Legacy fallback)
  return (
    <div style={{ padding: '15px' }}>
      <Title level={5} style={{ marginBottom: '20px', color: '#595959' }}>{title}</Title>
      <div style={{ height: '240px', overflowY: 'auto', paddingRight: '5px' }}>
        {data.map((item, index) => (
          <div key={index} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <Text strong style={{ fontSize: '13px' }}>{item.label}</Text>
              <Text style={{ fontSize: '13px', color: '#1890ff' }}>
                {type === 'currency' ? `${(item.value || 0).toLocaleString('vi-VN')}₫` : (item.value || 0).toLocaleString('vi-VN')}
              </Text>
            </div>
            <Progress
              percent={totalValue > 0 ? Math.round(((item.value || 0) / totalValue) * 100) : 0}
              size="small"
              strokeColor={COLORS[index % COLORS.length]}
              showInfo={false}
              trailColor="#f0f0f0"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleChart; 