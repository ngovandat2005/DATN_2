import React from 'react';
import { Row, Col, Card, Typography, Tag, Space, Avatar } from 'antd';
import { Link } from 'react-router-dom';
import { UserOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// Dữ liệu mẫu cho các bài viết
const blogPosts = [
  {
    id: 1,
    title: "Top 10 giày thể thao bán chạy nhất năm 2025",
    summary:
      "Khám phá những mẫu giày thể thao được ưa chuộng nhất trong năm nay...",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    author: "Nguyễn Văn A",
    date: "2025-08-15",
    views: 1234,
    tags: ["Giày thể thao", "Xu hướng"],
  },
  {
    id: 2,
    title: "Hướng dẫn chọn giày chạy bộ phù hợp",
    summary:
      "Làm thế nào để chọn được đôi giày chạy bộ phù hợp với đôi chân của bạn...",
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800",
    author: "Trần Thị B",
    date: "2025-09-10",
    views: 856,
    tags: ["Chạy bộ", "Hướng dẫn"],
  },
  // Thêm các bài viết khác...
];

function BlogPage() {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Tin Tức & Blog</Title>
      
      <Row gutter={[24, 24]}>
        {blogPosts.map(post => (
          <Col xs={24} md={12} key={post.id}>
            <Card
              hoverable
              cover={<img alt={post.title} src={post.image} style={{ height: 200, objectFit: 'cover' }} />}
            >
              <Card.Meta
                title={
                  <Link to={`/blog/${post.id}`}>
                    <Title level={4}>{post.title}</Title>
                  </Link>
                }
                description={
                  <>
                    <Paragraph ellipsis={{ rows: 2 }}>
                      {post.summary}
                    </Paragraph>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space>
                        <Avatar icon={<UserOutlined />} />
                        <Text>{post.author}</Text>
                        <ClockCircleOutlined />
                        <Text type="secondary">{post.date}</Text>
                        <EyeOutlined />
                        <Text type="secondary">{post.views} lượt xem</Text>
                      </Space>
                      <Space>
                        {post.tags.map(tag => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </Space>
                    </Space>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default BlogPage; 
