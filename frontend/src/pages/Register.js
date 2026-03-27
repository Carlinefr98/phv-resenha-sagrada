import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Register.css';
import api from '../api';

const Register = () => {
    const { user } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const history = useHistory();

    if (!user || !user.isAdmin) {
        return (
            <div className="register-container">
                <h2>🔒 Acesso Restrito</h2>
                <p className="error">Apenas administradores podem registrar novos usuários.</p>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('/auth/register', { username, password }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSuccess(`Usuário "${username}" criado com sucesso!`);
            setUsername('');
            setPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao registrar. Tente novamente.');
        }
    };

    return (
        <div className="register-container">
            <h2>&#9997;&#65039; Criar Novo Usuário</h2>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nome de Usuário:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Escolha o nome..."
                        required
                    />
                </div>
                <div>
                    <label>Senha:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Crie uma senha..."
                        required
                    />
                </div>
                <button type="submit">Registrar Usuário</button>
            </form>
        </div>
    );
};

export default Register;