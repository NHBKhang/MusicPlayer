import React, { useEffect, useState } from 'react';
import { authAPI, endpoints } from '../configs/API';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/SetPasswordPage.css';
import { usePageTitle } from '../components/PageTitle';
import { useUser } from '../configs/UserContext';

const SetPasswordPage = () => {
    usePageTitle("Set password");
    const location = useLocation();
    const { user } = location.state || {};
    const { getAccessToken } = useUser();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({});
    const navigate = useNavigate();

    const updateShowPassword = (field, value) =>
        setShowPassword(prev => ({ ...prev, [field]: value }))

    useEffect(() => {
        if (user)
            navigate('/');
    }, [user, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let res = await authAPI(await getAccessToken())
                .post(endpoints['set-password'],
                    { new_password: password });

            if (res.status === 204) {
                setPassword('');
                navigate('/');
            }
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
                            <strong className="logo-name">SoundScape</strong></a>
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
                                        onClick={() => updateShowPassword('password', !showPassword?.password)}>
                                        {showPassword?.password ? <i class="fa-solid fa-eye"></i> : <i class="fa-solid fa-eye-slash"></i>}
                                    </button>
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="confirm" className='input-label'>Nhập lại mật khẩu</label>
                                    <input
                                        type="confirm"
                                        className="form-control"
                                        id="confirm"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        required />
                                    <button
                                        className="form-icon" type='button'
                                        onClick={() => updateShowPassword('confirm', !showPassword?.confirm)}>
                                        {showPassword?.confirm ? <i class="fa-solid fa-eye"></i> : <i class="fa-solid fa-eye-slash"></i>}
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
