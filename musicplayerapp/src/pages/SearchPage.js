import React, { useCallback, useEffect, useRef, useState } from 'react';
import Page from '.';
import { LoginRequiredModal, MusicTabView, VerifiedBadge } from '../components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI, endpoints } from '../configs/API';
import '../styles/SearchPage.css';
import { useAudio } from '../configs/AudioContext';
import moment from 'moment';
import { useUser } from '../configs/UserContext';

const SearchPage = () => {
    const { getAccessToken } = useUser();
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [data, setData] = useState({
        songs: [],
        artists: []
    });
    const [page, setPage] = useState({
        songs: 1,
        artists: 1
    });
    const [loading, setLoading] = useState({
        songs: false,
        artists: false
    });
    const [activeTab, setActiveTab] = useState('Bài hát');
    const observerRefs = useRef({
        songs: null,
        artists: null
    });
    const loadMoreRefs = useRef({
        songs: null,
        artists: null
    });

    const updatePage = (field, value) => {
        setPage(prev => ({ ...prev, [field]: value }));
    };

    const updateData = (field, newData, append = false) => {
        setData(prev => ({
            ...prev,
            [field]: append ? [...prev[field], ...newData] : newData,
        }));
    };

    const updateLoading = (field, value) => {
        setLoading(prev => ({ ...prev, [field]: value }));
    };

    const loadItems = useCallback(
        async (field, endpoint, append = false) => {
            if (page[field] > 0) {
                updateLoading(field, true);
                try {
                    const url = `${endpoint}?q=${query}&page=${page[field]}`;
                    const res = await authAPI(await getAccessToken()).get(url);

                    if (res.data.next === null) updatePage(field, 0);

                    updateData(field, res.data.results, append);
                } catch (error) {
                    console.error(error);
                    alert(error);
                } finally {
                    updateLoading(field, false);
                }
            }
        },
        [page, query, getAccessToken]
    );

    const loadMore = useCallback((field, endpoint) => {
        if (page[field] > 0 && !loading[field]) {
            updatePage(field, page[field] + 1);
            loadItems(field, endpoint, true);
        }
    }, [page, loading, loadItems]);

    useEffect(() => {
        if (activeTab === 'Bài hát') {
            loadItems('songs', endpoints.songs);
        } else if (activeTab === 'Nghệ sĩ') {
            loadItems('artists', endpoints.users);
        }
    }, [activeTab, query, loadItems]);

    useEffect(() => {
        const newQuery = searchParams.get('q') || '';
        setQuery(newQuery);
        setPage({ songs: 1, artists: 1 });
        setData({ songs: [], artists: [] });
    }, [searchParams]);

    useEffect(() => {
        const currentSongsObserver = observerRefs.current.songs;

        if (currentSongsObserver) {
            currentSongsObserver.disconnect();
        }

        const callback = (entries) => {
            if (entries[0].isIntersecting && page.songs > 0) {
                loadMore('songs', endpoints.songs);
            }
        };

        const newSongsObserver = new IntersectionObserver(callback);
        observerRefs.current.songs = newSongsObserver;

        if (loadMoreRefs.current.songs) {
            newSongsObserver.observe(loadMoreRefs.current.songs);
        }

        return () => {
            if (currentSongsObserver) {
                currentSongsObserver.disconnect();
            }
        };
    }, [loadMore, page.songs]);

    useEffect(() => {
        const currentArtistsObserver = observerRefs.current.artists;

        if (currentArtistsObserver) {
            currentArtistsObserver.disconnect();
        }

        const callback = (entries) => {
            if (entries[0].isIntersecting && page.artists > 0) {
                loadMore('artists', endpoints.users);
            }
        };

        const newArtistsObserver = new IntersectionObserver(callback);
        observerRefs.current.artists = newArtistsObserver;

        if (loadMoreRefs.current.artists) {
            newArtistsObserver.observe(loadMoreRefs.current.artists);
        }

        return () => {
            if (currentArtistsObserver) {
                currentArtistsObserver.disconnect();
            }
        };
    }, [loadMore, page.artists]);

    const handleTabChange = (label) => {
        setActiveTab(label);
    };

    const tabs = [
        // {
        //     label: 'Tất cả',
        //     content: (
        //         <div>
        //             {songs.map((song) => (
        //                 <div key={song.id}>
        //                     <h6>{song.name}</h6>
        //                 </div>
        //             ))}
        //         </div>
        //     ),
        // },
        {
            label: 'Bài hát',
            content: (
                <div>
                    {data.songs.map((song) => (
                        <SongItem key={song.id} song={song} />
                    ))}
                    {page.songs > 0 && (
                        <div ref={el => loadMoreRefs.current.songs = el} className="load-more-container">
                            {loading.songs && <p>Loading...</p>}
                        </div>
                    )}
                </div>
            ),
        },
        {
            label: 'Nghệ sĩ',
            content: (
                <div>
                    {data.artists.map((artist) => (
                        <ArtistItem key={artist.id} artist={artist} state={{ isModalOpen, setIsModalOpen }} />
                    ))}
                    {page.artists > 0 && (
                        <div ref={el => loadMoreRefs.current.artists = el} className="load-more-container">
                            {loading.artists && <p>Loading...</p>}
                        </div>
                    )}
                </div>
            ),
        },
        {
            label: 'Albums',
            content: (
                <ul>
                    {/* {albums.map((album) => (
                        <li key={album.id}>{album.name}</li>
                    ))} */}
                </ul>
            ),
        },
        {
            label: 'Danh sách phát',
            content: (
                <ul>
                    {/* {albums.map((album) => (
                        <li key={album.id}>{album.name}</li>
                    ))} */}
                </ul>
            ),
        },
    ];

    return (
        <Page title={`Kết quả cho "${query}"`}>
            <div className="content-container" style={{ height: '85%' }}>
                <div style={{ width: '100%', position: 'relative' }}>
                    <MusicTabView
                        tabs={tabs} query={query} activeTab={activeTab}
                        onTabChange={handleTabChange}
                        state={{ isModalOpen, setIsModalOpen }} />
                </div>
            </div>
            <LoginRequiredModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen} />
        </Page>
    );
};

