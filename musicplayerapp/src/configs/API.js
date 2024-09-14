import {
    DownloadPage,
    HomePage,
    LibraryPage,
    LivePage,
    LiveVideoPage,
    LoginPage, PaymentSuccessPage, PlaylistDetailsPage, ProfilePage, SearchPage, SetPasswordPage, SignupPage,
    SongDetailsPage,
    UploadPage,
    VideoDetailsPage
} from "../pages";
import axios from "axios";
import PaymentCancelPage from "../pages/PaymentCancelPage";


export const routes = {
    home: {
        url: '/',
        component: HomePage,
        required: false,
        controlShow: true
    },
    login: {
        url: '/login/',
        component: LoginPage,
        required: false,
        controlShow: false
    },
    signup: {
        url: '/signup/',
        component: SignupPage,
        required: false,
        controlShow: false
    },
    song: {
        url: '/songs/:id/',
        component: SongDetailsPage,
        required: false,
        controlShow: true
    },
    playlist: {
        url: '/playlists/:id/',
        component: PlaylistDetailsPage,
        required: false,
        controlShow: true
    },
    video: {
        url: '/videos/:id/',
        component: VideoDetailsPage,
        required: false,
        controlShow: false
    },
    setPassword: {
        url: '/set-password/',
        component: SetPasswordPage,
        required: true,
        controlShow: true
    },
    search: {
        url: '/search/',
        component: SearchPage,
        required: false,
        controlShow: true
    },
    profile: {
        url: '/profile/:id/',
        component: ProfilePage,
        required: false,
        controlShow: true
    },
    library: {
        url: '/library/',
        component: LibraryPage,
        required: true,
        controlShow: true
    },
    upload: {
        url: '/upload/',
        component: UploadPage,
        required: true,
        controlShow: true
    },
    download: {
        url: '/download/',
        component: DownloadPage,
        require: false,
        controlShow: false
    },
    paymentSuccess: {
        url: '/payment-success/',
        component: PaymentSuccessPage,
        require: true,
        controlShow: false
    },
    paymentCancel: {
        url: '/payment-cancel/',
        component: PaymentCancelPage,
        require: true,
        controlShow: false
    },
    live: {
        url: '/live/',
        component: LivePage,
        require: false,
        controlShow: false
    },
    liveVideo: {
        url: '/live/:id/',
        component: LiveVideoPage,
        require: false,
        controlShow: false
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
    'download-song': (songId) => `/songs/${songId}/download/`,
    'previous-song': (songId) => `/songs/${songId}/previous/`,
    'next-song': (songId) => `/songs/${songId}/next/`,
    'related-songs': (songId) => `/songs/${songId}/related/`,
    'playlists': '/playlists/',
    'playlist': (playlistId) => `/playlists/${playlistId}/`,
    'music-videos': '/music-videos/',
    'music-video': (videoId) => `/music-videos/${videoId}/`,
    'live-video': (videoId) => `/music-videos/${videoId}/live/`,
    'live-videos': '/music-videos/live-videos/',
    'related-playlists': (playlistId) => `/playlists/${playlistId}/related/`,
    'like': (songId) => `/songs/${songId}/like/`,
    'stream': (songId) => `/songs/${songId}/stream/`,
    'comments': (songId) => `/songs/${songId}/comments/`,
    'add-comment': (songId) => `/songs/${songId}/comment/`,
    'mixed-search': '/search/',
    'paypal-create-order': '/payment/paypal/create-order/',
    'paypal-payment-success': '/payment/paypal/payment-success/',
    'notifications': '/notifications/',
    'notification': (notificationId) => `/notifications/${notificationId}/mark_as_read/`,
    'readonly-songs': '/readonly-songs/',
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