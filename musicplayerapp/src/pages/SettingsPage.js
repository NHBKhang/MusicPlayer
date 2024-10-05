import React, { useState } from "react";
import Page from ".";
import '../styles/SettingsPage.css';
import { useUser } from "../configs/UserContext";
import { List, ListItem, ListItemText, Divider, Collapse, Typography, IconButton } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import TwoFactorAuthIcon from '@mui/icons-material/VerifiedUser';

const SettingsPage = () => {
    const [currentPage, setCurrentPage] = useState('main');

    const handleBackClick = () => {
        setCurrentPage('main');
    };

    const renderMainSettings = () => (
        <List
            style={{
                border: '1px solid #444',
                borderRadius: '8px',
                backgroundColor: 'rgba(42, 42, 42, 0.5)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
            <ListItem button onClick={() => setCurrentPage('account')}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <AccountCircleIcon />
                </IconButton>
                <ListItemText primary="Tài khoản" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />

            {/* Privacy Section */}
            <ListItem button onClick={() => setCurrentPage('privacy')}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <PrivacyTipIcon />
                </IconButton>
                <ListItemText primary="Quyền riêng tư" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />

            {/* Notifications Section */}
            <ListItem button onClick={() => setCurrentPage('notification')}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <NotificationsIcon />
                </IconButton>
                <ListItemText primary="Thông báo" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />

            {/* Help Section */}
            <ListItem button onClick={() => setCurrentPage('help')}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <HelpIcon />
                </IconButton>
                <ListItemText primary="Hỗ trợ" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />

            {/* About Section */}
            <ListItem button onClick={() => setCurrentPage('about')}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <InfoIcon />
                </IconButton>
                <ListItemText primary="Giới thiệu" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />

            {/* Premium Section */}
            <ListItem button onClick={() => setCurrentPage('premium')}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <WorkspacePremiumIcon style={{ color: 'gold' }} />
                </IconButton>
                <ListItemText primary="Đăng ký Premium" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
        </List>
    );

    return (
        <Page title={"Cài đặt"} style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white' }}>
            <div className="py-2 px-5">
                <Typography variant="h4" style={{ textAlign: 'center', fontWeight: '500', marginBottom: '16px', color: '#fff' }}>
                    Cài đặt
                </Typography>

                {(() => {
                    switch (currentPage) {
                        case 'main':
                            return renderMainSettings();
                        case 'account':
                            return <AccountSettings goBack={handleBackClick} />;
                        case 'privacy':
                            return <PrivacySettings goBack={handleBackClick} />;
                        case 'notification':
                            return <NotificationSettings goBack={handleBackClick} />;
                        case 'help':
                            return <HelpSettings goBack={handleBackClick} />;
                        case 'about':
                            return <AboutSettings goBack={handleBackClick} />;
                        case 'premium':
                            return <PremiumSettings goBack={handleBackClick} />;
                        default:
                            return null;
                    }
                })()}
            </div>
        </Page>
    );
};

const AccountSettings = ({ goBack }) => {
    return (
        <List
            style={{
                border: '1px solid #444',
                borderRadius: '8px',
                backgroundColor: 'rgba(42, 42, 42, 0.5)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
            <ListItem button onClick={goBack}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <ArrowBackIcon />
                </IconButton>
                <ListItemText primary="Quay lại" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />

            <ListItem button>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <VpnKeyIcon />
                </IconButton>
                <ListItemText primary="Đổi mật khẩu" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem><Divider style={{ backgroundColor: '#444' }} />

            <ListItem button>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <TwoFactorAuthIcon />
                </IconButton>
                <ListItemText primary="Xác thực 2 lớp (2FA)" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
        </List>
    )
};

const NotificationSettings = ({ goBack }) => {
    return (
        <List
            style={{
                border: '1px solid #444',
                borderRadius: '8px',
                backgroundColor: 'rgba(42, 42, 42, 0.5)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
            <ListItem button onClick={goBack}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <ArrowBackIcon />
                </IconButton>
                <ListItemText primary="Quay lại" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />
        </List>
    )
};

const HelpSettings = ({ goBack }) => {
    return (
        <List
            style={{
                border: '1px solid #444',
                borderRadius: '8px',
                backgroundColor: 'rgba(42, 42, 42, 0.5)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
            <ListItem button onClick={goBack}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <ArrowBackIcon />
                </IconButton>
                <ListItemText primary="Quay lại" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />
        </List>
    )
};

const PrivacySettings = ({ goBack }) => {
    return (
        <List
            style={{
                border: '1px solid #444',
                borderRadius: '8px',
                backgroundColor: 'rgba(42, 42, 42, 0.5)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
            <ListItem button onClick={goBack}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <ArrowBackIcon />
                </IconButton>
                <ListItemText primary="Quay lại" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />

            <ListItem button>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <PrivacyTipIcon />
                </IconButton>
                <ListItemText primary="Chính sách quyền riêng tư" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />

            <ListItem button>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <DeleteIcon />
                </IconButton>
                <ListItemText primary="Xóa tài khoản và dữ liệu" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
        </List>
    )
};

const AboutSettings = ({ goBack }) => {
    const [open, setOpen] = useState({
        app: false,
        me: false
    });
    const updatedOpen = (field, value) => {
        setOpen(current => ({ ...current, [field]: value }));
    }

    return (
        <List
            style={{
                border: '1px solid #444',
                borderRadius: '8px',
                backgroundColor: 'rgba(42, 42, 42, 0.5)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
            <ListItem button onClick={goBack}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <ArrowBackIcon />
                </IconButton>
                <ListItemText primary="Quay lại" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />

            <ListItem button onClick={() => updatedOpen('app', !open.app)}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <InfoIcon />
                </IconButton>
                <ListItemText primary="Giới thiệu về ứng dụng" primaryTypographyProps={{ style: { color: '#fff' } }} />
                <IconButton edge="end" style={{ color: '#fff' }}>
                    {open.app ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </ListItem>
            <Collapse in={open.app} timeout="auto" unmountOnExit>
                <Typography variant="body1" className="settings-typography">
                    Ứng dụng này là một nền tảng nghe nhạc trực tuyến giúp người dùng khám phá và thưởng thức âm nhạc
                    yêu thích. Bạn có thể tìm kiếm, nghe và tạo danh sách phát cá nhân từ một thư viện âm nhạc phong phú.
                    Ứng dụng hỗ trợ các tính năng như nhận diện bài hát, bình luận, đánh giá, và chia sẻ nhạc với bạn bè.
                </Typography>
            </Collapse>
            <Divider style={{ backgroundColor: '#444' }} />

            <ListItem button onClick={() => updatedOpen('me', !open.me)}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <InfoIcon />
                </IconButton>
                <ListItemText primary="Giới thiệu về nhà phát triển" primaryTypographyProps={{ style: { color: '#fff' } }} />
                <IconButton edge="end" style={{ color: '#fff' }}>
                    {open.me ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </ListItem>
            <Collapse in={open.me} timeout="auto" unmountOnExit>
                <Typography variant="body1" className="settings-typography">
                    Nhà phát triển ứng dụng: Nguyễn Hà Bảo Khang. Chúng tôi chuyên tạo ra các giải pháp công nghệ sáng tạo,
                    mang lại trải nghiệm nghe nhạc tốt nhất cho người dùng. Đừng ngần ngại liên hệ với chúng tôi nếu có bất kỳ câu hỏi hoặc góp ý nào.
                </Typography>
            </Collapse>
        </List>
    )
};

const PremiumSettings = ({ goBack }) => {
    const { user } = useUser();

    const isPremiumUser = user.premium;
    const premiumEndDate = isPremiumUser ? new Date(user.premium.end_date) : null;

    return (
        <List
            style={{
                border: '1px solid #444',
                borderRadius: '8px',
                backgroundColor: 'rgba(42, 42, 42, 0.5)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
            <ListItem button onClick={goBack}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <ArrowBackIcon />
                </IconButton>
                <ListItemText primary="Quay lại" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />

            <Typography variant="body1" className="settings-typography">
                {isPremiumUser ?
                    `Bạn đã đăng ký Premium! Thời gian kết thúc: ${premiumEndDate.toLocaleDateString()}` :
                    "Bạn chưa đăng ký dịch vụ Premium."}
            </Typography>

            <ListItem button onClick={() => window.open('/premium/', '_blank')}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <WorkspacePremiumIcon style={{ color: 'gold' }} />
                </IconButton>
                <ListItemText
                    primary={isPremiumUser ? "Gia hạn Premium ngay!" : "Đăng ký Premium ngay!"}
                    primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
        </List>
    )
};

export default SettingsPage;