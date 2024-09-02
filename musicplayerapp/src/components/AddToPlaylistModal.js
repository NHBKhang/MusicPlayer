import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Tabs, Tab } from 'react-bootstrap';
import { useUser } from '../configs/UserContext';
import { authAPI, endpoints } from '../configs/API';
import { useNavigate } from 'react-router-dom';

const AddToPlaylistModal = ({ visible, song, onClose }) => {
    const { getAccessToken, user } = useUser();
    const navigate = useNavigate();
    const [filterText, setFilterText] = useState('');
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylist, setNewPlaylist] = useState(null);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [created, setCreated] = useState(false);

    const updateNewPlaylist = (field, value) => {
        setNewPlaylist(current => ({ ...current, [field]: value }));
    }

    const filteredPlaylists = playlists.filter(playlist =>
        playlist.title.toLowerCase().includes(filterText.toLowerCase())
    );

    const validateForm = () => {
        const newErrors = {};
        if (!newPlaylist?.title) newErrors.title = 'Tên bài hát là bắt buộc.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const closeModal = () => {
        onClose();
        setErrors({});
    }

    useEffect(() => {
        if (visible && user?.id && song?.id) {
            const loadPlaylists = async () => {
                try {
                    let res = await authAPI(await getAccessToken()).get(
                        `${endpoints.playlists}?creator=${user?.id}`, {
                        headers: {
                            "Song-ID": song?.id
                        }
                    });
                    setPlaylists(res.data.results);
                } catch (error) {
                    console.error(error);
                }
            }

            loadPlaylists();

            setNewPlaylist({
                title: '',
                is_public: true
            });
            setCreated(false);
        }
    }, [getAccessToken, visible, user?.id, song?.id]);

    const onSave = async () => {
        if (!validateForm()) return;

        const formData = new FormData();
        for (let key in newPlaylist)
            formData.append(key, newPlaylist[key]);
        formData.append('creator_id', user.id);
        formData.append('details_list', JSON.stringify({
            song: song.id
        }));

        try {
            let res = await authAPI(await getAccessToken()).post(endpoints.playlists,
                formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Song-ID": song?.id
                }
            });

            if (res.status === 201) {
                setCreated(true);
                setNewPlaylist(res.data);
            } else {
                throw new Error("Response code is invalid");
            }
        } catch (error) {
            setFormError("Lỗi không tạo được playlist");
        }
    };

    const addToPlaylist = async (playlist) => {
        try {
            let formData = new FormData();

            if (playlist.added) {
                formData.append('details_list', JSON.stringify({
                    id: playlist.details.find(d => d.song.id === song.id).id,
                    song: song.id,
                    action: 'remove'
                }));
            } else {
                formData.append('details_list', JSON.stringify({
                    song: song.id
                }));
            }

            let res = await authAPI(await getAccessToken()).patch(endpoints.playlist(playlist.id),
                formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Song-ID": song?.id
                }
            });

            if (res.status === 200 || res.status === 204) {
                setPlaylists(currentPlaylists =>
                    currentPlaylists.map(pl =>
                        pl.id === playlist.id
                            ? { ...pl, added: !pl.added }
                            : pl
                    )
                );
            } else {
                throw new Error("Response code is invalid");
            }
        } catch (error) {
            setFormError("Lỗi không thể cập nhật playlist");
        }
    };


    const goToPlaylist = (playlistId) => navigate(`/playlists/${playlistId}/`)

    return (
        <Modal show={visible} onHide={closeModal} className='add-modal'>
            <Modal.Header closeButton>
                <Modal.Title>Thêm vào playlist</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs defaultActiveKey="add" id="playlist-add-tabs" className="mb-3">
                    <Tab eventKey="add" title="Thêm vào playlist" className='bg-white'>
                        <Form.Control
                            type="text"
                            placeholder="Filter playlists"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="mb-3" />
                        <div className="playlist-list">
                            {filteredPlaylists.map((playlist) => (
                                <div
                                    key={playlist.id}
                                    className="d-flex align-items-center justify-content-between mb-2"
                                    style={{ cursor: 'pointer', padding: '5px', borderBottom: '1px solid #ddd' }}>
                                    <div onClick={() => goToPlaylist(playlist.id)} className="d-flex align-items-center">
                                        <img
                                            src={playlist.image ??
                                                (playlist?.details?.length > 0 && playlist?.details[0].song.image)}
                                            alt={playlist.title}
                                            style={{ width: '40px', height: '40px', borderRadius: '4px', marginRight: '10px' }} />
                                        <div>
                                            <div className="text-dark">{playlist.title}</div>
                                            <div className="text-muted">{playlist.details.length} bài hát</div>
                                        </div>
                                    </div>
                                    <Button
                                        variant={playlist.added ? "success" : "outline-primary"}
                                        size="sm"
                                        onClick={() => addToPlaylist(playlist)}>
                                        {playlist.added ? "Đã thêm" : "Thêm vào playlist"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Tab>
                    <Tab eventKey="create" title="Tạo playlist mới" className='bg-white'>
                        {created ? <>
                            <div
                                className="d-flex align-items-center justify-content-between mb-2"
                                style={{ cursor: 'pointer', padding: '5px', borderBottom: '1px solid #ddd' }}>
                                <div className="d-flex align-items-center">
                                    <img
                                        src={newPlaylist.image ??
                                            (newPlaylist?.details?.length > 0 && newPlaylist?.details[0].song.image)}
                                        alt={newPlaylist.title}
                                        style={{ width: '40px', height: '40px', borderRadius: '4px', marginRight: '10px' }} />
                                    <div>
                                        <div className="text-dark">{newPlaylist.title}</div>
                                        <div className="text-muted">{newPlaylist.details.length} bài hát</div>
                                    </div>
                                </div>
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => navigate(`/playlists/${newPlaylist.id}/`)}>
                                    Đi tới playlist
                                </Button>
                            </div>
                        </> : <>
                            <Form.Group>
                                <Form.Label className='text-dark'>Tên Playlist</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newPlaylist?.title}
                                    onChange={(e) => updateNewPlaylist('title', e.target.value)} />
                                {errors.title && <Form.Text className="text-danger">{errors.title}</Form.Text>}
                            </Form.Group>
                            <Form.Group>
                                <Form.Check
                                    className='mt-2'
                                    type="checkbox"
                                    label="Công khai"
                                    checked={playlists?.is_public ?? true}
                                    onChange={(e) => updateNewPlaylist('is_public', e.target.checked)} />
                            </Form.Group>
                            <Form.Group className='text-end mt-3'>
                                <Button
                                    variant="primary"
                                    size="md"
                                    onClick={onSave}>
                                    Lưu
                                </Button>
                            </Form.Group>
                        </>}
                    </Tab>
                </Tabs>
                {formError && <Form.Text className="text-danger">{formError}</Form.Text>}
            </Modal.Body>
        </Modal>
    );
};

export default AddToPlaylistModal;