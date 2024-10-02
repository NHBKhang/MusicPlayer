import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { endpoints } from '../configs/API';
import { useUser } from '../configs/UserContext';

const PaymentSuccessPage = () => {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [type, setType] = useState(null);
    const navigate = useNavigate();
    const { saveUser, user } = useUser();
    const queryParams = new URLSearchParams(window.location.search);
    const paymentId = queryParams.get('paymentId');
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
                    PayerID: PayerID,
                });
                setMessage(res.data.message);
                setData(res.data.data);
                setType(res.data.type);
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

    const redirect = () => {
        if (type === 'song') {
            navigate(`/download/?songId=${data?.id}`);
        } else {
            navigate('/');
            saveUser({ ...user, is_premium: true });
        }
    };

    return (
        <div className='payment-success-wrapper'>
            <div className="payment-success-container">
                <h1>Thanh toán thành công</h1>
                <p>{message}</p>
                <div className='text-start payment-info'>
                    {type === 'song' ? (
                        <>
                            <p>Tên bài hát: {data.title}</p>
                            <p>Mã giao dịch: {data.transaction_id}</p>
                            <p>Số tiền: {data.amount} VNĐ</p>
                            <p>Ngày giao dịch: {data.transaction_date}</p>
                            <p>Phương thức giao dịch: {data.method}</p>
                        </>
                    ) : (
                        <>
                            <p>Loại premium: {data.type}</p>
                            <p>Mã giao dịch: {data.transaction_id}</p>
                            <p>Số tiền: {data.amount} VNĐ</p>
                            <p>Ngày giao dịch: {data.transaction_date}</p>
                            <p>Ngày bắt đầu: {data.start_date}</p>
                            <p>Ngày kết thúc: {data.end_date}</p>
                            <p>Phương thức giao dịch: {data.method}</p>
                        </>
                    )}
                </div>
                <button onClick={redirect}>
                    {type === 'song' ? `Tải xuống ${data?.title} ngay bây giờ` : 'Hãy tận hưởng Premium của bạn!'}
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;