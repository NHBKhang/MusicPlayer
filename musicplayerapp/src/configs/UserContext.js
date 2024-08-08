import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, endpoints } from './API';
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

    const login = async (token) => {
        localStorage.setItem('token', token);

        const res = await authAPI(token).get(endpoints['current-user'])
        setUser(res.data);
    };

    const logout = () => {
        googleLogout();
        
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};