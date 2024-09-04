import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
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
    const [isDownloadable, setIsDownloadable] = useState(false);
    const { getAccessToken } = useUser();

    useEffect(() => {
        if (song && visible) {
            let loadSong = async () => {
                try {
                    setImage(song.image || '');
                    setTitle(song.title || '');
                    setArtists(song.artists || '');
                    setIsPublic(song.is_public);
                    setIsDownloadable(song.access?.is_downloadable);
                    if (!song.genres) {
                        let res = await authAPI(await getAccessToken()).get(endpoints.song(song.id));
                        let data = res.data;
                        setGenres(data.genres?.map(genre => ({
                            value: genre.id,
                            label: genre.name
                        })) || []);
                        setLyrics(data.lyrics || '');
                        setDescription(data.description || '');
                    } else {
                        setGenres(song.genres?.map(genre => ({
                            value: genre.id,
                            label: genre.name
                        })) || []);
                        setLyrics(song.lyrics || '');
                        setDescription(song.description || '');
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

    const handleSubmit = async () => {
        let formData = new FormData();
        if (image !== song.image) formData.append('image', image);
        if (title !== song.title) formData.append('title', title);
        if (artists !== song.artists) formData.append('artirts', artists);
        const genreIds = genres.map(genre => genre.value);
        const originalGenreIds = availableGenres.map(genre => genre.id);
        if (genreIds.length !== originalGenreIds.length || !genreIds.every(id => originalGenreIds.includes(id)))
            genreIds.forEach(id => {
                formData.append('genre_ids', id);
            });
        if (lyrics !== song.lyrics) formData.append('lyrics', lyrics);
        if (description !== song.description) formData.append('description', description);
        if (isPublic !== song.is_public) formData.append('is_public', isPublic);


        try {
            let accessData = new FormData();
            accessData.append('is_downloadable', isDownloadable);
            accessData.append('is_downloadable', isDownloadable);
            accessData.append('is_downloadable', isDownloadable);

            if (!song.access) {
                await authAPI(await getAccessToken()).post(
                    endpoints['song-access'](song.id), accessData, {
                    headers: {
                        "Content-Type": "multipart/form-dat"
                    }
                });
            } else {
                await authAPI(await getAccessToken()).patch(
                    endpoints['song-access'](song.id), accessData, {
                    headers: {
                        "Content-Type": "multipart/form-dat"
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

    return (
        <Modal show={visible} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Chỉnh sửa bài hát</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className='d-flex' style={{ gap: '50px' }}>
                    <Form.Group style={{ width: '350px', height: '350px' }}>
                        <Form.Label className='text-dark'>Ảnh bìa</Form.Label>
                        <ImageUpload
                            src={image}
                            onDrop={(f) => setImage(f.file[0])} />
                    </Form.Group>
                    <Form.Group style={{ width: '600px' }}>
                        <Form.Group controlId="formTitle">
                            <Form.Label className='text-dark mt-2'>Tên bài hát</Form.Label>
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formArtists">
                            <Form.Label className='text-dark mt-2'>Nghệ sĩ</Form.Label>
                            <Form.Control
                                type="text"
                                value={artists}
                                onChange={(e) => setArtists(e.target.value)}
                            />
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
                                classNamePrefix="select"
                            />
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
                            <Form.Label className='text-dark mt-2'>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)} />
                        </Form.Group>
                        <Form.Group className='d-flex' style={{ gap: '50px' }}>
                            <Form.Group>
                                <Form.Check
                                    className='mt-2'
                                    type="checkbox"
                                    label="Công khai"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Check
                                    className='mt-2'
                                    type="checkbox"
                                    label="Cho phép tải về"
                                    checked={isDownloadable}
                                    onChange={(e) => setIsDownloadable(e.target.checked)} />
                            </Form.Group>
                        </Form.Group>
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

export default SongModal;