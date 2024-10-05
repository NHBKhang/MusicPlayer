import React, { useState } from 'react';
import '../styles/Comments.css';
import moment from 'moment';
import { useUser } from '../configs/UserContext';
import { authAPI, endpoints } from '../configs/API';
import VerifiedBadge from './VerifiedBadge';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../configs/AudioContext';

const Comments = ({ comments, setComments, user, state }) => {
    const [content, setContent] = useState('');
    const { getAccessToken, user: currentUser } = useUser();
    const { setSong, song } = state;
    const { isPlaying, currentSong, setCurrentSong } = useAudio();
    const navigate = useNavigate();

    const inputChange = (event) => {
        setContent(event.target.value);
    };

    const addComment = async () => {
        if (!content.trim()) {
            alert("Bình luận không được rỗng!");
            return;
        }
        try {
            let res = await authAPI(await getAccessToken())
                .post(endpoints['add-comment'](song.id), {
                    'content': content,
                    'user': user.id,
                    'song': song.id
                }, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            setComments((current) => [
                ...current,
                res.data,
            ]);
            setContent('');
        } catch (error) {
            console.error(error);
            alert(error);
        }
    };

    const follow = async () => {
        try {
            let res = await authAPI(await getAccessToken())
                .post(endpoints.follow(song?.uploader?.id));
            setSong(prev => ({
                ...prev,
                followed: res.data.followed
            }));

            if (isPlaying && currentSong.id === song.id)
                setCurrentSong(prev => ({
                    ...prev,
                    followed: res.data.followed
                }));
        } catch (error) {
            console.error(error);
            alert("Lỗi");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            addComment();
        }
    };

    const goToArtist = (artistId) => { navigate(`/profile/${artistId}`); };

    return (
        <div className="comments-container">
            {currentUser ? <>
                <div className='mb-3 mt-1' style={{ fontSize: "1.1rem" }}>
                    <span>
                        <i class="fa-solid fa-comment me-2"></i>
                        {song?.comments} bình luận
                    </span>
                </div>
                <div className='w-100 mb-4 pb-2'>
                    <img
                        src={user?.avatar}
                        alt={user?.name}
                        className='rounded-circle me-2'
                        width={45} />
                    <input
                        type="text"
                        value={content}
                        onChange={inputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a comment..."
                        className="comment-input" />
                    <button onClick={addComment} className="add-comment-button">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
                <div className='row w-100'>
                    <div
                        className='col-md-3 d-md-inline-flex d-none flex-wrap'
                        style={{ alignItems: "flex-start", justifyContent: "center", maxHeight: 250 }}>
                        <img onClick={() => goToArtist(song?.uploader?.id)}
                            src={song?.uploader?.avatar}
                            alt={song?.uploader?.name}
                            className='rounded-circle m-auto mt-1 uploader-cover' />
                        <h6 className='w-100 mt-2 fs-ms-6 fs-5' onClick={() => goToArtist(song?.uploader?.id)}>
                            {song?.uploader?.name}
                            {song?.uploader?.info?.verified && <VerifiedBadge />}
                        </h6>
                        <div className='mb-2 d-flex justify-content-evenly w-100'>
                            <div className='d-flex align-items-center'>
                                <i class="fa-solid fa-users text-white"></i>
                                <p className='mb-0 ms-1'>{song?.uploader?.followers}</p>
                            </div>
                            <div className='align-items-center d-none d-lg-flex'>
                                <i class="fa-solid fa-music text-white"></i>
                                <p className='mb-0 ms-1'>{song?.uploader?.songs}</p>
                            </div>
                        </div>
                        {user?.id !== song?.uploader?.id &&
                            <button
                                className={`mb-2 follow-button ${song?.followed ? 'followed' : ''}`}
                                onClick={follow}>
                                {song?.followed ? (<>
                                    <i class="fa-solid fa-user-check"></i>
                                    <p className='d-none d-lg-inline text-black'> Đã theo dõi</p>
                                </>) : (<>
                                    <i class="fa-solid fa-user-plus"></i>
                                    <p className='d-none d-lg-inline text-black'> Theo dõi</p>
                                </>)}
                            </button>}
                    </div>
                    <div className='col-md-9 col-sm-12'>
                        {comments.length > 0 ? comments.map((comment, index) => (
                            <div
                                key={index}
                                className="comment-item d-flex w-100"
                                style={{ position: 'relative' }}>
                                <div className='ms-1 me-2'>
                                    <img
                                        src={comment.user?.avatar}
                                        alt={comment.user?.name}
                                        className='rounded-circle me-2'
                                        width={50} />
                                </div>
                                <div>
                                    <h6 className='m-0 p-0'>
                                        {comment.user?.name}
                                    </h6>
                                    <p>{comment.content}</p>
                                    <span className='created-date'>
                                        {moment(comment.created_date).fromNow()}
                                    </span>
                                </div>
                            </div>
                        )) : <h5 className='mt-5'>Không có bình luận nào!!!</h5>}
                    </div>
                </div>
            </> : <>
                <p>Hãy <a className='text-primary' href='/login/'>đăng nhập</a> để bình luận</p>
            </>}
        </div>
    );
};

export default Comments;