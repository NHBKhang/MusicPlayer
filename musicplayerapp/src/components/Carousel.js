import React, { useEffect, useRef } from 'react';
import Slider from 'react-slick';
import '../styles/Carousel.css';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../configs/AudioContext';

const Carousel = ({ label, items, type = 'song' }) => {
    const sliderRef = useRef(null);

    useEffect(() => {
        if (sliderRef.current) {
            setTimeout(() => {
                sliderRef.current?.slickGoTo(0);
            }, 200);
        }
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 8,
        slidesToScroll: 1,
        initialSlide: 0,
        responsive: [
            {
                breakpoint: 1600,
                settings: {
                    slidesToShow: 7,
                }
            },
            {
                breakpoint: 1400,
                settings: {
                    slidesToShow: 6,
                }
            },
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 5,
                }
            },
            {
                breakpoint: 1000,
                settings: {
                    slidesToShow: 4,
                }
            },
            {
                breakpoint: 800,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                }
            }
        ]
    };

    const navigate = useNavigate();
    const { isPlaying, currentSong, togglePlayPauseNewSong } = useAudio();

    const goToDetails = (songId) => {
        navigate(`/songs/${songId}/`);
    }

    const goToArtist = (artistId) => {
        navigate(`/profile/${artistId}/`);
    }

    const togglePlayPause = (song) => {
        togglePlayPauseNewSong(song);
    }

    return (
        <div className="carousel-container">
            {label && <h3 className='carousel-label'>{label}</h3>}
            <Slider ref={sliderRef} {...settings}>
                {type === 'song' ? items.map((song) =>
                    <div
                        key={song.id}
                        className="carousel-item rounded" >
                        <img
                            src={song.image}
                            alt={song.title}
                            className='song-cover'
                            onClick={() => goToDetails(song.id)} />
                        <div className="song-title-wrapper">
                            <h6
                                onClick={() => goToDetails(song.id)}
                                className='song-title'>
                                {`${song.artists} - ${song?.title}`}
                            </h6>
                        </div>
                        <p onClick={() => goToArtist(song.uploader.id)}>{song.uploader.name}</p>
                        <div className='btn-group'>
                            <button
                                className="play-button"
                                title="Phát bài hát"
                                onClick={() => togglePlayPause(song)}>
                                {isPlaying && currentSong?.id === song.id ?
                                    <i class="fa-solid fa-pause"></i> :
                                    <i class="fa-solid fa-play"></i>}
                            </button>
                        </div>
                    </div>) : items.map((artist) =>
                        <div
                            key={artist.id}
                            className="carousel-item rounded"
                            onClick={() => goToArtist(artist.id)} >
                            <img
                                src={artist.avatar}
                                alt={artist.name}
                                className='artist-cover' />
                            <div className="artist-title-wrapper">
                                <h6
                                    className='artist-title'>
                                    {artist.name}
                                </h6>
                            </div>
                            <div className='text-center m-0 p-0'>
                                <p>{artist.songs} bài hát</p>
                            </div>
                        </div>)
                }
            </Slider>
        </div>
    );
};

export default Carousel;
