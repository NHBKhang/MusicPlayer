import { Carousel } from '../components';
import '../styles/HomePage.css';
import { useEffect, useState } from 'react';
import API, { authAPI, endpoints } from '../configs/API';
import Page from '.';
import { useUser } from '../configs/UserContext';

const HomePage = () => {
    const [topMusic, setTopMusic] = useState([]);
    const [recentlyMusic, setRecentlyMusic] = useState([]);
    const [artistsShouldKnow, setArtistsShouldKnow] = useState([]);
    const { getAccessToken, user } = useUser();

    useEffect(() => {
        const loadTopMusic = async () => {
            try {
                let res = await authAPI(await getAccessToken()).get(`${endpoints.songs}?cate=1`);
                setTopMusic(res.data.results);
            } catch (error) {
                console.error(error);
            }
        };

        const loadRecentlyMusic = async () => {
            try {
                let res = await authAPI(await getAccessToken()).get(`${endpoints.songs}?cate=2`);
                setRecentlyMusic(res.data.results);
            } catch (error) {
                console.error(error);
            }
        };

        const loadArtistsShouldKnow = async () => {
            try {
                let res = await API.get(`${endpoints.users}?cate=1`);
                setArtistsShouldKnow(res.data.results);
            } catch (error) {
                console.error(error);
            }
        };

        loadTopMusic();
        loadRecentlyMusic();
        loadArtistsShouldKnow();
    }, [getAccessToken]);

    return (
        <Page title={"Home"}>
            <Carousel label='Bài hát hàng đầu' items={topMusic} />
            {user && <Carousel label='Nghe gần đây' items={recentlyMusic} />}
            <Carousel label='Nghệ sĩ bạn nên biết' items={artistsShouldKnow} type='artist'/>
        </Page>
    )
}

export default HomePage;