import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import API, { endpoints } from '../configs/API';
import ReactSelect from 'react-select';

const SongModal = ({ visible, song, onUpdate, onClose }) => {
    const [title, setTitle] = useState('');
    const [artists, setArtists] = useState('');
    const [genres, setGenres] = useState([]);
    const [lyrics, setLyrics] = useState('');
    const [description, setDescription] = useState('');
    const [availableGenres, setAvailableGenres] = useState([]);

    useEffect(() => {
        if (song) {
            setTitle(song.title || '');
            setArtists(song.artists || '');
            setGenres(song.genres.map(genre => ({
                value: genre.id,
                label: genre.name
            })));
            setLyrics(song.lyrics || '');
            setDescription(song.description || '');
        }
    }, [song, availableGenres]);

    useEffect(() => {
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
    }, []);

    const handleSubmit = async () => {
        try {
            await axios.put(`/api/songs/${song.id}/`, {
                title,
                artists,
                genres: genres.map(g => g.value),
                lyrics,
                description,
            });
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating song:', error);
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
                <Form className='d-flex'>
                    <Form.Group>
                        <Form.Label className='text-dark'>Title</Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group style={{ width: '300px' }}>
                        <Form.Group controlId="formTitle">
                            <Form.Label className='text-dark'>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formArtists">
                            <Form.Label className='text-dark'>Artists</Form.Label>
                            <Form.Control
                                type="text"
                                value={artists}
                                onChange={(e) => setArtists(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formGenres">
                            <Form.Label className='text-dark'>Genres</Form.Label>
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
                            <Form.Label className='text-dark'>Lyrics</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={lyrics}
                                onChange={(e) => setLyrics(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formDescription">
                            <Form.Label className='text-dark'>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Form.Group>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SongModal;