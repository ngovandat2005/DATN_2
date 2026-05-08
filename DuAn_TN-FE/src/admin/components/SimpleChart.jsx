import React from 'react';
import { Typography, Progress } from 'antd';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  Brush,
  AreaChart,
  Area
} from 'recharts';

const { Text, Title } = Typography;

// Premium Color Palette
const COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#3b82f6', // Blue
];

const SimpleChart = ({ data, title, type = 'bar' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', background: 'rgba(248, 250, 252, 0.5)', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
        <Text type="secondary">Chưa có dữ liệu cho biểu đồ này</Text>
      </div>
    );
  }

  const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);

  // Custom Tooltip for Area/Bar Charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          padding: '12px 16px', 
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f1f5f9',
          backdropFilter: 'blur(4px)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#1e293b', marginBottom: '8px', fontSize: '14px' }}>{label}</p>
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }}></div>
              <span style={{ color: '#64748b', fontSize: '13px' }}>{entry.name}:</span>
              <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '13px' }}>
                {entry.name.toLowerCase().includes('doanh thu') || entry.name.toLowerCase().includes('tiền')
                  ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(entry.value)
                  : entry.value.toLocaleString('vi-VN')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === 'area' || type === 'bar') {
    const ChartComponent = type === 'area' ? AreaChart : BarChart;
    const DataComponent = type === 'area' ? Area : Bar;

    return (
      <div style={{ height: '400px', width: '100%', marginTop: '20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="label" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: '500' }}
            />
            {type === 'area' ? (
              <>
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  name="Số lượng đơn"
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={1500}
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  name="Doanh thu"
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={2000}
                />
              </>
            ) : (
              <>
                <Bar 
                  yAxisId="left"
                  name="Số lượng đơn"
                  dataKey="value" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar 
                  yAxisId="right"
                  name="Doanh thu"
                  dataKey="revenue" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </>
            )}
            {data.length > 20 && (
              <Brush 
                dataKey="label" 
                height={30} 
                stroke="#e2e8f0" 
                fill="#f8fafc"
                startIndex={data.length - 20}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'horizontalBar') {
    return (
      <div style={{ height: data.length * 40 + 60, minHeight: '200px', width: '100%', marginTop: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="label" 
              type="category" 
              axisLine={false}
              tickLine={false}
              width={100}
              tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              formatter={(value) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), 'Doanh thu']}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]} 
              barSize={20}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div style={{ height: '300px', width: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={5}
              dataKey="value"
              nameKey="label"
              animationBegin={0}
              animationDuration={1500}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                fontSize: '13px'
              }}
              formatter={(value, name) => {
                const percent = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0;
                return [`${value.toLocaleString('vi-VN')} (${percent}%)`, `${name}`];
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              align="center"
              iconType="circle"
              layout="horizontal"
              formatter={(value, entry) => {
                return <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '500' }}>{value}</span>;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label for donut chart */}
        <div style={{
          position: 'absolute',
          top: '46%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>TỔNG</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>
            {totalValue > 1000000 ? `${(totalValue / 1000000).toFixed(1)}M` : totalValue.toLocaleString('vi-VN')}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SimpleChart; 
