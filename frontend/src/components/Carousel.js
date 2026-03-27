import React, { useState } from 'react';
import api from '../api';
import './Carousel.css';

const Carousel = ({ images }) => {
    const [current, setCurrent] = useState(0);

    if (!images || images.length === 0) return null;

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${api.defaults.baseURL.replace('/api', '')}/${url}`;
    };

    const prev = () => setCurrent(current === 0 ? images.length - 1 : current - 1);
    const next = () => setCurrent(current === images.length - 1 ? 0 : current + 1);

    return (
        <div className="carousel">
            <div className="carousel-slide">
                <img
                    src={getImageUrl(images[current].url)}
                    alt={`Slide ${current + 1}`}
                    className="carousel-image"
                />
                {images.length > 1 && (
                    <>
                        <button className="carousel-btn carousel-btn-left" onClick={prev}>‹</button>
                        <button className="carousel-btn carousel-btn-right" onClick={next}>›</button>
                        <div className="carousel-dots">
                            {images.map((_, i) => (
                                <span
                                    key={i}
                                    className={`carousel-dot ${i === current ? 'active' : ''}`}
                                    onClick={() => setCurrent(i)}
                                />
                            ))}
                        </div>
                        <span className="carousel-counter">{current + 1} / {images.length}</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default Carousel;