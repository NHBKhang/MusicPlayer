import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginRequiredModal = ({ visible, onClose }) => {
    const navigate = useNavigate();
    if (!visible) return;

    const onLogin = () => {
        onClose();
        navigate('/login/');
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h2 className='text-dark'>Yêu cầu đăng nhập</h2>
                <p className='text-dark'>Bạn cần đăng nhập để thực hiện hành động này.</p>
                <button onClick={onLogin} style={buttonStyle}>Đăng nhập</button>
                <button onClick={onClose} style={buttonStyle}>Đóng</button>
            </div>
        </div>
    );
};

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const modalContentStyle = {
    background: 'rgba(240, 240, 240, 0.95)',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
};

const buttonStyle = {
    width: '125px',
    margin: '10px',
    padding: '10px 15px',
    cursor: 'pointer',
    background: 'rgba(205, 100, 0)',
    color: '#fff',
    fontSize: '17px',
    borderWidth: '1px',
    borderColor: 'rgba(205, 50, 0)',
    borderRadius: '5px',
    textShadow: '2px 2px 4px rgba(0, 47, 255, 0.5)',
};

export default LoginRequiredModal;