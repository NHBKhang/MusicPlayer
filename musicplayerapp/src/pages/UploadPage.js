import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Page from '.';

const UploadPage = () => {
    const [files, setFiles] = useState([]);
    const [uploadStatus, setUploadStatus] = useState('');

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(acceptedFiles);
    }, []);

    const handleUpload = async () => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files[]', file);
        });

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setUploadStatus('Upload thành công!');
                setFiles([]);
            } else {
                setUploadStatus('Upload thất bại.');
            }
        } catch (error) {
            setUploadStatus('Có lỗi xảy ra khi upload.');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'audio/*' });

    return (
        <Page title={"Tải nhạc lên"}>
            <div className='content-container px-5'>
                <h3 className='my-4'>Tải nhạc của bạn lên</h3>
                <div
                    {...getRootProps()}
                    style={{
                        display: 'flex',
                        border: '2px dashed #cccccc',
                        minHeight: '400px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        backgroundColor: isDragActive ? '#f0f0f0' : 'rgba(0, 0, 0, 0.4)',
                    }}>
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p>Thả file vào đây ...</p>
                    ) : (
                        <p>Kéo và thả file nhạc vào đây, hoặc click để chọn file</p>
                    )}
                </div>
                <div style={{ marginTop: '20px' }}>
                    {files.length > 0 && (
                        <>
                            <h4>Files sẽ upload:</h4>
                            <ul>
                                {files.map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                ))}
                            </ul>
                            <button onClick={handleUpload}>Upload</button>
                        </>
                    )}
                </div>
                {uploadStatus && <p>{uploadStatus}</p>}
            </div>
        </Page>
    );
};

export default UploadPage;