import { useEffect, useRef, useState } from "react";

const CommentSection = ({ comments, socketRef, user, liveStream }) => {
    const [newComment, setNewComment] = useState('');
    const commentsBoxRef = useRef(null);

    useEffect(() => {
        if (commentsBoxRef.current) {
            commentsBoxRef.current.scrollTop = commentsBoxRef.current.scrollHeight;
        }
    }, [comments]);

    const handleCommentSubmit = async () => {
        if (newComment.trim() && socketRef.current) {
            const commentData = {
                type: 'chat_message',
                content: newComment,
                user: JSON.stringify({
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar
                }),
                timestamp: new Date(),
                live_stream_id: liveStream.id
            };

            socketRef.current.send(JSON.stringify(commentData));
            setNewComment('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCommentSubmit();
        }
    };

    return (
        <div className="comments-section m-0">
            <h5>Bình luận</h5>
            <div className="comments-box" ref={commentsBoxRef}>
                {comments.length > 0 ? (
                    comments.map((comment, index) => (
                        <div
                            key={index}
                            className={`comment ${comment.user.id === user.id && 'owner'}`}>
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
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập bình luận..." />
                <button onClick={handleCommentSubmit}>Gửi</button>
            </div>
        </div>
    )
}

export default CommentSection;