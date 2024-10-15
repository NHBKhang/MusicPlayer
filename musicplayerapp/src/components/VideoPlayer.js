import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoPlayer = ({ src, live = false, releaseDate = null }) => {
    const [seekableEnd, setSeekableEnd] = useState(0);
    const [player, setPlayer] = useState(null);
    const [startTime, setStartTime] = useState(0);

    useEffect(() => {
        const videoPlayer = videojs('video-player', {
            controls: true,
            autoplay: false,
            preload: 'auto',
            liveui: live,
            sources: [
                {
                    src: src,
                    type: 'video/mp4',
                },
            ],
        });

        setPlayer(videoPlayer);

        if (live) {
            videoPlayer.on('loadedmetadata', () => {
                if (releaseDate) {
                    setStartTime(new Date(releaseDate).getTime());
                }
                setSeekableEnd(0);

                return () => {
                    if (videoPlayer) {
                        videoPlayer.dispose();
                    }
                };
            });
        }
    }, [src, live, releaseDate]);

    useEffect(() => {
        if (!player || !live) return;

        const updateSeekableEnd = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            setSeekableEnd(elapsed);
        };

        const updateInterval = setInterval(updateSeekableEnd, 1000);

        player.on('seeking', () => {
            const currentTime = player.currentTime();
            if (currentTime > seekableEnd) {
                player.currentTime(seekableEnd);
            }
        });

        return () => {
            clearInterval(updateInterval);
            if (player) {
                player.off('seeking');
            }
        };
    }, [player, seekableEnd, startTime, live]);

    return (
        <div>
            <video id="video-player" src={src} className="video-js vjs-default-skin w-100 h-100" controls />
        </div>
    );
};

export default VideoPlayer;