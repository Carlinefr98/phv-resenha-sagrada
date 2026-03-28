import React, { useState, useEffect } from 'react';
import api from '../api';
import './LikeButton.css';

const LikeButton = ({ postId }) => {
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    const [likeUsers, setLikeUsers] = useState([]);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || user.userId;

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const response = await api.get(`/likes/${postId}/likes`);
                setLikes(response.data.length);
                setLikeUsers(response.data.map(l => l.User).filter(Boolean));
                if (userId) {
                    const userLiked = response.data.some(like => like.userId === userId);
                    setLiked(userLiked);
                }
            } catch (error) {
                console.error('Error fetching likes:', error);
            }
        };
        fetchLikes();
    }, [postId, userId]);

    const handleToggleLike = async () => {
        if (!userId) return;

        try {
            if (liked) {
                await api.delete(`/likes/${postId}/unlike`, { data: { userId } });
                setLikes(likes - 1);
                setLiked(false);
                setLikeUsers(prev => prev.filter(u => u.id !== userId));
            } else {
                await api.post(`/likes/${postId}/like`, { userId });
                setLikes(likes + 1);
                setLiked(true);
                setLikeUsers(prev => [...prev, { id: userId, username: user.username }]);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    return (
        <div className="like-wrapper">
            <button
                className={`like-button ${liked ? 'liked' : ''}`}
                onClick={handleToggleLike}
            >
                <span className="like-icon">{liked ? '❤️' : '🤍'}</span>
                <span className="like-count">{likes}</span>
            </button>
            {likeUsers.length > 0 && (
                <span className="like-users">
                    Curtido por {likeUsers.slice(0, 3).map(u => u.username).join(', ')}
                    {likeUsers.length > 3 && ` e mais ${likeUsers.length - 3}`}
                </span>
            )}
        </div>
    );
};

export default LikeButton;