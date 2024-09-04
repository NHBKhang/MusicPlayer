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
        component: HomePage,
        required: false
    },
    login: {
        url: '/login/',
        component: LoginPage,
        required: false
    },
    signup: {
        url: '/signup/',
        component: SignupPage,
        required: false
    },
    song: {
        url: '/songs/:id/',
        component: SongDetailsPage,
        required: false
    },
    playlist: {
        url: '/playlists/:id/',
        component: PlaylistDetailsPage,
        required: false
    },
    setPassword: {
        url: '/set-password/',
        component: SetPasswordPage,
        required: true
    },
    search: {
        url: '/search/',
        component: SearchPage,
        required: false
    },
    profile: {
        url: '/profile/:id/',
        component: ProfilePage,
        required: false
    },
    library: {
        url: '/library/',
        component: LibraryPage,
        required: true
    },
    upload: {
        url: '/upload/',
        component: UploadPage,
        required: true
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
    'song-access': (songId) => `/songs/${songId}/access/`,
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