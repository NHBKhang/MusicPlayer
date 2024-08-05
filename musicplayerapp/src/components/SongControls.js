import '../styles/SongControls.css';
import { useAudio } from '../configs/AudioContext';

const SongControls = () => {
    const { isPlaying, togglePlayPause, visible, currentSong } = useAudio();

    const handleNext = () => {
        // Implement logic to play the next song
    };

    const handlePrevious = () => {
        // Implement logic to play the previous song
    };

    return (
        <div className={`song-control fixed-bottom bg-dark text-white d-flex align-items-center p-2${visible ? ' show' : ''}`}>
            <div className="container d-flex justify-content-between align-items-center">
                <div className="controls d-flex align-items-center">
                    <button className="me-2" onClick={handlePrevious}>
                        <i className="fas fa-backward-step"></i>
                    </button>
                    <button className="me-2" onClick={togglePlayPause}>
                        <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                    </button>
                    <button className="" onClick={handleNext}>
                        <i className="fas fa-forward-step"></i>
                    </button>
                </div>
                <div className="song-info">
                    <h5 className='mb-0'>{currentSong?.title}</h5>
                    <p className='fs-6'>{currentSong?.artists}</p>
                </div>
            </div>
        </div>
    );
};

export default SongControls;