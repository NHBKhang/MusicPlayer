import React, { useState } from 'react';
import { SupportContainer } from './SupportPage';
import { usePageTitle } from '../components/PageTitle';

const SupportFAQPage = () => {
  usePageTitle("FAQs");
  const faqData = [
    {
      question: "Làm thế nào để tôi đặt lại mật khẩu của mình?",
      answer: 'Bạn có thể đặt lại mật khẩu bằng cách nhấp vào "Quên Mật Khẩu" trên trang đăng nhập. Theo dõi hướng dẫn được gửi đến email của bạn.'
    },
    {
      question: "Làm thế nào tôi có thể tải lên một bản nhạc?",
      answer: 'Bạn có thể tải lên một bản nhạc bằng cách nhấp vào nút "Tải Lên" ở phía trên màn hình của bạn.'
    },
    {
      question: "Làm thế nào tôi có thể quản lý các đăng ký Premium của mình?",
      answer: 'Vào cài đặt tài khoản của bạn để quản lý và cập nhật các đăng ký Premium của bạn.'
    },
    {
      question: "Làm thế nào để tôi có thể liên hệ đến bộ phận hỗ trợ khách hàng?",
      answer: "Bạn có thể liên hệ đến bộ phận hỗ trợ khác hàng thông qua email soundscapesupport@example.com hoặc gọi điện đến số 1-800-123-4567."
    },
    {
      question: "Tôi có thể tìm thấy các điều khoản và điều kiện ở đâu?",
      answer: "Bạn có thể tìm thấy các điều khoản và điều kiện ở cuối trang chủ hoặc bằng cách nhấp vào đây."
    }
  ];

  return (
    <SupportContainer>
      <div className="faq-page">
        <h1>Hỗ trợ - Những câu hỏi thường gặp</h1>
        <div className="faq-list">
          {faqData.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </SupportContainer>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFAQ = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="faq-item">
      <h3 onClick={toggleFAQ} className="faq-question">
        {question}
        <span className="toggle-icon">
          {isOpen ? '-' : '+'}
        </span>
      </h3>
      {isOpen && <p className="faq-answer">{answer}</p>}
    </div>
  );
};

export default SupportFAQPage;