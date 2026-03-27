import React, { useEffect, useState } from 'react';
import api from '../api';
import PostCard from '../components/PostCard';
import Memories from '../components/Memories';
import './Feed.css';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get('/posts');
                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="feed">
            <div className="feed-header">
                <img src="/logo.png" alt="PHV" className="feed-logo" />
                <p className="feed-subtitle">
                    <span className="text-gold">JUNTOS NA </span>
                    <span className="text-teal">FÉ</span>
                    <span className="text-gold">. FIRMES NA </span>
                    <span className="text-red">FARRA</span>
                    <span className="text-gold">.</span>
                </p>
            </div>
            <div className="post-list">
                <Memories />
                {loading ? (
                    <div className="feed-loading">
                        <div className="loading-spinner"></div>
                        <p>Carregando resenhas...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="feed-empty">
                        <p>😔 Nenhuma resenha ainda. Crie a primeira!</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))
                )}
            </div>
        </div>
    );
};

export default Feed;