import React, { useState, useEffect } from 'react';
import api from '../api';
import './CommentSection.css';

const CommentSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

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
            setComments([...comments, response.data]);
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
                        <span className="comment-author">{comment.author}</span>
                        <span className="comment-content">{comment.content}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CommentSection;