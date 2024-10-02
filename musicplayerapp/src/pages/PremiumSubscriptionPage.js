import React from "react";
import { Container, Typography, Button, Box, Grid, Card, CardContent, CardActions } from "@mui/material";
import { usePageTitle } from "../components/PageTitle";
import { useUser } from "../configs/UserContext";
import { useNavigate } from "react-router-dom";
import API, { endpoints } from "../configs/API";

const PremiumSubscriptionPage = () => {
    usePageTitle("Đăng ký Premium");
    const { user } = useUser();
    const navigate = useNavigate();

    const handleSubscribe = async (duration) => {
        if (!user) {
            alert("Vui lòng đăng nhập để tiếp tục");
            return;
        }
        
        let amount;
        switch (duration) {
            case 'daily':
                amount = 0.19;
                break;
            case 'monthly':
                amount = 4.99;
                break;
            case 'yearly':
                amount = 49.99
                break;
            default:
                alert("Lỗi hệ thống");
                return;
        }
        
        const txnRef = `${duration[0]}${user.id}${new Date().getTime()}`;
        const orderInfo = `Payment for ${duration} premium`;

        const payload = {
            amount: amount,
            return_url: `${window.location.origin}/payment-success/`,
            cancel_url: `${window.location.origin}/payment-cancel/`,
            txn_ref: txnRef,
            order_info: orderInfo,
            type: duration,
            user_id: user.id
        };

        try {
            const res = await API.post(endpoints["paypal-subscribe-premium"], payload);
            const { approval_url } = res.data;
            window.location.href = approval_url;
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.detail || "Lỗi chuyển hướng đến Paypal");
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <div className="container-fluid header bg-dark">
                <div className="navbar-brand cursor-pointer" onClick={() => navigate('/')}>
                    <img src="/logo.png" height={40} className="me-2 ms-1" alt="logo" />
                    <strong>SoundScape</strong>
                </div>
                {user ? <div className="account">
                    <img
                        src={user?.avatar}
                        alt={user?.name}
                        width={35}
                        className="rounded-circle" />
                </div> : <div className="account">
                    <a href={`/login/?next=${window.location.href}`} className="btn me-2 login" type="button">Đăng nhập</a>
                    <a href="/signup/" className="btn signin" type="button">Đăng ký</a>
                </div>}
            </div>
            <Container maxWidth="md" style={{ paddingTop: '80px', paddingBottom: '20px' }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Đăng ký Premium
                </Typography>
                <Typography variant="body1" align="center" paragraph>
                    Nâng cấp lên Premium để tận hưởng những lợi ích tuyệt vời:
                </Typography>
                <Box style={{ marginBottom: '20px', textAlign: 'start' }}>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        <li>
                            <Typography variant="body1">✅ Tải lên tệp lớn hơn 30MB</Typography>
                            <Typography variant="body2" style={{ marginLeft: '20px', color: '#666' }}>
                                Nâng cấp lên Premium cho phép bạn tải lên các tệp âm thanh hoặc video với kích thước lớn hơn giới hạn thông thường.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1">✅ Truy cập vào các tính năng độc quyền</Typography>
                            <Typography variant="body2" style={{ marginLeft: '20px', color: '#666' }}>
                                Hưởng lợi từ những tính năng chỉ có cho người dùng Premium, giúp trải nghiệm của bạn trở nên phong phú hơn.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1">✅ Không có quảng cáo làm phiền</Typography>
                            <Typography variant="body2" style={{ marginLeft: '20px', color: '#666' }}>
                                Thoải mái nghe nhạc mà không bị gián đoạn bởi quảng cáo.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1">✅ Hỗ trợ ưu tiên từ đội ngũ kỹ thuật</Typography>
                            <Typography variant="body2" style={{ marginLeft: '20px', color: '#666' }}>
                                Nhận sự hỗ trợ nhanh chóng và ưu tiên từ đội ngũ kỹ thuật của chúng tôi khi gặp vấn đề.
                            </Typography>
                        </li>
                    </ul>
                </Box>
                <Typography variant="h6" align="center" gutterBottom>
                    Chọn gói đăng ký của bạn:
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                        <Card
                            variant="outlined"
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #ccc',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                borderRadius: '10px',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <CardContent>
                                <Typography variant="h5" align="center" style={{ color: '#000' }}>Đăng ký hàng ngày</Typography>
                                <Typography variant="h6" align="center" gutterBottom style={{ color: '#000' }}>
                                    0.19$ / ngày
                                </Typography>
                                <Typography variant="body2" align="center" style={{ color: '#000' }}>
                                    Hủy bất kỳ lúc nào.
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleSubscribe('daily')}
                                    style={{ width: '100%' }}>
                                    Đăng ký ngay
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Card
                            variant="outlined"
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #ccc',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                borderRadius: '10px',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <CardContent>
                                <Typography variant="h5" align="center" style={{ color: '#000' }}>Đăng ký hàng tháng</Typography>
                                <Typography variant="h6" align="center" gutterBottom style={{ color: '#000' }}>
                                    4.99$ / tháng
                                </Typography>
                                <Typography variant="body2" align="center" style={{ color: '#000' }}>
                                    Giảm giá 12.54% so với giá gốc!
                                </Typography>
                                <Typography variant="body2" align="center" style={{ color: '#666' }}>
                                    Hủy bất kỳ lúc nào.
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleSubscribe('monthly')}
                                    style={{ width: '100%' }}>
                                    Đăng ký ngay
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Card
                            variant="outlined"
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #ccc',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                borderRadius: '10px',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <CardContent>
                                <Typography variant="h5" align="center" style={{ color: '#000' }}>Đăng ký hàng năm</Typography>
                                <Typography variant="h6" align="center" gutterBottom style={{ color: '#000' }}>
                                    49.99$ / năm
                                </Typography>
                                <Typography variant="body2" align="center" style={{ color: '#000' }}>
                                    Giảm giá 28% so với giá gốc!
                                </Typography>
                                <Typography variant="body2" align="center" style={{ color: '#666' }}>
                                    Hủy bất kỳ lúc nào.
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleSubscribe('yearly')}
                                    style={{ width: '100%' }}>
                                    Đăng ký ngay
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
};

export default PremiumSubscriptionPage;