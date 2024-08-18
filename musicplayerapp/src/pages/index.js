import { Footer, Header, Sidebar } from '../components';
import PageTitle from '../components/PageTitle';

const Page = ({ children, title }) => {
    return (
        <div className='d-flex' style={{ flexDirection: 'row' }}>
            {title && <PageTitle title={title} />}
            <Header />
            <div className='sidebar'>
                <Sidebar />
            </div>
            <div className='content w-100'>
                <div className='mb-5'>{children}</div>
                <Footer />
            </div>
        </div>
    )
}

export default Page;
export { default as HomePage } from './HomePage';
export { default as LoginPage } from './LoginPage';
export { default as SignupPage } from './SignupPage';
export { default as SongDetailsPage } from './SongDetailsPage';
export { default as SetPasswordPage } from './SetPasswordPage';
export { default as SearchPage } from './SearchPage';
export { default as ProfilePage } from './ProfilePage'; 