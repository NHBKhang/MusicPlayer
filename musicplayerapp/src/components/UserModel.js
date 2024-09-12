import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { authAPI, endpoints } from '../configs/API';
import ImageUpload from './ImageUpload';
import { useUser } from '../configs/UserContext';

const UserModal = ({ visible, onClose }) => {
    const [image, setImage] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [errors, setErrors] = useState({});
    const { getAccessToken, user, saveUser } = useUser();

    useEffect(() => {
        if (visible && user) {
            setImage(user.avatar);
            setDisplayName(user.info.display_name || '');
            setEmail(user.email || '');
            setLastName(user.last_name || '');
            setFirstName(user.first_name || '');
            setBio(user.info?.bio || '');
        }
    }, [visible, user, getAccessToken]);

    const validateForm = () => {
        const newErrors = {};
        // if (!displayName) newErrors.displayName = 'Tên hiển thị là bắt buộc.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        let formData = new FormData();
        if (user.avatar !== image) formData.append('avatar', image);
        if (user.email !== email) formData.append('email', email);
        if (user.last_name !== lastName) formData.append('last_name', lastName);
        if (user.first_name !== firstName) formData.append('first_name', firstName);
        if (user.info.display_name !== displayName) formData.append('display_name', displayName);
        if (user.info.bio !== bio) formData.append('bio', bio);

        try {
            let res = await authAPI(await getAccessToken()).patch(endpoints['current-user'],
                formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            saveUser(res.data);
        } catch (error) {
            alert("Không thể lưu thay đổi");
            console.error(error);
        } finally {
            onClose();
        }
    };

    return (
        <Modal show={visible} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Chỉnh sửa hồ sơ</Modal.Title>
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
                        <Form.Group controlId="formDisPlayName">
                            <Form.Label className='text-dark mt-2'>Tên hiển thị</Form.Label>
                            <Form.Control
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)} />
                            {errors.displayName && <Form.Text className="text-danger">{errors.displayName}</Form.Text>}
                        </Form.Group>
                        <Form.Group controlId="formEmail">
                            <Form.Label className='text-dark mt-2'>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} />
                            {errors.email && <Form.Text className="text-danger">{errors.email}</Form.Text>}
                        </Form.Group>
                        <Form.Group className='d-flex' style={{ gap: '25px' }}>
                            <Form.Group style={{ minWidth: 'calc(50% - 10px)' }}>
                                <Form.Label className='text-dark mt-2'>Tên</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)} />
                                {errors.firstName && <Form.Text className="text-danger">{errors.firstName}</Form.Text>}
                            </Form.Group>
                            <Form.Group style={{ minWidth: 'calc(50% - 10px)' }}>
                                <Form.Label className='text-dark mt-2'>Họ</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)} />
                                {errors.lastName && <Form.Text className="text-danger">{errors.lastName}</Form.Text>}
                            </Form.Group>
                        </Form.Group>
                        <Form.Group controlId="formBio">
                            <Form.Label className='text-dark mt-2'>Tiểu sử</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)} />
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

export default UserModal;