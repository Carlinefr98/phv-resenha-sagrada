import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './CommentSection.css';

const CommentSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${api.defaults.baseURL.replace('/api', '')}/${url}`;
    };

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await api.get(`/comments/${postId}`);
                setComments(response.data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };
        fetchComments();
    }, [postId]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user.token) return;
        setLoading(true);

        try {
            const response = await api.post(`/comments/${postId}`, {
                author: user.username || 'Anônimo',
                content: newComment
            }, { headers: { Authorization: `Bearer ${user.token}` } });
            const data = response.data;
            if (data.earnedBadge) {
                alert(`🏆 Badge conquistada: ${data.earnedBadge.emoji} ${data.earnedBadge.name}!\n${data.earnedBadge.description}`);
            }
            setComments([...comments, data]);
            setNewComment('');
        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="comment-section">
            <h3 className="comment-section-title">💬 Comentários ({comments.length})</h3>
            {user.token ? (
            <form onSubmit={handleCommentSubmit} className="comment-form">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Deixa teu comentário..."
                    className="comment-input"
                />
                <button type="submit" className="comment-btn" disabled={loading}>
                    {loading ? '...' : 'Enviar'}
                </button>
            </form>
            ) : (
            <p className="comment-login-msg">Faça login para comentar.</p>
            )}
            <ul className="comment-list">
                {comments.map((comment) => (
                    <li key={comment.id} className="comment-item">
                        {comment.User && comment.User.profilePhoto ? (
                            <img src={getImageUrl(comment.User.profilePhoto)} alt="" className="comment-avatar-img" />
                        ) : (
                            <span className="comment-avatar">{(comment.author || '?').charAt(0).toUpperCase()}</span>
                        )}
                        <div className="comment-body">
                            <Link to={`/perfil/${comment.author}`} className="comment-author-link">{comment.author}</Link>
                            <span className="comment-content">{comment.content}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CommentSection;