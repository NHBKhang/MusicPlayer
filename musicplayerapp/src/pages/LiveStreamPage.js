import React, { useRef, useState } from "react";
import Page from ".";
import '../styles/LiveStreamPage.css';
import { useUser } from "../configs/UserContext";
import createWebSocket from "../configs/WebSocket";

const LiveStreamPage = () => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const socket = useRef(null);
    const mediaSourceRef = useRef(null);
    const sourceBufferRef = useRef(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isSourceBufferReady, setIsSourceBufferReady] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const { user } = useUser();

    const generateSessionId = () => {
        return 'session-' + Math.random().toString(36).substr(2, 9);
    };

    const startStream = async () => {
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoRef.current.srcObject = userStream;
            setStream(userStream);
            setIsStreaming(true);

            const id = generateSessionId();
            setSessionId(id);
            socket.current = createWebSocket('live', { user_id: user.id }, id);

            socket.current.onopen = () => {
                console.info("WebSocket connection established.");
            };
            socket.current.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
            socket.current.onclose = () => {
                console.info("WebSocket connection closed.");
            };

            const mimeType = 'video/webm; codecs="vp8, opus"';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                console.error("Unsupported MIME type or codec: ", mimeType);
                return;
            }

            // Initialize MediaSource API
            mediaSourceRef.current = new MediaSource();
            videoRef.current.src = URL.createObjectURL(mediaSourceRef.current);

            mediaSourceRef.current.addEventListener('sourceopen', () => {
                sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer(mimeType);
                setIsSourceBufferReady(true);  // Set source buffer as ready
            });

            const recorder = new MediaRecorder(userStream, { mimeType: mimeType });
            setMediaRecorder(recorder);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0 && socket.current.readyState === WebSocket.OPEN) {
                    const blob = new Blob([event.data], { type: 'video/webm' });
                    socket.current.send(blob);

                    if (isSourceBufferReady && sourceBufferRef.current && !sourceBufferRef.current.updating) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            sourceBufferRef.current.appendBuffer(new Uint8Array(reader.result));
                        };
                        reader.readAsArrayBuffer(blob);
                    }
                }
            };

            recorder.start(5000);  // Send video/audio chunks every 5 seconds
        } catch (err) {
            console.error("Error starting stream:", err);
        }
    };

    const stopStream = () => {
        setSessionId(null);
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsStreaming(false);
        }
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
        if (socket.current) {
            socket.current.close();
            console.info("Stopped WebSocket connection.");
        }
    };

    return (
        <Page title={'Live Stream'}>
            <div className="camera-container">
                <video ref={videoRef} autoPlay playsInline muted />
            </div>
            {isStreaming ? (
                <button onClick={stopStream} className="live-button">
                    <i className="fa-solid fa-stop"></i> Stop Streaming
                </button>
            ) : (
                <button onClick={startStream} className="live-button">
                    <i className="fa-solid fa-camera"></i> Start Streaming
                </button>
            )}
            {sessionId && (
                <div className="session-id-container">
                    <p className="m-0">Session ID: <strong>{sessionId}</strong></p>
                    <span
                        className="copy-icon ms-2"
                        onClick={() => navigator.clipboard.writeText(sessionId)}
                        title="Copy Session ID" >
                        <i className="fa-solid fa-copy"></i>
                    </span>
                </div>
            )}
        </Page>
    );
};

export default LiveStreamPage;