import React, { useCallback, useEffect, useRef, useState } from 'react';
import '../styles/LibraryPage.css';
import Page from '.';
import { useUser } from '../configs/UserContext';
import { authAPI, endpoints } from '../configs/API';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../configs/AudioContext';
import { debounce } from 'lodash';

const LibraryPage = () => {

    return (
        <Page title={'Library'}>
            <div className='library-container'>
                <TabView />
            </div>
        </Page>
    )
};

const TabView = () => {
    const [activeTab, setActiveTab] = useState(1);

    const renderTabContent = () => {
        switch (activeTab) {
            // case 0:
            //     return <div>Overview Content</div>;
            case 1:
                return <Likes />;
            case 2:
                return <Playlists />;
            case 3:
                return <Albums />;
            case 4:
                return <Following />;
            // case 5:
            //     return <div>History Content</div>;
            default:
                return null;
        }
    };

    return (
        <div className="tabview mt-3">
            <div className="tabs">
                {/* <div className={`tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>Overview</div> */}
                <div className={`tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>Đã thích</div>
                <div className={`tab ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>Playlists</div>
                <div className={`tab ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)}>Albums</div>
                <div className={`tab ${activeTab === 4 ? 'active' : ''}`} onClick={() => setActiveTab(4)}>Đã theo dõi</div>
                {/* <div className={`tab ${activeTab === 5 ? 'active' : ''}`} onClick={() => setActiveTab(5)}>History</div> */}
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
    const [loading, setLoading] = useState(false);
    const loadMoreRef = useRef(null);
    const observerRef = useRef(null);
    const { getAccessToken } = useUser();

    const updateSongs = (newData, append = false) => {
        setSongs(prev => append ? [...newData, ...prev] : newData);
    };

    const loadSongs = useCallback(async (append = false) => {
        if (page > 0) {
            setLoading(true);
            try {
                let url = `${endpoints.songs}?likes=true&q=${query.trim()}&page=${page}`;
                let res = await authAPI(await getAccessToken()).get(url);
                if (!res.data.next) setPage(0);
                updateSongs(res.data.results, append);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    }, [getAccessToken, query, page]);

    useEffect(() => {
        setSongs([]);
        setPage(1);
    }, [query]);

    useEffect(() => {
        loadSongs();
    }, [loadSongs]);

    const loadMore = useCallback(() => {
        if (page > 0 && !loading && songs.length > 0) {
            setPage(p => p + 1);
            loadSongs(true);
        }
    }, [loading, page, songs, loadSongs]);

    const debouncedLoadMore = useRef(debounce(loadMore, 2000)).current;

    useEffect(() => {
        const callback = (entries) => {
            if (entries[0].isIntersecting && page > 0 && !loading) {
                debouncedLoadMore();
            }
        };

        observerRef.current = new IntersectionObserver(callback);

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loadMore, page, loading, debouncedLoadMore]);

    return (
        <div className='song-card-container'>
            <div className='w-100 d-flex justify-content-between flex-wrap'>
                <p className='fs-5 p-0'>Hãy nghe lại các bài hát bạn đã thích:</p>
                <input className="song-card-query"
                    placeholder='Tìm kiếm...'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)} />
            </div>
            {songs.map((song) => <SongCard key={song.id} song={song} />)}
            {page > 0 && (
                <div ref={el => loadMoreRef.current = el} className="load-more-container">
                    {loading && <p>Loading...</p>}
                </div>
            )}
        </div>
    )
};

const Playlists = () => {
    const [playlists, setPlaylists] = useState([]);;
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const loadMoreRef = useRef(null);
    const observerRef = useRef(null);
    const { getAccessToken, user } = useUser();

    const updatePlaylists = (newData, append = false) => {
        setPlaylists(prev => append ? [...prev, ...newData] : newData);
    };

    const loadPlaylists = useCallback(async (append = false) => {
        if (page > 0 && user?.id) {
            setLoading(true);
            try {
                let url = `${endpoints.playlists}?creator=${user.id}&q=${query.trim()}&page=${page}&type=4`;
                let res = await authAPI(await getAccessToken()).get(url);
                if (res.data.next === null) setPage(0);
                updatePlaylists(res.data.results, append);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    }, [getAccessToken, query, page, user?.id]);

    useEffect(() => {
        setPlaylists([]);
        setPage(1);
    }, [query]);

    useEffect(() => {
        loadPlaylists();
    }, [loadPlaylists]);

    const loadMore = useCallback(() => {
        if (!loading && playlists.length > 0) {
            setPage(p => p + 1);
            loadPlaylists(true);
        }
    }, [loading, playlists, loadPlaylists]);

    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        const callback = (entries) => {
            if (entries[0].isIntersecting && page > 0) {
                loadMore();
            }
        };

        observerRef.current = new IntersectionObserver(callback);

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loadMore, page]);

    return (
        <div className='song-card-container'>
            <div className='w-100 d-flex justify-content-between flex-wrap'>
                <p className='fs-5 p-0'>Hãy nghe các bài hát trong playlist của bạn:</p>
                <input className="song-card-query"
                    placeholder='Tìm kiếm...'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)} />
            </div>
            {playlists.map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} />)}
            {page > 0 && (
                <div ref={el => loadMoreRef.current = el} className="load-more-container">
                    {loading && <p>Loading...</p>}
                </div>
            )}
        </div>
    )
};

const Albums = () => {
    const [albums, setAlbums] = useState([]);;
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const loadMoreRef = useRef(null);
    const observerRef = useRef(null);
    const { getAccessToken, user } = useUser();

    const updateAlbums = (newData, append = false) => {
        setAlbums(prev => append ? [...prev, ...newData] : newData);
    };

    const loadAlbums = useCallback(async (append = false) => {
        if (page > 0 && user?.id) {
            setLoading(true);
            try {
                let url = `${endpoints.playlists}?creator=${user.id}&q=${query.trim()}&page=${page}`;
                let res = await authAPI(await getAccessToken()).get(url);
                if (res.data.next === null) setPage(0);
                updateAlbums(res.data.results, append);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    }, [getAccessToken, query, page, user?.id]);

    useEffect(() => {
        setAlbums([]);
        setPage(1);
    }, [query]);

    useEffect(() => {
        loadAlbums();
    }, [loadAlbums]);

    const loadMore = useCallback(() => {
        if (!loading && albums.length > 0) {
            setPage(p => p + 1);
            loadAlbums(true);
        }
    }, [loading, albums, loadAlbums]);

    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        const callback = (entries) => {
            if (entries[0].isIntersecting && page > 0) {
                loadMore();
            }
        };

        observerRef.current = new IntersectionObserver(callback);

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loadMore, page]);

    return (
        <div className='song-card-container'>
            <div className='w-100 d-flex justify-content-between flex-wrap'>
                <p className='fs-5 p-0'>Hãy nghe các bài hát trong albums của bạn:</p>
                <input className="song-card-query"
                    placeholder='Tìm kiếm...'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)} />
            </div>
            {albums.map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} />)}
            {page > 0 && (
                <div ref={el => loadMoreRef.current = el} className="load-more-container">
                    {loading && <p>Loading...</p>}
                </div>
            )}
        </div>
    )
};

const Following = () => {
    const [following, setFollowing] = useState([]);;
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const loadMoreRef = useRef(null);
    const observerRef = useRef(null);
    const { getAccessToken, user } = useUser();

    const updateFollowing = (newData, append = false) => {
        setFollowing(prev => append ? [...prev, ...newData] : newData);
    };

    const loadFollowing = useCallback(async (append = false) => {
        if (page > 0 && user?.id) {
            setLoading(true);
            try {
                let url = `${endpoints.users}?follower=${user.id}&q=${query.trim()}&page=${page}`;
                let res = await authAPI(await getAccessToken()).get(url);
                if (res.data.next === null) setPage(0);
                updateFollowing(res.data.results, append);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    }, [getAccessToken, query, page, user?.id]);

    useEffect(() => {
        setFollowing([]);
        setPage(1);
    }, [query]);

    useEffect(() => {
        loadFollowing();
    }, [loadFollowing]);

    const loadMore = useCallback(() => {
        if (!loading && following.length > 0) {
            setPage(p => p + 1);
            loadFollowing(true);
        }
    }, [loading, following, loadFollowing]);

    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        const callback = (entries) => {
            if (entries[0].isIntersecting && page > 0) {
                loadMore();
            }
        };

        observerRef.current = new IntersectionObserver(callback);

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loadMore, page]);

    return (
        <div className='song-card-container'>
            <div className='w-100 d-flex justify-content-between flex-wrap'>
                <p className='fs-5 p-0'>Hãy nghe những gì những người bạn theo dõi đã đăng:</p>
                <input className="song-card-query"
                    placeholder='Tìm kiếm...'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)} />
            </div>
            {following.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}
            {page > 0 && (
                <div ref={el => loadMoreRef.current = el} className="load-more-container">
                    {loading && <p>Loading...</p>}
                </div>
            )}
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
    const { togglePlayPauseNewSong, isPlaying, playlistId, currentSong } = useAudio();

    const goToDetails = () => { navigate(`/playlists/${item.id}/`); };

    const goToArtist = () => { navigate(`/profile/${item.uploader.id}/`); };

    const play = () => {
        if (currentSong && `${playlistId}` === `${item.id}`)
            togglePlayPauseNewSong(currentSong, playlist.id);
        else {
            if (item.details?.length > 0) {
                togglePlayPauseNewSong(item.details[0].song, playlist.id);
            }
        }
    };

    return (
        <div className='song-card'>
            <button className="play-button"
                title="Phát bài hát"
                onClick={play}>
                {isPlaying && `${playlistId}` === `${item.id}` ?
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

const ArtistCard = ({ artist }) => {
    const [item,] = useState(artist);
    const navigate = useNavigate();

    const goToArtist = () => { navigate(`/profile/${item.id}/`); };

    return (
        <div className='artist-card cursor-pointer' onClick={goToArtist}>
            <img
                src={item.avatar} alt={item.title}
                className='artist-card-image' />
            <h6 className='artist-card-name'>{item.name}</h6>
            <span className='artist-card-following'>
                <i class="fa-solid fa-users text-white me-2"></i>{item.followers}
            </span>
        </div>
    )
};

export default LibraryPage;