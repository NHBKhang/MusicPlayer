import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PaymentPage.css';

const PaymentCancelPage = () => {
    const navigate = useNavigate();

    return (
        <div className='payment-cancel-wrapper'>
            <div className="payment-cancel-container">
                <h1>Thanh toán đã bị hủy</h1>
                <p>Thanh toán của bạn đã bị hủy. Nếu bạn cần hỗ trợ, vui lòng liên hệ với bộ phận hỗ trợ.</p>
                <button onClick={() => navigate('/')}>Go to Home</button>
            </div>
        </div>
    );
};

export default PaymentCancelPage;