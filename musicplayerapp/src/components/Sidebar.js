import React, { memo } from 'react';
import '../styles/Sidebar.css';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
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
                    <li className={`cursor-pointer ${c.href === location.pathname && 'selected'}`}
                        onClick={() => navigate(c.href)} >
                        <span>
                            {c.icon}
                            <p>{c.label}</p>
                        </span>
                    </li>)}
            </ul>
        </div>
    );
};

export default memo(Sidebar);