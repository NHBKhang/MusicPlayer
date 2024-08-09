import { Carousel, Footer, Header, Sidebar } from '../components';
import '../styles/HomePage.css';
import { usePageTitle } from '../configs/PageTitle';

const HomePage = () => {
    usePageTitle("Home");

    return (
        <div className='d-flex' style={{ flexDirection: 'row' }}>
            <Header />
            <div className='sidebar'>
                <Sidebar />
            </div>
            <div className='content w-100'>
                <Carousel label={'Top music'} />
                <Carousel />
                <Carousel />

                <Footer />
            </div>
        </div>
    )
}

export default HomePage;