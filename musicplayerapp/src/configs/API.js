import { HomePage, LoginPage, SignupPage } from "../pages";
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
}

export const endpoints = {
    'users': '/users/',
    'login': '/o/token/',

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