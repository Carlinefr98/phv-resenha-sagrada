import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import './Museum.css';

const Museum = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', date: '', videoUrl: '' });
    const [image, setImage] = useState(null);
    const [audio, setAudio] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [adminMode, setAdminMode] = useState(false);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/museum');
            setEvents(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchEvents(); }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('date', form.date);
            if (form.videoUrl.trim()) formData.append('videoUrl', form.videoUrl.trim());
            if (image) formData.append('image', image);
            if (audio) formData.append('audio', audio);
            await api.post('/museum', formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }
            });
            setForm({ title: '', description: '', date: '', videoUrl: '' });
            setImage(null);
            setAudio(null);
            setShowForm(false);
            fetchEvents();
        } catch (err) { console.error(err); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Deletar este momento do museu?')) return;
        try {
            await api.delete(`/museum/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
            fetchEvents();
        } catch (err) { console.error(err); }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    return (
        <div className="museum-page">
            <h1 className="museum-title"><span className="emoji">🏛️</span> Museu PHV</h1>
            <p className="museum-subtitle">A história do grupo, momentos que marcaram nossa caminhada.</p>

            {user && user.isAdmin && (
                <div className="museum-admin-area">
                    <button className="museum-admin-toggle" onClick={() => setAdminMode(!adminMode)}>
                        {adminMode ? '🔒 Sair do modo Admin' : '🔧 Modo Admin'}
                    </button>
                    {adminMode && (
                    <>
                    <button className="museum-add-btn" onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕ Cancelar' : '➕ Adicionar Momento'}
                    </button>
                    {showForm && (
                        <form className="museum-form" onSubmit={handleSubmit}>
                            <input type="text" placeholder="Título do momento" value={form.title}
                                onChange={e => setForm({...form, title: e.target.value})} required />
                            <textarea placeholder="Conte a história..." value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})} rows="4" required />
                            <input type="date" value={form.date}
                                onChange={e => setForm({...form, date: e.target.value})} required />
                            <div className="museum-file-input">
                                <input type="file" accept="image/*" id="museum-img" onChange={e => setImage(e.target.files[0])} />
                                <label htmlFor="museum-img">📷 {image ? image.name : 'Escolher foto'}</label>
                            </div>
                            <div className="museum-file-input">
                                <input type="file" accept="audio/*" id="museum-audio" onChange={e => setAudio(e.target.files[0])} />
                                <label htmlFor="museum-audio">🎵 {audio ? audio.name : 'Escolher áudio (opcional)'}</label>
                            </div>
                            <input type="url" placeholder="Link de vídeo (YouTube ou Google Drive, opcional)"
                                value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} />
                            <small style={{color: 'rgba(255,255,255,0.4)', display: 'block', marginTop: '-8px', marginBottom: '12px'}}>💡 YouTube ou Google Drive</small>
                            <button type="submit" disabled={submitting}>
                                {submitting ? 'Salvando...' : '🚀 Salvar Momento'}
                            </button>
                        </form>
                    )}
                    </>
                    )}
                </div>
            )}

            {loading ? (
                <div className="museum-loading">
                    <div className="loading-spinner"></div>
                    <p>Carregando história...</p>
                </div>
            ) : events.length === 0 ? (
                <div className="museum-empty">
                    <p>📜 Nenhum momento registrado ainda.</p>
                </div>
            ) : (
                <div className="timeline">
                    <div className="timeline-line"></div>
                    {events.map((event, index) => (
                        <div key={event.id} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
                            <div className="timeline-dot"></div>
                            <div className="timeline-card">
                                {user && user.isAdmin && adminMode && (
                                    <button className="timeline-delete-btn" onClick={() => handleDelete(event.id)}>🗑️</button>
                                )}
                                <span className="timeline-date">{formatDate(event.date)}</span>
                                <h3 className="timeline-card-title">{event.title}</h3>
                                <p className="timeline-card-desc">{event.description}</p>
                                {event.imageUrl && (
                                    <img src={getImageUrl(event.imageUrl)} alt={event.title} className="timeline-img" />
                                )}
                                {event.audioUrl && (
                                    <audio controls className="timeline-audio">
                                        <source src={getImageUrl(event.audioUrl)} />
                                    </audio>
                                )}
                                {event.videoUrl && getYoutubeId(event.videoUrl) && (
                                    <div className="timeline-video">
                                        <iframe
                                            width="100%" height="200"
                                            src={`https://www.youtube.com/embed/${getYoutubeId(event.videoUrl)}`}
                                            title={event.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                )}
                                {event.videoUrl && getDriveId(event.videoUrl) && !getYoutubeId(event.videoUrl) && (
                                    <div className="timeline-video">
                                        <iframe
                                            width="100%" height="200"
                                            src={`https://drive.google.com/file/d/${getDriveId(event.videoUrl)}/preview`}
                                            title={event.title}
                                            frameBorder="0"
                                            allow="autoplay; encrypted-media"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Museum;
