import { memo } from "react";
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer>
            <div className="mt-5 p-3 bg-dark text-white row footer">
                <div style={{justifyContent: 'space-evenly'}} className="container d-flex flex-wrap">
                    <div className="content about me-2">
                        <h4>Theo dõi chúng tôi</h4>
                        <ul style={{listStyleType: 'disc'}} className="social-icon">
                            <li><a href="https://www.facebook.com/"><i className="fa-brands fa-facebook"></i>Facebook</a></li>
                            <li><a href="https://twitter.com/"><i className="fa-brands fa-twitter"></i>Twitter</a></li>
                            <li><a href="https://www.instagram.com/"><i className="fa-brands fa-instagram"></i>Instagram</a></li>
                            <li><a href="https://www.youtube.com/"><i className="fa-brands fa-youtube"></i>Youtube</a></li>
                        </ul>
                    </div>
                    <div className="content links me-2">
                        <h4>Đường Dẫn</h4>
                        <ul className="link">
                            <li><a href="/">Trang Chủ</a></li>
                            <li><a href="/">Về Chúng Tôi</a></li>
                            <li><a href="/">Thông Tin Liên Lạc</a></li>
                            <li><a href="/">Dịch Vụ</a></li>
                            <li><a href="/">Điều Kiện Chính Sách</a></li>
                        </ul>
                    </div>
                    <div className="content help me-2">
                        <h4>Trợ giúp</h4>
                        <ul className="link">
                            <li><a href="/">Trung tâm trợ giúp</a></li>
                            <li><a href="/">Hình thức thanh toán</a></li>
                            <li><a href="/">Hướng dẫn đăng nhập</a></li>
                            <li><a href="/">Quy định sử dụng </a></li>
                            <li><a href="/">Chính sách bảo mật</a></li>
                            <li><a href="/">Liên hệ</a></li>
                        </ul>
                    </div>
                    <div className="content contactus">
                        <h4>Liên hệ</h4>
                        <ul style={{listStyleType: 'square'}}>
                            <li>CÔNG TY ABC</li>
                            <li>Trụ sở: xã Nhơn Đức, huyện Nhà Bè, TP.HCM</li>
                            <li>Tổng đài tư vấn mua hàng: <b>19003851</b></li>
                            <li>Tổng đài dịch vụ vận chuyển: <b>19005341</b></li>
                            <li>Email: <a href="mailto:nhbkhang12@gmail.com">nhbkhang12@gmail.com</a></li>
                        </ul>
                    </div>
                </div>
                <p>&copy; Nguyễn Hà Bảo Khang, 2023</p>
            </div>
        </footer>
    )
}

export default memo(Footer);