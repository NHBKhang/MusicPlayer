import axios from "axios";

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
    'paypal-subscribe-premium': '/payment/paypal/subscribe-premium/',
    'notifications': '/notifications/',
    'notification': (notificationId) => `/notifications/${notificationId}/mark_as_read/`,
    'readonly-songs': '/readonly-songs/',
    'live-streams': '/live-streams/',
    'live-stream': (streamId) => `/live-streams/${streamId}/`,
    'enable-2fa': '/auth/2fa/enable/',
    'verify-2fa': '/auth/2fa/verify/',
    'disable-2fa': '/auth/2fa/disable/',
    'resend-2fa-qr': '/auth/2fa/resend-qr/',
    'dialogflow-response': '/support/dialogflow/response/',
    'feedback': 'support/feedback/',
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