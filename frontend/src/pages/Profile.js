import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import './Profile.css';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [userBadges, setUserBadges] = useState([]);
    const [allBadges, setAllBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [bio, setBio] = useState('');
    const [birthday, setBirthday] = useState('');
    const [photo, setPhoto] = useState(null);
    const [saving, setSaving] = useState(false);
    const [changingPw, setChangingPw] = useState(false);
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [pwMsg, setPwMsg] = useState('');
    const [pwError, setPwError] = useState('');

    const fetchData = async () => {
        if (!user || !user.username) { setLoading(false); return; }
        try {
            const [profileRes, badgesRes, userBadgesRes] = await Promise.all([
                api.get(`/profile/${user.username}`),
                api.get('/badges'),
                api.get(`/badges/user/${user.username}`)
            ]);
            setProfile(profileRes.data);
            setBio(profileRes.data.bio || '');
            setBirthday(profileRes.data.birthday || '');
            setAllBadges(badgesRes.data);
            setUserBadges(userBadgesRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [user]);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${api.defaults.baseURL.replace('/api', '')}/${url}`;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('bio', bio);
            if (birthday) formData.append('birthday', birthday);
            if (photo) formData.append('profilePhoto', photo);
            await api.put('/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }
            });
            setEditing(false);
            setPhoto(null);
            setLoading(true);
            fetchData();
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const hasBadge = (badgeId) => userBadges.some(b => b.id === badgeId);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwMsg(''); setPwError('');
        try {
            await api.put('/auth/change-password', { currentPassword: currentPw, newPassword: newPw }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setPwMsg('Senha alterada com sucesso!');
            setCurrentPw(''); setNewPw(''); setChangingPw(false);
        } catch (e) {
            setPwError(e.response?.data?.message || 'Erro ao alterar senha');
        }
    };

    const formatBirthday = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
    };

    if (!user || !user.username) {
        return (
            <div className="profile-page">
                <h1 className="profile-title">👤 Perfil</h1>
                <p className="profile-login-msg">Faça login para ver seu perfil.</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {loading ? (
                <div className="profile-loading"><div className="loading-spinner"></div></div>
            ) : (
                <>
                    <div className="profile-header">
                        <div className="profile-avatar-wrapper">
                            {profile && profile.profilePhoto ? (
                                <img src={getImageUrl(profile.profilePhoto)} alt={user.username} className="profile-avatar-img" />
                            ) : (
                                <div className="profile-avatar">{user.username.charAt(0).toUpperCase()}</div>
                            )}
                        </div>
                        <h1 className="profile-username">{user.username}</h1>
                        {profile && profile.zodiac && (
                            <div className="profile-zodiac">
                                <span className="zodiac-emoji">{profile.zodiac.emoji}</span>
                                <span className="zodiac-name">{profile.zodiac.name}</span>
                            </div>
                        )}
                        {profile && profile.birthday && (
                            <p className="profile-birthday">🎂 {formatBirthday(profile.birthday)}</p>
                        )}
                        {profile && profile.bio && !editing && (
                            <p className="profile-bio">{profile.bio}</p>
                        )}
                        <button className="profile-edit-btn" onClick={() => setEditing(!editing)}>
                            {editing ? '✕ Cancelar' : '✏️ Editar Perfil'}
                        </button>
                    </div>

                    {editing && (
                        <form className="profile-edit-form" onSubmit={handleSave}>
                            <div className="profile-form-group">
                                <label>Foto de perfil</label>
                                <div className="profile-file-input">
                                    <input type="file" accept="image/*" id="profile-photo" onChange={e => setPhoto(e.target.files[0])} />
                                    <label htmlFor="profile-photo">📷 {photo ? photo.name : 'Escolher foto'}</label>
                                </div>
                            </div>
                            <div className="profile-form-group">
                                <label>Bio</label>
                                <textarea value={bio} onChange={e => setBio(e.target.value)}
                                    placeholder="Fale um pouco sobre você..." rows="3" />
                            </div>
                            <div className="profile-form-group">
                                <label>Data de nascimento</label>
                                <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} />
                            </div>
                            <button type="submit" className="profile-save-btn" disabled={saving}>
                                {saving ? 'Salvando...' : '💾 Salvar'}
                            </button>
                        </form>
                    )}

                    <div className="profile-password-section">
                        <button className="profile-edit-btn" onClick={() => { setChangingPw(!changingPw); setPwMsg(''); setPwError(''); }}>
                            {changingPw ? '✕ Cancelar' : '🔑 Trocar Senha'}
                        </button>
                        {pwMsg && <p className="pw-success">{pwMsg}</p>}
                        {pwError && <p className="pw-error">{pwError}</p>}
                        {changingPw && (
                            <form className="profile-edit-form" onSubmit={handleChangePassword}>
                                <div className="profile-form-group">
                                    <label>Senha atual</label>
                                    <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
                                </div>
                                <div className="profile-form-group">
                                    <label>Nova senha</label>
                                    <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required />
                                </div>
                                <button type="submit" className="profile-save-btn">💾 Alterar Senha</button>
                            </form>
                        )}
                    </div>

                    <h2 className="badges-title">🏆 Badges</h2>
                    <div className="badges-grid">
                        {allBadges.map(badge => (
                            <div key={badge.id} className={`badge-card ${hasBadge(badge.id) ? 'earned' : 'locked'}`}>
                                <span className="badge-emoji">{badge.emoji}</span>
                                <h4 className="badge-name">{badge.name}</h4>
                                <p className="badge-desc">{badge.description}</p>
                                {!hasBadge(badge.id) && <div className="badge-lock">🔒</div>}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Profile;
