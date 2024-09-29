import {
    DownloadPage,
    HomePage,
    LibraryPage, LivePage, LiveStreamPage, LiveVideoPage, LiveViewerPage, LoginPage,
    PageNotFound,
    PaymentCancelPage,
    PaymentSuccessPage, PlaylistDetailsPage, ProfilePage,
    SearchPage, SetPasswordPage, SignupPage, SongDetailsPage,
    UploadPage,
    VideoDetailsPage
} from "../pages";

export const routes = {
    pageNotFound: {
        url: '*',
        component: PageNotFound,
        required: false,
        controlShow: false
    },
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
        controlShow: true
    },
    liveVideo: {
        url: '/live/:id/',
        component: LiveVideoPage,
        require: false,
        controlShow: false
    },
    liveStream: {
        url: '/live-stream/',
        component: LiveStreamPage,
        require: true,
        controlShow: false
    },
    liveStreamViewer: {
        url: '/live-stream/:id/',
        component: LiveViewerPage,
        require: true,
        controlShow: false
    },
}