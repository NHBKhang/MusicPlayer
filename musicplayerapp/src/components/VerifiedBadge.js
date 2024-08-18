import React from 'react';

const VerifiedBadge = () => {
    const badgeStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1da1f2', 
        color: 'white',
        fontSize: '1rem', 
        marginLeft: '8px',
        padding: '4px', 
        borderRadius: '50%',
        width: '21px', 
        height: '21px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        backgroundImage: 'linear-gradient(135deg, #1da1f2 0%, #0a74da 100%)',
    };

    const checkmarkStyle = {
        fontWeight: 'bold',
        fontSize: '12px',
    };

    return (
        <span style={badgeStyle}>
            <span style={checkmarkStyle}>✔️</span>
        </span>
    );
};

export default VerifiedBadge;