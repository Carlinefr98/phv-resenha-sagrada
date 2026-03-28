import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${api.defaults.baseURL.replace('/api', '')}/${url}`;
    };

    const getYoutubeId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
    };

    const getDriveId = (url) => {
        if (!url) return null;
        const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    };

    const ytId = getYoutubeId(post.videoUrl);
    const driveId = getDriveId(post.videoUrl);

    return (
        <div className="post-detail">
            <div className="post-detail-card">
                <div className="post-detail-header">
                    <h1 className="post-detail-title">{post.title}</h1>
                    <div className="post-detail-meta">
                        <Link to={`/perfil/${post.author}`} className="post-detail-author">✌️ {post.author}</Link>
                        <span className="post-detail-date">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
                {post.Images && post.Images.length > 0 && (
                    <Carousel images={post.Images} />
                )}
                {ytId && (
                    <div className="post-detail-video">
                        <iframe
                            width="100%" height="400"
                            src={`https://www.youtube.com/embed/${ytId}`}
                            title={post.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}
                {driveId && (
                    <div className="post-detail-video">
                        <iframe
                            width="100%" height="400"
                            src={`https://drive.google.com/file/d/${driveId}/preview`}
                            title={post.title}
                            frameBorder="0"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}
                {post.videoUrl && !ytId && !driveId && (
                    <div className="post-detail-video">
                        <video width="100%" controls>
                            <source src={post.videoUrl} />
                            Seu navegador não suporta vídeo.
                        </video>
                    </div>
                )}
                {post.audioUrl && (
                    <div className="post-detail-audio">
                        <p className="post-detail-audio-label">🎵 Áudio</p>
                        <audio controls style={{ width: '100%' }}>
                            <source src={getImageUrl(post.audioUrl)} />
                            Seu navegador não suporta áudio.
                        </audio>
                    </div>
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