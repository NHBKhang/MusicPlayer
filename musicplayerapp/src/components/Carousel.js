import React from 'react';
import Slider from 'react-slick';
import '../styles/Carousel.css';

const Carousel = ({ label }) => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 8,
        slidesToScroll: 8,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 7,
                    slidesToScroll: 7,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 5,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                }
            }
        ]
    };

    return (
        <div className="carousel-container">
            {label && <h3 className='carousel-label'>{label}</h3>}
            <Slider {...settings}>
                <div className="carousel-item">
                    <h3>Item 1</h3>
                </div>
                <div className="carousel-item">
                    <h3>Item 2</h3>
                </div>
                <div className="carousel-item">
                    <h3>Item 3</h3>
                </div>
                <div className="carousel-item">
                    <h3>Item 4</h3>
                </div>
                <div className="carousel-item">
                    <h3>Item 5</h3>
                </div>
                <div className="carousel-item">
                    <h3>Item 6</h3>
                </div>
            </Slider>
        </div>
    );
};

export default Carousel;
