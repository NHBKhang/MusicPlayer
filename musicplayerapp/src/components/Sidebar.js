import React, { memo } from 'react';
import '../styles/Sidebar.css';
import { useLocation, useNavigate } from 'react-router-dom';

export const sidebarContents = [{
    href: '/',
    icon: <i class="fa-solid fa-house"></i>,
    label: 'Trang chủ'
}, {
    href: '/library/',
    icon: <i class="fa-solid fa-list"></i>,
    label: 'Thư viện'
}, {
    href: '/live/',
    icon: <i class="fa-solid fa-tower-broadcast"></i>,
    label: 'Phát trực tiếp'
}];

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="sidebar bg-dark">
            <ul className='sidebar-content'>
                {sidebarContents.map(c =>
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