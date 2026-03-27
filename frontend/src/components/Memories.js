import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Memories.css';

const Memories = () => {
    const [memories, setMemories] = useState([]);

    useEffect(() => {
        const fetchMemories = async () => {
            try {
                const res = await api.get('/memories');
                setMemories(res.data);
            } catch (e) { console.error(e); }
        };
        fetchMemories();
    }, []);

    if (memories.length === 0) return null;

    const getYearsAgo = (dateStr) => {
        const postYear = new Date(dateStr).getFullYear();
        const currentYear = new Date().getFullYear();
        const diff = currentYear - postYear;
        return diff === 1 ? 'Há 1 ano atrás...' : `Há ${diff} anos atrás...`;
    };

    return (
        <div className="memories-section">
            <h2 className="memories-title">💭 Lembranças</h2>
            <div className="memories-list">
                {memories.map(memory => (
                    <Link to={`/post/${memory.id}`} key={memory.id} className="memory-card">
                        <span className="memory-ago">{getYearsAgo(memory.createdAt)}</span>
                        {memory.Images && memory.Images.length > 0 && (
                            <img
                                src={memory.Images[0].url.startsWith('http') ? memory.Images[0].url : `${api.defaults.baseURL.replace('/api', '')}/${memory.Images[0].url}`}
                                alt={memory.title}
                                className="memory-img"
                            />
                        )}
                        <h4 className="memory-card-title">{memory.title}</h4>
                        <p className="memory-card-author">por {memory.author}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Memories;
