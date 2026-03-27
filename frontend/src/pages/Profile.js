import React, { useEffect, useState } from 'react';
import api from '../api';
import './Profile.css';

const Profile = () => {
    const [userBadges, setUserBadges] = useState([]);
    const [allBadges, setAllBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchData = async () => {
            if (!user.username) { setLoading(false); return; }
            try {
                const [badgesRes, userBadgesRes] = await Promise.all([
                    api.get('/badges'),
                    api.get(`/badges/user/${user.username}`)
                ]);
                setAllBadges(badgesRes.data);
                setUserBadges(userBadgesRes.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [user.username]);

    const hasBadge = (badgeId) => userBadges.some(b => b.id === badgeId);

    if (!user.username) {
        return (
            <div className="profile-page">
                <h1 className="profile-title">👤 Perfil</h1>
                <p className="profile-login-msg">Faça login para ver seu perfil.</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar">{user.username.charAt(0).toUpperCase()}</div>
                <h1 className="profile-username">{user.username}</h1>
            </div>

            <h2 className="badges-title">🏆 Badges</h2>

            {loading ? (
                <div className="profile-loading"><div className="loading-spinner"></div></div>
            ) : (
                <div className="badges-grid">
                    {allBadges.map(badge => (
                        <div key={badge.id} className={`badge-card ${hasBadge(badge.id) ? 'earned' : 'locked'}`}>
                            <span className="badge-emoji">{badge.emoji}</span>
                            <h4 className="badge-name">{badge.name}</h4>
                            <p className="badge-desc">{badge.description}</p>
                            {!hasBadge(badge.id) && <div className="badge-lock">🔒</div>}
                        </div>
                    ))}
                    {allBadges.length === 0 && (
                        <p className="no-badges">Nenhuma badge disponível ainda.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;
