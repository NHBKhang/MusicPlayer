import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Page, { TrackItem } from '.';
import API, { authAPI, endpoints } from '../configs/API';
import { normalizeFileName } from '../configs/Utils';
import { useUser } from '../configs/UserContext';
import ReactSelect from 'react-select';
import { ImageUpload, LoginRequiredModal } from '../components';

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
            default:
                return null;
        }
    };

    return (
        <div className="tabview mt-3">
            <div className="tabs">
                <div className={`tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>Tải lên</div>
                <div className={`tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>Bài hát của bạn</div>
                {/* <div className={`tab ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>Playlists</div> */}
            </div>
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};

const Upload = () => {
    const { getAccessToken, user } = useUser();
    const [songs, setSongs] = useState([]);
    const [uploadStatus, setUploadStatus] = useState('');
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        const loadGenres = async () => {
            try {
                let res = await API.get(endpoints.genres);
                setGenres(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        loadGenres();
    }, []);

    const handleDrop = useCallback((acceptedFiles) => {
        const newSongs = acceptedFiles.map(file => ({
            file,
            image: '',
            title: normalizeFileName(file.name),
            artists: '',
            genres: [],
            lyrics: '',
            description: ''
        }));
        setSongs((prevSongs) => [...prevSongs, ...newSongs]);
    }, []);

    const handleUpload = async (song) => {
        if (!user || !user.id) {
            setUploadStatus('Người dùng không hợp lệ.');
            return;
        }

        const formData = new FormData();
        formData.append('image', song.image);
        formData.append('file', song.file);
        formData.append('title', song.title);
        formData.append('artists', song.artists);
        song.genres.forEach(id => {
            formData.append('genre_ids', id);
        });
        formData.append('lyrics', song.lyrics);
        formData.append('description', song.description);
        formData.append('uploader_id', String(user.id));

        try {
            const res = await authAPI(await getAccessToken())
                .post(endpoints.songs, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    },
                    timeout: 0
                });

            if (res.status === 201) {
                setUploadStatus('Upload thành công!');
                setSongs((prevSongs) => prevSongs.filter(s => s !== song));
            } else {
                setUploadStatus('Upload thất bại.');
            }
        } catch (error) {
            console.error(error);
            setUploadStatus('Có lỗi xảy ra khi upload.');
        }
    };

    const handleCancel = (index) => {
        setSongs((prevSongs) => prevSongs.filter((_, i) => i !== index));
    };

    const updateSong = (index, field, value) => {
        setSongs((prevSongs) => {
            const updatedSongs = [...prevSongs];
            updatedSongs[index][field] = value;
            return updatedSongs;
        });
    };

    const handleInputChange = (index, e) => {
        const { name, value, options } = e.target;

        if (name === "genres") {
            const selectedOptions = Array.from(options)
                .filter(option => option.selected)
                .map(option => option.value);

            updateSong(index, name, selectedOptions);
        } else {
            updateSong(index, name, value);
        }
    };

    const options = genres.map(g => ({
        value: g.id,
        label: g.name,
    }));

    const handleGenresChange = (selectedOptions, index) => {
        const selectedGenres = selectedOptions ? selectedOptions.map(option => option.value) : [];
        updateSong(index, 'genres', selectedGenres);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: handleDrop, accept: 'audio/*' });

    return (
        <div>
            <h3 className='my-4'>Tải nhạc của bạn lên</h3>
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
                    <p>Kéo và thả file nhạc vào đây, hoặc click để chọn file</p>
                )}
            </div>

            {songs.length > 0 && (
                <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {songs.map((song, index) => (
                        <div key={index} style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '10px',
                            width: '500px',
                            backgroundColor: 'rgba(50, 50, 50, 0.4)',
                            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
                        }}>
                            <h5>Bài hát {index + 1}</h5>
                            <p className='mb-2'>{song.file.name}</p>
                            <div style={{
                                gap: '25px'
                            }} className='d-flex flex-wrap justify-content-center'>
                                <div style={{ width: '150px', height: '150px' }}>
                                    <label>Ảnh bìa</label>
                                    <ImageUpload src={song.image}
                                        onDrop={(files) => {
                                            const file = files[0];
                                            if (file) {
                                                updateSong(index, 'image', file);
                                            }
                                        }} />
                                </div>
                                <div>
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
                                    <button onClick={() => handleUpload(song)} style={{ marginTop: '10px', marginRight: '10px' }}>Upload</button>
                                    <button onClick={() => handleCancel(index)} style={{ marginTop: '10px', backgroundColor: 'red', color: 'white' }}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {uploadStatus && <p style={{ marginTop: '20px' }}>{uploadStatus}</p>}
        </div>
    )
};

const MySong = () => {
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
            {songs.map((song) => <TrackItem song={song} state={{ setIsModalOpen }} />)}
            <LoginRequiredModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)} />
        </div>
    )
};

export default UploadPage;