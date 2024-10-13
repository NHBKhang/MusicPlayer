import React, { useEffect, useState } from "react";
import Page from ".";
import '../styles/SettingsPage.css';
import { useUser } from "../configs/UserContext";
import { authAPI, endpoints } from "../configs/API";
import { Modal } from "../components";
import { List, ListItem, ListItemText, Divider, Collapse, Typography, IconButton, TextField, Button, Box, CircularProgress, Switch } from "@mui/material";
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
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import FeedbackIcon from '@mui/icons-material/Feedback';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

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

// ACCOUNT SETTINGS
const AccountSettings = ({ goBack }) => {
    const [activeItem, setActiveItem] = useState(0);
    const [visible, setVisible] = useState(false);
    const { user, getAccessToken, saveUser } = useUser();

    const backToAccount = () => {
        setActiveItem(0);
    }

    const disable2FA = async () => {
        try {
            const res = await authAPI(await getAccessToken()).post(endpoints["disable-2fa"]);
            if (res.status === 204) {
                saveUser({ is_2fa_enabled: false }, true);
            }
        } catch (error) {
            console.error(error);
            if (error.response?.data?.detail) {
                alert(error.response?.data?.detail);
            } else {
                alert(error.message);
            }
        }
    };

    if (activeItem === 1)
        return <ChangePassword
            backToAccount={backToAccount}
            getAccessToken={getAccessToken}
            is_2fa_enabled={user.is_2fa_enabled} />
    if (activeItem === 2)
        return <TwoFactorAuth
            backToAccount={backToAccount}
            getAccessToken={getAccessToken}
            saveUser={saveUser} />

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

            <ListItem button onClick={() => setActiveItem(1)}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <VpnKeyIcon />
                </IconButton>
                <ListItemText primary="Đổi mật khẩu" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />

            <ListItem button onClick={async () => {
                if (user.is_2fa_enabled)
                    setVisible(true);
                else
                    setActiveItem(2)
            }}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <TwoFactorAuthIcon />
                </IconButton>
                <ListItemText primary="Xác thực 2 lớp (2FA)" primaryTypographyProps={{ style: { color: '#fff' } }} />
                <Switch
                    checked={user.is_2fa_enabled}
                    color="primary" />
            </ListItem>

            <Modal
                title="Xác nhận tắt tính năng bảo mật"
                label="Bạn có chắc chắn muốn vô hiệu hóa xác thực hai lớp? Việc này sẽ giảm mức độ bảo mật cho tài khoản của bạn."
                visible={visible}
                onConfirm={disable2FA}
                onCancel={() => setVisible(false)} />
        </List>
    );
};

