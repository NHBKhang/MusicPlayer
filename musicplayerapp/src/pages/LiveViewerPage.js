import React, { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import Page from '.';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../configs/UserContext';
import createWebSocket from '../configs/WebSocket';
import { authAPI, endpoints } from '../configs/API';
import { CommentSection } from '../components';

const LiveViewerPage = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const socketRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);
  const [isSourceBufferReady, setIsSourceBufferReady] = useState(false);
  const [comments, setComments] = useState([]);
  const [views, setViews] = useState(0);
  const [liveStream, setLiveStream] = useState();
  const { id } = useParams();
  const { user, getAccessToken } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const createNewWebSocket = () => {
      const socket = createWebSocket('live', { viewer: user.id }, id);

      socket.onopen = () => {
        console.log('WebSocket connection established.');
      };

      socket.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          const videoBlob = new Blob([event.data], { type: 'video/webm' });

          if (isSourceBufferReady && sourceBufferRef.current && !sourceBufferRef.current.updating) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const arrayBuffer = reader.result;
              try {
                sourceBufferRef.current.appendBuffer(new Uint8Array(arrayBuffer));

                if (videoRef.current.currentTime > 10) {
                  const removeStart = 0;
                  const removeEnd = videoRef.current.currentTime - 10;
                  sourceBufferRef.current.remove(removeStart, removeEnd);
                }
              } catch (error) {
                console.error("Error appending buffer:", error);
              }
            };
            reader.readAsArrayBuffer(videoBlob);
          }
        } else {
          const data = JSON.parse(event.data);

          if (data.type === 'chat_message') {
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
          } else if (data.viewers_count !== undefined) {
            setViews(data.viewers_count);
          }
        }
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed.');
        setTimeout(() => {
          socketRef.current = createNewWebSocket();
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

  useEffect(() => {
    const loadLiveStream = async () => {
      try {
        let res = await authAPI(await getAccessToken()).get(endpoints['live-stream'](id));
        setLiveStream(res.data);
      } catch (error) {
        console.error(error);
      }
    }

    loadLiveStream();
  }, [id, getAccessToken]);

  const goToArtist = () => navigate(`/profile/${liveStream.user.id}/`)
  const follow = () => {

  }

  return (
    <Page title={liveStream?.title || 'Phiên trực tuyến'}>
      <div className='row'>
        <div className="col-md-8 text-start">
          <div className='video-container '>
            <video ref={videoRef} className="video-js vjs-default-skin mb-2" controls preload="auto" />
            <span className='views'><i class="fa-solid fa-eye"></i> {views}</span>
          </div>
          <h4>{liveStream?.title}</h4>
          <div className="d-flex align-items-center cursor-pointer" style={{ gap: '12px' }}>
            <img onClick={goToArtist}
              src={liveStream?.user.avatar}
              alt={liveStream?.user.name}
              width={40}
              height={40}
              className='rounded-circle' />
            <div className='d-flex text-start' style={{ flexDirection: 'column' }}
              onClick={goToArtist}>
              <h6 className='m-0'>{liveStream?.user.name}</h6>
              <p className='m-0'>{liveStream?.user.followers} người theo dõi</p>
            </div>
            {user.id !== liveStream?.user.id &&
              <button className={`follow-button ${liveStream?.user.followed && 'followed'}`} onClick={follow}>
                {liveStream?.user.followed ? (<>
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
          <CommentSection
            comments={comments}
            socketRef={socketRef}
            user={user}
            liveStream={liveStream} />
        </div>
      </div>
    </Page>
  );
};

export default LiveViewerPage;