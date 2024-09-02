import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    const [genreQuery, setGenreQuery] = useState(searchParams.get('genre') || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const tabKeys = useMemo(() => ['all', 'songs', 'artists', 'albums', 'playlists'], []);
    const [activeTab, setActiveTab] = useState(0);
    const genreParam = !!searchParams.get('genre');

    const urls = useMemo(() => ({
        all: (query, page) => `${endpoints['mixed-search']}?q=${query}&page=${page}&type=0`,
        songs: (query, page, genre) => `${endpoints.songs}?q=${query}&page=${page}&genre=${genre}`,
        artists: (query, page) => `${endpoints.users}?q=${query}&page=${page}`,
        albums: (query, page, genre) => `${endpoints.playlists}?q=${query}&page=${page}&genre=${genre}`,
        playlists: (query, page, genre) => `${endpoints.playlists}?q=${query}&page=${page}&type=4&genre=${genre}`
    }), []);

    const [data, setData] = useState({
        all: [],
        songs: [],
        artists: [],
        albums: [],
        playlists: []
    });

    const [page, setPage] = useState({
        all: 1,
        songs: 1,
        artists: 1,
        albums: 1,
        playlists: 1
    });

    const [loading, setLoading] = useState({
        all: false,
        songs: false,
        artists: false,
        albums: false,
        playlists: false
    });

    const observerRefs = useRef({});
    const loadMoreRefs = useRef({});

    const updatePage = (field, value) => setPage(prev => ({ ...prev, [field]: value }));
    const updateData = (field, newData, append = false) => setData(prev => ({
        ...prev,
        [field]: append ? [...prev[field], ...newData] : newData,
    }));
    const updateLoading = (field, value) => setLoading(prev => ({ ...prev, [field]: value }));

    const loadItems = useCallback(async (field, append = false) => {
        if (page[field] > 0) {
            updateLoading(field, true);
            try {
                const url = urls[tabKeys[activeTab]](query, page[field], genreQuery);
                const res = await authAPI(await getAccessToken()).get(url);

                if (res.data.next === null) updatePage(field, 0);
                console.info(res.data.results)
                updateData(field, res.data.results, append);
            } catch (error) {
                console.error('Failed to load items:', error);
            } finally {
                updateLoading(field, false);
            }
        }
    }, [page, query, genreQuery, activeTab, tabKeys, urls, getAccessToken]);

    const loadMore = useCallback((field) => {
        if (page[field] > 0 && !loading[field] && data[field].length > 0) {
            updatePage(field, page[field] + 1);
            loadItems(field, true);
        }
    }, [page, loading, data, loadItems]);

    useEffect(() => {
        const tabKey = tabKeys[activeTab];
        loadItems(tabKey);
    }, [activeTab, loadItems, tabKeys]);

    useEffect(() => {
        const newQuery = searchParams.get('q') || '';
        setQuery(newQuery);
        setData({
            all: [],
            songs: [],
            artists: [],
            albums: [],
            playlists: []
        });
        setPage({
            all: 1,
            songs: 1,
            artists: 1,
            albums: 1,
            playlists: 1
        });
        setLoading({
            all: false,
            songs: false,
            artists: false,
            albums: false,
            playlists: false
        });
    }, [searchParams, genreQuery]);

    useEffect(() => {
        if (genreParam) {
            setActiveTab(1);
        }
    }, [genreParam]);

    useEffect(() => {
        const currentField = tabKeys[activeTab];
        const currentObserver = observerRefs.current[currentField];

        if (currentObserver) {
            currentObserver.disconnect();
        }

        const callback = (entries) => {
            if (entries[0].isIntersecting && page[currentField] > 0) {
                loadMore(currentField);
            }
        };

        const newObserver = new IntersectionObserver(callback);
        observerRefs.current[currentField] = newObserver;

        if (loadMoreRefs.current[currentField]) {
            newObserver.observe(loadMoreRefs.current[currentField]);
        }

        return () => {
            if (currentObserver) {
                currentObserver.disconnect();
            }
        };
    }, [activeTab, loadMore, page, tabKeys]);

    const handleTabChange = (index) => {
        setActiveTab(index);
    };

    const tabs = [
        {
            label: 'Tất cả',
            content: (
                <div>
                    {data.all?.map(item => item.type === 'song' ? (
                        <SongItem key={item.id} song={item} state={{ isModalOpen, setIsModalOpen }} />
                    ) : (item.type === 'artist' ? (
                        <ArtistItem key={item.id} artist={item} state={{ isModalOpen, setIsModalOpen }} />
                    ) : (
                        <PlaylistItem key={item.id} playlist={item} />
                    )))}
                    {page.all > 0 && (
                        <div ref={el => loadMoreRefs.current.all = el} className="load-more-container">
                            {loading.all && <p>Loading...</p>}
                        </div>
                    )}
                </div>
            ),
        },
        {
            label: 'Bài hát',
            content: (
                <div>
                    {data.songs?.map(song => (
                        <SongItem key={song.id} song={song} state={{ isModalOpen, setIsModalOpen }} />
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
                    {data.artists?.map(artist => (
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
                <div>
                    {data.albums?.map(album => (
                        <PlaylistItem key={album.id} playlist={album} />
                    ))}
                    {page.albums > 0 && (
                        <div ref={el => loadMoreRefs.current.albums = el} className="load-more-container">
                            {loading.albums && <p>Loading...</p>}
                        </div>
                    )}
                </div>
            ),
        },
        {
            label: 'Danh sách phát',
            content: (
                <div>
                    {data.playlists?.map(playlist => (
                        <PlaylistItem key={playlist.id} playlist={playlist} />
                    ))}
                    {page.playlists > 0 && (
                        <div ref={el => loadMoreRefs.current.playlists = el} className="load-more-container">
                            {loading.playlists && <p>Loading...</p>}
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <Page title={`Kết quả cho "${query}"`}>
            <div style={{ width: '100%', position: 'relative' }}>
                <MusicTabView
                    tabs={tabs}
                    queryset={{ query, genreQuery, setGenreQuery, genreParam }}
                    activeTab={activeTab}
                    onTabChange={handleTabChange} />
            </div>
            <LoginRequiredModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)} />
        </Page>
    );
};

const SongItem = ({ song, state }) => {
    const { togglePlayPauseNewSong, isPlaying, currentSong, setCurrentSong } = useAudio();
    const { setIsModalOpen } = state;
    const { getAccessToken, user } = useUser();
    const [item, setItem] = useState(song);
    const navigate = useNavigate();

    const togglePlayPause = (song) => {
        togglePlayPauseNewSong(song);
    };

    const like = async () => {
        if (user) {
            try {
                let token = await getAccessToken();
                let res = await authAPI(token).post(endpoints.like(item.id));
                setItem(res.data);

                if (isPlaying && currentSong.id === item.id)
                    setCurrentSong(res.data);
            } catch (error) {
                alert(error);
            }
        } else {
            setIsModalOpen(true);
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
        <div key={item.id} className='d-flex item cursor-pointer'>
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
};

const PlaylistItem = ({ playlist }) => {
    const { isPlaying, currentSong, playlistId, togglePlayPauseNewSong, playSong } = useAudio();
    const navigate = useNavigate();
    const [item,] = useState(playlist);
    const [visibleCount, setVisibleCount] = useState(5);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleViewMore = () => {
        if (isExpanded) {
            setVisibleCount(5);
        } else {
            setVisibleCount(item?.details?.length || 0);
        }
        setIsExpanded(!isExpanded);
    };

    const goToDetails = () => navigate(`/playlists/${item.id}/`);

    const goToArtist = () => navigate(`/profile/${item.creator.id}/`);

    const play = () => {
        if (currentSong && `${playlistId}` === `${item?.id}`) {
            togglePlayPauseNewSong(currentSong, item?.id);
        } else {
            if (item?.details?.length > 0) {
                playSong(item.details[0]?.song, item?.id);
            }
        }
    };

    return (
        <div className="playlist-item item cursor-pointer">
            <img
                src={item?.image ?? (item?.details && item.details[0]?.song?.image)}
                alt={item?.title}
                className="track-cover"
                onClick={goToDetails} />
            <div className="w-100">
                <div className="d-flex" style={{ gap: 12 }}>
                    <button
                        className="play-button"
                        title="Phát bài hát"
                        onClick={play}>
                        {isPlaying && `${playlistId}` === `${item?.id}` ?
                            <i className="fa-solid fa-pause"></i> :
                            <i className="fa-solid fa-play"></i>}
                    </button>
                    <div className="playlist-info w-100">
                        <div className='d-flex justify-content-between'>
                            <p className="p-0 m-0" onClick={goToArtist}>{item?.creator?.name}</p>
                            <p className="date">{moment(item?.created_date).fromNow()}</p>
                        </div>
                        <div className='d-flex justify-content-between'>
                            <h5 onClick={goToDetails} className="cursor-pointer">{item?.title}</h5>
                            {!item?.is_public && <span className="privacy">
                                <i className="fa-solid fa-lock"></i> Private
                            </span>}
                        </div>
                    </div>
                </div>
                <div className="track-list-container">
                    <ul className="track-list">
                        {item?.details?.slice(0, visibleCount).map((d, index) => (
                            <li key={index}
                                className={`track-item cursor-pointer${currentSong?.id === d.song?.id ? ' active' : ''}`}
                                onClick={() => playSong(d.song, item?.id)}>
                                <img src={d.song?.image} alt={d.song?.title} className="track-image" />
                                <div className="track-info">
                                    <span>{index + 1}. {`${d.song?.artists} - ${d.song?.title}`}</span>
                                    <span><i className="fa-solid fa-play me-2"></i>{d.song?.streams}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {item?.details?.length > 5 && (
                        <button onClick={handleViewMore} className="view-more-button">
                            {isExpanded ? `View Less` : `View ${item.details.length - 5} more tracks`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
};

export default SearchPage;