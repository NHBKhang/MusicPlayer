import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../configs/UserContext';
import API, { endpoints } from '../configs/API';

const GoogleButton = () => {
    const navigate = useNavigate();
    const { loginWithToken } = useUser();

    const handleLoginSuccess = async (response) => {
        try {
            const { credential } = response;
            const res = await API.post(endpoints['login-google'], {
                id_token: credential
            });

            const { user, token, created } = res.data;
            loginWithToken(token);

            if (created)
                navigate('/set-password/', {
                    state: {
                        user: user,
                        token: token
                    }
                });
            else
                navigate('/');
        } catch (error) {
            console.error(error)
            alert(`Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại.\nDetails: ${error}`);
        }
    };


    const handleLoginFailure = (error) => {
        console.error(error);
        alert("Google login failed");
    };

    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <GoogleLogin
                onSuccess={handleLoginSuccess}
                onFailure={handleLoginFailure}
                shape="circle"
                size="large"
                theme="filled_black"
                text="signin_with"
                width="400"
            />
        </GoogleOAuthProvider>
    );
};

export default GoogleButton;