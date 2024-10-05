import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Tabs, Tab } from 'react-bootstrap';
import API, { authAPI, endpoints } from '../configs/API';
import ReactSelect from 'react-select';
import ImageUpload from './ImageUpload';
import { useUser } from '../configs/UserContext';

const SongModal = ({ visible, song, onSaveChange, onClose }) => {
    const [image, setImage] = useState('');
    const [title, setTitle] = useState('');
    const [artists, setArtists] = useState('');
    const [genres, setGenres] = useState([]);
    const [lyrics, setLyrics] = useState('');
    const [description, setDescription] = useState('');
    const [availableGenres, setAvailableGenres] = useState([]);
    const [isPublic, setIsPublic] = useState(true);
    const [releaseDate, setReleaseDate] = useState('');
    const [releaseTime, setReleaseTime] = useState('');
    const [access, setAccess] = useState(null);
    const [errors, setErrors] = useState({});
    const { getAccessToken } = useUser();

    const updateAccess = (field, value) => setAccess(prev => ({ ...prev, [field]: value }))

    useEffect(() => {
        if (song && visible) {
            let loadSong = async () => {
                try {
                    setImage(song.image || '');
                    setTitle(song.title || '');
                    setArtists(song.artists || '');
                    setIsPublic(song.is_public);
                    setAccess(song.access);
                    if (!song.genres) {
                        let res = await authAPI(await getAccessToken()).get(endpoints.song(song.id));
                        let data = res.data;
                        setGenres(data.genres?.map(genre => ({
                            value: genre.id,
                            label: genre.name
                        })) || []);
                        setLyrics(data.lyrics || '');
                        setDescription(data.description || '');
                        if (data.release_date) {
                            const releaseDateTime = new Date(data.release_date);
                            const releaseDate = releaseDateTime.toISOString().split('T')[0];
                            const releaseTime = releaseDateTime.toISOString().split('T')[1].slice(0, 5);
                            setReleaseDate(releaseDate);
                            setReleaseTime(releaseTime);
                        }
                        
                    } else {
                        setGenres(song.genres?.map(genre => ({
                            value: genre.id,
                            label: genre.name
                        })) || []);
                        setLyrics(song.lyrics || '');
                        setDescription(song.description || '');
                        if (song.release_date) {
                            const releaseDateTime = new Date(song.release_date);
                            const releaseDate = releaseDateTime.toISOString().split('T')[0];
                            const releaseTime = releaseDateTime.toISOString().split('T')[1].slice(0, 5);
                            setReleaseDate(releaseDate);
                            setReleaseTime(releaseTime);
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            };

            loadSong();
        }
    }, [song, visible, getAccessToken]);

    useEffect(() => {
        if (visible) {
            const loadGenres = async () => {
                try {
                    let res = await API.get(endpoints.genres);
                    const genresFormatted = res.data.map(genre => ({
                        value: genre.id,
                        label: genre.name
                    }));
                    setAvailableGenres(genresFormatted);
                } catch (error) {
                    console.error(error);
                }
            };

            loadGenres();
        }
    }, [visible]);

    const validateForm = () => {
        const newErrors = {};
        if (!title) newErrors.title = 'Tên bài hát là bắt buộc.';
        if (genres.length === 0) newErrors.genres = 'Bạn phải chọn ít nhất một thể loại.';
        if (!releaseDate || !releaseTime) newErrors.releaseDateTime = 'Thời gian phát trực tiếp là bắt buộc';
        if (access?.is_downloadable && !access?.is_free && !access?.price) newErrors.price = 'Bạn phải nhập giá tiền cho bài hát này.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        let formData = new FormData();
        if (image !== song.image) formData.append('image', image);
        if (title !== song.title) formData.append('title', title);
        if (artists !== song.artists) formData.append('artists', artists);
        const genreIds = genres.map(genre => genre.value);
        const originalGenreIds = availableGenres.map(genre => genre.id);
        if (genreIds.length !== originalGenreIds.length || !genreIds.every(id => originalGenreIds.includes(id)))
            genreIds.forEach(id => {
                formData.append('genre_ids', id);
            });
        if (lyrics !== song.lyrics) formData.append('lyrics', lyrics);
        if (description !== song.description) formData.append('description', description);
        if (isPublic !== song.is_public) formData.append('is_public', isPublic);
        formData.append('release_date', `${releaseDate}T${releaseTime}:00`);

        try {
            let accessData = new FormData();
            if (access?.is_downloadable !== song.access?.is_downloadable) accessData.append('is_downloadable', access?.is_downloadable);
            if (access?.is_free !== song.access?.is_free) accessData.append('is_free', access?.is_free);
            if (access?.is_free)
                accessData.append('price', 0);
            else {
                if (access?.price !== song.access?.price)
                    accessData.append('price', Number(access?.price));
            }


            if (!song.access) {
                await authAPI(await getAccessToken()).post(
                    endpoints['song-access'](song.id), accessData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
            } else {
                await authAPI(await getAccessToken()).patch(
                    endpoints['song-access'](song.id), accessData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
            }

            let res = await authAPI(await getAccessToken()).patch(endpoints.song(song.id),
                formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            onSaveChange?.(res.data);
        } catch (error) {
            alert("Không thể lưu thay đổi");
            console.error(error);
        } finally {
            onClose();
        }
    };

    const handleGenresChange = (selectedOptions) => {
        setGenres(selectedOptions || []);
    };

    const handleIsPublicChange = (e) => {
        setIsPublic(Number(e.target.value));
    };

    return (
        <Modal show={visible} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Chỉnh sửa bài hát</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs defaultActiveKey="general" id="song-edit-tabs" className="mb-3">
                    <Tab eventKey="general" title="Thông tin chung" className='bg-white'>
                        <Form className='d-flex flex-wrap justify-content-center' style={{ gap: '50px' }}>
                            <Form.Group style={{ width: '250px', height: '250px' }}>
                                <Form.Label className='text-dark'>Ảnh bìa</Form.Label>
                                <ImageUpload
                                    src={image}
                                    onDrop={(f) => setImage(f[0])} />
                            </Form.Group>
                            <Form.Group style={{ maxWidth: '600px', width: '100%' }}>
                                <Form.Group controlId="formTitle">
                                    <Form.Label className='text-dark mt-2'>Tên bài hát</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)} />
                                    {errors.title && <Form.Text className="text-danger">{errors.title}</Form.Text>}
                                </Form.Group>
                                <Form.Group controlId="formArtists">
                                    <Form.Label className='text-dark mt-2'>Nghệ sĩ</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={artists}
                                        onChange={(e) => setArtists(e.target.value)} />
                                </Form.Group>
                                <Form.Group controlId="formGenres">
                                    <Form.Label className='text-dark mt-2'>Thể loại</Form.Label>
                                    <ReactSelect
                                        value={genres}
                                        onChange={handleGenresChange}
                                        options={availableGenres}
                                        isMulti
                                        placeholder="Chọn thể loại"
                                        className="multi-dropdown"
                                        classNamePrefix="select" />
                                    {errors.genres && <Form.Text className="text-danger">{errors.genres}</Form.Text>}
                                </Form.Group>
                                <Form.Group controlId="formLyrics">
                                    <Form.Label className='text-dark mt-2'>Lời bài hát</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={lyrics}
                                        onChange={(e) => setLyrics(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group controlId="formDescription">
                                    <Form.Label className='text-dark mt-2'>Mô tả</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)} />
                                </Form.Group>
                                <Form.Group>
                                    <div className="my-2 d-flex" style={{ gap: '50px' }}>
                                        <Form.Check
                                            type="radio"
                                            label="Riêng tư"
                                            name="visibility"
                                            value="1"
                                            checked={isPublic === 1}
                                            onChange={handleIsPublicChange} />
                                        <Form.Check
                                            type="radio"
                                            label="Công khai"
                                            name="visibility"
                                            value="2"
                                            checked={isPublic === 2}
                                            onChange={handleIsPublicChange} />
                                        <Form.Check
                                            type="radio"
                                            label="Theo lịch trình"
                                            name="visibility"
                                            value="3"
                                            checked={isPublic === 3}
                                            onChange={handleIsPublicChange} />
                                    </div>
                                </Form.Group>
                                {isPublic === 3 && <Form.Group controlId="formReleaseDateTime">
                                    <Form.Label className='text-dark mt-2'>Thời gian phát hành</Form.Label>
                                    <Form.Group className="d-flex" style={{ gap: '20px' }}>
                                        <Form.Control
                                            type="date"
                                            value={releaseDate}
                                            onChange={(e) => setReleaseDate(e.target.value)} />
                                        <Form.Control
                                            type="time"
                                            value={releaseTime}
                                            onChange={(e) => setReleaseTime(e.target.value)} />
                                    </Form.Group>
                                    {errors.releaseDateTime && <Form.Text className="text-danger">{errors.releaseDateTime}</Form.Text>}
                                </Form.Group>}
                            </Form.Group>
                        </Form>
                    </Tab>
                    <Tab eventKey="permissions" title="Quyền" className='bg-white'>
                        <Form.Group className="permissions-checkbox">
                            <div className="d-flex align-items-start flex-wrap mt-2 w-100" style={{ gap: '20px' }}>
                                <div className="d-flex align-items-start permissions-item">
                                    <Form.Check
                                        className='mt-2'
                                        type="checkbox"
                                        checked={access?.is_downloadable}
                                        onChange={(e) => updateAccess('is_downloadable', e.target.checked)} />
                                    <div className="ms-2">
                                        <label>Cho phép tải xuống trực tiếp</label>
                                        <p className="small text-muted">Bản nhạc này sẽ có sẵn để tải xuống trực tiếp ở định dạng ban đầu mà nó đã được tải lên.</p>
                                    </div>
                                </div>
                                {access?.is_downloadable &&
                                    <div className='d-flex align-items-start permissions-item'>
                                        <Form.Check
                                            className='mt-2'
                                            type="checkbox"
                                            checked={access?.is_free}
                                            onChange={(e) => updateAccess('is_free', e.target.checked)} />
                                        <div className="ms-2">
                                            <label>Tải xuống miễn phí</label>
                                            <p className="small text-muted mb-1">Bản nhạc này có thể được tải xuống miễn phí.</p>
                                            {!access?.is_free && <>
                                                <div>
                                                    <input
                                                        className='m-0'
                                                        value={access?.price}
                                                        onChange={(e) => updateAccess('price', e.target.value)}
                                                        placeholder='100.000VNĐ' />
                                                </div>
                                                {errors.price && <Form.Text className="text-danger">{errors.price}</Form.Text>}
                                            </>}
                                        </div>
                                    </div>}
                            </div>
                        </Form.Group>
                    </Tab>
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Đóng
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Lưu thay đổi
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SongModal;