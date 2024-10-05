import React, { useRef, useState } from "react";
import Page from ".";
import '../styles/LiveStreamPage.css';
import { useUser } from "../configs/UserContext";
import createWebSocket from "../configs/WebSocket";
import { authAPI, endpoints } from "../configs/API";
import { CommentSection } from "../components";

const LiveStreamPage = () => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const socketRef = useRef(null);
    const mediaSourceRef = useRef(null);
    const sourceBufferRef = useRef(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isSourceBufferReady, setIsSourceBufferReady] = useState(false);
    const [liveStream, setLiveStream] = useState({});
    const [comments, setComments] = useState([]);
    const [views, setViews] = useState(0);
    const { user, getAccessToken } = useUser();

    const updateLiveStream = (field, value) => {
        setLiveStream(current => ({ ...current, [field]: value }));
    }

    const startStream = async () => {
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoRef.current.srcObject = userStream;
            setStream(userStream);
            setIsStreaming(true);
            setComments([]);

            const res = await authAPI(await getAccessToken()).post(endpoints["live-streams"],
                {
                    ...liveStream,
                    user: user.id
                }, {
                headers: {
                    "Content-Type": 'application/json'
                }
            });
            setLiveStream(res.data);

            socketRef.current = createWebSocket('live', { user_id: user.id }, res.data.session_id);

            socketRef.current.onopen = () => {
                console.info("WebSocket connection established.");
            };
            socketRef.current.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
            socketRef.current.onclose = () => {
                console.info("WebSocket connection closed.");
            };
            socketRef.current.onmessage = async (event) => {
                if (!(event.data instanceof Blob)) {
                    const data = JSON.parse(event.data);
                    if (data.type === 'chat_message') {
                        addNewComment(data);
                    } else if (data.viewers_count !== undefined) {
                        setViews(data.viewers_count);
                    }
                }
            };

            const addNewComment = (data) => {
                const newComment = {
                    content: data.content,
                    user: data.user,
                    timestamp: new Date(data.timestamp)
                };

                setComments(prevComments => {
                    const isDuplicate = prevComments.some(comment =>
                        comment.timestamp.getTime() === newComment.timestamp.getTime()
                    );

                    if (!isDuplicate) {
                        return [...prevComments, newComment];
                    }
                    return prevComments;
                });
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
                if (event.data.size > 0 && socketRef.current.readyState === WebSocket.OPEN) {
                    const blob = new Blob([event.data], { type: 'video/webm' });
                    socketRef.current.send(blob);

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
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsStreaming(false);
        }
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
        if (socketRef.current) {
            socketRef.current.close();
            console.info("Stopped WebSocket connection.");
        }

        setViews(0);
        setLiveStream({ title: '' });
    };

    return (
        <Page title={'Phát trực tuyến'}>
            <div className={isStreaming && 'row'}>
                <div className={`row mb-4 ${isStreaming && 'col-xxl-9'}`}>
                    <div className="col-lg-3 col-md-4">
                        <div className="w-100 w-sm-90 m-auto mb-5">
                            <h4 className="text-center mb-2 p-0 text-white">Thông tin live stream</h4>
                            <div className="form-group mb-3">
                                <label htmlFor="username" className='input-label'>Tên live stream</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="username"
                                    value={liveStream?.title}
                                    onChange={(e) => updateLiveStream('title', e.target.value)}
                                    disabled={isStreaming} />
                                <div className="form-icon">
                                    <i class="fa-solid fa-user"></i>
                                </div>
                            </div>
                            {isStreaming && (
                                <div className="session-container">
                                    <div>
                                        <p className="m-0">Session ID: <strong>{liveStream.session_id}</strong></p>
                                        <span
                                            className="copy-icon ms-2"
                                            onClick={() => navigator.clipboard.writeText(liveStream.session_id)}
                                            title="Copy Session ID" >
                                            <i className="fa-solid fa-copy"></i>
                                        </span>
                                    </div>
                                    <p className="m-0">Lượt xem: <strong>{views}</strong></p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-lg-9 col-md-8 p-0 h-100">
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
                    </div>
                </div>
                {isStreaming &&
                    <div className="col-xxl-3">
                        <CommentSection
                            comments={comments}
                            socketRef={socketRef}
                            user={user}
                            liveStream={liveStream} />
                    </div>
                }
            </div>
        </Page>
    );
};

export default LiveStreamPage;