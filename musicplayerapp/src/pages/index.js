import { Footer, Header, Sidebar } from '../components';
import PageTitle from '../components/PageTitle';
import { useUser } from '../configs/UserContext';

const Page = ({ children, title }) => {
    const { user } = useUser();

    if (user) {
        return (
            <div className='d-flex' style={{ flexDirection: 'row' }}>
                {title && <PageTitle title={title} />}
                <Header />
                <div className='sidebar d-none d-sm-inline'>
                    <Sidebar />
                </div>
                <div className='content w-100'>
                    <div className='mb-5 music-content'>
                        <div className='content-container'>
                            {children}
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        )
    } else {
        return (
            <div className='d-flex'>
                {title && <PageTitle title={title} />}
                <Header />
                <div className='content w-100'>
                    {children}
                    <Footer />
                </div>
            </div>
        )
    }
}

export default Page;
export { default as HomePage } from './HomePage';
export { default as LoginPage } from './LoginPage';
export { default as SignupPage } from './SignupPage';
export { default as SongDetailsPage } from './SongDetailsPage';
export { default as PlaylistDetailsPage } from './PlaylistDetailsPage';
export { default as VideoDetailsPage } from './VideoDetailsPage';
export { default as SetPasswordPage } from './SetPasswordPage';
export { default as SearchPage } from './SearchPage';
export { default as ProfilePage } from './ProfilePage';
export { default as LibraryPage } from './LibraryPage';
export { default as UploadPage } from './UploadPage';
export { default as DownloadPage } from './DownloadPage';
export { default as PaymentSuccessPage } from './PaymentSuccessPage';
export { default as PaymentCancelPage } from './PaymentCancelPage';
export { default as LivePage } from './LivePage';