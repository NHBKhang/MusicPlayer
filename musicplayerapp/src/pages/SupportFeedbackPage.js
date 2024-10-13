import React, { useState, useEffect } from 'react';
import { SupportContainer } from './SupportPage';
import { authAPI, endpoints } from '../configs/API';
import { useUser } from '../configs/UserContext';

const SupportFeedbackPage = () => {
    const [feedbackList, setFeedbackList] = useState([]);
    const { user, getAccessToken } = useUser();

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await authAPI(await getAccessToken()).get(endpoints.feedback);
                setFeedbackList(res.data);
            } catch (error) {
                console.error('There was an error fetching feedback:', error);
            }
        };

        fetchFeedback();
    }, [getAccessToken]);

    const addFeedback = (newFeedback) => {
        setFeedbackList([...feedbackList, newFeedback]);
    };

    return (
        <SupportContainer>
            <div className="feedback-page">
                <h1 className='mt-4 mb-5'>Phản hồi của bạn</h1>
                {user ? <>
                    <FeedbackForm addFeedback={addFeedback} getAccessToken={getAccessToken} user={user} />
                    <FeedbackTable feedbackList={feedbackList} />
                </> : <p>
                    Vui lòng <a className='text-primary' href='/login/?next=/support/feedback/'>đăng nhập</a> để gửi phản hồi
                </p>}
            </div>
        </SupportContainer>
    );
};

const FeedbackForm = ({ addFeedback, getAccessToken, user }) => {
    const [content, setContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await authAPI(await getAccessToken()).post(endpoints.feedback,
                { feedback: content });
            addFeedback(res.data);
            setContent('');
        } catch (error) {
            console.error('There was an error submitting feedback:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <img src={user.avatar} alt={user.name} />
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập phản hồi của bạn..."
                required />
            <button type="submit">Gửi phản hồi</button>
        </form>
    );
};

const FeedbackTable = ({ feedbackList }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Phản hồi</th>
                    <th>Ngày gửi</th>
                </tr>
            </thead>
            <tbody>
                {feedbackList.map((feedback) => (
                    <tr key={feedback.id}>
                        <td>{feedback.id}</td>
                        <td>{feedback.feedback}</td>
                        <td>{new Date(feedback.created_at).toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default SupportFeedbackPage;