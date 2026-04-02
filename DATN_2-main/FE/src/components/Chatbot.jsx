import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Spin, Typography, Space } from 'antd';
import { MessageOutlined, CloseOutlined, SendOutlined, RobotOutlined } from '@ant-design/icons';
import '../styles/Chatbot.css';
import axios from 'axios';

const { Text } = Typography;

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Chào bạn! Tôi là trợ lý ảo của KingStep. Tôi có thể giúp gì cho bạn?", isBot: true }
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
            const response = await axios.post('http://localhost:8080/api/chatbot/ask', {
                message: userMessage
            });
            setMessages(prev => [...prev, { text: response.data.reply, isBot: true }]);
        } catch (error) {
            console.error("Error asking chatbot:", error);
            setMessages(prev => [...prev, { text: "Xin lỗi, hiện tại tôi đang gặp chút sự cố kết nối. Vui lòng thử lại sau!", isBot: true }]);
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
                            <RobotOutlined style={{ fontSize: '20px' }} />
                            <Text strong style={{ color: '#fff', fontSize: '16px' }}>KingStep AI</Text>
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
                                <div className="message-bubble bot" style={{ padding: '8px 12px' }}>
                                    <Spin size="small" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input">
                        <Input
                            placeholder="Nhập tin nhắn..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onPressEnter={handleSend}
                            disabled={isLoading}
                        />
                        <Button 
                            type="primary" 
                            icon={<SendOutlined />} 
                            onClick={handleSend}
                            loading={isLoading}
                        />
                    </div>
                </div>
            ) : (
                <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<MessageOutlined style={{ fontSize: '24px' }} />}
                    className="chatbot-fab"
                    onClick={toggleChat}
                />
            )}
        </div>
    );
};

export default Chatbot;
