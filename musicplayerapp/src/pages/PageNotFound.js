import React from 'react';
import { Link } from 'react-router-dom';

const PageNotFound = () => {
    return (
        <div style={{ textAlign: 'center', padding: '50px' }} className='page-not-found'>
            <h1>404 - Page Not Found</h1>
            <p>Oops! The page you are looking for does not exist.</p>
            <Link to="/">Go back to Home</Link>
        </div>
    );
};

export default PageNotFound;