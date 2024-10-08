import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Page from ".";
import { useUser } from "../configs/UserContext";
import '../styles/ProfilePage.css';
import { useParams } from "react-router-dom";
import { LoginRequiredModal, PlaylistItem, SongItem, UserModal, VerifiedBadge, VideoItem } from "../components";
import { authAPI, endpoints } from "../configs/API";
import { useAudio } from "../configs/AudioContext";

const ProfilePage = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const { user, getAccessToken } = useUser();
    const { currentSong } = useAudio();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (parseInt(user?.id) === parseInt(id)) {
            setProfile(user);
            return;
        }

        const loadUser = async () => {
            try {
                let res = await authAPI(await getAccessToken()).get(endpoints.user(id));
                setProfile(res.data);
            } catch (error) {
                alert(error);
            }
        };

        loadUser();
    }, [id, user, getAccessToken]);

    useEffect(() => {
        setProfile(prev => ({
            ...prev,
            followed: currentSong?.followed
        }));
    }, [currentSong?.followed]);

    const follow = async () => {
        if (user) {
            try {
                let res = await authAPI(await getAccessToken())
                    .post(endpoints.follow(profile?.id));
                setProfile(res.data);
            } catch (error) {
                console.error(error);
                alert("Lỗi");
            }
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <Page title={`Stream ${profile?.name} music`}>
            <div className="row profile-container">
                <div className="profile-detail mt-4">
                    <img
                        src={profile?.avatar}
                        alt={profile?.name}
                        className="profile-cover rounded-circle" />
                    <div className="mt-1">
                        <h4 className="profile-display-name">
                            {profile?.info?.display_name ?? profile?.name}
                            {profile?.info?.verified && <VerifiedBadge />}
                        </h4>
                        <p className="profile-name">
                            {`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`}
                        </p>
                    </div>
                    {profile?.info?.bio && <div className="profile-bio w-100"><p>
                        {profile?.info?.bio}
                    </p></div>}
                </div>
                <div className="info-container">
                    <div className="info-item">
                        <span>Người theo dõi</span>
                        <span>{profile?.followers}</span>
                    </div>
                    <div className="info-item">
                        <span>Đang theo dõi</span>
                        <span>{profile?.following}</span>
                    </div>
                    <div className="info-item">
                        <span>Số bài hát</span>
                        <span>{profile?.songs}</span>
                    </div>
                </div>
                {user?.id === profile?.id ?
                    <button
                        className={`mt-1 mb-2 follow-button ${profile?.followed ? 'followed' : ''}`}
                        onClick={() => setVisible(true)}>
                        <i class="fa-solid fa-user-pen"></i>
                        <p className='d-none d-sm-inline text-black'> Chỉnh sửa</p>
                    </button> : <button
                        className={`mt-1 mb-2 follow-button ${profile?.followed ? 'followed' : ''}`}
                        onClick={follow}>
                        {profile?.followed ? (<>
                            <i class="fa-solid fa-user-check"></i>
                            <p className='d-none d-sm-inline text-black'> Đã theo dõi</p>
                        </>) : (<>
                            <i class="fa-solid fa-user-plus"></i>
                            <p className='d-none d-sm-inline text-black p-1'> Theo dõi</p>
                        </>)}
                    </button>
                }
            </div>
            <UserProfileTabs
                profile={profile}
                getAccessToken={getAccessToken}
                state={{ isModalOpen, setIsModalOpen }} />
            <LoginRequiredModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)} />
            <UserModal
                visible={visible}
                onClose={() => setVisible(false)} />
        </Page>
    );
};

