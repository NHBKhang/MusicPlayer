import React, { useState, useEffect } from 'react';
import { authAPI, endpoints } from '../configs/API';
import { useUser } from '../configs/UserContext';
import { VideoPlayer } from '../components';
import { useNavigate, useParams } from 'react-router-dom';
import Page from '.';

const LiveVideoPage = () => {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('');
    const { getAccessToken, user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const loadVideoStatus = async () => {
            try {
                const res = await authAPI(await getAccessToken())
                    .get(endpoints['live-video'](id))
                setVideo(res.data.video);
                if (res.data.video.is_public === 2)
                    navigate(`/videos/${video.id}/`);
                setStatus(res.data.status);
            } catch (err) {
                setError("Error fetching video status");
            }
        };

        loadVideoStatus();

        const interval = setInterval(loadVideoStatus, 60000);
        return () => clearInterval(interval);
    }, [id, getAccessToken]);

    const follow = async () => {
        try {
            let res = await authAPI(await getAccessToken())
                .post(endpoints.follow(video.uploader.id));
            setVideo(prev => ({
                ...prev,
                followed: res.data.followed
            }));
        } catch (error) {
            console.error(error);
            alert("Lỗi");
        }
    };

    const goToArtist = () => navigate(`/profile/${video.uploader.id}/`);

    if (error) return <p>{error}</p>;

    if (!video) return <p>Loading...</p>;

    return (
        <Page title={`Trực tuyến`}>
            <div className="video-details-page row">
                <div className='col-lg-9 text-start'>
                    <div className="video-container">
                        {status === "live" ? (
                            <VideoPlayer
                                src={video.stream_url} live={status === "live"}
                                releaseDate={video.release_date} />
                        ) : (
                            <p>Video will be live on: {new Date(video.release_date).toLocaleString()}</p>
                        )}
                    </div>
                    <h4>{video.title}</h4>
                    <p className="description">{video.description}</p>
                    <div className="d-flex align-items-center cursor-pointer" style={{ gap: '12px' }}>
                        <img onClick={goToArtist}
                            src={video.uploader.avatar}
                            alt={video.uploader.name}
                            width={40}
                            height={40}
                            className='rounded-circle' />
                        <div className='d-flex' style={{ flexDirection: 'column' }}
                            onClick={goToArtist}>
                            <h6 className='m-0'>{video.uploader.name}</h6>
                            <p className='m-0'>{video.uploader.followers} người theo dõi</p>
                        </div>
                        {user.id !== video.uploader.id &&
                            <button className={`follow-button ${video.followed && 'followed'}`} onClick={follow}>
                                {video?.followed ? (<>
                                    <i class="fa-solid fa-user-check"></i>
                                    <p className='text-black m-0'> Đã theo dõi</p>
                                </>) : (<>
                                    <i class="fa-solid fa-user-plus"></i>
                                    <p className='text-black m-0'> Theo dõi</p>
                                </>)}
                            </button>}
                    </div>
                    <p>{video.description}</p>
                </div>
            </div>
            <div className='col-md-3'>

            </div>
        </Page>
    );
};

export default LiveVideoPage;