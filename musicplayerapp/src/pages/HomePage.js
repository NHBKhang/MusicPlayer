import { Carousel } from '../components';
import '../styles/HomePage.css';
import { useEffect, useState } from 'react';
import API, { endpoints } from '../configs/API';
import Page from '.';

const HomePage = () => {
    const [topMusic, setTopMusic] = useState([]);
    const [recentlyMusic, setRecentlyMusic] = useState([]);

    useEffect(() => {
        const loadTopMusic = async () => {
            try {
                let res = await API.get(`${endpoints.songs}?cate=1`);
                setTopMusic(res.data.results);
            } catch (error) {
                console.error(error);
                alert(error);
            }
        };

        const loadRecentlyMusic = async () => {
            try {
                let res = await API.get(`${endpoints.songs}?cate=2`);
                setRecentlyMusic(res.data.results);
            } catch (error) {
                console.error(error);
                alert(error);
            }
        }

        loadTopMusic();
        loadRecentlyMusic();
    }, []);

    return (
        <Page title={"Home"}>
            <Carousel label='Bài hát hàng đầu' items={topMusic} />
            <Carousel label='Nghe gần đây' items={recentlyMusic} />
            {/* <Carousel label='Có thể bạn sẽ thích' items={topMusic} /> */}
        </Page>
    )
}

export default HomePage;