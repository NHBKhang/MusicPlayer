import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../configs/UserContext';
import API, { endpoints } from '../configs/API';
import '../App.css';
import FacebookLogin from '@greatsumini/react-facebook-login';

const FacebookButton = () => {
    const navigate = useNavigate();
    const { loginWithToken, saveUser } = useUser();

    const handleLoginSuccess = async (response) => {
        try {
            const { accessToken } = response;
            const res = await API.post(endpoints['login-facebook'], {
                access_token: accessToken
            });

            const { token, created } = res.data;
            let user = await loginWithToken(token);

            if (created)
                navigate('/set-password/', {
                    state: {
                        user: user,
                        token: token
                    }
                });
            else {
                saveUser(user)
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            alert(`Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại.\nDetails: ${error}`);
        }
    };

    const handleLoginFailure = (error) => {
        console.error(error);
        alert("Facebook login failed");
    };

    return (
        <FacebookLogin
            appId={process.env.REACT_APP_FACEBOOK_APP_ID}
            onSuccess={handleLoginSuccess}
            onFail={handleLoginFailure}
            render={({ onClick, logout }) => (
                <Button
                    onClick={onClick}
                    onLogoutClick={logout}
                    text={'Đăng nhập bằng Facebook'} />
            )}
        />
    );
};

const Button = ({ onClick, onLogoutClick, text }) => (
    <button onClick={onClick} className='facebook-button'>
        <i class="fa-brands fa-facebook"></i>{text || 'Login with Facebook'}
    </button>
)

export default FacebookButton;