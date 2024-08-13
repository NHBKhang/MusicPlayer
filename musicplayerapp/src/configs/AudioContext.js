import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getAudioInstance } from './Singleton';
import { authAPI, endpoints } from './API';
import { useUser } from './UserContext';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const [visible, setVisible] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [loop, setLoop] = useState('none');
    const [volume, setVolume] = useState(1);
    const [streamPosted, setStreamPosted] = useState(false);
    const audio = getAudioInstance();
    const { getAccessToken } = useUser();

    const postStreamAfterDelay = useCallback((songId, delay = 5000) => {
        const timerId = setTimeout(async () => {
            try {
                await authAPI(getAccessToken()).post(endpoints.stream(songId));
                setStreamPosted(true);
            } catch (error) {
                console.error('Error posting stream:', error);
            }
        }, delay);

        return timerId;
    }, [getAccessToken]);

    const playNextSong = useCallback(async () => {
        try {
            if (!currentSong) {
                console.error('No current song to get the next song from');
                return;
            }
            setCurrentTime(0);
            let res = await authAPI(await getAccessToken()).get(endpoints['next-song'](currentSong.id));
            playSong(res.data);
        } catch (error) {
            console.error('Playback failed:', error);
            alert('Playback failed: ' + (error.response?.data?.detail || 'An unknown error occurred'));
        }
    }, [currentSong, getAccessToken]);

    const playPreviousSong = useCallback(async () => {
        try {
            if (!currentSong) {
                console.error('No current song to get the previous song from');
                return;
            }
            setCurrentTime(0);
            let res = await authAPI(await getAccessToken()).get(endpoints['previous-song'](currentSong.id));
            playSong(res.data);
        } catch (error) {
            console.error('Playback failed:', error);
            alert('Playback failed: ' + (error.response?.data?.detail || 'An unknown error occurred'));
        }
    }, [currentSong, getAccessToken]);

    useEffect(() => {
        let postStreamTimer = null;

        const handlePlaySong = async (event) => {
            const { song } = event.detail;
            setCurrentSong(song);
            setVisible(true);
            setStreamPosted(false);
            audio.src = song.file;
            audio.volume = volume;
            if (currentSong && currentSong.id !== song.id) {
                setCurrentTime(0);
                audio.currentTime = 0;
            } else {
                audio.currentTime = currentTime;
            }

            try {
                await audio.play();
                setIsPlaying(true);
                postStreamTimer = postStreamAfterDelay(song.id);
            } catch (error) {
                alert('Playback failed:', error);
            }
        };

        const handlePauseSong = () => {
            audio.currentTime = currentTime;
            audio.pause();
            setIsPlaying(false);
            clearTimeout(postStreamTimer);
        };

        const handleSongEnd = async () => {
            if (loop === 'single') {
                try {
                    audio.currentTime = 0;
                    await audio.play();
                    setIsPlaying(true);
                    setStreamPosted(false);
                    postStreamTimer = postStreamAfterDelay(currentSong.id);
                } catch (error) {
                    alert('Playback failed:', error);
                }
            } else if (loop === 'playlist') {
                await playNextSong();
            } else {
                await playNextSong();
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
            clearTimeout(postStreamTimer);
        };
    }, [audio, currentTime, loop, volume, currentSong, streamPosted,
        playNextSong, postStreamAfterDelay, setCurrentTime]);

    useEffect(() => {
        const storedLoop = localStorage.getItem('loop');
        if (storedLoop) {
            setLoop(storedLoop);
        }
    }, []);

    useEffect(() => {
        if (isPlaying)
            setVisible(true);
    }, [isPlaying]);

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

    const togglePlayPauseNewSong = (song) => {
        if (currentSong && song.id === currentSong.id) {
            if (isPlaying) {
                pauseSong();

            }
            else {
                playSong(song);
            }
        } else {
            playSong(song);
        }
    };

    const toggleLoop = () => {
        setLoop((prevLoop) => {
            let newLoop;
            switch (prevLoop) {
                case 'none':
                    newLoop = 'single';
                    break;
                case 'single':
                    newLoop = 'playlist';
                    break;
                case 'playlist':
                    newLoop = 'none';
                    break;
                default:
                    newLoop = 'none';
                    break;
            }
            localStorage.setItem('loop', newLoop);
            return newLoop;
        })
    };

    return (
        <AudioContext.Provider value={{
            isPlaying,
            visible,
            currentSong, setCurrentSong,
            duration,
            loop, toggleLoop,
            volume, setVolume,
            currentTime, setCurrentTime,
            playSong, pauseSong, 
            togglePlayPause, togglePlayPauseNewSong,
            playNextSong, playPreviousSong,
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    return useContext(AudioContext);
};
