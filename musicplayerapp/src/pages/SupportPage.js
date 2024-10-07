import React, { useEffect, useRef, useState } from 'react';
import '../styles/SupportPage.css';
import API, { endpoints } from '../configs/API';

const SupportPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);

    const toggleChatBox = () => {
        setIsChatOpen(!isChatOpen);
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    return (
        <div>
            <Header />
            <div className="support-page-container">
                {/* Thanh tìm kiếm */}
                <section className="search-section">
                    <h1 className="main-title">How can we help?</h1>
                    <input
                        type="text"
                        placeholder="Search for answers"
                        value={searchQuery}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </section>

                {/* Các danh mục hỗ trợ */}
                <section className="categories-section">
                    <h2 className="section-title">Chủ đề phổ biến</h2>
                    <div className="category-list">
                        <div className="category-item">
                            <h3 className="category-title">Tài khoản của bạn</h3>
                            <p className="category-description">Tìm hiểu cách quản lý cài đặt tài khoản của bạn.</p>
                        </div>
                        <div className="category-item">
                            <h3 className="category-title">Tải lên & Chia sẻ</h3>
                            <p className="category-description">Tìm hiểu cách tải lên và chia sẻ các bản nhạc của bạn.</p>
                        </div>
                        <div className="category-item">
                            <h3 className="category-title">Thanh toán</h3>
                            <p className="category-description">Quản lý các đăng ký và phương thức thanh toán của bạn.</p>
                        </div>
                        <div className="category-item">
                            <h3 className="category-title">Bản quyền</h3>
                            <p className="category-description">Hiểu về các vấn đề và chính sách bản quyền.</p>
                        </div>
                        <div className="category-item">
                            <h3 className="category-title">Ứng dụng di động</h3>
                            <p className="category-description">Tìm hiểu về việc sử dụng SoundCloud trên thiết bị di động của bạn.</p>
                        </div>
                    </div>
                </section>

                {/* Câu hỏi thường gặp (FAQ) */}
                <section className="faq-section">
                    <h2 className="section-title">Câu Hỏi Thường Gặp</h2>
                    <div className="faq-item">
                        <h3 className="faq-question">Làm thế nào để tôi đặt lại mật khẩu của mình?</h3>
                        <p className="faq-answer">
                            Bạn có thể đặt lại mật khẩu bằng cách nhấp vào "Quên Mật Khẩu" trên trang đăng nhập.
                        </p>
                    </div>
                    <div className="faq-item">
                        <h3 className="faq-question">Làm thế nào tôi có thể tải lên một bản nhạc?</h3>
                        <p className="faq-answer">
                            Bạn có thể tải lên một bản nhạc bằng cách nhấp vào nút "Tải Lên" ở phía trên màn hình của bạn.
                        </p>
                    </div>
                    <div className="faq-item">
                        <h3 className="faq-question">Làm thế nào tôi có thể quản lý các đăng ký của mình?</h3>
                        <p className="faq-answer">
                            Vào cài đặt tài khoản của bạn để quản lý và cập nhật các đăng ký.
                        </p>
                    </div>
                </section>
            </div>
            <Footer />
            <button className="toggle-chat-btn" onClick={toggleChatBox}>
                <div className="toggle-icon">
                    <img
                        width={35} height={35}
                        src='/echo_ai.png'
                        alt='Echo'
                        className={`chat-icon ${isChatOpen ? 'hidden' : 'visible'}`} />
                    <i
                        className={`fa fa-times close-icon ${isChatOpen ? 'visible' : 'hidden'}`}
                        aria-hidden="true" />
                </div>
            </button>

            <div className={`${isChatOpen ? 'open' : ''}`}>
                <ChatBox />
            </div>
        </div>
    );
};

const Header = () => {
    return (
        <header className="header-container">
            <a className="logo" href='/'>
                <h1>SoundScape</h1>
            </a>
            <nav className="nav-links">
                <a href="/support">Trang chủ</a>
                <a href="/support/feedback/">Phản hồi</a>
            </nav>
        </header>
    );
};

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-links">
                <a href="/terms">Terms of Service</a>
                <a href="/privacy">Privacy Policy</a>
            </div>
            <p className="footer-copyright">
                © 2024 SoundScape. All rights reserved.
            </p>
        </footer>
    );
};

const ChatBox = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: 'Xin chào!', sender: 'bot' },
        { id: 2, text: "Tên tôi là Echo, tôi là bot hỗ trợ của SoundScape 🤖", sender: 'bot' },
        { id: 3, text: 'Hôm nay tôi có thể giúp gì cho bạn?', sender: 'bot' },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesRef = useRef(null);

    const handleSendMessage = async () => {
        if (inputMessage.trim()) {
            const newMessage = { id: messages.length + 1, text: inputMessage, sender: 'user' };
            setMessages([...messages, newMessage]);
            setInputMessage('');
            setLoading(true);

            try {
                let res = await API.post(endpoints['dialogflow-response'],
                    { message: inputMessage });

                const botResponse = res.data;
                const botMessage = { id: messages.length + 2, text: botResponse.response, sender: 'bot' }; // Tạo tin nhắn bot
                setMessages(prevMessages => [...prevMessages, botMessage]);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    };

    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="chat-box">
            <div className="chat-header">
                <img src='/logo.png' alt='Echo' width={35} height={35} className='bot-logo me-2 bg-none' />
                Echo Support AI
            </div>

            <div className="chat-messages" ref={messagesRef}>
                {messages.map((message, index) => {
                    const isUserMessage = message.sender === 'user';
                    const isBotMessage = message.sender === 'bot';
                    const isLastBotMessage = isBotMessage && (index === messages.length - 1 || messages[index + 1].sender !== 'bot');

                    return (
                        <div key={message.id} className={`chat-message-container ${isUserMessage ? 'user-message' : 'bot-message'}`}>
                            {isLastBotMessage && isBotMessage && (
                                <img src='/echo_ai.png' alt='Echo' className="bot-logo" height={30} width={30} />
                            )}
                            <div className={`chat-message ${isBotMessage && !isLastBotMessage && 'no-logo'}`}>
                                {message.text}
                            </div>
                        </div>
                    );
                })}

                {/* Hiển thị loading nếu đang chờ phản hồi từ bot */}
                {loading && (
                    <div className="chat-message-container bot-message">
                        <img src='/echo_ai.png' alt='Echo' className="bot-logo" height={30} width={30} />
                        <div className="loading-message">Đang soạn tin nhắn...</div>
                    </div>
                )}
            </div>

            <div className="chat-input-container">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="chat-input" />
                <button onClick={handleSendMessage} className="send-button">
                    Send
                </button>
            </div>
        </div>
    );
};

export default SupportPage;
