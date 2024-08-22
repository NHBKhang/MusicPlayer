import React, { useEffect, useState } from 'react';
import '../styles/LibraryPage.css';
import Page from '.';
import { useUser } from '../configs/UserContext';
import { authAPI, endpoints } from '../configs/API';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../configs/AudioContext';

const LibraryPage = () => {

    return (
        <Page title={'Library'}>
            <div className='content-container library-container'>
                <TabView />
            </div>
        </Page>
    )
};

const TabView = () => {
    const [activeTab, setActiveTab] = useState(0);

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <div>Overview Content</div>;
            case 1:
                return <Likes />;
            case 2:
                return <Playlists />;
            case 3:
                return <div>Albums Content</div>;
            case 4:
                return <div>Following Content</div>;
            case 5:
                return <div>History Content</div>;
            default:
                return null;
        }
    };

    return (
        <div className="tabview">
            <div className="tabs">
                <div className={`tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>Overview</div>
                <div className={`tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>Likes</div>
                <div className={`tab ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>Playlists</div>
                <div className={`tab ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)}>Albums</div>
                <div className={`tab ${activeTab === 4 ? 'active' : ''}`} onClick={() => setActiveTab(4)}>Following</div>
                <div className={`tab ${activeTab === 5 ? 'active' : ''}`} onClick={() => setActiveTab(5)}>History</div>
            </div>
            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

const Likes = () => {
    const [songs, setSongs] = useState([]);;
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const { getAccessToken } = useUser();

    useEffect(() => {
        setSongs([]);
        setPage(1);
    }, [query]);

    useEffect(() => {
        const loadSongs = async () => {
            if (page > 0) {
                try {
                    let url = `${endpoints.songs}?likes=true&q=${query.trim()}&page=${page}`;
                    let res = await authAPI(await getAccessToken()).get(url);
                    setSongs(res.data.results);
                } catch (error) {
                    console.error(error);
                }
            }
        };

        loadSongs();
    }, [getAccessToken, query, page]);

    return (
        <div className='song-card-container'>
            <div className='w-100 d-flex justify-content-between flex-wrap'>
                <p className='fs-5 p-0'>Nghe lại các bài hát bạn đã thích:</p>
                <input className="song-card-query"
                    placeholder='Tìm kiếm...'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)} />
            </div>
            {songs.map((song) => <SongCard key={song.id} song={song} />)}
        </div>
    )
};

const Playlists = () => {
    const [playlists, setPlaylists] = useState([]);;
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const { getAccessToken, user } = useUser();

    useEffect(() => {
        setPlaylists([]);
        setPage(1);
    }, [query]);

    useEffect(() => {
        const loadSongs = async () => {
            if (page > 0 && user?.id) {
                try {
                    let url = `${endpoints.playlists}?creator=${user.id}&q=${query.trim()}&page=${page}&type=4`;
                    let res = await authAPI(await getAccessToken()).get(url);
                    setPlaylists(res.data.results);
                } catch (error) {
                    console.error(error);
                }
            }
        };

        loadSongs();
    }, [getAccessToken, query, page, user?.id]);

    return (
        <div className='song-card-container'>
            <div className='w-100 d-flex justify-content-between flex-wrap'>
                <p className='fs-5 p-0'>Nghe lại các bài hát trong playlist của bạn:</p>
                <input className="song-card-query"
                    placeholder='Tìm kiếm...'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)} />
            </div>
            {playlists.map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} />)}
        </div>
    )
};

const SongCard = ({ song }) => {
    const [item,] = useState(song);
    const navigate = useNavigate();
    const { togglePlayPauseNewSong, isPlaying, currentSong } = useAudio();

    const goToDetails = () => { navigate(`/songs/${item.id}/`); };

    const goToArtist = () => { navigate(`/profile/${item.uploader.id}/`); };

    return (
        <div className='song-card'>
            <button className="play-button"
                title="Phát bài hát"
                onClick={() => togglePlayPauseNewSong(item)}>
                {isPlaying && currentSong?.id === item.id ?
                    <i class="fa-solid fa-pause"></i> :
                    <i class="fa-solid fa-play"></i>}
            </button>
            <img onClick={goToDetails}
                src={item.image} alt={item.title}
                className='song-card-image' />
            <h6 className='song-card-title' onClick={goToDetails}>{item.title}</h6>
            <span className='song-card-artists' onClick={goToArtist}>{item.artists}</span>
        </div>
    )
};

const PlaylistCard = ({ playlist }) => {
    const [item,] = useState(playlist);
    const navigate = useNavigate();
    const { togglePlayPauseNewSong, isPlaying, playlistId } = useAudio();

    const goToDetails = () => { navigate(`/playlists/${item.id}/`); };

    const goToArtist = () => { navigate(`/profile/${item.uploader.id}/`); };

    const play = () => {
        if (item.details?.length > 0) {
            togglePlayPauseNewSong(item.details[0].song, playlist.id)
        }
    };

    return (
        <div className='song-card'>
            <button className="play-button"
                title="Phát bài hát"
                onClick={play}>
                {isPlaying && playlistId === item.id ?
                    <i class="fa-solid fa-pause"></i> :
                    <i class="fa-solid fa-play"></i>}
            </button>
            <img onClick={goToDetails}
                src={item?.image ?? (item?.details && item.details[0]?.song?.image)} alt={item.title}
                className='song-card-image' />
            <h6 className='song-card-title' onClick={goToDetails}>{item.title}</h6>
            <span className='song-card-artists' onClick={goToArtist}>{item.creator.name}</span>
        </div>
    )
};

export default LibraryPage;