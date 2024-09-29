import React, { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import Page from '.';
import { useParams } from 'react-router-dom';
import { useUser } from '../configs/UserContext';
import createWebSocket from '../configs/WebSocket';

const LiveViewerPage = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const socketRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSourceBufferReady, setIsSourceBufferReady] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [views, setViews] = useState(0);
  const { id } = useParams();
  const { user } = useUser();

  useEffect(() => {
    const createNewWebSocket = () => {
      const socket = createWebSocket('live', { viewer: user.id }, id);

      socket.onopen = () => {
        console.log('WebSocket connection established.');
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        if (event.data instanceof Blob) {
          const blob = new Blob([event.data], { type: 'video/webm' });

          if (isSourceBufferReady && sourceBufferRef.current && !sourceBufferRef.current.updating) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const arrayBuffer = reader.result;
              try {
                sourceBufferRef.current.appendBuffer(new Uint8Array(arrayBuffer));

                // Xóa dữ liệu cũ hơn 10 giây để tránh overflow buffer
                if (videoRef.current.currentTime > 10) {
                  const removeStart = 0;
                  const removeEnd = videoRef.current.currentTime - 10;
                  sourceBufferRef.current.remove(removeStart, removeEnd);
                }
              } catch (error) {
                console.error("Error appending buffer:", error);
              }
            };
            reader.readAsArrayBuffer(blob);
          }
        } else {
          const data = JSON.parse(event.data);
          if (data.viewers_count !== undefined) {
            setViews(data.viewers_count);
          }
        }
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed.');
        setIsConnected(false);

        setTimeout(() => {
          createNewWebSocket();
        }, 1000);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return socket;
    };

    socketRef.current = createNewWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [isSourceBufferReady, id, user.id]);

  useEffect(() => {
    playerRef.current = videojs(videoRef.current, {
      controls: true,
      autoplay: true,
      fluid: true,
      liveui: true,
      preload: 'auto',
    });

    mediaSourceRef.current = new MediaSource();
    videoRef.current.src = URL.createObjectURL(mediaSourceRef.current);

    mediaSourceRef.current.addEventListener('sourceopen', () => {
      const mimeType = 'video/webm; codecs="vp8, opus"';

      if (!sourceBufferRef.current) {
        try {
          sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer(mimeType);
          setIsSourceBufferReady(true);
        } catch (error) {
          console.error('Error adding SourceBuffer:', error);
        }
      }

      sourceBufferRef.current.addEventListener('updateend', () => {
        if (mediaSourceRef.current.readyState === 'open' && !sourceBufferRef.current.updating) {
          mediaSourceRef.current.endOfStream();
        }
      });
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      const updatedComments = [...comments, { text: newComment, timestamp: new Date() }];
      setComments(updatedComments);
      setNewComment('');
    }
  };

  return (
    <Page title={'Live Viewer'}>
      <div className='row'>
        <div className="video-container col-md-8">
          <video ref={videoRef} className="video-js vjs-default-skin" controls preload="auto" />
          <span className='views'><i class="fa-solid fa-eye"></i> {views}</span>
          <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        </div>
        <div className='col-md-4'>
          <div className="comments-section">
            <h5>Bình luận</h5>
            <div className="comments-box">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div key={index} className="comment">
                    <strong>User {index + 1}</strong>
                    <p className='text-dark'>{comment.text}</p>
                    <small>{comment.timestamp.toLocaleTimeString()}</small>
                  </div>
                ))
              ) : (
                <p className='text-dark'>Chưa có bình luận nào</p>
              )}
            </div>
            <div className="comment-input">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Nhập bình luận..." />
              <button onClick={handleCommentSubmit}>Gửi</button>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default LiveViewerPage;