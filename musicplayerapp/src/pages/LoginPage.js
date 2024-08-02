import React, { useState } from 'react';
import '../styles/LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log('Email:', username);
        console.log('Password:', password);
    };

    return (
        <div className="container">
            <div className="row justify-content-center p-5 pb-4">
                <div className="col-lg-6 col-md-9 col-sm-12">
                    <div className='mb-5 fs-2'>
                        <a className="navbar-brand p-1 m-1" href="/">
                            <img src="../logo.png" height={50} className="me-2 ms-1" alt="logo" />
                            <strong>SoundScape</strong></a>
                    </div>
                    <div className="card bg-dark">
                        <div className="card-body">
                            <h3 className="card-title text-center mb-2 p-1 text-white">Đăng nhập</h3>
                            <form onSubmit={handleSubmit} className='p-2'>
                                <div className="form-group mb-3">
                                    <label htmlFor="email" className='input-label'>Tên tài khoản</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required />
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="password" className='input-label'>Mật khẩu</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required />
                                </div>
                                <button type="submit" className="btn login btn-block mt-4">
                                    Đăng nhập
                                </button>
                                <div className="custom-text mt-4 mb-2 ms-1 fadeIn third">
                                    Bạn chưa có tài khoản? <a href="/signup/">Đăng ký</a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row justify-content-center p-1 pb-5">
                <div className="col-lg-9 col-md-12">
                    <div className="card bg-dark">
                        <p className='text-white mt-3'>Hoặc đăng nhập bằng tài khoản:</p>
                        <div className='d-flex p-1 pb-4 justify-content-center'>
                            <a className='social-link' href="/">
                                <img height={50} width={50} alt="Facebook" importance="low" loading="lazy" src="https://cdn.tgdd.vn/2020/03/GameApp/Facebook-200x200.jpg" />
                                <div className='social-name'>Facebook</div>
                            </a>
                            <a className='social-link' href="/">
                                <img height={50} width={50} alt="X" importance="low" loading="lazy" src="https://images2.thanhnien.vn/528068263637045248/2023/7/24/f1x5vdqx0aa9sgt-16901896163331463104829.jpg" />
                                <div className='social-name'>X</div>
                            </a>
                            <a className='social-link' href="/">
                                <img height={50} width={50} alt="Google" importance="low" loading="lazy" src="https://d1785e74lyxkqq.cloudfront.net/_next/static/v2/c/c6bf231775a1d162b567c0882e1d7e3b.svg" />
                                <div className='social-name'>Google</div>
                            </a>
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