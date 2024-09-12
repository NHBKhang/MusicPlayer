import React, { useEffect, useState } from 'react';
import { useUser } from '../configs/UserContext';
import { authAPI, endpoints } from '../configs/API';
import moment from 'moment';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const { getAccessToken } = useUser();

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const res = await authAPI(await getAccessToken()).get(endpoints.notifications);
                setNotifications(res.data.results || []);
            } catch (error) {
                console.error(error);
            }
        };

        loadNotifications();
    }, [getAccessToken]);

    const handleViewAll = () => {
        setShowAll(true);
    };

    const markAsRead = async (notificationId) => {
        try {
            await authAPI(await getAccessToken()).patch(endpoints.notification(notificationId), { is_read: true });
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId ? { ...notification, is_read: true } : notification
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const hasMoreThanThree = notifications.length > 3;
    const notificationsToShow = showAll ? notifications : notifications.slice(0, 3);

    return (
        <div className="dropdown notification-dropdown">
            <button
                className="btn notification-btn dropdown-toggle no-caret"
                type="button"
                id="notificationDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                data-bs-auto-close="outside">
                <i className="fa-solid fa-bell"></i>
                <span className="badge">
                    {notifications.filter((n) => n.is_read === false).length}
                </span>
            </button>

            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown">
                <li><h6 className="dropdown-header">Thông báo</h6></li>
                {notifications.length === 0 ? (
                    <p className="text-center text-secondary fs-6 m-1">Không có thông báo nào!</p>
                ) : (
                    notificationsToShow.map(notification => (
                        <li key={notification.id}>
                            <button
                                onClick={() => markAsRead(notification.id)}
                                className={`dropdown-item text-white notification-item ${notification.is_read && 'seen'}`}>
                                {notification.message || 'No message'}
                                <span className='created-date'>
                                    {moment(notification.created_date).fromNow()}
                                </span>
                            </button>
                        </li>
                    ))
                )}
                {hasMoreThanThree && !showAll && (<>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                        <button
                            className="dropdown-item text-center text-white"
                            onClick={handleViewAll}>
                            Xem tất cả
                        </button>
                    </li>
                </>)}
            </ul>
        </div>
    );
};

export default NotificationDropdown;