import React, { useRef, useEffect, useState } from 'react';
import '../styles/MusicTabView.css';
import API, { endpoints } from '../configs/API';

const MusicTabView = ({ tabs, queryset, activeTab, onTabChange }) => {
    const contentRef = useRef(null);
    const [genres, setGenres] = useState([]);
    const { query, genreQuery, setGenreQuery, genreParam } = queryset;

    const handleTabClick = (index) => {
        onTabChange(index);
    };

    const handleGenreChange = (e) => {
        setGenreQuery(e.target.value);
    };

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [activeTab]);

    useEffect(() => {
        const loadGenres = async () => {
            try {
                let res = await API.get(endpoints.genres);
                setGenres(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        loadGenres();
    }, []);

    return (
        <div className="music-tabview">
            <div className="music-tabview-fixed">
                <p className='mb-1 p-1 fs-4'>Kết quả tìm cho "{query}"</p>
                {activeTab !== 2 && activeTab !== 0 &&
                    <select id="genre" value={genreQuery}
                        onChange={(e) => handleGenreChange(e)}>
                        <option value={0} disabled selected>Chọn thể loại</option>
                        {genres.map((genre, index) => (
                            <option key={index} value={genre.id}>
                                {genre.name}
                            </option>
                        ))}
                    </select>}
                <div className="music-tab-headers">
                    {tabs.map((tab, index) => {
                        if (genreParam) {
                            return (index !== 0 && index !== 2 &&
                                <button
                                    key={index}
                                    className={`music-tab-button ${activeTab === index ? 'music-active' : ''}`}
                                    onClick={() => handleTabClick(index)}>
                                    {tab.label}
                                </button>
                            )
                        } else {
                            return (
                                <button
                                    key={index}
                                    className={`music-tab-button ${activeTab === index ? 'music-active' : ''}`}
                                    onClick={() => handleTabClick(index)}>
                                    {tab.label}
                                </button>
                            )
                        }
                    })}
                </div>
            </div>
            <div className="music-tab-content" ref={contentRef}>
                {tabs.map((tab, index) => {
                    if (genreParam) {
                        return (index !== 0 && index !== 2 &&
                            <div
                                key={index}
                                className={`music-tab-pane ${activeTab === index ? 'music-active' : 'music-inactive'}`}>
                                {tab.content}
                            </div>
                        );
                    }
                    return <div
                        key={index}
                        className={`music-tab-pane ${activeTab === index ? 'music-active' : 'music-inactive'}`}>
                        {tab.content}
                    </div>;
                })}
            </div>
        </div>
    );
};

export default MusicTabView;