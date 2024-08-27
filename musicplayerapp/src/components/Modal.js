import React from 'react';
import '../styles/Modal.css';

const Modal = ({ label, visible, onConfirm, onCancel }) => {
    if (!visible) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p>{label}</p>
                <div className="modal-buttons">
                    <button onClick={onConfirm}>Yes</button>
                    <button onClick={onCancel}>No</button>
                </div>
            </div>
        </div>
    );
};

export default Modal;