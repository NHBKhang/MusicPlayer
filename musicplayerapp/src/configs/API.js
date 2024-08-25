import {
    HomePage,
    LibraryPage,
    LoginPage, PlaylistDetailsPage, ProfilePage, SearchPage, SetPasswordPage, SignupPage,
    SongDetailsPage,
    UploadPage
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
    playlist: {
        url: '/playlists/:id/',
        component: PlaylistDetailsPage
    },
    setPassword: {
        url: '/set-password/',
        component: SetPasswordPage
    },
    search: {
        url: '/search/',
        component: SearchPage
    },
    profile: {
        url: '/profile/:id/',
        component: ProfilePage
    },
    library: {
        url: '/library/',
        component: LibraryPage
    },
    upload: {
        url: '/upload/',
        component: UploadPage
    }
}

export const endpoints = {
    'users': '/users/',
    'user': (userId) => `/users/${userId}/`,
    'follow': (useId) => `/users/${useId}/follow/`,
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
    'playlists': '/playlists/',
    'playlist': (playlistId) => `/playlists/${playlistId}/`,
    'like': (songId) => `/songs/${songId}/like/`,
    'stream': (songId) => `/songs/${songId}/stream/`,
    'comments': (songId) => `/songs/${songId}/comments/`,
    'add-comment': (songId) => `/songs/${songId}/comment/`,
    'mixed-search': '/search/',
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