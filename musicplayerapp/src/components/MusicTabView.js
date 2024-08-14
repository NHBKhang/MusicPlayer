import React, { useState } from 'react';
import '../styles/MusicTabView.css';

const MusicTabView = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(tabs[0].label);

    const handleTabClick = (label) => {
        setActiveTab(label);
    };

    return (
        <div className="music-tabview">
            <div className="music-tab-headers">
                {tabs.map((tab) => (
                    <button
                        key={tab.label}
                        className={`music-tab-button ${activeTab === tab.label ? 'music-active' : ''}`}
                        onClick={() => handleTabClick(tab.label)}>
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="music-tab-content">
                {tabs.map((tab) => (
                    <div
                        key={tab.label}
                        className={`music-tab-pane ${activeTab === tab.label ? 'music-active' : ''}`}
                    >
                        {activeTab === tab.label && tab.content}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MusicTabView;