const UserProfileTabs = ({ profile, getAccessToken, state }) => {
    const tabs = ['Tất cả', 'Bài hát', 'Phổ biến', 'MV', 'Albums', 'Playlists'];
    const tabKeys = useMemo(() => ['all', 'songs', 'popular', 'mv', 'albums', 'playlists'], []);
    const [activeTab, setActiveTab] = useState(0);
    const urls = useMemo(() => ({
        all: (userId, page) =>
            `${endpoints["mixed-search"]}?user=${userId}&page=${page}`,
        songs: (userId, page) =>
            `${endpoints.songs}?uploader=${userId}&page=${page}`,
        popular: (userId, page) =>
            `${endpoints.songs}?uploader=${userId}&page=${page}&cate=1`,
        mv: (userId, page) =>
            `${endpoints["music-videos"]}?uploader=${userId}&page=${page}`,
        albums: (userId, page) =>
            `${endpoints.playlists}?creator=${userId}&page=${page}`,
        playlists: (userId, page) =>
            `${endpoints.playlists}?creator=${userId}&page=${page}&type=4`
    }), []);
    const [data, setData] = useState({
        all: [],
        songs: [],
        popular: [],
        mv: [],
        albums: [],
        playlists: []
    });
    const [page, setPage] = useState({
        all: 1,
        songs: 1,
        popular: 1,
        mv: 1,
        albums: 1,
        playlists: 1
    });
    const [loading, setLoading] = useState({
        all: false,
        songs: false,
        popular: false,
        mv: false,
        albums: false,
        playlists: false
    });
    const loadMoreRefs = useRef({});

    const handleTabClick = (index) => setActiveTab(index)

    const updatePage = (field, value) => setPage(prev => ({ ...prev, [field]: value }))

    const updateData = (field, newData, append = false) => {
        setData(prev => ({
            ...prev,
            [field]: append ? [...prev[field], ...newData] : newData,
        }));
    };

    const updateLoading = (field, value) => setLoading(prev => ({ ...prev, [field]: value }))

    const loadItems = useCallback(
        async (field, append = false) => {
            if (page[field] > 0 && profile?.id) {
                updateLoading(field, true);
                try {
                    const url = urls[field](profile?.id, page[field]);
                    const res = await authAPI(await getAccessToken()).get(url);

                    if (res.data.next === null) updatePage(field, 0);

                    updateData(field, res.data.results, append);
                } catch (error) {
                    console.error(error);
                } finally {
                    updateLoading(field, false);
                }
            }
        },
        [page, getAccessToken, profile?.id, urls]
    );

    useEffect(() => {
        setData({ all: [], songs: [], popular: [], mv: [], albums: [], playlists: [] });
        setPage({ all: 1, songs: 1, popular: 1, mv: 1, albums: 1, playlists: 1 });
        setLoading({ all: false, songs: false, popular: false, mv: false, albums: false, playlists: false });
    }, [profile?.id]);

    useEffect(() => {
        const loadMore = (field) => {
            updatePage(field, page[field] + 1);
            loadItems(field, true);
        };

        const currentField = tabKeys[activeTab];

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading[currentField] &&
                page[currentField] > 0) {
                loadMore(currentField);
            }
        });

        const loadMoreElement = loadMoreRefs.current[currentField];

        if (loadMoreElement) {
            observer.observe(loadMoreElement);
        }

        return () => {
            if (loadMoreElement) {
                observer.unobserve(loadMoreElement);
            }
        };
    }, [loading, page, data, tabKeys, activeTab, loadItems]);

    return (
        <div className="user-profile-tabs">
            <div className="tab-view">
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        className={`tab ${activeTab === index ? 'active' : ''}`}
                        onClick={() => handleTabClick(index)}>
                        {tab}
                    </div>
                ))}
            </div>
            <div className="tracks-container">
                {data[tabKeys[activeTab]].map(item => {
                    if (activeTab === 0) {
                        return item.type === 'song' ? (
                            <SongItem
                                key={`track-${tabKeys[activeTab]}-${item.id}`}
                                song={item}
                                state={state} />
                        ) : (
                            <PlaylistItem
                                key={`playlist-${tabKeys[activeTab]}-${item.id}`}
                                playlist={item}
                                state={state} />
                        );
                    }

                    if (activeTab === 1 || activeTab === 2) {
                        return (
                            <SongItem
                                key={`track-${tabKeys[activeTab]}-${item.id}`}
                                song={item}
                                state={state} />
                        );
                    }

                    if (activeTab === 3) {
                        return (
                            <VideoItem
                                key={`mv-${tabKeys[activeTab]}-${item.id}`}
                                video={item} />
                        );
                    }

                    if (activeTab === 4 || activeTab === 5) {
                        return (
                            <PlaylistItem
                                key={`playlist-${tabKeys[activeTab]}-${item.id}`}
                                playlist={item} />
                        );
                    }
                    return null;
                })}

                {page[tabKeys[activeTab]] > 0 && (
                    <div ref={el => loadMoreRefs.current[tabKeys[activeTab]] = el} className="load-more-container">
                        {loading[tabKeys[activeTab]] && <p>Loading...</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;