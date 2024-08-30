import { useNavigate, useParams } from "react-router-dom";
import Page from "."
import { useEffect, useState } from "react";
import { authAPI, endpoints } from "../configs/API";
import { useUser } from "../configs/UserContext";
import moment from "moment";
import { LoginRequiredModal, Modal, PlaylistModal, TabView, VerifiedBadge } from "../components";
import { renderDescription } from "../configs/Utils";
import { useAudio } from "../configs/AudioContext";
import '../styles/PlaylistDetailsPage.css';

const PlaylistDetailsPage = () => {
    const { id } = useParams();
    const { getAccessToken } = useUser();
    const { isPlaying, currentSong, togglePlayPauseNewSong, playlistId } = useAudio();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [visible, setVisible] = useState({
        edit: false,
        delete: false
    });

    const updateVisible = (field, value) => setVisible(prev => ({ ...prev, [field]: value }))

    useEffect(() => {
        const loadPlaylist = async () => {
            try {
                let res = await authAPI(await getAccessToken()).get(endpoints.playlist(id));
                setPlaylist(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        loadPlaylist();
    }, [id, getAccessToken]);

    const searchByGenre = (e, genreId) => {
        e.preventDefault();
        navigate(`/search/?genre=${genreId}`);
    }

    const goToArtist = (artistId) => { navigate(`/profile/${artistId}/`); };

    const play = () => {
        if (currentSong && `${playlistId}` === `${playlist.id}`)
            togglePlayPauseNewSong(currentSong, playlist.id);
        else {
            if (playlist.details?.length > 0) {
                togglePlayPauseNewSong(playlist.details[0].song, playlist.id);
            }
        }
    };

    const tabs = [
        {
            label: "Bài hát",
            content: <div className="playlist-songs-container">
                {playlist?.details?.length > 0 ? (
                    playlist.details.map((item) => (
                        <SongItem
                            key={item.song.id}
                            song={item.song}
                            playlistId={playlist.id}
                            state={{ isModalOpen, setIsModalOpen }}
                            navigate={navigate} />
                    ))
                ) : (
                    <div style={{ minHeight: 65 }} className="d-flex align-items-center justify-content-center">
                        <span>No songs available in this playlist.</span>
                    </div>
                )}
            </div>
        }, {
            label: "Mô tả",
            content: <div
                className={`song-description ${playlist?.description ? '' : 'center'}`}>
                <pre>
                    {renderDescription(playlist?.description,
                        "Không có mô tả cho danh sách phát này")}
                </pre>
            </div>
        },
    ];

    const onDelete = async () => {
        try {
            let res = await authAPI(await getAccessToken()).delete(playlist.id);

            if (res.status === 204) {
                navigate('/');
            }
        } catch (error) {
            alert(`Lỗi không xóa được ${playlist.type}`);
        }
    }

    return (
        <Page title={`${playlist?.title}`}>
            <div className="song-container">
                <div className="song-detail row">
                    <div className="song-cover col-xxl-3 col-xl-4 col-lg-4 col-md-6 col-sm-12">
                        <img
                            src={`${playlistId}` !== `${playlist?.id}` ?
                                (playlist?.image ?? (playlist?.details?.length > 0 && playlist?.details[0].song.image)) :
                                (currentSong?.image)}
                            alt={playlist?.title} />
                    </div>
                    <div className="song-info col-xxl-9 col-xl-8 col-lg-8 col-md-6">
                        <h1 className="mt-2 mb-2">{playlist?.title} ({playlist?.type})</h1>
                        <div className="d-flex justify-content-end mb-3">
                            <div className="mt-4">
                                {playlist?.genres?.map(g =>
                                    <a key={g.id}
                                        href="/" className="ms-3 genre"
                                        onClick={(e) => searchByGenre(e, g.id)}>
                                        # {g.name}
                                    </a>)}
                            </div>
                        </div>
                        <div className="d-flex justify-content-between other-info">
                            <div onClick={() => goToArtist(playlist?.creator?.id)} className="cursor-pointer">
                                <img
                                    className="rounded-circle"
                                    src={playlist?.creator?.avatar}
                                    alt={playlist?.creator?.name}
                                    width={40} />
                                <span>
                                    <strong>{playlist?.creator?.name}</strong>
                                    {playlist?.creator?.info?.verified && <VerifiedBadge />}
                                </span>
                            </div>
                            <span>{moment(playlist?.created_date).fromNow()}</span>
                        </div>
                        <div className="divider"></div>
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="button-group">
                                <button type="button"
                                    onClick={play}
                                    className="me-4 play-button">
                                    {isPlaying && `${playlistId}` === `${playlist?.id}` ?
                                        <span><i class="fa-solid fa-pause me-1"></i> Tạm dừng</span> :
                                        <span><i class="fa-solid fa-play me-1"></i> Phát bài hát</span>}
                                </button>
                                {/* <button
                                    type="button"
                                    onClick={like}
                                    className={`me-4 ${song?.liked ? 'liked' : ''}`}>
                                    <i class="fa-solid fa-heart me-1"></i> {song?.liked ? 'Bỏ thích' : 'Thích'}
                                </button> */}
                            </div>
                            <div className="playlist-number">
                                <h3>{playlist?.details?.length}</h3>
                                <p>Bài hát</p>
                            </div>
                        </div>
                        <div className="button-group">
                            {playlist?.is_owner &&
                                <div className="d-flex align-items-center button-group" style={{ gap: '12px' }}>
                                    <button onClick={() => updateVisible('edit', true)}>
                                        <i class="fa-solid fa-pen-to-square me-1"></i>
                                        <p className="d-none d-md-inline fs-6 text-dark">Chỉnh sửa</p>
                                    </button>
                                    <button onClick={() => updateVisible('delete', true)}>
                                        <i class="fa-solid fa-trash me-1"></i>
                                        <p className="d-none d-md-inline fs-6 text-dark">Xóa playlist</p>
                                    </button>
                                </div>}
                        </div>
                        <br />
                    </div>
                </div>
            </div>
            <div className="row p-1">
                <div className="col-md-8 p-0">
                    <TabView tabs={tabs} />
                </div>
                <div className="col-md-4 text-start mt-2">
                    <h5>Các playlist khác từ {playlist.creator.name}</h5>
                    <hr />
                    {/* {relatedSongs.map(r =>
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
                    </div>)} */}
                </div>
            </div>
            <LoginRequiredModal
                visible={isModalOpen.required}
                onClose={setIsModalOpen} />
            <PlaylistModal
                visible={visible.edit}
                playlist={playlist}
                onSaveChange={(playlist) => setPlaylist(playlist)}
                onClose={() => updateVisible('edit', false)} />
            <Modal
                label={`Bạn có chắc chắn muốn xóa ${playlist.title} (${playlist.type}) không?`}
                visible={visible.delete}
                onCancel={() => updateVisible('delete', false)}
                onConfirm={onDelete} />
        </Page>
    )
};

const SongItem = ({ song, state, navigate, playlistId }) => {
    const [item, setItem] = useState(song);
    const { togglePlayPauseNewSong, isPlaying, currentSong } = useAudio();
    const { user, getAccessToken } = useUser();
    const { setIsModalOpen } = state;

    const goToDetails = () => { navigate(`/songs/${item.id}/`); };

    const like = async () => {
        if (user) {
            try {
                let res = await authAPI(await getAccessToken())
                    .post(endpoints.like(item.id));
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
        <div className="track-item p-2">
            <button style={{ left: 35 }}
                className="play-button"
                title="Phát bài hát"
                onClick={() => togglePlayPauseNewSong(item, playlistId)}>
                {isPlaying && currentSong?.id === item.id ?
                    <i class="fa-solid fa-pause"></i> :
                    <i class="fa-solid fa-play"></i>}
            </button>
            <span className="date" style={{ right: 10 }}>
                {moment(item.created_date).fromNow()}
            </span>
            <img src={item.image} alt={item.title} className="track-cover" onClick={goToDetails} />
            <div className="track-info w-100">
                <h5 onClick={goToDetails} className="cursor-pointer">{item.title}</h5>
                <p>{item.artists}</p>
                <div className="d-flex justify-content-between align-items-center w-100 mt-2">
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
}

export default PlaylistDetailsPage;