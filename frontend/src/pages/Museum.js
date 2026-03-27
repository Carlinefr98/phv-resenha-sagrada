import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import './Museum.css';

const Museum = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', date: '' });
    const [image, setImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('date', form.date);
            if (image) formData.append('image', image);
            await api.post('/museum', formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }
            });
            setForm({ title: '', description: '', date: '' });
            setImage(null);
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
            <h1 className="museum-title">🏛️ Museu PHV</h1>
            <p className="museum-subtitle">A história do grupo, momentos que marcaram nossa caminhada.</p>

            {user && user.isAdmin && (
                <div className="museum-admin-area">
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
                            <button type="submit" disabled={submitting}>
                                {submitting ? 'Salvando...' : '🚀 Salvar Momento'}
                            </button>
                        </form>
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
                                {user && user.isAdmin && (
                                    <button className="timeline-delete-btn" onClick={() => handleDelete(event.id)}>🗑️</button>
                                )}
                                <span className="timeline-date">{formatDate(event.date)}</span>
                                <h3 className="timeline-card-title">{event.title}</h3>
                                <p className="timeline-card-desc">{event.description}</p>
                                {event.imageUrl && (
                                    <img src={getImageUrl(event.imageUrl)} alt={event.title} className="timeline-img" />
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
