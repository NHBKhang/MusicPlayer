import React, { useState } from 'react';
import { authAPI, endpoints } from '../configs/API';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/SetPasswordPage.css';

const SetPasswordPage = () => {
    const location = useLocation();
    const { user } = location.state || {};
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            await authAPI(token).post(endpoints['set-password'],
                { new_password: password });
            setPassword('');
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.error || 'Lỗi không xác định');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center p-5 pb-4">
                <div className="col-lg-6 col-md-9 col-sm-12">
                    <div className='mb-5 fs-1'>
                        <a className="navbar-brand p-1 m-0" href="/">
                            <img src="/logo.png" height={70} className="me-1" alt="logo" />
                            <strong>SoundScape</strong></a>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="card bg-dark">
                            <div className="card-body">
                                <h2 className="card-title text-center mb-3 p-2 text-white">Đặt mật khẩu</h2>
                                <p className='username'>{user?.username}<i class="fa-solid fa-arrow-right"></i></p>
                                <div className="form-group mb-3">
                                    <label htmlFor="password" className='input-label'>Mật khẩu</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required />
                                    <button
                                        className="form-icon" type='button'
                                        onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <i class="fa-solid fa-eye"></i> : <i class="fa-solid fa-eye-slash"></i>}
                                    </button>
                                </div>
                                <div className="error-text">{error}</div>
                                <button
                                    type="submit"
                                    className="btn login btn-block mt-4 mb-3">
                                    {loading ? <div className='spinner'></div> : 'Đặt mật khẩu'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
            <span className='fs-6'>
                <p className='text-white pb-2 m-0'>This site is protected by reCAPTCHA and the Google <br />
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className='text-info'>Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className='text-info'>Terms of Service</a> apply.</p>
            </span>
            <br />
        </div>
    );
};

export default SetPasswordPage;
