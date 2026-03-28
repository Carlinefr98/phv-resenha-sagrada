import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import './Profile.css';

const UserProfile = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [userBadges, setUserBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, badgesRes] = await Promise.all([
                    api.get(`/profile/${username}`),
                    api.get(`/badges/user/${username}`)
                ]);
                setProfile(profileRes.data);
                setUserBadges(badgesRes.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [username]);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${api.defaults.baseURL.replace('/api', '')}/${url}`;
    };

    const formatBirthday = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-loading"><div className="loading-spinner"></div></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-page">
                <h1 className="profile-title">👤 Perfil</h1>
                <p className="profile-login-msg">Usuário não encontrado.</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar-wrapper">
                    {profile.profilePhoto ? (
                        <img src={getImageUrl(profile.profilePhoto)} alt={username} className="profile-avatar-img" />
                    ) : (
                        <div className="profile-avatar">{username.charAt(0).toUpperCase()}</div>
                    )}
                </div>
                <h1 className="profile-username">{username}</h1>
                {profile.zodiac && (
                    <div className="profile-zodiac">
                        <span className="zodiac-emoji">{profile.zodiac.emoji}</span>
                        <span className="zodiac-name">{profile.zodiac.name}</span>
                    </div>
                )}
                {profile.birthday && (
                    <p className="profile-birthday">🎂 {formatBirthday(profile.birthday)}</p>
                )}
                {profile.bio && (
                    <p className="profile-bio">{profile.bio}</p>
                )}
            </div>

            {userBadges.length > 0 && (
                <>
                    <h2 className="badges-title"><span className="emoji">🏆</span> Badges</h2>
                    <div className="badges-grid">
                        {userBadges.map(badge => (
                            <div key={badge.id} className="badge-card earned">
                                <span className="badge-emoji">{badge.emoji}</span>
                                <h4 className="badge-name">{badge.name}</h4>
                                <p className="badge-desc">{badge.description}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default UserProfile;
