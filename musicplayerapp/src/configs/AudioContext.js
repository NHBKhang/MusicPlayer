import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAudioInstance } from './Singleton';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const [visible, setVisible] = useState(false);
    const audio = getAudioInstance();

    useEffect(() => {
        const handlePlaySong = (event) => {
            const { song } = event.detail;
            setCurrentSong(song);
            setVisible(true);
            audio.src = song.file;
            audio.play().catch(error => {
                alert('Playback failed:', error);
            });
            setIsPlaying(true);
        };

        const handlePauseSong = () => {
            audio.pause();
            setIsPlaying(false);
        };

        window.addEventListener('playSong', handlePlaySong);
        window.addEventListener('pauseSong', handlePauseSong);

        return () => {
            window.removeEventListener('playSong', handlePlaySong);
            window.removeEventListener('pauseSong', handlePauseSong);
        };
    }, [audio]);

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

    return (
        <AudioContext.Provider value={{ isPlaying, visible, playSong, pauseSong, togglePlayPause, currentSong }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    return useContext(AudioContext);
};
