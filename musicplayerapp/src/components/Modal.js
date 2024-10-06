import React from 'react';
import '../styles/Modal.css';

const Modal = ({
    label,
    visible,
    onConfirm,
    onCancel,
    confirmText = "Yes",
    cancelText = "No",
    title = null
}) => {
    if (!visible) return null;
    const confirm = () => {
        onConfirm();
        onCancel();
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {title && <h5 className='text-dark'>{title}</h5>}
                <p>{label}</p>
                <div className="modal-buttons">
                    <button onClick={confirm}>{confirmText}</button>
                    <button onClick={onCancel}>{cancelText}</button>
                </div>
            </div>
        </div>
    );
};

export default Modal;