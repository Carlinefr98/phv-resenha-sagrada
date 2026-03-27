import React from 'react';
import { Link } from 'react-router-dom';
import './PostCard.css';

const PostCard = ({ post }) => {
    const firstImage = post.Images && post.Images.length > 0 ? post.Images[0].url : null;
    const imageCount = post.Images ? post.Images.length : 0;

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:5000/${url}`;
    };

    return (
        <div className="post-card">
            <Link to={`/post/${post.id}`} className="post-card-link">
                {firstImage && (
                    <div className="post-card-image-wrapper">
                        <img src={getImageUrl(firstImage)} alt={post.title} className="post-card-image" />
                        {imageCount > 1 && (
                            <span className="post-card-image-count">📷 {imageCount} fotos</span>
                        )}
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