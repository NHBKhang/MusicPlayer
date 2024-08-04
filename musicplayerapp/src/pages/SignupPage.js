import { useState } from "react";
import '../styles/SignupPage.css';
import API, { endpoints } from "../configs/API";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const updateUser = (field, value) => {
        setUser(current => ({ ...current, [field]: value }));
    };

    const onSignup = async (e) => {
        e.preventDefault();
        if (user?.password !== user?.re_password)
            setError('Mật khẩu không khớp');
        else {
            setError(null);
            setLoading(true);

            let form = new FormData();
            for (let key in user)
                if (key !== 're_password')
                    form.append(key, user[key]);

            try {
                const res = await API.post(endpoints.users, form, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });

                if (res.status === 201) {
                    navigate("/login/");
                }
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }

        }
    }

    return (
        <div className="container">
            <div className="row justify-content-center p-5 pb-4">
                <div className="col-lg-6 col-md-9 col-sm-12">
                    <div className='mb-5 fs-1'>
                        <a className="navbar-brand p-1 m-0" href="/">
                            <img src="../logo.png" height={70} className="me-1" alt="logo" />
                            <strong>SoundScape</strong></a>
                    </div>
                    <form onSubmit={onSignup}>
                        <div className="card bg-dark">
                            <div className="card-body">
                                <h3 className="card-title text-center mb-2 p-2 text-white">Đăng ký</h3>
                                <div className="form-group mb-3">
                                    <label htmlFor="username" className='input-label'>Tên tài khoản</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        value={user?.username}
                                        onChange={(e) => updateUser('username', e.target.value)}
                                        required />
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="email" className='input-label'>Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        value={user?.email}
                                        onChange={(e) => updateUser('email', e.target.value)}
                                        required />
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="password" className='input-label'>Mật khẩu</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        value={user?.password}
                                        onChange={(e) => updateUser('password', e.target.value)}
                                        required />
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="re_password" className='input-label'>Nhập lại mật khẩu</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="re_password"
                                        value={user?.re_password}
                                        onChange={(e) => updateUser('re_password', e.target.value)}
                                        required />
                                </div>
                                <div className="error-text">{error}</div>
                                <button
                                    type="submit"
                                    className="btn login btn-block mt-3">
                                    {loading ? <div className='spinner'></div> : 'Đăng ký'}
                                </button>
                                <div className="custom-text mt-4 mb-2 ms-1 fadeIn third">
                                    Bạn đã có tài khoản? <a href="/login/">Đăng nhập</a>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div className="row justify-content-center p-1 pb-5">
                <div className="col-lg-9 col-md-12">
                    <div className="card bg-dark">
                        <p className='text-white mt-3'>Hoặc đăng ký bằng tài khoản:</p>
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
    )
}

export default SignupPage;