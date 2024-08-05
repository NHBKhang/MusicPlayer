import {
    HomePage,
    LoginPage, SignupPage,
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
        component: SignupPage,

    },
    song: {
        url: '/songs/:id/',
        component: SongDetailsPage
    }
}

export const endpoints = {
    'users': '/users/',
    'user': (userId) => `/users/${userId}`,
    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'genres': '/genres/',
    'songs': '/songs/',
    'song': (songId) => `/songs/${songId}/`,
}

export const authAPI = (accessToken) => axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 2000,
    headers: {
        "Authorization": `bearer ${accessToken}`
    }
});

export default axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 2000
});