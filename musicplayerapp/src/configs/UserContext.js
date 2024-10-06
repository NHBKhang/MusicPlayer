import React, { createContext, useState, useContext, useEffect } from 'react';
import API, { authAPI, endpoints } from './API';
import { googleLogout } from '@react-oauth/google';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const login = async (username, password) => {
        try {
            const res = await API.post(endpoints.login, {
                "username": username,
                "password": password,
                "client_id": process.env.REACT_APP_CLIENT_ID,
                "client_secret": process.env.REACT_APP_CLIENT_SECRET,
                "grant_type": "password"
            });

            let user = await loginWithToken(res.data);
            return user;
        } catch (error) {
            throw error;
        }
    };

    const loginWithToken = async (token) => {
        const now = Date.now() / 1000;
        const newToken = {
            ...token,
            issued_at: now,
        };
        localStorage.setItem('token', JSON.stringify(newToken));

        try {
            const res = await authAPI(token.access_token).get(endpoints['current-user']);
            return res.data;
        } catch (error) {
            const refreshedAccessToken = await refreshAccessToken();
            if (refreshedAccessToken) {
                const res = await authAPI(refreshedAccessToken).get(endpoints['current-user']);
                return res.data;
            } else {
                logout();
            }
        }
    };

    const refreshAccessToken = async () => {
        const token = JSON.parse(localStorage.getItem('token'));

        if (token && token.refresh_token) {
            try {
                const res = await API.post(endpoints.login, {
                    "client_id": process.env.REACT_APP_CLIENT_ID,
                    "client_secret": process.env.REACT_APP_CLIENT_SECRET,
                    "grant_type": "refresh_token",
                    "refresh_token": token.refresh_token
                });

                const now = Date.now() / 1000;
                const newToken = {
                    ...res.data,
                    issued_at: now,
                };
                localStorage.setItem('token', JSON.stringify(newToken));
                return newToken.access_token;
            } catch (error) {
                logout();
                throw error;
            }
        } else {
            logout();
        }
        return null;
    };

    const getAccessToken = async () => {
        let tokenString = localStorage.getItem("token");
        let token = tokenString ? JSON.parse(tokenString) : null;
        if (token) {
            const now = Date.now() / 1000;
            const expiresAt = token.issued_at + token.expires_in;

            if (expiresAt > now) {
                return token.access_token;
            } else {
                const refreshedAccessToken = await refreshAccessToken();
                return refreshedAccessToken || null;
            }
        }

        return null;
    }

    const logout = () => {
        googleLogout();
        setUser(null);
        localStorage.removeItem('token');

    };

    const saveUser = (data, append = false) => {
        let updatedUser;
        if (append) {
            updatedUser = {
                ...user,
                ...data
            };
        } else {
            updatedUser = data;
        }
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    const checkPremiumActive = () => {
        const currentDate = new Date();

        try {
            if (user.premium && user.premium.start_date && user.premium.end_date) {
                const startDate = new Date(user.premium.start_date);
                const endDate = new Date(user.premium.end_date);

                return currentDate >= startDate && currentDate <= endDate;
            }

            return false;
        } catch (error) {
            return false;
        }
    }

    return (
        <UserContext.Provider value={{
            user,
            login, loginWithToken,
            logout,
            getAccessToken,
            saveUser,
            checkPremiumActive
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};