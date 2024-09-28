import { useNavigate } from "react-router-dom";
import { useUser } from "../configs/UserContext";
import { useState } from "react";
import { authAPI, endpoints } from "../configs/API";
import moment from "moment";
import '../styles/SongItem.css';
import Modal from "./Modal";
import VideoModal from "./VideoModal";

const VideoItem = ({ video, state }) => {
    const setIsModalOpen = state?.setIsModalOpen;
    const { getAccessToken, user } = useUser();
    const navigate = useNavigate();
    const [item, setItem] = useState(video);
    const [visible, setVisible] = useState({
        delete: false,
        edit: false
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

    const onDelete = async () => {
        try {
            await authAPI(await getAccessToken()).delete(endpoints.playlist(item.id));
        } catch (error) {
            alert("Không thể xóa playlist");
        } finally {
            updateVisible('delete', false);
        }
    };

    const goToDetails = () => {
        if (item.session_id)
            navigate(`/live-stream/${item.session_id}/`);
        else
            navigate(`/videos/${item.id}/`);
    }

    const goToArtist = () => navigate(`/profile/${item.uploader.id}/`)

    return (
        <div className="track-item cursor-pointer">
            <span className="date">{moment(item.created_date).fromNow()}</span>
            <div className="cover-container">
                <img src={item.session_id ?
                    'https://img.freepik.com/vektoren-premium/live-stream-symbol-und-videouebertragung-streaming-von-online-uebertragungen_212474-689.jpg' :
                    item.image} alt={item.title} className="track-cover" onClick={goToDetails} />
                <div className="cover-wrapper"></div>
                <i class="fa-solid fa-video"></i>
            </div>
            <div className="track-info w-100">
                <div className="d-flex" style={{ gap: 12 }}>
                    <div className="w-100">
                        <p className="p-0 m-0" onClick={goToArtist}>{item?.uploader?.name}</p>
                        <h5 onClick={goToDetails}>
                            {item.title}
                            {!item?.is_public && !item.session_id &&
                                <span className="privacy m-2" style={{ fontSize: '12px' }}>
                                    <i className="fa-solid fa-lock"></i>
                                </span>}
                        </h5>
                    </div>
                </div>
                <div className="d-flex justify-content-between align-items-center w-100 mt-3">
                    <div className="d-flex" style={{ gap: '4px' }}>
                        {/* <button
                            type="button"
                            onClick={like}
                            className={`m-0 button track-button ${item.liked ? 'liked' : ''}`}>
                            <i class="fa-solid fa-heart me-1"></i>
                            <span className={`d-none d-md-inline fs-7 p-0 ${item.liked ? '' : 'text-dark'}`}>
                                {item.liked ? 'Bỏ thích' : 'Thích'}
                            </span>
                        </button> */}
                        {item?.is_owner &&
                            <div className="d-flex align-items-center button-group" style={{ gap: '4px' }}>
                                <button onClick={() => updateVisible('edit', true)} className="track-button">
                                    <i class="fa-solid fa-pen-to-square me-1"></i>
                                    <p className="d-none d-md-inline fs-6 text-dark">Chỉnh sửa</p>
                                </button>
                                <button onClick={() => updateVisible('delete', true)} className="track-button">
                                    <i class="fa-solid fa-trash me-1"></i>
                                    <p className="d-none d-md-inline fs-6 text-dark">Xóa video</p>
                                </button>
                            </div>}
                    </div>
                    {/* <div>
                        <span className="me-4">
                            <i class="fa-solid fa-heart me-1"></i> {item.likes}
                        </span>
                        <span>
                            <i class="fa-solid fa-play me-1"></i> {item.streams}
                        </span>
                    </div> */}
                </div>
            </div>
            <Modal
                label={`Bạn có chắc muốn xóa mv ${item?.title} không?`}
                visible={visible.delete}
                onConfirm={onDelete}
                onCancel={() => updateVisible('delete', false)} />
            <VideoModal
                visible={visible.edit}
                video={item}
                onSaveChange={(video) => setItem(video)}
                onClose={() => updateVisible('edit', false)} />
        </div>
    )
};

export default VideoItem;