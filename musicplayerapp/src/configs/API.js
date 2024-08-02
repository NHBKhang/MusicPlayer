import { HomePage, LoginPage, SignupPage } from "../pages";

export const endpoints = {
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
}