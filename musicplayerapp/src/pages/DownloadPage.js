import React, { useState, useEffect } from 'react';
import API, { authAPI, endpoints } from '../configs/API';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/DownloadPage.css';
import { usePageTitle } from '../components/PageTitle';
import { useUser } from '../configs/UserContext';

const DownloadPage = () => {
    usePageTitle('Tải xuống');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const songId = searchParams.get('songId');
    const [song, setSong] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [downloadError, setDownloadError] = useState(null);
    const [progress, setProgress] = useState(0);
    const [abortController, setAbortController] = useState(null);
    const { user, getAccessToken } = useUser();

    useEffect(() => {
        const loadSong = async () => {
            try {
                const res = await authAPI(await getAccessToken()).get(endpoints.song(songId));
                setSong(res.data);
                console.log(res.data)
            } catch (err) {
                setError('Error loading song data');
            } finally {
                setLoading(false);
            }
        };

        loadSong();
    }, [songId, getAccessToken]);

    const download = async () => {
        try {
            const res = await authAPI(await getAccessToken())
                .get(endpoints['download-song'](songId));

            const controller = new AbortController();
            setDownloadLoading(true);
            setAbortController(controller);
            setProgress(0);

            const url = res.data.download_url;
            const fileResponse = await fetch(url, { signal: controller.signal });

            const reader = fileResponse.body.getReader();
            const contentLength = +fileResponse.headers.get('Content-Length');
            let receivedLength = 0;
            const chunks = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                receivedLength += value.length;
                setProgress((receivedLength / contentLength) * 100);
            }

            const blob = new Blob(chunks);
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', `${song.title}.mp3`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        } catch (err) {
            if (err.name === 'AbortError') {
                setDownloadError('Download cancelled');
            } else if (err.response?.data?.detail) {
                setDownloadError(err.response.data.detail);
            } else {
                setDownloadError('Error downloading song');
            }
        } finally {
            setDownloadLoading(false);
        }
    };

    const cancelDownload = () => {
        if (abortController) {
            abortController.abort();
        }
    };

    const payWithPayPal = async () => {
        if (!user) {
            setDownloadError("Vui lòng đăng nhập để tiếp tục");
            return;
        }

        const amount = song.access?.price ? Math.round(song.access.price) : 0;
        if (amount <= 0) {
            setDownloadError('Invalid amount');
            return;
        }
        const txnRef = `${song.id}${new Date().getTime()}`;
        const orderInfo = `Payment for ${song.title}`;

        const payload = {
            amount: amount,
            return_url: `${window.location.origin}/payment-success/`,
            cancel_url: `${window.location.origin}/payment-cancel/`,
            txn_ref: txnRef,
            order_info: orderInfo,
            song_id: song.id,
            user_id: user.id
        };

        try {
            const res = await API.post(endpoints['paypal-create-order'], payload);
            const { approval_url } = res.data;
            window.location.href = approval_url;
        } catch (error) {
            console.error(error);
            if (error.response?.data) {
                setDownloadError(error.response?.data?.detail);
            } else {
                setDownloadError(error.message);
            }
        }
    };

    // const payWithCreditCard = () => {
    //     alert('Chuyển tới trang thanh toán bằng thẻ tín dụng');
    // };

    if (loading) return <p>Loading song details...</p>;
    if (error) return <p>{error}</p>;
    if (!song?.access?.is_downloadable) return <p>Không tìm thấy bài hát</p>;

    return (
        <div className="background-wrapper">
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
            <div className="blurred-background" style={{ backgroundImage: `url(${song.image})` }}></div>
            <div className="song-download-container">
                <img src={song.image} alt={song.title} width={300} height={300} />
                <h2 className='mt-4'>{song.title}</h2>
                <p className='m-2'>Nghệ sĩ: {song.artists}</p>
                {downloadLoading ?
                    <div className="loading-slider">
                        <div className="spinner"></div>
                        <div className='d-flex w-100'>
                            <div className="progress-container">
                                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                            </div>
                            <button onClick={cancelDownload} className="cancel-btn">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div> :
                    <button
                        onClick={download}
                        className={`download-btn ${song.access?.is_free || song.has_purchased ? '' : 'not-purchase'}`}>
                        Tải xuống {song.access?.is_free && 'miễn phí'}
                    </button>}
                {downloadError && <p className='text-danger'>{downloadError}</p>}
                {!song.access?.is_free &&
                    <div className="payment-options">
                        {song.has_purchased ? <h6 className='text-success mt-2 mb-3'>
                            Bạn đã thanh toán cho bài hát này
                        </h6> : <>
                            <h6 className="price">Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(song.access?.price)}</h6>
                            <p className='text-dark mb-1'>Chọn phương thức thanh toán:</p>
                            <ul className="payment-method-list cursor-pointer">
                                <li onClick={payWithPayPal}>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png" alt="PayPal" className="payment-logo" />
                                    Thanh toán với PayPal
                                </li>
                                {/* <li onClick={payWithCreditCard}>
                                <img src="/path/to/credit-card-logo.png" alt="Credit Card" className="payment-logo" />
                                Thanh toán với Thẻ tín dụng
                            </li> */}
                            </ul>
                        </>}
                    </div>}
            </div>
        </div>
    );
};

export default DownloadPage;