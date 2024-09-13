import { memo, useState } from "react";
import '../styles/Header.css';
import { useNavigate } from "react-router-dom";
import { useUser } from "../configs/UserContext";
import NotificationDropdown from "./NotificationDropdown";
import { sidebarContents } from "./Sidebar";

const Header = () => {
    const [query, setQuery] = useState('');
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSearch = () => {
        if (query.trim() === '') {
            return;
        }
        navigate(`/search/?q=${encodeURIComponent(query.trim())}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const onLogout = (e) => {
        e.preventDefault();
        logout();
        navigate('/');
    }

    const onProfileClick = (e) => {
        e.preventDefault();
        navigate(`/profile/${user.id}/`);
    }

    const onUploadClick = (e) => {
        e.preventDefault();
        navigate('/upload/');
    }

    return (
        <div>
            <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
                <div className="container-fluid">
                    <div className="navbar-brand cursor-pointer" onClick={() => navigate("/")}>
                        <img src="/logo.png" height={40} className="me-2 ms-1" alt="logo" />
                        <strong>SoundScape</strong></div>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse w-100" id="mynavbar">
                        <ul class="navbar-nav d-sm-none d-inline cursor-pointer">
                            {sidebarContents.map(c =>
                                <li class="nav-item"
                                    onClick={() => navigate(c.href)}>
                                    <p class="nav-link active m-0">
                                        {c.icon} {c.label}
                                    </p>
                                </li>)}
                        </ul>
                        <div className="search-bar">
                            <input className="query form-control"
                                type="text"
                                value={query}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Search..." />
                            <button onClick={handleSearch} className="search">
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                        {user ? <div className="account">
                            <NotificationDropdown />
                            <div className="dropdown">
                                <button
                                    className="dropdown-toggle bg-dark no-caret"
                                    id="dropdownMenuButton"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false" >
                                    <img
                                        src={user?.avatar}
                                        alt={user?.name}
                                        width={35}
                                        className="rounded-circle" />
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                                    <li onClick={onProfileClick}>
                                        <a className="dropdown-item" href="/profile/">
                                            <i class="fa-regular fa-user"></i> Hồ sơ
                                        </a>
                                    </li>
                                    <li>
                                        <a className="dropdown-item" href="#/settings">
                                            <i class="fa-solid fa-gear"></i> Cài đặt
                                        </a>
                                    </li>
                                    <li onClick={onUploadClick}>
                                        <a className="dropdown-item" href="/upload/">
                                            <i class="fa-solid fa-upload"></i> Tải lên
                                        </a>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li onClick={onLogout}>
                                        <a className="dropdown-item" href="/logout/">
                                            <i class="fa-solid fa-right-from-bracket"></i> Đăng xuất
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div> : <div className="account">
                            <a href="/login/" className="btn me-2 login" type="button">Đăng nhập</a>
                            <a href="/signup/" className="btn signin" type="button">Đăng ký</a>
                        </div>}
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default memo(Header);