const SongItem = ({ song }) => {
    const { togglePlayPauseNewSong, isPlaying, currentSong,
        setCurrentSong
    } = useAudio();
    const { getAccessToken } = useUser();
    const [item, setItem] = useState(song);
    const navigate = useNavigate();

    const togglePlayPause = (song) => {
        togglePlayPauseNewSong(song);
    };

    const like = async () => {
        try {
            let token = await getAccessToken();
            let res = await authAPI(token).post(endpoints.like(item.id));
            setItem(res.data);

            if (isPlaying && currentSong.id === item.id)
                setCurrentSong(res.data);
        } catch (error) {
            alert(error);
        }
    };

    const goToDetails = () => {
        navigate(`/songs/${item.id}/`);
    }

    return (
        <div key={item.id} className='d-flex item'>
            <img onClick={goToDetails}
                src={item.image} alt={item.title}
                width={120} height={120} className='song-item-image' />
            <div className='song-item-button'>
                <button
                    className="play-button"
                    title="Phát bài hát"
                    onClick={() => togglePlayPause(item)}>
                    {isPlaying && currentSong?.id === item.id ?
                        <i class="fa-solid fa-pause"></i> :
                        <i class="fa-solid fa-play"></i>}
                </button>
            </div>
            <div className='text-start w-100'>
                <div className='d-flex justify-content-between w-100'>
                    <span className='song-item-uploader'>{item.uploader.name}</span>
                    <span className='text-end text-info'>{moment(item.created_date).fromNow()}</span>
                </div>
                <h5 className='song-item-title mb-1' onClick={goToDetails}>{item.title}</h5>
                <p className='d-block w-100 song-item-artists'>Nghệ sĩ: {item.artists}</p>
                <div className="d-flex align-items-center mb-3">
                    <div className="button-group">
                        {item.liked !== null && <button
                            type="button"
                            onClick={like}
                            className={`me-4 ${item.liked ? 'liked' : ''}`}>
                            <i class="fa-solid fa-heart me-1"></i> {item.liked ? 'Bỏ thích' : 'Thích'}
                        </button>}
                        <div className="mt-md-2">
                            <span className="me-4">
                                <i class="fa-solid fa-heart me-1"></i> {item.likes}
                            </span>
                            <span>
                                <i class="fa-solid fa-play me-1"></i> {item.streams}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

const ArtistItem = ({ artist, state }) => {
    const [item, setItem] = useState(artist);
    const { setIsModalOpen } = state;
    const { getAccessToken, user } = useUser();
    const navigate = useNavigate();

    const goToArtist = () => {
        navigate(`/profile/${item.id}/`);
    };

    const follow = async () => {
        if (user) {
            try {
                let res = await authAPI(await getAccessToken())
                    .post(endpoints.follow(item?.id));
                setItem(res.data);
            } catch (error) {
                console.error(error);
                alert("Lỗi");
            }
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <div key={item.id} className='d-flex item'>
            <img onClick={goToArtist}
                src={item.avatar} alt={item.name}
                width={120} height={120} className='artist-item-image rounded-circle' />
            <div className='ms-4 text-start mt-1'>
                <h5 onClick={goToArtist}>
                    {item.name}
                    {item.info?.verified && <VerifiedBadge />}
                </h5>
                <div className='mb-2 mt-1 d-flex justify-content-evenly w-100' onClick={goToArtist}>
                    <div className='d-flex align-items-center'>
                        <i class="fa-solid fa-users text-white"></i>
                        <p className='mb-0 ms-1'>{item.followers}</p>
                    </div>
                    <div className='d-flex align-items-center ms-2'>
                        <i class="fa-solid fa-music text-white"></i>
                        <p className='mb-0 ms-1'>{item.songs}</p>
                    </div>
                </div>
                <button onClick={follow}
                    className={`mt-1 mb-2 follow-button ${item?.followed ? 'followed' : ''}`}>
                    {item?.followed ? <>
                        <i class="fa-solid fa-user-check"></i>
                        <p className='d-none d-lg-inline text-black'> Đã theo dõi</p>
                    </> : <>
                        <i class="fa-solid fa-user-plus"></i>
                        <p className='d-inline text-black p-1'> Theo dõi</p>
                    </>}
                </button>
            </div>
        </div>
    )
}

export default SearchPage;