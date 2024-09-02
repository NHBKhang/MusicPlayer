import { useNavigate, useParams } from "react-router-dom";
import { Comments, LoginRequiredModal, Modal, SongModal, TabView, VerifiedBadge } from "../components";
import '../styles/SongDetailsPage.css';
import { useEffect, useState } from "react";
import { authAPI, endpoints } from "../configs/API";
import moment from "moment";
import { useAudio } from "../configs/AudioContext";
import { useUser } from "../configs/UserContext";
import Page from ".";
import { renderDescription } from "../configs/Utils";

const SongDetailsPage = () => {
    const {
        isPlaying, setCurrentSong, currentSong, togglePlayPauseNewSong
    } = useAudio();
    const { getAccessToken, user } = useUser();
    const { id } = useParams();
    const [song, setSong] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState({
        like: false,
        delete: false,
        edit: false
    });
    const [comments, setComments] = useState([]);
    const [relatedSongs, setRelatedSong] = useState([]);
    const navigate = useNavigate();

    const updateIsModalOpen = (field, value) => {
        setIsModalOpen(current => ({ ...current, [field]: value }));
    };

    useEffect(() => {
        const loadComments = async () => {
            try {
                let res = await authAPI(await getAccessToken()).get(endpoints.comments(id));
                setComments(res.data.results);
            } catch (error) {
                alert("Không thể tải được bình luận");
            }
        };

        const loadRelatedSongs = async () => {
            try {
                let res = await authAPI(await getAccessToken()).get(endpoints["related-songs"](id));
                setRelatedSong(res.data);
            } catch (error) {
                alert("Không thể tải được bài hát liên quan");
            }
        }

        loadComments();
        loadRelatedSongs();
    }, [id, getAccessToken]);

    useEffect(() => {
        const loadSong = async () => {
            try {
                let res = await authAPI(await getAccessToken()).get(endpoints.song(id));
                setSong(res.data);
            } catch (error) {
                alert("Không thể tải được bài hát");
            }
        };

        loadSong();
    }, [currentSong, id, getAccessToken, setSong]);

    const like = async () => {
        if (user) {
            try {
                let res = await authAPI(await getAccessToken()).post(endpoints.like(id));
                setSong(res.data);

                if (isPlaying && currentSong.id === song.id)
                    setCurrentSong(res.data);
            } catch (error) {
                alert("Không thể thích bài hát");
            }
        } else {
            updateIsModalOpen('like', true);
        }
    };

    const onDelete = async () => {
        try {
            let res = await authAPI(await getAccessToken()).delete(endpoints.song(song.id));

            if (res.status === 204) {
                navigate('/');
            }
        } catch (error) {
            alert("Không thể xóa bài hát")
        } finally {
            updateIsModalOpen('delete', false);
        }
    };

    const play = () => {
        togglePlayPauseNewSong(song);
    };

    const playNewSong = (song) => { togglePlayPauseNewSong(song); };

    const searchByGenre = async (e, genreId) => {
        e.preventDefault();
        navigate(`/search/?genre=${genreId}`);
    };

    const goToDetails = (songId) => { navigate(`/songs/${songId}/`); };

    const goToArtist = (artistId) => { navigate(`/profile/${artistId}/`); };

    const tabs = [
        {
            label: "Bình luận",
            content: <Comments
                comments={comments}
                setComments={setComments}
                user={user}
                state={{ isModalOpen, setIsModalOpen, song, setSong }} />
        }, {
            label: "Mô tả",
            content: <div
                className={`song-description ${song?.description ? '' : 'center'}`}>
                <pre>
                    {renderDescription(song?.description)}
                </pre>
            </div>
        }, {
            label: "Lời bài hát",
            content: <div
                className={`song-lyrics ${song?.lyrics ? '' : 'center'}`}>
                <span>
                    <pre>
                        {song?.lyrics ? song?.lyrics :
                            "Không có lời bát cho bài hát này"}
                    </pre>
                </span>
            </div>
        }
    ]

    return (
        <Page title={`${song?.artists} - ${song?.title}`}>
            <div className="song-container">
                <div className="song-detail row">
                    <div className="song-cover col-xxl-3 col-xl-4 col-lg-4 col-md-6 col-sm-12">
                        <img src={song?.image} alt={song?.title} />
                    </div>
                    <div className="song-info col-xxl-9 col-xl-8 col-lg-8 col-md-6">
                        <h1 className="mt-2 mb-2">
                            {song?.title}
                            {!song?.is_public &&
                                <span className="privacy fs-4 m-2">
                                    <i className="fa-solid fa-lock"></i>
                                </span>}
                        </h1>
                        <p className="mt-2 mb-4 p-1">Nghệ sĩ: {song?.artists}</p>
                        <div className="d-flex justify-content-end mb-3">
                            <div>
                                {song?.genres.map(g =>
                                    <a key={g.id}
                                        href="/" className="ms-3 genre"
                                        onClick={(e) => searchByGenre(e, g.id)}>
                                        # {g.name}
                                    </a>)}
                            </div>
                        </div>
                        <div className="d-flex justify-content-between other-info">
                            <div onClick={() => goToArtist(song?.uploader?.id)} className="cursor-pointer">
                                <img
                                    className="rounded-circle"
                                    src={song?.uploader?.avatar}
                                    alt={song?.uploader?.name}
                                    width={40} />
                                <span>
                                    <strong>{song?.uploader?.name}</strong>
                                    {song?.uploader?.info?.verified && <VerifiedBadge />}
                                </span>
                            </div>
                            <span>{moment(song?.created_date).fromNow()}</span>
                        </div>
                        <div className="divider"></div>
                        <div className="d-flex align-items-center mb-3">
                            <div className="button-group">
                                <button type="button" onClick={play} className="me-4 play-button">
                                    {isPlaying && currentSong?.id === song?.id ?
                                        <span><i class="fa-solid fa-pause me-1"></i> Tạm dừng</span> :
                                        <span><i class="fa-solid fa-play me-1"></i> Phát bài hát</span>}
                                </button>
                                <button
                                    type="button"
                                    onClick={like}
                                    className={`me-4 ${song?.liked ? 'liked' : ''}`}>
                                    <i class="fa-solid fa-heart me-1"></i> {song?.liked ? 'Bỏ thích' : 'Thích'}
                                </button>
                                <div className="mt-md-2">
                                    <span className="me-4">
                                        <i class="fa-solid fa-heart me-1"></i> {song?.likes}
                                    </span>
                                    <span>
                                        <i class="fa-solid fa-play me-1"></i> {song?.streams}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {song?.is_owner &&
                            <div className="d-flex align-items-center button-group" style={{ gap: '12px' }}>
                                <button onClick={() => updateIsModalOpen('edit', true)}>
                                    <i class="fa-solid fa-pen-to-square me-1"></i>
                                    <p className="d-none d-md-inline fs-6 text-dark">Chỉnh sửa</p>
                                </button>
                                <button onClick={() => updateIsModalOpen('delete', true)}>
                                    <i class="fa-solid fa-trash me-1"></i>
                                    <p className="d-none d-md-inline fs-6 text-dark">Xóa bài hát</p>
                                </button>
                            </div>}
                        <br />
                    </div>
                </div>
            </div>
            <div className="row p-1">
                <div className="col-md-8 p-0">
                    <TabView tabs={tabs} />
                </div>
                <div className="col-md-4 text-start mt-2">
                    <h5>Bài hát liên quan</h5>
                    <hr />
                    {relatedSongs.map(r =>
                        <div key={r.id}
                            className="related-song d-flex ms-lg-1">
                            <img
                                src={r.image} alt={r.title} width={75} height={75}
                                onClick={() => goToDetails(r.id)} />
                            <div className="ms-3" onClick={() => goToDetails(r.id)}>
                                <h5 className="mb-0">{r.title}</h5>
                                <p style={{ marginTop: 2, marginBottom: 3 }}>{r.artists}</p>
                                <div>
                                    <span className="me-4">
                                        <i class="fa-solid fa-heart me-1"></i> {r.likes}
                                    </span>
                                    <span>
                                        <i class="fa-solid fa-play me-1"></i> {r.streams}
                                    </span>
                                </div>
                            </div>
                            <button
                                className="play-button"
                                title="Phát bài hát"
                                onClick={() => playNewSong(r)}>
                                {isPlaying && currentSong?.id === r.id ?
                                    <i class="fa-solid fa-pause"></i> :
                                    <i class="fa-solid fa-play"></i>}
                            </button>
                        </div>)}
                </div>
            </div>
            <LoginRequiredModal
                visible={isModalOpen.like}
                onClose={() => updateIsModalOpen('like', false)} />
            <Modal
                label={`Bạn có chắc muốn xóa bài hát ${song?.title} không?`}
                visible={isModalOpen.delete}
                onConfirm={onDelete}
                onCancel={() => updateIsModalOpen('delete', false)} />
            <SongModal
                visible={isModalOpen.edit}
                song={song}
                onSaveChange={(song) => setSong(song)}
                onClose={() => updateIsModalOpen('edit', false)} />
        </Page>
    )
}

export default SongDetailsPage;