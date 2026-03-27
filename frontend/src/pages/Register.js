import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './Register.css';
import api from '../api';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/auth/register', { username, password });
            history.push('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao registrar. Tente novamente.');
        }
    };

    return (
        <div className="register-container">
            <h2>&#9997;&#65039; Criar Conta</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nome de Usuário:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Escolha seu nome..."
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
                <button type="submit">Registrar</button>
            </form>
        </div>
    );
};

export default Register;