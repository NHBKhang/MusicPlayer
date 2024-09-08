import '../styles/SongControls.css';
import { useAudio } from '../configs/AudioContext';
import { getAudioInstance } from '../configs/Singleton';
import { useEffect, useState } from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { RepeatOneOutlined, RepeatOutlined } from '@mui/icons-material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useUser } from '../configs/UserContext';
import { authAPI, endpoints } from '../configs/API';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';

const SongControls = () => {
    const {
        isPlaying, togglePlayPause, visible, toggleLoop, loop,
        currentSong, setCurrentSong, duration,
        currentTime, setCurrentTime, volume, setVolume,
        playNextSong, playPreviousSong
    } = useAudio();
    const audio = getAudioInstance();
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const { user, getAccessToken } = useUser();
    const navigate = useNavigate();

    const handleSliderChange = (e) => {
        const value = (e.target.value / e.target.max) * 100;
        e.target.style.setProperty('--value', `${value}%`);
        setCurrentTime(e.target.value);
        audio.currentTime = e.target.value;
    };

    useEffect(() => {
        const updateSlider = () => {
            const value = (audio.currentTime / audio.duration) * 100;
            const slider = document.querySelector('input[type="range"]');
            slider.style.setProperty('--value', `${value}%`);

            slider.style.background = `linear-gradient(
                to right,
                #007bff 0%,
                #007bff ${value}%,
                #ddd ${value}%,
                #ddd 100%
            )`;
        };

        audio.addEventListener('timeupdate', updateSlider);

        return () => {
            audio.removeEventListener('timeupdate', updateSlider);
        };
    }, [audio]);

    useEffect(() => {
        const handleEnded = () => {
            const slider = document.querySelector('input[type="range"]');
            slider.style.background = 'linear-gradient(to right, #ddd 0%, #ddd 100%)';
        };

        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audio]);

    const handleNext = async () => {
        await playNextSong();
    };

    const handlePrevious = async () => {
        await playPreviousSong();
    };

    const handleVolumeChange = (event) => {
        const newVolume = parseFloat(event.target.value);
        setVolume(newVolume);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const like = async () => {
        try {
            let res = await authAPI(await getAccessToken())
                .post(endpoints.like(currentSong.id));
            setCurrentSong(res.data);
        } catch (error) {
            alert(error);
        }
    };

    const follow = async () => {
        try {
            let res = await authAPI(await getAccessToken())
                .post(endpoints.follow(currentSong.uploader.id));
            setCurrentSong(prevSong => ({
                ...prevSong,
                followed: res.data.followed

            }));
        } catch (error) {
            console.error(error);
            alert("Lỗi");
        }
    };

    const goToDetails = () => navigate(`/songs/${currentSong.id}/`)

    const goToArtist = () => navigate(`/profile/${currentSong.uploader.id}/`)

    return (
        <div className={`song-control fixed-bottom bg-dark text-white d-flex align-items-center p-2${visible ? ' show' : ''}`}>
            {currentSong && <PageTitle title={`${currentSong?.artists} - ${currentSong?.title}`} defaultTitle={false} />}
            <div className="container d-flex justify-content-between align-items-center">
                <div className="controls d-flex align-items-center">
                    <button className="me-2" onClick={handlePrevious}>
                        <SkipPreviousIcon />
                    </button>
                    <button className="me-2" onClick={togglePlayPause}>
                        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    </button>
                    <button className="me-2" onClick={handleNext}>
                        <SkipNextIcon />
                    </button>
                    <button className="me-2" onClick={toggleLoop}>
                        {loop === 'none' ? (
                            <RepeatOutlined />
                        ) : loop === 'single' ? (
                            <RepeatOneOutlined sx={{ color: 'rgb(210, 70, 0)' }} />
                        ) : (
                            <RepeatOutlined sx={{ color: 'rgb(210, 70, 0)' }} />
                        )}
                    </button>
                </div>
                <div className="duration-slider">
                    <input
                        type="range"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={handleSliderChange} />
                    <div className="time-info d-flex justify-content-between">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
                <div
                    className="me-2 volume-button-container"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}>
                    <button className="volume-button">
                        {volume === 0 ? (
                            <VolumeOffIcon />
                        ) : (
                            <VolumeUpIcon />
                        )}
                    </button>
                    {showVolumeSlider && (
                        <div className="volume-slider-container">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="volume-slider" />
                        </div>
                    )}
                </div>
                <div className='ms-2' onClick={goToDetails}>
                    <img
                        src={currentSong?.image}
                        alt={currentSong?.title}
                        width={50}
                        height={50} />
                </div>
                <div className="song-info">
                    <h5 className='mb-0' onClick={goToDetails}>{currentSong?.title}</h5>
                    <p className='fs-6' onClick={goToArtist}>{currentSong?.artists}</p>
                </div>
                {user && <div className='btn-group ms-1'>
                    <button
                        type="button"
                        onClick={like}
                        className={`me-4${currentSong?.liked ? ' liked' : ''}`}>
                        <i class="fa-solid fa-heart"></i>
                    </button>
                    {currentSong?.uploader.id !== user.id && <button
                        type="button"
                        onClick={follow}
                        className={`me-4${currentSong?.followed ? ' followed' : ''}`}>
                        {currentSong?.followed ?
                            <i class="fa-solid fa-user-check"></i> :
                            <i class="fa-solid fa-user-plus"></i>}
                    </button>}
                </div>}
            </div>
        </div>
    );
};

export default SongControls;