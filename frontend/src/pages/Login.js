import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './Login.css';
import { loginUser } from '../api/index';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser({ username, password });
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify({ userId: response.userId, username: response.username }));
                history.push('/');
            } else {
                setError('Login falhou. Verifique suas credenciais.');
            }
        } catch (err) {
            setError('Erro ao fazer login. Tente novamente.');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Usuário:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Senha:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Entrar</button>
            </form>
            <p>Ainda não tem uma conta? <a href="/register">Registre-se</a></p>
        </div>
    );
};

export default Login;