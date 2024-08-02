import React, { memo } from 'react';
import '../styles/Sidebar.css';
import { useLocation } from 'react-router-dom';

const Sidebar = () => {
    const contents = [{
        href: '/',
        icon: <i class="fa-solid fa-house"></i>,
        label: 'Trang chủ'
    }, {
        href: '#',
        icon: <i class="fa-solid fa-list"></i>,
        label: 'Thư viện'
    }];

    const location = useLocation();

    return (
        <div className="sidebar bg-dark">
            <ul className='sidebar-content'>
                {contents.map(c =>
                    <li className={c.href === location.pathname && 'selected'}>
                        <a href={c.href}>
                            {c.icon}
                            <p>{c.label}</p>
                        </a>
                    </li>)}
            </ul>
        </div>
    );
};

export default memo(Sidebar);