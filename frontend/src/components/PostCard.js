import React from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './PostCard.css';

const PostCard = ({ post }) => {
    const firstImage = post.Images && post.Images.length > 0 ? post.Images[0].url : null;
    const imageCount = post.Images ? post.Images.length : 0;

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

    const ytId = getYoutubeId(post.videoUrl);
    const hasVideo = !!post.videoUrl;

    return (
        <div className="post-card">
            <Link to={`/post/${post.id}`} className="post-card-link">
                {firstImage && (
                    <div className="post-card-image-wrapper">
                        <img src={getImageUrl(firstImage)} alt={post.title} className="post-card-image" />
                        {imageCount > 1 && (
                            <span className="post-card-image-count">📷 {imageCount} fotos</span>
                        )}
                        {hasVideo && <span className="post-card-video-badge">▶️</span>}
                    </div>
                )}
                {!firstImage && ytId && (
                    <div className="post-card-image-wrapper">
                        <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={post.title} className="post-card-image" />
                        <span className="post-card-image-count">▶️ Vídeo</span>
                    </div>
                )}
                {!firstImage && hasVideo && !ytId && (
                    <div className="post-card-image-wrapper post-card-video-placeholder">
                        <span className="post-card-play-icon">🎬</span>
                        <span className="post-card-image-count">▶️ Vídeo</span>
                    </div>
                )}
                <div className="post-card-body">
                    <h3 className="post-card-title">{post.title}</h3>
                    <p className="post-card-description">{post.description}</p>
                    <div className="post-card-meta">
                        <span className="post-card-author">✌️ {post.author}</span>
                        <span className="post-card-date">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default PostCard;