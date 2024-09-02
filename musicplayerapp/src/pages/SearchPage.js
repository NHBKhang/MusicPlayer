import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Page from '.';
import { ArtistItem, LoginRequiredModal, MusicTabView, PlaylistItem, SongItem } from '../components';
import { useSearchParams } from 'react-router-dom';
import { authAPI, endpoints } from '../configs/API';
import '../styles/SearchPage.css';
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
                <div className='search-container'>
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
                <div className='search-container'>
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
                <div className='search-container'>
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
                <div className='search-container'>
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
                <div className='search-container'>
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

export default SearchPage;