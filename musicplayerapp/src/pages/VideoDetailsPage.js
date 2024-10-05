import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authAPI, endpoints } from '../configs/API';
import '../styles/VideoDetailsPage.css';
import { useUser } from '../configs/UserContext';
import Page from '.';
import { useAudio } from '../configs/AudioContext';
import { VideoPlayer } from '../components';

const VideoDetailsPage = () => {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const { getAccessToken, user } = useUser();
    const { isPlaying, pauseSong } = useAudio();
    const navigate = useNavigate();

    useEffect(() => {
        if (isPlaying) pauseSong()
    }, [isPlaying, pauseSong]);

    useEffect(() => {
        const loadVideo = async () => {
            try {
                const res = await authAPI(await getAccessToken()).get(endpoints['music-video'](id));
                setVideo(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch video:', error);
                setLoading(false);
            }
        };

        loadVideo();
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

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!video) {
        return <div className="error">Video not found</div>;
    }

    return (
        <Page title={`${video.title}`}>
            <div className="video-details-page row">
                <div className='col-lg-9 text-start'>
                    <div className="video-container">
                        <VideoPlayer src={video.file} />
                    </div>
                    <h4>{video.title}</h4>
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
                    <p className="description">{video.description}</p>
                </div>
            </div>
            <div className='col-md-3'>

            </div>
        </Page>
    );
};

export default VideoDetailsPage;