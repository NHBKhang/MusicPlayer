import moment from "moment";
import Modal from "./Modal";
import PlaylistModal from "./PlaylistModal";
import { useUser } from "../configs/UserContext";
import { useAudio } from "../configs/AudioContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authAPI, endpoints } from "../configs/API";
import '../styles/PlaylistItem.css';

const PlaylistItem = ({ playlist }) => {
    const { isPlaying, currentSong, playlistId, togglePlayPauseNewSong, playSong } = useAudio();
    const { getAccessToken } = useUser();
    const navigate = useNavigate();
    const [item, setItem] = useState(playlist);
    const [visibleCount, setVisibleCount] = useState(5);
    const [isExpanded, setIsExpanded] = useState(false);
    const [visible, setVisible] = useState({
        delete: false,
        edit: false
    });

    const updateVisible = (field, value) => {
        setVisible(current => ({ ...current, [field]: value }));
    };

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

    const onDelete = async () => {
        try {
            await authAPI(await getAccessToken()).delete(endpoints.playlist(item.id));
        } catch (error) {
            alert("Không thể xóa playlist");
        } finally {
            updateVisible('delete', false);
        }
    };

    return (
        <div className="playlist-item cursor-pointer">
            <div className="cover-container">
                <img
                    src={item?.image ?? (item?.details && item.details[0]?.song?.image)}
                    alt={item?.title}
                    className="track-cover"
                    onClick={goToDetails} />
                <div className="cover-wrapper"></div>
                <i class="fa-solid fa-list"></i>
            </div>
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
                            <h5 onClick={goToDetails} className="cursor-pointer">
                                {item?.title}
                                <span className="playlist-type">{item?.type}</span>
                            </h5>
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
                <div className="button-group">
                    {item?.is_owner &&
                        <div className="d-flex align-items-center button-group" style={{ gap: '4px' }}>
                            <button onClick={() => updateVisible('edit', true)} className="track-button">
                                <i class="fa-solid fa-pen-to-square me-1"></i>
                                <p className="d-none d-md-inline fs-6 text-dark">Chỉnh sửa</p>
                            </button>
                            <button onClick={() => updateVisible('delete', true)} className="track-button">
                                <i class="fa-solid fa-trash me-1"></i>
                                <p className="d-none d-md-inline fs-6 text-dark">Xóa playlist</p>
                            </button>
                        </div>}
                </div>
            </div>
            <Modal
                label={`Bạn có chắc muốn xóa playlist ${item?.title} không?`}
                visible={visible.delete}
                onConfirm={onDelete}
                onCancel={() => updateVisible('delete', false)} />
            <PlaylistModal
                visible={visible.edit}
                playlist={item}
                onSaveChange={(playlist) => setItem(playlist)}
                onClose={() => updateVisible('edit', false)} />
        </div>
    )
};

export default PlaylistItem;