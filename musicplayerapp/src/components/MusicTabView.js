import React, { useRef, useEffect } from 'react';
import '../styles/MusicTabView.css';

const MusicTabView = ({ tabs, query, activeTab, onTabChange }) => {
    const contentRef = useRef(null);

    const handleTabClick = (index) => {
        onTabChange(index);
    };

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [activeTab]);

    return (
        <div className="music-tabview">
            <div className="music-tabview-fixed">
                <p className='m-2 mb-3 p-1 fs-4'>Kết quả tìm cho "{query}"</p>
                <div className="music-tab-headers">
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            className={`music-tab-button ${activeTab === index ? 'music-active' : ''}`}
                            onClick={() => handleTabClick(index)}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="music-tab-content" ref={contentRef}>
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        className={`music-tab-pane ${activeTab === index ? 'music-active' : 'music-inactive'}`}>
                        {tab.content}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MusicTabView;