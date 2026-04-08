import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Spin, Typography, Space } from 'antd';
import { MessageOutlined, CloseOutlined, SendOutlined, RobotOutlined } from '@ant-design/icons';
import '../styles/Chatbot.css';
import axios from 'axios';

const { Text } = Typography;

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Chào bạn! Tôi là trợ lý ảo của KingStep. Tôi có thể giúp gì cho bạn về các mẫu giày, size số hay chính sách đổi trả không?", isBot: true }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage = inputValue;
        setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Lấy context từ Local Storage (Featured/Sales)
            let contextStr = "";
            try {
                const f = JSON.parse(localStorage.getItem('bot_featured') || '[]');
                const s = JSON.parse(localStorage.getItem('bot_sales') || '[]');
                if (f.length > 0) contextStr += "Sản phẩm nổi bật: " + f.join(", ") + ". ";
                if (s.length > 0) contextStr += "Giảm giá: " + s.join(", ") + ". ";
            } catch(e){}

            const response = await axios.post('http://localhost:8080/api/chatbot/ask', {
                message: userMessage,
                context: contextStr
            });
            setMessages(prev => [...prev, { text: response.data.reply, isBot: true }]);
        } catch (error) {
            console.error("Error asking chatbot:", error);
            setMessages(prev => [...prev, { text: "Xin lỗi, hiện tại tôi đang gặp sự cố kết nối. Quý khách vui lòng thử lại sau giây lát!", isBot: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            {isOpen ? (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <Space>
                            <div className="bot-avatar-header">
                                <RobotOutlined />
                            </div>
                            <div>
                                <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', lineHeight: '1.2' }}>KingStep AI</div>
                                <div style={{ color: '#b7eb8f', fontSize: '10px', lineHeight: '1.2' }}>● Đang trực tuyến</div>
                            </div>
                        </Space>
                        <Button type="text" icon={<CloseOutlined style={{ color: '#fff' }} />} onClick={toggleChat} />
                    </div>
                    
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-wrapper ${msg.isBot ? 'bot' : 'user'}`}>
                                <div className={`message-bubble ${msg.isBot ? 'bot' : 'user'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message-wrapper bot">
                                <div className="message-bubble bot" style={{ padding: '12px 16px' }}>
                                    <div className="typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input">
                        <Input
                            placeholder="Nhập tin nhắn..."
                            variant="borderless"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onPressEnter={handleSend}
                            disabled={isLoading}
                        />
                        <Button 
                            type="primary" 
                            shape="circle"
                            icon={<SendOutlined />} 
                            onClick={handleSend}
                            loading={isLoading}
                            style={{ backgroundColor: '#1890ff', border: 'none' }}
                        />
                    </div>
                </div>
            ) : (
                <div className="chatbot-fab-wrapper">
                    <div className="chatbot-tooltip">Hỏi trợ lý KingStep AI</div>
                    <Button
                        type="primary"
                        shape="circle"
                        size="large"
                        icon={<MessageOutlined style={{ fontSize: '24px' }} />}
                        className="chatbot-fab"
                        onClick={toggleChat}
                    />
                </div>
            )}
        </div>
    );
};

export default Chatbot;
