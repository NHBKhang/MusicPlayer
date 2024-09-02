import { useNavigate } from "react-router-dom";
import { useAudio } from "../configs/AudioContext";
import { useUser } from "../configs/UserContext";
import { useState } from "react";
import { authAPI, endpoints } from "../configs/API";
import moment from "moment";
import SongModal from "./SongModal";
import AddToPlaylistModal from "./AddToPlaylistModal";
import Modal from "./Modal";
import '../styles/SongItem.css';

const SongItem = ({ song, state }) => {
    const setIsModalOpen = state?.setIsModalOpen;
    const { getAccessToken, user } = useUser();
    const { isPlaying, currentSong, togglePlayPauseNewSong } = useAudio();
    const navigate = useNavigate();
    const [item, setItem] = useState(song);
    const [showOptions, setShowOptions] = useState(false);
    const [visible, setVisible] = useState({
        delete: false,
        edit: false,
        add: false,
    });

    const updateVisible = (field, value) => {
        setVisible(current => ({ ...current, [field]: value }));
    };

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
    };

    const onDelete = async () => {
        try {
            await authAPI(await getAccessToken()).delete(endpoints.song(item.id));
        } catch (error) {
            alert("Không thể xóa bài hát")
        } finally {
            updateVisible('delete', false);
        }
    };

    const handleToggleOptions = () => setShowOptions(!showOptions)

    const goToArtist = () => navigate(`/profile/${item.uploader.id}/`);

    return (
        <div className="track-item cursor-pointer">
            <span className="date">{moment(item.created_date).fromNow()}</span>
            <img src={item.image} alt={item.title} className="track-cover" onClick={goToDetails} />
            <div className="track-info w-100">
                <div className="d-flex" style={{ gap: 12 }}>
                    <button
                        className="play-button"
                        title="Phát bài hát"
                        onClick={() => togglePlayPauseNewSong(item)}>
                        {isPlaying && currentSong?.id === item.id ?
                            <i class="fa-solid fa-pause"></i> :
                            <i class="fa-solid fa-play"></i>}
                    </button>
                    <div className="w-100">
                        <p className="p-0 m-0" onClick={goToArtist}>{item?.uploader?.name}</p>
                        <h5 onClick={goToDetails}>
                            {item.artists} - {item.title}
                            {!item?.is_public &&
                                <span className="privacy m-2" style={{ fontSize: '12px' }}>
                                    <i className="fa-solid fa-lock"></i>
                                </span>}
                        </h5>
                    </div>
                </div>
                <div className="d-flex justify-content-between align-items-center w-100 mt-3">
                    <div className="d-flex" style={{ gap: '4px' }}>
                        <button
                            type="button"
                            onClick={like}
                            className={`m-0 ${item.liked ? 'liked' : ''}`}>
                            <i class="fa-solid fa-heart me-1"></i>
                            <span className={`d-none d-md-inline fs-7 p-0 ${item.liked ? '' : 'text-dark'}`}>
                                {item.liked ? 'Bỏ thích' : 'Thích'}
                            </span>
                        </button>
                        {item.is_owner && <>
                            <button onClick={() => updateVisible('edit', true)} className="m-0">
                                <i class="fa-solid fa-pen-to-square me-1"></i>
                                <span className="d-none d-md-inline fs-7 text-dark p-0">Chỉnh sửa</span>
                            </button>
                            <button onClick={() => updateVisible('delete', true)} className="m-0">
                                <i class="fa-solid fa-trash me-1"></i>
                                <span className="d-none d-md-inline fs-7 text-dark p-0">Xóa bài hát</span>
                            </button>
                        </>}
                        <button style={{ position: 'relative' }}
                            className="m-0 px-md-2 p-1"
                            onClick={handleToggleOptions}>
                            <i class="fa-solid fa-ellipsis"></i>
                            {showOptions && (
                                <div className="options-dropdown">
                                    <ul>
                                        <li onClick={() => updateVisible('add', true)}>Thêm vào playlist</li>
                                        <li>Option 2</li>
                                        <li>Option 3</li>
                                    </ul>
                                </div>
                            )}
                        </button>
                    </div>
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
            <Modal
                label={`Bạn có chắc muốn xóa bài hát ${item?.title} không?`}
                visible={visible.delete}
                onConfirm={onDelete}
                onCancel={() => updateVisible('delete', false)} />
            <SongModal
                visible={visible.edit}
                song={item}
                onSaveChange={(song) => setItem(song)}
                onClose={() => updateVisible('edit', false)} />
            <AddToPlaylistModal
                visible={visible.add}
                song={item}
                onClose={() => updateVisible('add', false)} />
        </div>
    )
};

export default SongItem;