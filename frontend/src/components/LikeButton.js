import React, { useState, useEffect } from 'react';
import api from '../api';
import './LikeButton.css';

const LikeButton = ({ postId }) => {
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const response = await api.get(`/likes/${postId}/likes`);
                setLikes(response.data.length);
                if (user.userId) {
                    const userLiked = response.data.some(like => like.userId === user.userId);
                    setLiked(userLiked);
                }
            } catch (error) {
                console.error('Error fetching likes:', error);
            }
        };
        fetchLikes();
    }, [postId, user.userId]);

    const handleToggleLike = async () => {
        if (!user.userId) return;

        try {
            if (liked) {
                await api.delete(`/likes/${postId}/unlike`, { data: { userId: user.userId } });
                setLikes(likes - 1);
                setLiked(false);
            } else {
                await api.post(`/likes/${postId}/like`, { userId: user.userId });
                setLikes(likes + 1);
                setLiked(true);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    return (
        <button
            className={`like-button ${liked ? 'liked' : ''}`}
            onClick={handleToggleLike}
        >
            <span className="like-icon">{liked ? '❤️' : '🤍'}</span>
            <span className="like-count">{likes}</span>
        </button>
    );
};

export default LikeButton;