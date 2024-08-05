import { memo, useState } from "react";
import '../styles/Header.css';
import { useNavigate } from "react-router-dom";

const Header = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSearch = () => {
        // Add search functionality here
        console.log(query);
    };

    return (
        <div>
            <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
                <div className="container-fluid">
                    <div className="navbar-brand" onClick={() => navigate("/")}>
                        <img src="/logo.png" height={40} className="me-2 ms-1" alt="logo" />
                        <strong>SoundScape</strong></div>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse w-100" id="mynavbar">
                        <div className="search-bar">
                            <input className="query form-control"
                                type="text"
                                value={query}
                                onChange={handleChange}
                                placeholder="Search..." />
                            <button onClick={handleSearch} className="search">
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                        <div className="account">
                            <a href="/login/" className="btn me-2 login" type="button">Đăng nhập</a>
                            <a href="/signup/" className="btn signin" type="button">Đăng ký</a>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default memo(Header);