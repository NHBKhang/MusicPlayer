import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAudioInstance } from './Singleton';
import API, { endpoints } from './API';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const [visible, setVisible] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [loop, setLoop] = useState('none');
    const [volume, setVolume] = useState(1);
    const audio = getAudioInstance();

    useEffect(() => {
        const handlePlaySong = async (event) => {
            const { song } = event.detail;
            setCurrentSong(song);
            setVisible(true);
            audio.src = song.file;
            audio.currentTime = currentTime;
            audio.volume = volume;
            try {
                await audio.play();
                setIsPlaying(true);

                await API.post(endpoints.stream(song.id));
            } catch (error) {
                alert('Playback failed:', error);
            }
        };

        const handlePauseSong = () => {
            audio.currentTime = currentTime;
            audio.pause();
            setIsPlaying(false);
        };

        const handleSongEnd = async () => {
            if (loop === 'single') {
                audio.currentTime = 0;
                try {
                    await audio.play();
                    setIsPlaying(true);

                    await API.post(endpoints.stream(currentSong.id));
                } catch (error) {
                    alert('Playback failed:', error);
                }
            } else if (loop === 'playlist') {
                // Implement logic to play the next song in the playlist
                // Assume you have a list of songs in state
                playNextSong();
            } else {
                setCurrentTime(0);
                setIsPlaying(false);
            }
        };

        const updateTime = () => {
            setCurrentTime(audio.currentTime);
        };

        const setSongDuration = () => {
            setDuration(audio.duration);
        };

        audio.volume = volume;

        audio.addEventListener('loadedmetadata', setSongDuration);
        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('ended', handleSongEnd);

        window.addEventListener('playSong', handlePlaySong);
        window.addEventListener('pauseSong', handlePauseSong);

        return () => {
            audio.removeEventListener('loadedmetadata', setSongDuration);
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('ended', handleSongEnd);
            window.removeEventListener('playSong', handlePlaySong);
            window.removeEventListener('pauseSong', handlePauseSong);
        };
    }, [audio, currentTime, loop, volume, currentSong]);

    const playSong = (song) => {
        const event = new CustomEvent('playSong', { detail: { song } });
        window.dispatchEvent(event);
    };

    const pauseSong = () => {
        const event = new CustomEvent('pauseSong');
        window.dispatchEvent(event);
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong(currentSong);
        }
    };

    const toggleLoop = () => {
        setLoop((prevLoop) => {
            switch (prevLoop) {
                case 'none':
                    return 'single';
                case 'single':
                    return 'playlist';
                case 'playlist':
                    return 'none';
                default:
                    return 'none';
            }
        });
    };

    const playNextSong = () => {
        alert("cc")
    };


    return (
        <AudioContext.Provider value={{
            isPlaying,
            visible,
            currentSong,
            duration,
            loop, toggleLoop,
            volume, setVolume,
            currentTime, setCurrentTime,
            playSong, pauseSong, togglePlayPause,
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    return useContext(AudioContext);
};
