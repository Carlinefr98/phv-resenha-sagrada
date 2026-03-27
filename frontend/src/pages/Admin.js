import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import './Admin.css';

const Admin = () => {
    const { user } = useContext(AuthContext);
    const history = useHistory();
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [tab, setTab] = useState('users');
    const [newUser, setNewUser] = useState({ username: '', password: '', isAdmin: false });
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!user || !user.isAdmin) {
            history.push('/');
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const token = user.token;
            const headers = { Authorization: `Bearer ${token}` };
            const [usersRes, postsRes] = await Promise.all([
                api.get('/admin/users', { headers }),
                api.get('/posts')
            ]);
            setUsers(usersRes.data);
            setPosts(postsRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const headers = { Authorization: `Bearer ${user.token}` };
            await api.post('/admin/users', newUser, { headers });
            setNewUser({ username: '', password: '', isAdmin: false });
            setMsg('Usuário criado!');
            fetchData();
            setTimeout(() => setMsg(''), 3000);
        } catch (e) {
            setMsg(e.response?.data?.error || 'Erro ao criar usuário');
        }
    };

    const handleDeleteUser = async (id, username) => {
        if (!window.confirm(`Deletar usuário "${username}"?`)) return;
        try {
            const headers = { Authorization: `Bearer ${user.token}` };
            await api.delete(`/admin/users/${id}`, { headers });
            setMsg('Usuário deletado!');
            fetchData();
            setTimeout(() => setMsg(''), 3000);
        } catch (e) {
            setMsg(e.response?.data?.error || 'Erro ao deletar');
        }
    };

    const handleDeletePost = async (id, title) => {
        if (!window.confirm(`Deletar post "${title}"?`)) return;
        try {
            const headers = { Authorization: `Bearer ${user.token}` };
            await api.delete(`/admin/posts/${id}`, { headers });
            setMsg('Post deletado!');
            fetchData();
            setTimeout(() => setMsg(''), 3000);
        } catch (e) {
            setMsg(e.response?.data?.error || 'Erro ao deletar');
        }
    };

    if (loading) return <div className="admin-page"><div className="loading-spinner"></div></div>;

    return (
        <div className="admin-page">
            <h1 className="admin-title">⚙️ Painel Admin</h1>

            {msg && <div className="admin-msg">{msg}</div>}

            <div className="admin-tabs">
                <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
                    👥 Usuários ({users.length})
                </button>
                <button className={`admin-tab ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>
                    📝 Posts ({posts.length})
                </button>
            </div>

            {tab === 'users' && (
                <div className="admin-section">
                    <form className="admin-create-form" onSubmit={handleCreateUser}>
                        <h3>Criar Usuário</h3>
                        <input
                            type="text" placeholder="Username" value={newUser.username}
                            onChange={e => setNewUser({...newUser, username: e.target.value})} required
                        />
                        <input
                            type="password" placeholder="Senha" value={newUser.password}
                            onChange={e => setNewUser({...newUser, password: e.target.value})} required
                        />
                        <label className="admin-checkbox">
                            <input type="checkbox" checked={newUser.isAdmin}
                                onChange={e => setNewUser({...newUser, isAdmin: e.target.checked})} />
                            Admin
                        </label>
                        <button type="submit">✅ Criar</button>
                    </form>

                    <div className="admin-list">
                        {users.map(u => (
                            <div key={u.id} className="admin-item">
                                <div className="admin-item-info">
                                    <span className="admin-item-name">{u.username}</span>
                                    {u.isAdmin && <span className="admin-badge">ADMIN</span>}
                                    <span className="admin-item-date">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <button className="admin-delete-btn" onClick={() => handleDeleteUser(u.id, u.username)}>
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'posts' && (
                <div className="admin-section">
                    <div className="admin-list">
                        {posts.map(p => (
                            <div key={p.id} className="admin-item">
                                <div className="admin-item-info">
                                    <span className="admin-item-name">{p.title}</span>
                                    <span className="admin-item-author">por {p.author}</span>
                                    <span className="admin-item-date">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <button className="admin-delete-btn" onClick={() => handleDeletePost(p.id, p.title)}>
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
