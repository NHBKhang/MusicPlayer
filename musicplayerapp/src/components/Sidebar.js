import React, { memo } from 'react';
import '../styles/Sidebar.css';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ contentArea }) => {
    const contents = [{
        href: '/',
        icon: <i class="fa-solid fa-house"></i>,
        label: 'Trang chủ'
    }, {
        href: '/library/',
        icon: <i class="fa-solid fa-list"></i>,
        label: 'Thư viện'
    }];

    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="sidebar bg-dark">
            <ul className='sidebar-content'>
                {contents.map(c =>
                    <li className={c.href === location.pathname && 'selected'}>
                        <a onClick={(e) => {
                            e.preventDefault();
                            navigate(c.href);
                        }} href='/'>
                            {c.icon}
                            <p>{c.label}</p>
                        </a>
                    </li>)}
            </ul>
        </div>
    );
};

export default memo(Sidebar);