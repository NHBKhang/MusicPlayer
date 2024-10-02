import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Page from '.';
import API, { authAPI, endpoints } from '../configs/API';
import { normalizeFileName } from '../configs/Utils';
import { useUser } from '../configs/UserContext';
import ReactSelect from 'react-select';
import { ImageUpload, LoginRequiredModal, SongItem, VideoItem } from '../components';
import '../styles/UploadPage.css';
import { usePageTitle } from '../components/PageTitle';

const UploadPage = () => (
    <Page>
        <div className='library-container'>
            <TabView />
        </div>
    </Page>
);

const TabView = () => {
    const [activeTab, setActiveTab] = useState(0);

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <Upload />;
            case 1:
                return <MySong />;
            case 2:
                return <MyVideo />;
            default:
                return null;
        }
    };

    return (
        <div className="tabview mt-3">
            <div className="tabs">
                <div className={`tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>Tải lên</div>
                <div className={`tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>Bài hát của bạn</div>
                <div className={`tab ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>MV của bạn</div>
            </div>
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};

const Upload = () => {
    usePageTitle("Upload");
    const { getAccessToken, user } = useUser();
    const [songs, setSongs] = useState([]);
    const [videos, setVideos] = useState([]);
    const [uploadStatus, setUploadStatus] = useState('');
    const [genres, setGenres] = useState([]);
    const [readonlySongs, setReadonlySongs] = useState([]);
    const [progresses, setProgresses] = useState({});
    const [uploadControllers, setUploadControllers] = useState({});

    useEffect(() => {
        const loadGenres = async () => {
            try {
                let res = await API.get(endpoints.genres);
                setGenres(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        const loadReadonlySongs = async () => {
            try {
                let res = await API.get(`${endpoints['readonly-songs']}?uploader=${user.id}`);
                setReadonlySongs(res.data.map(s => ({
                    value: s.id,
                    label: s.title,
                })));
            } catch (error) {
                console.error(error);
            }
        };

        loadGenres();
        loadReadonlySongs();
    }, [user.id]);

    const handleDrop = useCallback((acceptedFiles) => {
        const maxMB = 30;
        const maxSize = maxMB * 1024 * 1024;
        const maxSizeError = `Dung lượng file vượt quá giới hạn ${maxMB}MB`;

        const newSongs = acceptedFiles
            .filter(file => file.type.includes('audio'))
            .map(file => ({
                file,
                image: '',
                title: normalizeFileName(file.name),
                artists: '',
                genres: [],
                lyrics: '',
                description: '',
                isPublic: 1,
                isUpload: false,
                error: user.is_premium || file.size <= maxSize ? null : maxSizeError
            }));

        const newVideos = acceptedFiles
            .filter(file => file.type.includes('video'))
            .map(file => ({
                file,
                image: '',
                title: normalizeFileName(file.name),
                description: '',
                song: 0,
                isPublic: 1,
                isUpload: false,
                error: user.is_premium || file.size <= maxSize ? null : maxSizeError
            }));

        setSongs((prevSongs) => [...prevSongs, ...newSongs]);
        setVideos((prevVideos) => [...prevVideos, ...newVideos]);
    }, [user.is_premium]);

    const handleUpload = async (media, index, isVideo = false) => {
        if (media.isUpload || media.error) return;
        if (!user || !user.id) {
            setUploadStatus('Người dùng không hợp lệ.');
            return;
        }

        const updateState = isVideo ? setVideos : setSongs;
        updateState(prevMedia =>
            prevMedia.map((m, i) => i === index ? { ...m, isUpload: true } : m)
        );

        const controller = new AbortController();
        setUploadControllers(prev => ({ ...prev, [index]: controller }));

        const formData = new FormData();
        formData.append('file', media.file);
        formData.append('image', media.image);
        formData.append('title', media.title);
        formData.append('description', media.description);
        formData.append('uploader_id', String(user.id));
        formData.append('is_public', media.isPublic);
        if (media.isPublic === 3) formData.append('release_date', `${media.date}T${media.time}:00`);
        if (!isVideo) {
            formData.append('artists', media.artists);
            media.genres.forEach(id => {
                formData.append('genre_ids', id);
            });
            formData.append('lyrics', media.lyrics);
        } else {
            formData.append('song_id', media.song);
        }
        try {
            const res = await authAPI(await getAccessToken())
                .post(isVideo ? endpoints['music-videos'] : endpoints.songs,
                    formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    },
                    timeout: 0,
                    signal: controller.signal,
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgresses((prev) => ({ ...prev, [index]: percentCompleted }));
                    }
                });

            if (res.status === 201) {
                setUploadStatus('Upload thành công!');
                updateState((prevMedia) => prevMedia.filter((_, i) => i !== index));
            } else {
                setUploadStatus('Upload thất bại!');
            }
        } catch (error) {
            console.error(error);
            if (error.name === 'AbortError')
                setUploadStatus('Upload cancelled');
            else
                setUploadStatus('Có lỗi xảy ra khi upload.');
        } finally {
            setUploadControllers(prev => {
                const newControllers = { ...prev };
                delete newControllers[index];
                return newControllers;
            });
            updateState(prevMedia =>
                prevMedia.map((m, i) => i === index ? { ...m, isUpload: false } : m)
            );
        }
    };

    const handleCancel = (index, isVideo = false) => {
        const updateState = isVideo ? setVideos : setSongs;
        updateState((prevMedia) => prevMedia.filter((_, i) => i !== index));
    };

    const handleCancelUpload = (index, isVideo = false) => {
        const controller = uploadControllers[index];
        if (controller) {
            controller.abort();
            setProgresses(prev => ({ ...prev, [index]: 0 }));
            const updateState = isVideo ? setVideos : setSongs;
            updateState(prevMedia => {
                const updatedMedia = [...prevMedia];
                updatedMedia[index].isUpload = false;
                return updatedMedia;
            });
        }
    };

    const updateMedia = (index, field, value, isVideo = false) => {
        const updateState = isVideo ? setVideos : setSongs;
        updateState((prevMedia) => {
            const updatedMedia = [...prevMedia];
            updatedMedia[index][field] = value;
            return updatedMedia;
        });
    };

    const handleInputChange = (index, e, isVideo = false) => {
        const { name, value, options, type, checked } = e.target;
        if (type === 'checkbox') {
            updateMedia(index, name, checked, isVideo);
        } else if (type === 'radio') {
            updateMedia(index, name.split('_')[0], parseInt(value), isVideo);
        } else if (name === "genres" && !isVideo) {
            const selectedOptions = Array.from(options)
                .filter(option => option.selected)
                .map(option => option.value);
            updateMedia(index, name, selectedOptions, isVideo);
        } else {
            updateMedia(index, name, value, isVideo);
        }
    };

    const options = genres.map(g => ({
        value: g.id,
        label: g.name,
    }));

    const handleGenresChange = (selectedOptions, index) => {
        const selectedGenres = selectedOptions ? selectedOptions.map(option => option.value) : [];
        updateMedia(index, 'genres', selectedGenres);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: handleDrop, accept: 'audio/*,video/*' });

    return (
        <div>
            <h3 className='my-4'>Upload nhạc</h3>
            <div className="upload-notification">
                <p className='m-0'>Dung lượng tối đa cho mỗi file là 30MB. Nâng cấp lên Premium để tải lên tệp lớn hơn.</p>
                <button className="premium-button" onClick={() => window.open('/premium/', '_blank')}>
                    Đăng ký Premium
                </button>
            </div>
            <div
                {...getRootProps()}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    border: '2px dashed #cccccc',
                    minHeight: '100px',
                    width: '80%',
                    margin: 'auto',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDragActive ? 'rgba(150, 150, 150, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                    padding: '20px',
                }}>
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Thả file vào đây ...</p>
                ) : (
                    <p>Kéo và thả file nhạc hoặc file video vào đây, hoặc click để chọn file</p>
                )}
            </div>

            {songs.length > 0 && (
                <div style={{ margin: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {songs.map((song, index) => (
                        <div key={index} style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '15px 25px',
                            width: '100%',
                            backgroundColor: 'rgba(50, 50, 50, 0.4)',
                            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
                        }}>
                            <h5>Bài hát {index + 1}</h5>
                            <p className='mb-2'>{song.file.name}</p>
                            <div style={{
                                gap: '30px'
                            }} className='d-flex flex-wrap justify-content-center'>
                                <div style={{ width: '200px', height: '200px' }}>
                                    <label>Ảnh bìa</label>
                                    <ImageUpload src={song.image}
                                        onDrop={(files) => {
                                            const file = files[0];
                                            if (file) {
                                                updateMedia(index, 'image', file);
                                            }
                                        }} />
                                </div>
                                <div style={{ flexGrow: 1 }}>
                                    <div style={{ textAlign: 'start', marginBottom: '10px' }}>
                                        <label>Tên bài hát</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={song.title}
                                            onChange={(e) => handleInputChange(index, e)}
                                            style={{ width: '100%', padding: '5px', margin: '5px 0' }} />
                                    </div>
                                    <div style={{ textAlign: 'start', marginBottom: '10px' }}>
                                        <label>Nghệ sĩ</label>
                                        <input
                                            type="text"
                                            name="artists"
                                            value={song.artists}
                                            onChange={(e) => handleInputChange(index, e)}
                                            style={{ width: '100%', padding: '5px', margin: '5px 0' }} />
                                    </div>
                                    <div style={{ textAlign: 'start', marginBottom: '10px' }}>
                                        <label>Thể loại</label>
                                        <ReactSelect
                                            value={options.filter(option => song.genres.includes(option.value))}
                                            onChange={(selectedOptions) => handleGenresChange(selectedOptions, index)}
                                            options={options}
                                            isMulti
                                            placeholder="Chọn thể loại"
                                            className="multi-dropdown"
                                            classNamePrefix="select" />
                                    </div>
                                    <div style={{ textAlign: 'start', marginBottom: '10px' }}>
                                        <label>Lời bài hát</label>
                                        <textarea
                                            name="lyrics"
                                            value={song.lyrics}
                                            onChange={(e) => handleInputChange(index, e)}
                                            style={{ width: '100%', padding: '5px', margin: '5px 0' }} />
                                    </div>
                                    <div style={{ textAlign: 'start', marginBottom: '10px' }}>
                                        <label>Mô tả</label>
                                        <textarea
                                            name="description"
                                            value={song.description}
                                            onChange={(e) => handleInputChange(index, e)}
                                            style={{ width: '100%', padding: '5px', margin: '5px 0' }} />
                                    </div>
                                    <div style={{ textAlign: 'start', marginBottom: '10px' }}>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`isPublic_s${index}`}
                                                value={1}
                                                checked={song.isPublic === 1}
                                                onChange={(e) => handleInputChange(index, e)}
                                                className='me-2'
                                                size='large' />
                                            Riêng tư
                                        </label>
                                        <label className='ms-4'>
                                            <input
                                                type="radio"
                                                name={`isPublic_s${index}`}
                                                value={2}
                                                checked={song.isPublic === 2}
                                                onChange={(e) => handleInputChange(index, e)}
                                                className='me-2'
                                                size='large' />
                                            Công khai
                                        </label>
                                        <label className='ms-4'>
                                            <input
                                                type="radio"
                                                name={`isPublic_s${index}`}
                                                value={3}
                                                checked={song.isPublic === 3}
                                                onChange={(e) => handleInputChange(index, e)}
                                                className='me-2'
                                                size='large' />
                                            Lên lịch
                                        </label>
                                    </div>
                                    {song.isPublic === 3 &&
                                        <div style={{ textAlign: 'start', marginBottom: '10px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px' }}>Thời gian</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input
                                                    type="date"
                                                    name="date"
                                                    value={song.date}
                                                    onChange={(e) => handleInputChange(index, e)}
                                                    style={{ width: '50%', padding: '5px' }} />

                                                <input
                                                    type="time"
                                                    name="time"
                                                    value={song.time}
                                                    onChange={(e) => handleInputChange(index, e)}
                                                    style={{ width: '50%', padding: '5px' }} />
                                            </div>
                                        </div>}
                                    {song.error && <p className='text-danger'>{song.error}</p>}
                                    {!song.isUpload && <div className='d-flex justify-content-center mt-2'>
                                        <button
                                            onClick={() => handleUpload(song, index)}
                                            style={{ marginRight: '10px' }}>
                                            Upload
                                        </button>
                                        <button
                                            onClick={() => handleCancel(index)}
                                            style={{ backgroundColor: 'red', color: 'white' }}>
                                            Cancel
                                        </button>
                                    </div>}
                                </div>
                            </div>

                            {song.isUpload && (
                                <div className="upload-progress-container">
                                    <div className="progress-bar-container">
                                        <progress
                                            value={progresses[index] || 0}
                                            max="100"
                                            className="progress-bar" />
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${progresses[index] || 0}%` }} />
                                        <div className="percentage-display">
                                            {progresses[index] || 0}%
                                        </div>
                                    </div>
                                    {progresses[index] === 100
                                        ? <div className="spinner-container">
                                            <i className="fa-solid fa-spinner fa-spin spinner" />
                                        </div>
                                        : <div className="cancel-button-container">
                                            <i className="fa-solid fa-xmark cancel-button"
                                                onClick={() => handleCancelUpload(index)} />
                                        </div>
                                    }
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {videos.length > 0 && (
                <div style={{ margin: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {videos.map((video, index) => (
                        <div key={index} style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '15px 25px',
                            width: '100%',
                            backgroundColor: 'rgba(50, 50, 50, 0.4)',
                            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
                        }}>
                            <h5>Music Video {index + 1}</h5>
                            <p className='mb-2'>{video.file.name}</p>
                            <div style={{
                                gap: '30px'
                            }} className='d-flex flex-wrap justify-content-center'>
                                <div style={{ width: '200px', height: '200px' }}>
                                    <label>Ảnh bìa</label>
                                    <ImageUpload src={video.image}
                                        onDrop={(files) => {
                                            const file = files[0];
                                            if (file) {
                                                updateMedia(index, 'image', file, true);
                                            }
                                        }} />
                                </div>
                                <div style={{ flexGrow: 1 }}>
                                    <div style={{ textAlign: 'start', marginBottom: '10px' }}>
                                        <label>Tên video</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={video.title}
                                            onChange={(e) => handleInputChange(index, e, true)}
                                            style={{ width: '100%', padding: '5px', margin: '5px 0' }} />
                                    </div>
                                    <div style={{ textAlign: 'start', marginBottom: '10px' }}>
                                        <label>Bài hát</label>
                                        <ReactSelect
                                            value={readonlySongs.find(song => song.value === video.song)}
                                            onChange={(selectedOption) => updateMedia(index, 'song', selectedOption.value, true)}
                                            options={readonlySongs}
                                            placeholder="Chọn bài hát"
                                            classNamePrefix="select" />
                                    </div>
                                    <div style={{ textAlign: 'start', marginBottom: '10px' }}>
                                        <label>Mô tả</label>
                                        <textarea
                                            name="description"
                                            value={video.description}
                                            onChange={(e) => handleInputChange(index, e, true)}
                                            style={{ width: '100%', padding: '5px', margin: '5px 0' }} />
                                    </div>
                                    <div style={{ textAlign: 'start', marginBottom: '10px' }}>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`isPublic_v${index}`}
                                                value={1}
                                                checked={video.isPublic === 1}
                                                onChange={(e) => handleInputChange(index, e, true)}
                                                className='me-2'
                                                size='large' />
                                            Riêng tư
                                        </label>
                                        <label className='ms-4'>
                                            <input
                                                type="radio"
                                                name={`isPublic_v${index}`}
                                                value={2}
                                                checked={video.isPublic === 2}
                                                onChange={(e) => handleInputChange(index, e, true)}
                                                className='me-2'
                                                size='large' />
                                            Công khai
                                        </label>
                                        <label className='ms-4'>
                                            <input
                                                type="radio"
                                                name={`isPublic_v${index}`}
                                                value={3}
                                                checked={video.isPublic === 3}
                                                onChange={(e) => handleInputChange(index, e, true)}
                                                className='me-2'
                                                size='large' />
                                            Lên lịch
                                        </label>
                                    </div>
                                    {video.isPublic === 3 &&
                                        <div style={{ textAlign: 'start', marginBottom: '10px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px' }}>Thời gian</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input
                                                    type="date"
                                                    name="date"
                                                    value={video.date}
                                                    onChange={(e) => handleInputChange(index, e, true)}
                                                    style={{ width: '50%', padding: '5px' }} />

                                                <input
                                                    type="time"
                                                    name="time"
                                                    value={video.time}
                                                    onChange={(e) => handleInputChange(index, e, true)}
                                                    style={{ width: '50%', padding: '5px' }} />
                                            </div>
                                        </div>}
                                    {video.error && <p className='text-danger'>{video.error}</p>}
                                    {!video.isUpload && <div className='d-flex justify-content-center mt-2'>
                                        <button
                                            onClick={() => handleUpload(video, index, true)}
                                            style={{ marginRight: '10px' }}>
                                            Upload
                                        </button>
                                        <button
                                            onClick={() => handleCancel(index, true)}
                                            style={{ backgroundColor: 'red', color: 'white' }}>
                                            Cancel
                                        </button>
                                    </div>}
                                </div>
                            </div>

                            {video.isUpload && (
                                <div className="upload-progress-container">
                                    <div className="progress-bar-container">
                                        <progress
                                            value={progresses[index] || 0}
                                            max="100"
                                            className="progress-bar" />
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${progresses[index] || 0}%` }} />
                                        <div className="percentage-display">
                                            {progresses[index] || 0}%
                                        </div>
                                    </div>
                                    {progresses[index] === 100
                                        ? <div className="spinner-container">
                                            <i className="fa-solid fa-spinner fa-spin spinner" />
                                        </div>
                                        : <div className="cancel-button-container">
                                            <i className="fa-solid fa-xmark cancel-button"
                                                onClick={() => handleCancelUpload(index, true)} />
                                        </div>
                                    }
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {uploadStatus && <p style={{ marginTop: '20px' }}>{uploadStatus}</p>}
        </div>
    )
};

const MySong = () => {
    usePageTitle("My Song");
    const [songs, setSongs] = useState([]);
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user, getAccessToken } = useUser();

    const updateSongs = (newData, append = false) => {
        setSongs(prev => append ? [...newData, ...prev] : newData);
    };

    const loadSongs = useCallback(async (append = false) => {
        if (page > 0) {
            try {
                let res = await authAPI(await getAccessToken())
                    .get(`${endpoints.songs}?uploader=${user.id}&page${page}`);

                if (res.data.next === null) setPage(0);
                updateSongs(res.data.results, append);
            } catch (error) {
                alert("Lỗi tải nhạc");
            }
        }
    }, [user?.id, getAccessToken, page]);

    useEffect(() => {
        loadSongs();
    }, [loadSongs]);

    return (
        <div>
            {songs.map((song) => <SongItem song={song} state={{ setIsModalOpen }} />)}
            <LoginRequiredModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)} />
        </div>
    )
};

const MyVideo = () => {
    usePageTitle("My Video");
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user, getAccessToken } = useUser();

    const updateVideos = (newData, append = false) => {
        setVideos(prev => append ? [...newData, ...prev] : newData);
    };

    const loadVideos = useCallback(async (append = false) => {
        if (page > 0) {
            try {
                let res = await authAPI(await getAccessToken())
                    .get(`${endpoints['music-videos']}?uploader=${user.id}&page${page}`);

                if (res.data.next === null) setPage(0);
                updateVideos(res.data.results, append);
            } catch (error) {
                alert("Lỗi tải mv");
            }
        }
    }, [user?.id, getAccessToken, page]);

    useEffect(() => {
        loadVideos();
    }, [loadVideos]);

    return (
        <div>
            {videos.map((video) => <VideoItem video={video} state={{ setIsModalOpen }} />)}
        </div>
    )
};

export default UploadPage;