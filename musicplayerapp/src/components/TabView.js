import React, { useState } from 'react';
import '../styles/TabView.css';

const TabView = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(tabs[0].label);

    const handleTabClick = (label) => {
        setActiveTab(label);
    };

    return (
        <div>
            <div className="tab-header">
                {tabs.map((tab) => (
                    <button
                        key={tab.label}
                        className={`tab-button ${activeTab === tab.label ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab.label)}>
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="tab-content">
                {tabs.map((tab) => (
                    activeTab === tab.label && (
                        <div key={tab.label}>
                            {tab.content}
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default TabView;