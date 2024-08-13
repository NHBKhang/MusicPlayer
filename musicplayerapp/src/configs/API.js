import {
    HomePage,
    LoginPage, SetPasswordPage, SignupPage,
    SongDetailsPage
} from "../pages";
import axios from "axios";


export const routes = {
    home: {
        url: '/',
        component: HomePage
    },
    login: {
        url: '/login/',
        component: LoginPage
    },
    signup: {
        url: '/signup/',
        component: SignupPage

    },
    song: {
        url: '/songs/:id/',
        component: SongDetailsPage
    },
    SetPassword: {
        url: '/set-password/',
        component: SetPasswordPage
    }
}

export const endpoints = {
    'users': '/users/',
    'user': (userId) => `/users/${userId}`,
    'login': '/o/token/',
    'login-google': '/auth/google/',
    'login-facebook': '/auth/facebook/',
    'set-password': '/auth/set-password/',
    'current-user': '/users/current-user/',
    'genres': '/genres/',
    'songs': '/songs/',
    'song': (songId) => `/songs/${songId}/`,
    'previous-song': (songId) => `/songs/${songId}/previous/`,
    'next-song': (songId) => `/songs/${songId}/next/`,
    'related-songs': (songId) => `/songs/${songId}/related/`,
    'like': (songId) => `/songs/${songId}/like/`,
    'stream': (songId) => `/songs/${songId}/stream/`,
    'comments': (songId) => `/songs/${songId}/comments/`,
    'add-comment': (songId) => `/songs/${songId}/comment/`,
}

export const authAPI = (accessToken) =>
    axios.create({
        baseURL: process.env.REACT_APP_API_URL,
        timeout: 5000,
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });

export default axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 5000,
});