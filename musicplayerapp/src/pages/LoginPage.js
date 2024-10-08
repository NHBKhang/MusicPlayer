import React, { useEffect, useState } from 'react';
import '../styles/LoginPage.css';
import { useUser } from '../configs/UserContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleButton, FacebookButton } from '../components';
import { usePageTitle } from '../components/PageTitle';
import { authAPI, endpoints } from '../configs/API';

const LoginPage = () => {
    usePageTitle("Log in");
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [code, setCode] = useState('');
    const [user, setUser] = useState(null);
    const { login, getAccessToken, saveUser, user: currentUser } = useUser();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const next = searchParams.get('next') || '/';

    useEffect(() => {
        if (currentUser)
            navigate('/');
    }, [currentUser, navigate]);

    const onLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (user) {
                let res = await authAPI(await getAccessToken()).post(endpoints["verify-2fa"],
                    { token: code });

                if (res.status === 200) {
                    navigate(next);
                    saveUser(user);
                }
            } else {
                let u = await login(username, password);
                setUser(u);

                if (!u.is_2fa_enabled) {
                    navigate(next);
                    saveUser(u);
                }
            }
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.detail || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center p-5 pb-4">
                <div className="col-lg-6 col-md-9 col-sm-12">
                    <div className='mb-5 fs-2'>
                        <a className="navbar-brand p-1 m-1" href="/">
                            <img src="/logo.png" height={50} className="me-2 ms-1" alt="logo" />
                            <strong className="logo-name">SoundScape</strong></a>
                    </div>
                    <form onSubmit={onLogin}>
                        <div className="card bg-dark">
                            <div className="card-body">
                                <h3 className="card-title text-center mb-2 p-2 text-white">Đăng nhập</h3>
                                <div className="form-group mb-3">
                                    <label htmlFor="username" className='input-label'>Tên tài khoản</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        disabled={user} />
                                    <div className="form-icon">
                                        <i class="fa-solid fa-user"></i>
                                    </div>
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="password" className='input-label'>Mật khẩu</label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-control"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={user} />
                                    <button
                                        className="form-icon" type='button'
                                        onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <i class="fa-solid fa-eye"></i> : <i class="fa-solid fa-eye-slash"></i>}
                                    </button>
                                </div>
                                {user &&
                                    <div className="form-group mb-3">
                                        <label htmlFor="password" className='input-label'>Mã xác thực</label>
                                        <input
                                            type='text'
                                            className="form-control"
                                            id="password"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            required />
                                    </div>
                                }
                                <div className="error-text">{error}</div>
                                <button
                                    type="submit"
                                    className="btn login btn-block mt-4">
                                    {loading ? <div className='spinner'></div> : 'Đăng nhập'}
                                </button>
                                <div className="custom-text mt-4 mb-2 ms-1 fadeIn third">
                                    Bạn chưa có tài khoản? <a href="/signup/">Đăng ký</a>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div className="row justify-content-center p-1 pb-5">
                <div className="col-lg-9 col-md-12">
                    <div className="card bg-dark">
                        <p className='text-white mt-3'>Hoặc đăng nhập bằng tài khoản:</p>
                        <div className='d-flex p-1 pb-4 justify-content-center w-100 flex-wrap'>
                            <div className='mb-4 justify-content-center d-flex'><GoogleButton /></div>
                            <div className='mb-1 w-100'><FacebookButton /></div>
                        </div>
                    </div>
                </div>
            </div>
            <span className='fs-6'>
                <p className='text-white pb-2 m-0'>This site is protected by reCAPTCHA and the Google <br />
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className='text-info'>Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className='text-info'>Terms of Service</a> apply.</p>
            </span>
        </div>
    );
};

export default LoginPage;