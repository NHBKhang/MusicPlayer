import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

const ImageUpload = ({ src, onDrop }) => {
    const [imageSrc, setImageSrc] = useState(src);

    useEffect(() => {
        setImageSrc(src);
    }, [src]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: 'image/*',
        onDrop,
        multiple: false,
    });

    useEffect(() => {
        if (src instanceof File) {
            const objectUrl = URL.createObjectURL(src);
            setImageSrc(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (typeof src === 'string') {
            setImageSrc(src);
        }
    }, [src]);

    return (
        <div
            {...getRootProps()}
            style={{
                border: '1px dashed #cccccc',
                textAlign: 'center',
                cursor: 'pointer',
                padding: 0,
                width: '100%',
                height: '100%',
                boxSizing: 'unset',
                backgroundColor: isDragActive ? 'rgba(150, 150, 150, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                position: 'relative',
                overflow: 'hidden',
            }}

            aria-labelledby="image-upload-label"
        >
            <input {...getInputProps()} />
            {imageSrc ? (
                <img
                    src={imageSrc}
                    alt="Selected cover"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            ) : (
                <p id="image-upload-label" className='m-2'>
                    Kéo và thả ảnh vào đây, hoặc click để chọn ảnh</p>
            )}
            {isDragActive && (
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '14px',
                }}>
                    Drop it here!
                </div>
            )}
        </div>
    );
};

export default ImageUpload;