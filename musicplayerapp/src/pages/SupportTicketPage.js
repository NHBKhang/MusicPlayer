import React, { useState, useEffect } from 'react';
import { SupportContainer } from './SupportPage';
import { authAPI, endpoints } from '../configs/API';
import { useUser } from '../configs/UserContext';

const SupportTicketPage = () => {
    const [ticketList, setTicketList] = useState([]);
    const { user, getAccessToken } = useUser();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await authAPI(await getAccessToken()).get(endpoints.tickets);
                setTicketList(res.data);
            } catch (error) {
                console.error('Error fetching tickets:', error);
            }
        };

        fetchTickets();
    }, [getAccessToken]);

    const addTicket = (newTicket) => {
        setTicketList([...ticketList, newTicket]);
    };

    return (
        <SupportContainer>
            <div className="ticket-page">
                <h1>Phiếu hỗ trợ</h1>
                {user ? <>
                    <SupportTicketForm addTicket={addTicket} getAccessToken={getAccessToken} user={user} />
                    <SupportTicketTable ticketList={ticketList} />
                </> : <p>
                    Vui lòng <a className='text-primary' href='/login/?next=/support/feedback/'>đăng nhập</a> để tạo phiếu hỗ trợ
                </p>}
            </div>
        </SupportContainer>
    );
};

const SupportTicketForm = ({ addTicket, getAccessToken, user }) => {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await authAPI(await getAccessToken()).post(endpoints.tickets, {
                subject,
                description,
                priority,
            });
            addTicket(res.data);
            setSubject('');
            setDescription('');
            setPriority(0);
        } catch (error) {
            console.error('Error submitting ticket:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="ticket-form">
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Tiêu đề phiếu"
                required />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Miêu tả vấn đề của bạn"
                required />
            <select value={priority} onChange={(e) => setPriority(Number(e.target.value))}>
                <option value={0}>Thấp</option>
                <option value={1}>Trung bình</option>
                <option value={2}>Cao</option>
            </select>
            <button type="submit">Gửi phiếu</button>
        </form>
    );
};

const PRIORITY_CHOICES = {
    0: 'Thấp',
    1: 'Trung bình',
    2: 'Cao',
};

const STATUS_CHOICES = {
    0: 'Mở',
    1: 'Đóng',
};

const getPriorityClass = (priority) => {
    switch (priority) {
        case 0:
            return 'priority-low';
        case 1:
            return 'priority-medium';
        case 2:
            return 'priority-high';
        default:
            return '';
    }
};

const getStatusClass = (status) => {
    switch (status) {
        case 0:
            return 'status-open';
        case 1:
            return 'status-closed';
        default:
            return '';
    }
};

const SupportTicketTable = ({ ticketList }) => {
    return (
        <table className='ticket-table'>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tiêu đề</th>
                    <th>Mô tả</th>
                    <th>Độ ưu tiên</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                </tr>
            </thead>
            <tbody>
                {ticketList.map((ticket) => (
                    <tr key={ticket.id}>
                        <td>{ticket.id}</td>
                        <td>{ticket.subject}</td>
                        <td>{ticket.description}</td>
                        <td className={getPriorityClass(ticket.priority)}>
                            {PRIORITY_CHOICES[ticket.priority]}
                        </td>
                        <td className={getStatusClass(ticket.status)}>
                            {STATUS_CHOICES[ticket.status]}
                        </td>
                        <td>{new Date(ticket.created_at).toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default SupportTicketPage;