import React, { useEffect, useState } from 'react';
import api from '../api';
import './Museum.css';

const Museum = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/museum');
                setEvents(res.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchEvents();
    }, []);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    return (
        <div className="museum-page">
            <h1 className="museum-title">🏛️ Museu PHV</h1>
            <p className="museum-subtitle">A história do grupo, momentos que marcaram nossa caminhada.</p>

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
                                <span className="timeline-date">{formatDate(event.date)}</span>
                                <h3 className="timeline-card-title">{event.title}</h3>
                                <p className="timeline-card-desc">{event.description}</p>
                                {event.imageUrl && (
                                    <img src={event.imageUrl} alt={event.title} className="timeline-img" />
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
