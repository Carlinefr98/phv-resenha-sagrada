import React, { useEffect, useState } from 'react';
import api from '../api';
import './Events.css';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/events', { name, description, date, createdBy: user.username || 'Anônimo' });
            setName(''); setDescription(''); setDate(''); setShowForm(false);
            fetchEvents();
        } catch (err) { console.error(err); }
    };

    const handleParticipate = async (eventId) => {
        if (!user.username) return alert('Faça login para confirmar presença!');
        try {
            await api.post(`/events/${eventId}/participate`, { username: user.username });
            fetchEvents();
        } catch (err) {
            if (err.response?.status === 400) alert('Você já confirmou presença!');
        }
    };

    const handleCancel = async (eventId) => {
        try {
            await api.delete(`/events/${eventId}/participate`, { data: { username: user.username } });
            fetchEvents();
        } catch (err) { console.error(err); }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const isParticipating = (event) => {
        return event.EventParticipants?.some(p => p.username === user.username);
    };

    const isPast = (dateStr) => new Date(dateStr) < new Date(new Date().toDateString());

    return (
        <div className="events-page">
            <h1 className="events-title"><span className="emoji">📅</span> Eventos PHV</h1>

            {user.username && (
                <div className="events-create-area">
                    <button className="events-toggle-btn" onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕ Cancelar' : '+ Criar Evento'}
                    </button>
                    {showForm && (
                        <form className="events-form" onSubmit={handleCreate}>
                            <input type="text" placeholder="Nome do evento" value={name} onChange={e => setName(e.target.value)} required />
                            <textarea placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} rows="3" />
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                            <button type="submit" className="events-submit-btn">Criar Evento</button>
                        </form>
                    )}
                </div>
            )}

            {loading ? (
                <div className="events-loading"><div className="loading-spinner"></div><p>Carregando eventos...</p></div>
            ) : events.length === 0 ? (
                <div className="events-empty"><p>📅 Nenhum evento ainda. Crie o primeiro!</p></div>
            ) : (
                <div className="events-list">
                    {events.map(event => (
                        <div key={event.id} className={`event-card ${isPast(event.date) ? 'past' : ''}`}>
                            <div className="event-header">
                                <span className={`event-date-badge ${isPast(event.date) ? 'past' : 'upcoming'}`}>
                                    {formatDate(event.date)}
                                </span>
                                {isPast(event.date) && <span className="event-past-label">Encerrado</span>}
                            </div>
                            <h3 className="event-name">{event.name}</h3>
                            {event.description && <p className="event-desc">{event.description}</p>}
                            <div className="event-footer">
                                <span className="event-participants-count">
                                    👥 {event.EventParticipants?.length || 0} confirmados
                                </span>
                                {!isPast(event.date) && user.username && (
                                    isParticipating(event) ? (
                                        <button className="event-cancel-btn" onClick={() => handleCancel(event.id)}>
                                            Cancelar presença
                                        </button>
                                    ) : (
                                        <button className="event-join-btn" onClick={() => handleParticipate(event.id)}>
                                            ✅ Confirmar presença
                                        </button>
                                    )
                                )}
                            </div>
                            {event.EventParticipants?.length > 0 && (
                                <div className="event-participants-list">
                                    {event.EventParticipants.map(p => (
                                        <span key={p.id} className="participant-tag">{p.username}</span>
                                    ))}
                                </div>
                            )}
                            <span className="event-creator">Criado por {event.createdBy}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Events;
