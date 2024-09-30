import React, { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import Page from '.';
import { useParams } from 'react-router-dom';
import { useUser } from '../configs/UserContext';
import createWebSocket from '../configs/WebSocket';
import { authAPI, endpoints } from '../configs/API';

const LiveViewerPage = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const socketRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);
  const [isSourceBufferReady, setIsSourceBufferReady] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [views, setViews] = useState(0);
  const [streamer, setStreamer] = useState(null);
  const { id } = useParams();
  const { user, getAccessToken } = useUser();

  useEffect(() => {
    const createNewWebSocket = () => {
      const socket = createWebSocket('live', { viewer: user.id }, id);

      socket.onopen = () => {
        console.log('WebSocket connection established.');
      };

      socket.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          handleVideoStream(event.data);
        } else {
          const data = JSON.parse(event.data);
          await handleWebSocketMessage(data);
        }
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed.');
        reconnectWebSocket();
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return socket;
    };

    const handleVideoStream = (blob) => {
      const videoBlob = new Blob([blob], { type: 'video/webm' });

      if (isSourceBufferReady && sourceBufferRef.current && !sourceBufferRef.current.updating) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const arrayBuffer = reader.result;
          try {
            sourceBufferRef.current.appendBuffer(new Uint8Array(arrayBuffer));
            manageBufferOverflow();
          } catch (error) {
            console.error("Error appending buffer:", error);
          }
        };
        reader.readAsArrayBuffer(videoBlob);
      }
    };

    const manageBufferOverflow = () => {
      if (videoRef.current.currentTime > 10) {
        const removeStart = 0;
        const removeEnd = videoRef.current.currentTime - 10;
        sourceBufferRef.current.remove(removeStart, removeEnd);
      }
    };

    const handleWebSocketMessage = async (data) => {
      if (data.type === 'chat_message') {
        addNewComment(data);
      } else if (data.type === 'streamer_info') {
        await fetchStreamerInfo(Number(data.user_id));
      } else if (data.viewers_count !== undefined) {
        setViews(data.viewers_count);
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

    const fetchStreamerInfo = async (userId) => {
        const res = await authAPI(await getAccessToken()).get(endpoints.user(userId));
        setStreamer(res.data);
    };

    const reconnectWebSocket = () => {
      setTimeout(() => {
        socketRef.current = createNewWebSocket();
      }, 1000);
    };

    socketRef.current = createNewWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [isSourceBufferReady, id, user.id, getAccessToken]);

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
    if (newComment.trim() && socketRef.current) {
      const commentData = {
        type: 'chat_message',
        content: newComment,
        user: JSON.stringify({
          id: user.id,
          name: user.name,
          avatar: user.avatar
        }),
        timestamp: new Date()
      };

      socketRef.current.send(JSON.stringify(commentData));
      setNewComment('');
    }
  };

  const goToArtist = () => { }
  const follow = () => { }

  return (
    <Page title={'Live Viewer'}>
      <div className='row'>
        <div className="video-container col-md-8">
          <video ref={videoRef} className="video-js vjs-default-skin" controls preload="auto" />
          <span className='views'><i class="fa-solid fa-eye"></i> {views}</span>
          <div className="d-flex align-items-center cursor-pointer" style={{ gap: '12px' }}>
            <img onClick={goToArtist}
              src={streamer?.avatar}
              alt={streamer?.name}
              width={40}
              height={40}
              className='rounded-circle' />
            <div className='d-flex text-start' style={{ flexDirection: 'column' }}
              onClick={goToArtist}>
              <h6 className='m-0'>{streamer?.name}</h6>
              <p className='m-0'>{streamer?.followers} người theo dõi</p>
            </div>
            {user.id !== streamer?.id &&
              <button className={`follow-button ${streamer?.followed && 'followed'}`} onClick={follow}>
                {streamer?.followed ? (<>
                  <i class="fa-solid fa-user-check"></i>
                  <p className='text-black m-0'> Đã theo dõi</p>
                </>) : (<>
                  <i class="fa-solid fa-user-plus"></i>
                  <p className='text-black m-0'> Theo dõi</p>
                </>)}
              </button>}
          </div>
        </div>
        <div className='col-md-4'>
          <div className="comments-section">
            <h5>Bình luận</h5>
            <div className="comments-box">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div key={index} className="comment">
                    <div className="comment-header">
                      <img
                        src={comment.user.avatar}
                        alt={`Avatar of ${comment.user.name}`}
                        className="comment-avatar" />
                      <strong>{comment.user.name}</strong>
                    </div>
                    <p className="text-dark m-0">{comment.content}</p>
                    <small>{new Date(comment.timestamp).toLocaleTimeString()}</small>
                  </div>
                ))
              ) : (
                <p className="text-dark">Chưa có bình luận nào</p>
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