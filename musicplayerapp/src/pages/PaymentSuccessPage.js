import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { endpoints } from '../configs/API';

const PaymentSuccessPage = () => {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [song, setSong] = useState(null);
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(window.location.search);
    const paymentId = queryParams.get('paymentId');
    // const token = queryParams.get('token');
    const PayerID = queryParams.get('PayerID');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!paymentId || !PayerID) {
                setError('Invalid payment details');
                setLoading(false);
                return;
            }

            try {
                const res = await API.post(endpoints['paypal-payment-success'], {
                    paymentId: paymentId,
                    PayerID: PayerID
                });
                console.info(res)
                setMessage(res.data.message);
                setSong(res.data.song);
            } catch (err) {
                setError('Xác minh thanh toán không thành công');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [paymentId, PayerID]);

    if (loading) return <p className='mt-5'>Verifying payment...</p>;
    if (error) return <p className='mt-5'>{error}</p>;

    return (
        <div className='payment-success-wrapper'>
            <div className="payment-success-container">
                <h1>Thanh toán thành công</h1>
                <p>{message}</p>
                <div className='text-start payment-info'>
                    <p>Tên bài hát: {song?.title}</p>
                    <p>Mã giao dịch: {song?.transaction_id}</p>
                    <p>Số tiền: {song?.amount} VNĐ</p>
                    <p>Ngày giao dịch: {song?.transaction_date}</p>
                    <p>Phương thức giao dịch: {song?.method}</p>
                    <p>Phương thức giao dịch: {song?.method}</p>
                </div>
                <button onClick={() => navigate(`/download/?songId=${song?.id}`)}>
                    Tải xuống {song?.title} ngay bây giờ
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;