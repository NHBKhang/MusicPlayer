import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Page from ".";
import { useUser } from "../configs/UserContext";
import '../styles/ProfilePage.css';
import { useNavigate, useParams } from "react-router-dom";
import { LoginRequiredModal, VerifiedBadge } from "../components";
import { authAPI, endpoints } from "../configs/API";
import { useAudio } from "../configs/AudioContext";
import moment from "moment";

const ProfilePage = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const { user, getAccessToken } = useUser();
    const { currentSong } = useAudio();
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            <div className="content-container">
                <div className="row profile-container">
                    <div className="profile-detail">
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
                    {user?.id !== profile?.id && <button
                        className={`mt-1 mb-2 follow-button ${profile?.followed ? 'followed' : ''}`}
                        onClick={follow}>
                        {profile?.followed ? (<>
                            <i class="fa-solid fa-user-check"></i>
                            <p className='d-none d-sm-inline text-black'> Đã theo dõi</p>
                        </>) : (<>
                            <i class="fa-solid fa-user-plus"></i>
                            <p className='d-none d-sm-inline text-black p-1'> Theo dõi</p>
                        </>)}
                    </button>}
                </div>
                <UserProfileTabs
                    profile={profile}
                    getAccessToken={getAccessToken}
                    state={{ isModalOpen, setIsModalOpen }} />
            </div>
            <LoginRequiredModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen} />
        </Page>
    );
};

const UserProfileTabs = ({ profile, getAccessToken, state }) => {
    const tabs = ['Tất cả', 'Bài hát', 'Phổ biến', 'Albums', 'Playlists'];
    const tabKeys = useMemo(() => ['all', 'songs', 'popular', 'albums', 'playlists'], []);
    const [activeTab, setActiveTab] = useState(0);
    const urls = useMemo(() => ({
        all: (userId, page) =>
            `${endpoints.songs}?uploader=${userId}&page=${page}`,
        songs: (userId, page) =>
            `${endpoints.songs}?uploader=${userId}&page=${page}`,
        popular: (userId, page) =>
            `${endpoints.songs}?uploader=${userId}&page=${page}&cate=1`,
        albums: (userId, page) =>
            `${endpoints.songs}?uploader=${userId}&page=${page}`,
        playlists: (userId, page) =>
            `${endpoints.songs}?uploader=${userId}&page=${page}`
    }), []);
    const [data, setData] = useState({
        all: [],
        songs: [],
        popular: [],
        albums: [],
        playlists: []
    });
    const [page, setPage] = useState({
        all: 1,
        songs: 1,
        popular: 1,
        albums: 1,
        playlists: 1
    });
    const [loading, setLoading] = useState({
        all: false,
        songs: false,
        popular: false,
        albums: false,
        playlists: false
    });
    const observerRefs = useRef({
        all: null,
        songs: null,
        popular: null,
        albums: null,
        playlists: null
    });
    const loadMoreRefs = useRef({
        all: null,
        songs: null,
        popular: null,
        albums: null,
        playlists: null
    });

    const handleTabClick = (index) => {
        setActiveTab(index);
    };

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
        async (field, append = false) => {
            if (page[field] > 0 && profile?.id) {
                updateLoading(field, true);
                try {
                    const url = urls[tabKeys[activeTab]](profile.id, page[field]);
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
        [page, getAccessToken, profile?.id, activeTab, tabKeys, urls]
    );

    const loadMore = useCallback((field) => {
        if (page[field] > 0 && !loading[field] && data[field].length > 0) {
            updatePage(field, page[field] + 1);
            loadItems(field, true);
        }
    }, [page, loading, loadItems, data]);

    useEffect(() => {
        const tabKey = tabKeys[activeTab];
        loadItems(tabKey);
    }, [activeTab, loadItems, tabKeys]);

    useEffect(() => {
        setData({
            all: [],
            songs: [],
            popular: [],
            albums: [],
            playlists: []
        });
        setPage({
            all: 1,
            songs: 1,
            popular: 1,
            albums: 1,
            playlists: 1
        });
        setLoading({
            all: false,
            songs: false,
            popular: false,
            albums: false,
            playlists: false
        });
    }, [profile]);

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

    return (
        <div className="user-profile-tabs">
            <TabView tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
            <div className="tracks-container">
                {data[tabKeys[activeTab]].map(item => (
                    <TrackItem key={item.id} song={item} state={state} />
                ))}
                {page[tabKeys[activeTab]] > 0 && (
                    <div ref={el => loadMoreRefs.current[tabKeys[activeTab]] = el} className="load-more-container">
                        {loading[tabKeys[activeTab]] && <p>Loading...</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

const TabView = memo(({ tabs, activeTab, onTabClick }) => (
    <div className="tab-view">
        {tabs.map((tab, index) => (
            <div
                key={index}
                className={`tab ${activeTab === index ? 'active' : ''}`}
                onClick={() => onTabClick(index)}>
                {tab}
            </div>
        ))}
    </div>
));

const TrackItem = memo(({ song, state }) => {
    const { setIsModalOpen } = state;
    const { getAccessToken, user } = useUser();
    const { isPlaying, currentSong, togglePlayPauseNewSong } = useAudio();
    const navigate = useNavigate();
    const [item, setItem] = useState(song);

    const like = async () => {
        if (user) {
            try {
                let res = await authAPI(await getAccessToken())
                    .post(endpoints.like(item.id));
                setItem(res.data);
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
        <div className="track-item">
            <button
                className="play-button"
                title="Phát bài hát"
                onClick={() => togglePlayPauseNewSong(item)}>
                {isPlaying && currentSong?.id === item.id ?
                    <i class="fa-solid fa-pause"></i> :
                    <i class="fa-solid fa-play"></i>}
            </button>
            <span className="date">{moment(item.created_date).fromNow()}</span>
            <img src={item.image} alt={item.title} className="track-cover" onClick={goToDetails} />
            <div className="track-info w-100">
                <h5 onClick={goToDetails} className="cursor-pointer">{item.title}</h5>
                <p>{item.artists}</p>
                <div className="d-flex justify-content-between align-items-center w-100">
                    <button
                        type="button"
                        onClick={like}
                        className={`m-0 me-4 ${item.liked ? 'liked' : ''}`}>
                        <i class="fa-solid fa-heart me-1"></i> {item.liked ? 'Bỏ thích' : 'Thích'}
                    </button>
                    <div>
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
    )
});

export default ProfilePage;