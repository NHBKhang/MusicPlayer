import { useNavigate } from "react-router-dom";
import { useUser } from "../configs/UserContext";
import { useState } from "react";
import { authAPI, endpoints } from "../configs/API";
import moment from "moment";
import '../styles/SongItem.css';

const VideoItem = ({ video, state }) => {
    const setIsModalOpen = state?.setIsModalOpen;
    const { getAccessToken, user } = useUser();
    const navigate = useNavigate();
    const [item, setItem] = useState(video);

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

    const goToDetails = () => navigate(`/videos/${item.id}/`)

    const goToArtist = () => navigate(`/profile/${item.uploader.id}/`)

    return (
        <div className="track-item cursor-pointer">
            <span className="date">{moment(item.created_date).fromNow()}</span>
            <img src={item.image} alt={item.title} className="track-cover" onClick={goToDetails} />
            <div className="track-info w-100">
                <div className="d-flex" style={{ gap: 12 }}>
                    <div className="w-100">
                        <p className="p-0 m-0" onClick={goToArtist}>{item?.uploader?.name}</p>
                        <h5 onClick={goToDetails}>
                            {item.title}
                            {!item?.is_public &&
                                <span className="privacy m-2" style={{ fontSize: '12px' }}>
                                    <i className="fa-solid fa-lock"></i>
                                </span>}
                        </h5>
                    </div>
                </div>
                {/* <div className="d-flex justify-content-between align-items-center w-100 mt-3">
                    <div className="d-flex" style={{ gap: '4px' }}>
                        <button
                            type="button"
                            onClick={like}
                            className={`m-0 button track-button ${item.liked ? 'liked' : ''}`}>
                            <i class="fa-solid fa-heart me-1"></i>
                            <span className={`d-none d-md-inline fs-7 p-0 ${item.liked ? '' : 'text-dark'}`}>
                                {item.liked ? 'Bỏ thích' : 'Thích'}
                            </span>
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
                </div> */}
            </div>
        </div>
    )
};

export default VideoItem;