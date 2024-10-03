import React from "react";
import Page from ".";
import { List, ListItem, ListItemText, Divider, Typography, IconButton } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const SettingsPage = () => {
    return (
        <Page title={"Cài đặt"} style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white' }}>
            <div className="py-2 px-5">
                <Typography variant="h4" style={{ textAlign: 'center', fontWeight: '500', marginBottom: '16px', color: '#fff' }}>
                    Cài đặt
                </Typography>
                <List
                    style={{
                        border: '1px solid #444',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(42, 42, 42, 0.5)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}>
                    <ListItem button>
                        <IconButton edge="start" style={{ color: '#fff' }}>
                            <AccountCircleIcon />
                        </IconButton>
                        <ListItemText primary="Tài khoản" primaryTypographyProps={{ style: { color: '#fff' } }} />
                    </ListItem>
                    <Divider style={{ backgroundColor: '#444' }} />
                    <ListItem button>
                        <IconButton edge="start" style={{ color: '#fff' }}>
                            <PrivacyTipIcon />
                        </IconButton>
                        <ListItemText primary="Quyền riêng tư" primaryTypographyProps={{ style: { color: '#fff' } }} />
                    </ListItem>
                    <Divider style={{ backgroundColor: '#444' }} />
                    <ListItem button>
                        <IconButton edge="start" style={{ color: '#fff' }}>
                            <NotificationsIcon />
                        </IconButton>
                        <ListItemText primary="Thông báo" primaryTypographyProps={{ style: { color: '#fff' } }} />
                    </ListItem>
                    <Divider style={{ backgroundColor: '#444' }} />
                    <ListItem button>
                        <IconButton edge="start" style={{ color: '#fff' }}>
                            <HelpIcon />
                        </IconButton>
                        <ListItemText primary="Hỗ trợ" primaryTypographyProps={{ style: { color: '#fff' } }} />
                    </ListItem>
                    <Divider style={{ backgroundColor: '#444' }} />
                    <ListItem button>
                        <IconButton edge="start" style={{ color: '#fff' }}>
                            <InfoIcon />
                        </IconButton>
                        <ListItemText primary="Giới thiệu ứng dụng" primaryTypographyProps={{ style: { color: '#fff' } }} />
                    </ListItem>
                    <Divider style={{ backgroundColor: '#444' }} />
                    <ListItem button onClick={() => window.open('/premium/', '_blank')}>
                        <IconButton edge="start" style={{ color: '#fff' }}>
                            <WorkspacePremiumIcon style={{ color: 'gold' }} />
                        </IconButton>
                        <ListItemText primary="Đăng ký Premium" primaryTypographyProps={{ style: { color: '#fff' } }} />
                    </ListItem>
                </List>
            </div>
        </Page>
    );
}

export default SettingsPage;