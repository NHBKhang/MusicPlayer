import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import API, { authAPI, endpoints } from '../configs/API';
import ImageUpload from './ImageUpload';
import { useUser } from '../configs/UserContext';
import ReactSelect from 'react-select';

const VideoModal = ({ visible, video, onSaveChange, onClose }) => {
    const [image, setImage] = useState('');
    const [title, setTitle] = useState('');
    const [song, setSong] = useState(0);
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [releaseDate, setReleaseDate] = useState('');
    const [releaseTime, setReleaseTime] = useState('');
    const [errors, setErrors] = useState({});
    const [readonlySongs, setReadonlySongs] = useState([]);
    const { getAccessToken, user } = useUser();

    useEffect(() => {
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
        }

        loadReadonlySongs();
    }, [user.id]);

    useEffect(() => {
        if (video && visible) {
            let loadSong = async () => {
                try {
                    setImage(video.image || '');
                    setTitle(video.title || '');
                    setIsPublic(video.is_public);
                    setSong(video.song_id);
                    if (!video.description) {
                        let res = await authAPI(await getAccessToken()).get(endpoints['music-video'](video.id));
                        let data = res.data;
                        setDescription(data.description || '');
                        if (data.release_date) {
                            const releaseDateTime = new Date(data.release_date);
                            const releaseDate = releaseDateTime.toISOString().split('T')[0];
                            const releaseTime = releaseDateTime.toISOString().split('T')[1].slice(0, 5);
                            setReleaseDate(releaseDate);
                            setReleaseTime(releaseTime);
                        }
                    } else {
                        setDescription(video.description || '');
                        if (video.release_date) {
                            const releaseDateTime = new Date(video.release_date);
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
    }, [video, visible, getAccessToken]);

    const validateForm = () => {
        const newErrors = {};
        if (!title) newErrors.title = 'Tên bài hát là bắt buộc.';
        if (!releaseDate || !releaseTime) newErrors.releaseDateTime = 'Thời gian phát trực tiếp là bắt buộc';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        let formData = new FormData();
        if (image !== video.image) formData.append('image', image);
        if (title !== video.title) formData.append('title', title);
        if (description !== video.description) formData.append('description', description);
        if (isPublic !== video.is_public) formData.append('is_public', isPublic);
        formData.append('release_date', `${releaseDate}T${releaseTime}:00`);


        try {
            let res = await authAPI(await getAccessToken()).patch(endpoints['music-video'](video.id),
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

    const handleIsPublicChange = (e) => {
        setIsPublic(Number(e.target.value));
    };

    return (
        <Modal show={visible} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Chỉnh sửa bài hát</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
                        <Form.Group controlId="formSong">
                            <Form.Label className='text-dark mt-2'>Bài hát</Form.Label>
                            <ReactSelect
                                value={readonlySongs.find(s => s.value === song)}
                                onChange={(selectedOption) => setSong(selectedOption.value)}
                                options={readonlySongs}
                                placeholder="Chọn bài hát"
                                classNamePrefix="select" />
                            {errors.song && <Form.Text className="text-danger">{errors.song}</Form.Text>}
                        </Form.Group>
                        <Form.Group controlId="formDescription">
                            <Form.Label className='text-dark mt-2'>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)} />
                        </Form.Group>
                        <Form.Group>
                            <div className="mt-2 d-flex" style={{ gap: '50px' }}>
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
                            <Form.Label className='text-dark mt-2'>Thời gian phát trực tiếp</Form.Label>
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

export default VideoModal;