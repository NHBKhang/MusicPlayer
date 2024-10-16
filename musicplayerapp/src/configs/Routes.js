import {
    DownloadPage,
    HomePage,
    LibraryPage,
    LivePage, LiveStreamPage, LiveVideoPage, LiveViewerPage,
    LoginPage,
    PageNotFound,
    PaymentCancelPage, PaymentSuccessPage,
    PlaylistDetailsPage,
    PremiumSubscriptionPage,
    ProfilePage,
    SearchPage,
    SetPasswordPage,
    SettingsPage,
    SignupPage,
    SongDetailsPage,
    SupportFAQPage,
    SupportFeedbackPage,
    SupportPage,
    SupportTicketPage,
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
        controlShow: false,
        premium: true
    },
    liveStreamViewer: {
        url: '/live-stream/:id/',
        component: LiveViewerPage,
        require: true,
        controlShow: false
    },
    settings: {
        url: '/settings/',
        component: SettingsPage,
        require: true,
        controlShow: false
    },
    premiumSubscription: {
        url: '/premium/',
        component: PremiumSubscriptionPage,
        require: true,
        controlShow: false
    },
    support: {
        url: '/support/',
        component: SupportPage,
        require: false,
        controlShow: false
    },
    supportFAQ: {
        url: '/support/faq/',
        component: SupportFAQPage,
        require: false,
        controlShow: false
    },
    supportFeedback: {
        url: '/support/feedback/',
        component: SupportFeedbackPage,
        require: false,
        controlShow: false
    },
    supportTicket: {
        url: '/support/tickets/',
        component: SupportTicketPage,
        require: false,
        controlShow: false
    }
}