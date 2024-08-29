import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import API, { authAPI, endpoints } from '../configs/API';
import ReactSelect from 'react-select';
import ImageUpload from './ImageUpload';
import { useUser } from '../configs/UserContext';

const PlaylistModal = ({ visible, playlist, onSaveChange, onClose }) => {
    const [image, setImage] = useState('');
    const [title, setTitle] = useState('');
    const [genres, setGenres] = useState([]);
    const [description, setDescription] = useState('');
    const [availableGenres, setAvailableGenres] = useState([]);
    const [playlistType, setPlaylistType] = useState(playlist?.playlist_type || 4);
    const [isPublic, setIsPublic] = useState(playlist?.is_public || true);
    const [publishedDate, setPublishedDate] = useState(playlist?.published_date || '');
    const [errors, setErrors] = useState({});
    const { getAccessToken } = useUser();

    useEffect(() => {
        if (playlist && visible) {
            let loadPlaylist = async () => {
                try {
                    setImage(playlist.image || '');
                    setTitle(playlist.title || '');
                    setPlaylistType(playlist.playlist_type || 4);
                    setIsPublic(playlist.is_public);
                    setPublishedDate(playlist.published_date || '');

                    if (!playlist.genres) {
                        let res = await authAPI(await getAccessToken()).get(endpoints.playlist(playlist.id));
                        let data = res.data;
                        setGenres(data.genres?.map(genre => ({
                            value: genre.id,
                            label: genre.name
                        })) || []);
                        setDescription(data.description || '');
                    } else {
                        setGenres(playlist.genres?.map(genre => ({
                            value: genre.id,
                            label: genre.name
                        })) || []);
                        setDescription(playlist.description || '');
                    }
                } catch (error) {
                    console.error(error);
                }
            };

            loadPlaylist();
        }
    }, [playlist, visible, availableGenres, getAccessToken]);

    const validateForm = () => {
        const newErrors = {};
        if (!title) newErrors.title = 'Tên bài hát là bắt buộc.';
        if (genres.length === 0) newErrors.genres = 'Bạn phải chọn ít nhất một thể loại.';
        if (Number(playlistType) !== 4 && !publishedDate) newErrors.publishedDate = 'Ngày xuất bản là bắt buộc cho loại playlist này.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const closeModal = () => {
        onClose();
        setErrors({});
    }

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

    const handleGenresChange = (selectedOptions) => {
        setGenres(selectedOptions || []);
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        let formData = new FormData();
        if (image !== playlist.image) formData.append('image', image);
        if (title !== playlist.title) formData.append('title', title);
        if (Number(playlistType) !== Number(playlist.playlist_type)) formData.append('playlist_type', playlistType);
        if (isPublic !== playlist.is_public) formData.append('is_public', isPublic);
        if (Number(playlistType) === 4)
            formData.append('published_date', '');
        else if (Number(playlistType) !== 4 && publishedDate)
            formData.append('published_date', publishedDate);

        const genreIds = genres.map(genre => genre.value);
        genreIds.forEach(id => formData.append('genre_ids', id));
        formData.append('description', description);

        try {
            let res = await authAPI(await getAccessToken()).patch(endpoints.playlist(playlist.id),
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
            closeModal();
        }
    };

    return (
        <Modal show={visible} onHide={closeModal}>
            <Modal.Header closeButton>
                <Modal.Title>Chỉnh sửa {playlist?.type}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className='d-flex' style={{ gap: '50px' }}>
                    <Form.Group style={{ width: '350px', height: '350px' }}>
                        <Form.Label className='text-dark'>Ảnh bìa</Form.Label>
                        <ImageUpload
                            src={image}
                            onDrop={(f) => setImage(f.file[0])}
                        />
                    </Form.Group>
                    <Form.Group style={{ width: '600px' }}>
                        <Form.Group>
                            <Form.Label className='text-dark'>Tên Playlist</Form.Label>
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            {errors.title && <Form.Text className="text-danger">{errors.title}</Form.Text>}
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className='text-dark mt-2'>Thể loại</Form.Label>
                            <ReactSelect
                                value={genres}
                                onChange={handleGenresChange}
                                options={availableGenres}
                                isMulti
                                placeholder="Chọn thể loại"
                            />
                            {errors.genres && <Form.Text className="text-danger">{errors.genres}</Form.Text>}
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className='text-dark mt-2'>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className='text-dark mt-2'>Loại Playlist</Form.Label>
                            <Form.Control
                                as="select"
                                value={playlistType}
                                onChange={(e) => setPlaylistType(e.target.value)}
                            >
                                <option value={1}>Album</option>
                                <option value={2}>Single</option>
                                <option value={3}>EP</option>
                                <option value={4}>Playlist</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group>
                            <Form.Check
                                className='mt-2'
                                type="checkbox"
                                label="Công khai"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                            />
                        </Form.Group>
                        {Number(playlistType) !== 4 &&
                            <Form.Group>
                                <Form.Label className='text-dark mt-2'>Ngày xuất bản</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={publishedDate}
                                    onChange={(e) => setPublishedDate(e.target.value)}
                                />
                                {errors.publishedDate && <Form.Text className="text-danger">{errors.publishedDate}</Form.Text>}
                            </Form.Group>}
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>
                    Đóng
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Lưu thay đổi
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PlaylistModal;