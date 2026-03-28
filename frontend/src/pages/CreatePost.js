import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import api from '../api';
import './CreatePost.css';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [audio, setAudio] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const history = useHistory();

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleImageChange = (e) => {
        setImages([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('author', user.username || 'Anônimo');
        if (videoUrl.trim()) formData.append('videoUrl', videoUrl.trim());
        images.forEach((image) => {
            formData.append('images', image);
        });
        if (audio) formData.append('audio', audio);

        try {
            await api.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            history.push('/');
        } catch (error) {
            console.error('Error creating post:', error);
            setError('Erro ao criar postagem. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-post">
            <div className="create-post-card">
                <h2>✝ Nova Resenha 🍷</h2>
                {error && <p className="create-post-error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="O que rolou?"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Descrição</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Conta a resenha toda..."
                            rows="5"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Imagens (opcional)</label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                id="image-upload"
                            />
                            <label htmlFor="image-upload" className="file-input-label">
                                📷 {images.length > 0 ? `${images.length} foto(s) selecionada(s)` : 'Escolher fotos'}
                            </label>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Áudio (opcional)</label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => setAudio(e.target.files[0] || null)}
                                id="audio-upload"
                            />
                            <label htmlFor="audio-upload" className="file-input-label">
                                🎵 {audio ? audio.name : 'Escolher áudio'}
                            </label>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Vídeo (opcional — link do Google Drive ou YouTube)</label>
                        <input
                            type="url"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="https://drive.google.com/file/d/... ou YouTube"
                        />
                        <small className="form-hint">💡 No Drive: botão direito → Compartilhar → Qualquer pessoa com o link</small>
                    </div>
                    <button type="submit" className="create-post-btn" disabled={loading}>
                        {loading ? 'Postando...' : '🚀 Postar Resenha'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;