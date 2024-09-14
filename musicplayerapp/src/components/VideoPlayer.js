import { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import VideoJS from 'video.js';
import 'video.js/dist/video-js.css';

const VideoPlayer = memo(({ src, live = false, releaseDate = null }) => {
    const [seekableEnd, setSeekableEnd] = useState(0);
    const [player, setPlayer] = useState(null);
    const [startTime, setStartTime] = useState(0);

    useEffect(() => {
        const videoPlayer = VideoJS('video-player', {
            controls: true,
            autoplay: false,
            preload: 'auto',
            liveui: true,
            sources: [{
                src: src,
                type: 'video/mp4'
            }],
        });

        setPlayer(videoPlayer);

        if (live)
            videoPlayer.on('loadedmetadata', () => {
                setStartTime(new Date(releaseDate));
                setSeekableEnd(0);

                return () => {
                    if (videoPlayer) {
                        videoPlayer.dispose();
                    }
                };
            });
    }, [src]);

    useEffect(() => {
        if (!player) return;

        if (live) {
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
        }
    }, [player, seekableEnd, startTime]);

    return (
        <div>
            <video id="video-player" className="video-js vjs-default-skin" controls width="640" height="360" />
        </div>
    );
});

VideoPlayer.propTypes = {
    src: PropTypes.string.isRequired,
};

export default VideoPlayer;