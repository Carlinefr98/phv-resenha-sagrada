import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Carousel from '../components/Carousel';
import CommentSection from '../components/CommentSection';
import LikeButton from '../components/LikeButton';
import './PostDetail.css';

const PostDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/posts/${id}`);
                setPost(response.data);
            } catch (error) {
                console.error('Error fetching post:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div className="post-detail-loading">
                <div className="loading-spinner"></div>
                <p>Carregando...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="post-detail-empty">
                <p>😕 Post não encontrado.</p>
            </div>
        );
    }

    return (
        <div className="post-detail">
            <div className="post-detail-card">
                <div className="post-detail-header">
                    <h1 className="post-detail-title">{post.title}</h1>
                    <div className="post-detail-meta">
                        <span className="post-detail-author">✌️ {post.author}</span>
                        <span className="post-detail-date">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
                {post.Images && post.Images.length > 0 && (
                    <Carousel images={post.Images} />
                )}
                <div className="post-detail-body">
                    <p className="post-detail-description">{post.description}</p>
                </div>
                <div className="post-detail-actions">
                    <LikeButton postId={post.id} />
                </div>
                <CommentSection postId={post.id} />
            </div>
        </div>
    );
};

export default PostDetail;