const ChangePassword = ({ backToAccount, getAccessToken, is_2fa_enabled }) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState({});
    const [showPassword, setShowPassword] = useState({});
    const [token, setToken] = useState('');

    const updatedPassword = (field, value) => {
        setPassword(current => ({ ...current, [field]: value }));
    }

    const toggleShowPassword = (field) => {
        setShowPassword(current => ({ ...current, [field]: !current[field] }));
    };

    const handlePasswordChangeSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (password.new !== password.confirm) {
            setError('Mật khẩu mới không khớp.');
            return;
        }

        try {
            if (is_2fa_enabled) {
                await authAPI(await getAccessToken()).post(endpoints["verify-2fa"],
                    { token: token });
            }

            let res = await authAPI(await getAccessToken()).post(endpoints["set-password"],
                {
                    current_password: password.current,
                    new_password: password.new
                }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.status === 204) {
                backToAccount();
            }
        } catch (error) {
            console.error(error);
            if (error.response?.data?.detail) {
                setError(error.response?.data?.detail);
            } else {
                setError(error.message);
            }
        } finally {
            setPassword({ current: '', new: '', confirm: '' });
            setLoading(false);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handlePasswordChangeSubmit}
            sx={{
                padding: 3,
                backgroundColor: 'rgba(42, 42, 42, 0.8)',
                borderRadius: 2,
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                maxWidth: 500,
                margin: '0 auto',
            }}>
            <Typography variant="h5" align="center" gutterBottom style={{ color: '#fff' }}>
                Đổi mật khẩu
            </Typography>

            <TextField
                label="Mật khẩu hiện tại"
                type={showPassword?.current ? 'text' : 'password'}
                fullWidth
                margin="normal"
                required
                value={password?.current}
                onChange={(e) => updatedPassword('current', e.target.value)}
                InputLabelProps={{
                    style: { color: '#fff' },
                }}
                InputProps={{
                    style: { color: '#fff' },
                    endAdornment: (
                        <IconButton
                            onClick={() => toggleShowPassword('current')}
                            edge="end"
                            style={{ color: '#fff' }}>
                            {showPassword?.current ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    ),
                }} />

            <TextField
                label="Mật khẩu mới"
                type={showPassword?.new ? 'text' : 'password'}
                fullWidth
                margin="normal"
                required
                value={password?.new}
                onChange={(e) => updatedPassword('new', e.target.value)}
                InputLabelProps={{
                    style: { color: '#fff' },
                }}
                InputProps={{
                    style: { color: '#fff' },
                    endAdornment: (
                        <IconButton
                            onClick={() => toggleShowPassword('new')}
                            edge="end"
                            style={{ color: '#fff' }}>
                            {showPassword?.new ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    ),
                }} />

            <TextField
                label="Xác nhận mật khẩu"
                type={showPassword?.confirm ? 'text' : 'password'}
                fullWidth
                margin="normal"
                required
                value={password?.confirm}
                onChange={(e) => updatedPassword('confirm', e.target.value)}
                InputLabelProps={{
                    style: { color: '#fff' },
                }}
                InputProps={{
                    style: { color: '#fff' },
                    endAdornment: (
                        <IconButton
                            onClick={() => toggleShowPassword('confirm')}
                            edge="end"
                            style={{ color: '#fff' }}>
                            {showPassword?.confirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    ),
                }} />

            {is_2fa_enabled && password?.current && password?.new && password?.confirm &&
                <TextField
                    label="Mã xác thực"
                    type='text'
                    fullWidth
                    margin="normal"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    InputLabelProps={{
                        style: { color: '#fff' },
                    }}
                    InputProps={{
                        style: { color: '#fff' },
                    }} />
            }

            {error && (
                <Typography variant="body2" color="error" align="center">
                    {error}
                </Typography>
            )}

            <Box display="flex" justifyContent={loading ? 'center' : 'space-between'} mt={2}>
                {loading ? (
                    <CircularProgress size={24} />
                ) : (
                    <>
                        <Button variant="contained" color="primary" type="submit">
                            Đổi mật khẩu
                        </Button>
                        <Button variant="outlined" onClick={backToAccount}>
                            Quay lại
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    );
}

const TwoFactorAuth = ({ backToAccount, getAccessToken, saveUser }) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [QRLoading, setQRLoading] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    useEffect(() => {
        const enable2FA = async () => {
            try {
                const res = await authAPI(await getAccessToken()).post(endpoints["enable-2fa"]);
                if (res.status === 201) {
                    setQrCode(res.data.qr_code);
                    setError('');
                }
            } catch (error) {
                console.error(error);
                if (error.response?.data?.detail) {
                    alert(error.response?.data?.detail);
                } else {
                    alert(error.message);
                }
            }
        };

        enable2FA();
    }, [getAccessToken]);

    const handle2FAVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let res = await authAPI(await getAccessToken()).post(endpoints["verify-2fa"],
                { token: verificationCode });
            if (res.status === 200) {
                saveUser({ is_2fa_enabled: true }, true);
                setQrCode('');
                setVerificationCode('');
                backToAccount();
            }
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.detail || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendQRCode = async (e) => {
        e.preventDefault();
        setQRLoading(true);

        try {
            let res = await authAPI(await getAccessToken()).get(endpoints["resend-2fa-qr"]);
            if (res.status === 202) setQrCode(res.data.qr_code);
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.detail || error.message);
        } finally {
            setQRLoading(false);
        }
    }

    return (
        <Box
            component="form"
            onSubmit={handle2FAVerify}
            sx={{
                padding: 3,
                backgroundColor: 'rgba(42, 42, 42, 0.8)',
                borderRadius: 2,
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                maxWidth: 500,
                margin: '0 auto',
            }}>
            <Typography variant="h5" align="center" gutterBottom style={{ color: '#fff' }}>
                Xác thực 2 lớp
            </Typography>

            {qrCode ? (
                <Box mt={2} textAlign="center">
                    <img src={qrCode} alt="QR Code for 2FA" style={{ maxWidth: '100%', height: 'auto' }} className="mb-2" />
                    <Typography variant="body2" style={{ color: '#fff', marginTop: 8 }}>
                        Quét mã QR bằng ứng dụng xác thực của bạn.
                    </Typography>
                </Box>
            ) :
                <Button
                    variant="contained"
                    onClick={handleResendQRCode}
                    sx={{ mt: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}>
                    {QRLoading ? <CircularProgress size={25} /> : 'Gửi lại mã QR'}
                </Button>
            }

            <TextField
                label="Mã xác thực"
                type="text"
                fullWidth
                margin="normal"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                InputLabelProps={{
                    style: { color: '#fff' },
                }}
                InputProps={{
                    style: { color: '#fff' },
                }} />

            {error && (
                <Typography variant="body2" color="error" align="center">
                    {error}
                </Typography>
            )}

            <Box display="flex" justifyContent={loading ? 'center' : 'space-between'} mt={2}>
                {loading ? (
                    <CircularProgress size={24} />
                ) : (
                    <>
                        <Button variant="contained" color="primary" type="submit">
                            Xác thực
                        </Button>
                        <Button variant="outlined" onClick={backToAccount}>
                            Quay lại
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    );
}

// PRIVACY SETTINGS
const PrivacySettings = ({ goBack }) => {
    const [open, setOpen] = useState(false);

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

            <ListItem button onClick={() => setOpen(!open)}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <PrivacyTipIcon />
                </IconButton>
                <ListItemText primary="Chính sách & Quyền riêng tư" primaryTypographyProps={{ style: { color: '#fff' } }} />
                <IconButton edge="end" style={{ color: '#fff' }}>
                    {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit className="text-start">
                <Typography className="settings-typography">
                    <Typography variant="h5" gutterBottom>
                        Chính Sách và Quyền Riêng Tư
                    </Typography>
                    <Typography variant="body1" paragraph>
                        <strong>Giới thiệu:</strong> Chào mừng bạn đến với SoundScape! Chúng tôi rất coi trọng quyền riêng tư của bạn và cam kết bảo vệ thông tin cá nhân khi bạn sử dụng dịch vụ của chúng tôi.
                    </Typography>
                    <Typography variant="body1" paragraph>
                        <strong>Thông tin chúng tôi thu thập:</strong> Chúng tôi thu thập thông tin cá nhân từ bạn trong quá trình bạn tạo tài khoản, sử dụng dịch vụ, và tương tác với nền tảng của chúng tôi. Thông tin này bao gồm tên, địa chỉ email, và các sở thích nghe nhạc của bạn.
                    </Typography>
                    <Typography variant="body1" paragraph>
                        <strong>Mục đích sử dụng thông tin:</strong> Thông tin của bạn được sử dụng để:
                        <ul>
                            <li>Cung cấp và cải thiện dịch vụ nghe nhạc.</li>
                            <li>Cá nhân hóa trải nghiệm của bạn bằng cách đề xuất nội dung phù hợp.</li>
                            <li>Đảm bảo an toàn tài khoản thông qua xác thực hai lớp (2FA).</li>
                            <li>Thông báo cho bạn về các cập nhật và tin tức quan trọng.</li>
                        </ul>
                    </Typography>
                    <Typography variant="body1" paragraph>
                        <strong>Bảo mật thông tin:</strong> Chúng tôi thực hiện các biện pháp bảo mật nghiêm ngặt để bảo vệ thông tin cá nhân của bạn khỏi các truy cập trái phép. Chúng tôi cam kết rằng thông tin của bạn sẽ không được bán hay chia sẻ với bên thứ ba mà không có sự đồng ý của bạn.
                    </Typography>
                    <Typography variant="body1" paragraph>
                        <strong>Quyền của bạn:</strong> Bạn có quyền:
                        <ul>
                            <li>Truy cập và chỉnh sửa thông tin tài khoản của mình.</li>
                            <li>Yêu cầu xóa tài khoản hoặc ngừng sử dụng dịch vụ.</li>
                            <li>Từ chối việc thu thập và sử dụng thông tin cá nhân cho các mục đích khác.</li>
                        </ul>
                    </Typography>
                    <Typography variant="body1" paragraph>
                        <strong>Cookie và công nghệ theo dõi:</strong> Chúng tôi sử dụng cookie để nâng cao trải nghiệm người dùng và theo dõi việc sử dụng dịch vụ. Bạn có thể điều chỉnh cài đặt cookie trong trình duyệt của mình.
                    </Typography>
                    <Typography variant="body1" paragraph>
                        <strong>Thay đổi chính sách:</strong> Chúng tôi có quyền thay đổi chính sách này bất cứ lúc nào và sẽ thông báo rõ ràng cho bạn về các thay đổi.
                    </Typography>
                    <Typography variant="body1" paragraph>
                        <strong>Liên hệ với chúng tôi:</strong> Nếu bạn có bất kỳ câu hỏi nào về chính sách này, vui lòng liên hệ với chúng tôi qua email: nhbkhang12@gmail.com
                    </Typography>
                </Typography>
            </Collapse>
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

// NOTIFICATION SETTINGS
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

            <ListItem button>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <NotificationsIcon />
                </IconButton>
                <ListItemText primary="Thông báo chung" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />

            <ListItem button>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <NotificationImportantIcon />
                </IconButton>
                <ListItemText primary="Thông báo quan trọng" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />

            <ListItem button>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <ErrorOutlineIcon />
                </IconButton>
                <ListItemText primary="Thông báo lỗi" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
        </List>
    )
};

// HELP SETTINGS
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

            <ListItem button onClick={() => window.open('/support/faq/', '_blank')}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <HelpIcon />
                </IconButton>
                <ListItemText primary="Trung tâm hỗ trợ" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />

            <ListItem button onClick={() => window.open('/support/faq/', '_blank')}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <HelpIcon />
                </IconButton>
                <ListItemText primary="Câu hỏi thường gặp" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />

            <ListItem button onClick={() => window.open('/support/tickets/', '_blank')}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <ContactSupportIcon />
                </IconButton>
                <ListItemText primary="Liên hệ hỗ trợ" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
            <Divider style={{ backgroundColor: '#444' }} />

            <ListItem button onClick={() => window.open('/support/feedback/', '_blank')}>
                <IconButton edge="start" style={{ color: '#fff' }}>
                    <FeedbackIcon />
                </IconButton>
                <ListItemText primary="Gửi phản hồi" primaryTypographyProps={{ style: { color: '#fff' } }} />
            </ListItem>
        </List>
    )
};

// ABOUT SETTINGS
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
                    <strong>Tên ứng dụng:</strong> SoundScape
                    <br />
                    <strong>Phiên bản:</strong> 1.0.5
                    <br />
                    <strong>Ngày phát hành:</strong> 10 tháng 10, 2024
                    <br />
                    <strong>Tính năng mới:</strong>
                    <ul>
                        <li>Echo Support AI: chatbox hỗ trợ người dùng.</li>
                        <li>Hỗ trợ xác thực hai lớp (2FA) để bảo mật tài khoản người dùng.</li>
                        <li>Chức năng nhận diện bài hát thông minh.</li>
                        <li>Có thể tạo và chia sẻ danh sách phát cá nhân.</li>
                        <li>Khả năng bình luận và đánh giá các bài hát.</li>
                        <li>Sửa lỗi.</li>
                    </ul>
                    <strong>Chính sách bảo mật:</strong> Ứng dụng cam kết bảo vệ thông tin cá nhân của người dùng theo tiêu chuẩn cao nhất và tuân thủ các quy định về bảo mật thông tin.
                    <br />
                    <strong>Liên hệ hỗ trợ:</strong> Nếu bạn gặp bất kỳ vấn đề gì, vui lòng liên hệ với chúng tôi qua email support@soundscape.com.
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
                    <strong>Nhà phát triển ứng dụng:</strong> Nguyễn Hà Bảo Khang. Chúng tôi là một nhóm chuyên gia đam mê công nghệ và âm nhạc, cam kết mang đến cho người dùng những trải nghiệm nghe nhạc tốt nhất qua ứng dụng SoundScape. Với sứ mệnh kết nối con người qua âm nhạc, chúng tôi tin rằng âm nhạc không chỉ là một phần trong cuộc sống mà còn là một ngôn ngữ toàn cầu giúp xóa nhòa mọi khoảng cách giữa các nền văn hóa và thế hệ.
                    <br />
                    <br />
                    Ứng dụng của chúng tôi được thiết kế với tâm huyết nhằm cung cấp cho người dùng một không gian tuyệt vời để khám phá, thưởng thức và chia sẻ âm nhạc. Tại SoundScape, người dùng có thể tìm kiếm hàng triệu bài hát từ các thể loại khác nhau, từ nhạc pop, rock, jazz đến nhạc cổ điển và hơn thế nữa. Chúng tôi đã tạo ra một thư viện âm nhạc phong phú, nơi bạn có thể dễ dàng tìm thấy những bản nhạc yêu thích của mình cũng như khám phá những tác phẩm mới lạ, đầy cảm hứng từ các nghệ sĩ trên toàn thế giới.
                    <br />
                    <br />
                    Chúng tôi hiểu rằng mỗi người dùng đều có sở thích và gu âm nhạc riêng, vì vậy chúng tôi đã triển khai các tính năng cá nhân hóa thông minh. Hệ thống gợi ý của chúng tôi sẽ giúp bạn tìm kiếm những bài hát và danh sách phát phù hợp nhất với tâm trạng và sở thích của bạn, giúp bạn dễ dàng khám phá những âm thanh mới và những trải nghiệm mới.
                    <br />
                    <br />
                    Không chỉ dừng lại ở việc thưởng thức âm nhạc, chúng tôi cũng khuyến khích người dùng tương tác và chia sẻ quan điểm của họ về các bài hát thông qua các bình luận và đánh giá. Đây không chỉ là một nền tảng nghe nhạc mà còn là một cộng đồng yêu thích âm nhạc, nơi bạn có thể kết nối với những người có cùng sở thích, cùng nhau khám phá những xu hướng mới trong âm nhạc và chia sẻ những trải nghiệm của riêng mình.
                    <br />
                    <br />
                    Đội ngũ phát triển của chúng tôi luôn nỗ lực cải tiến và tối ưu hóa ứng dụng, đảm bảo rằng người dùng luôn có trải nghiệm tốt nhất. Chúng tôi lắng nghe phản hồi của bạn và thực hiện các cập nhật thường xuyên để nâng cao hiệu suất và tính năng của ứng dụng. Sự hài lòng của bạn là động lực lớn nhất để chúng tôi không ngừng phát triển.
                    <br />
                    <br />
                    Để đảm bảo an toàn và bảo mật cho người dùng, chúng tôi đã tích hợp nhiều tính năng bảo mật như xác thực hai lớp (2FA), nhằm bảo vệ thông tin cá nhân của bạn. Chúng tôi cam kết rằng mọi thông tin của bạn sẽ được bảo mật và không bao giờ bị chia sẻ cho bên thứ ba mà không có sự đồng ý của bạn.
                    <br />
                    <br />
                    Nếu bạn có bất kỳ câu hỏi nào, hoặc muốn chia sẻ ý kiến và góp ý của mình về ứng dụng, xin đừng ngần ngại liên hệ với chúng tôi qua email: <a href="mailto:nhbkhang12@gmail.com">nhbkhang12@gmail.com</a>. Chúng tôi rất trân trọng mọi phản hồi từ bạn, vì đó chính là cơ hội để chúng tôi cải thiện và phát triển.
                    <br />
                    <br />
                    Cuối cùng, chúng tôi muốn gửi lời cảm ơn chân thành đến bạn vì đã lựa chọn SoundScape làm bạn đồng hành trong hành trình âm nhạc của mình. Hãy cùng nhau khám phá và tận hưởng những giai điệu tuyệt vời, tạo nên những kỷ niệm đáng nhớ và kết nối sâu sắc hơn qua âm nhạc. Chúng tôi rất mong chờ được đồng hành cùng bạn trên con đường khám phá âm nhạc này, và hy vọng rằng SoundScape sẽ là nơi bạn tìm thấy niềm vui và sự kết nối qua những giai điệu yêu thích của mình.
                </Typography>
            </Collapse>
        </List>
    )
};

// PREMIUM SETTINGS
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