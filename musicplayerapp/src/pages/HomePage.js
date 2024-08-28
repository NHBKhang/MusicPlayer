import { Carousel } from '../components';
import '../styles/HomePage.css';
import { useEffect, useState } from 'react';
import { authAPI, endpoints } from '../configs/API';
import Page from '.';
import { useUser } from '../configs/UserContext';

const HomePage = () => {
    const [topMusic, setTopMusic] = useState([]);
    const [recentlyMusic, setRecentlyMusic] = useState([]);
    const { getAccessToken, user } = useUser();

    useEffect(() => {
        const loadTopMusic = async () => {
            try {
                let res = await authAPI(await getAccessToken()).get(`${endpoints.songs}?cate=1`);
                setTopMusic(res.data.results);
            } catch (error) {
                console.error(error);
                alert(error);
            }
        };

        const loadRecentlyMusic = async () => {
            try {
                let res = await authAPI(await getAccessToken()).get(`${endpoints.songs}?cate=2`);
                setRecentlyMusic(res.data.results);
            } catch (error) {
                console.error(error);
                alert(error);
            }
        }

        loadTopMusic();
        loadRecentlyMusic();
    }, [getAccessToken]);

    return (
        <Page title={"Home"}>
            <Carousel label='Bài hát hàng đầu' items={topMusic} />
            {user && <Carousel label='Nghe gần đây' items={recentlyMusic} />}
            {/* <Carousel label='Có thể bạn sẽ thích' items={topMusic} /> */}
        </Page>
    )
}

export default HomePage;