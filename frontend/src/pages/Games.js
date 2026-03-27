import React, { useRef, useEffect, useState, useCallback } from 'react';
import api from '../api';
import './Games.css';

const CELL_SIZE = 20;
const CANVAS_SIZE = 400;
const GRID_SIZE = CANVAS_SIZE / CELL_SIZE;
const INITIAL_SPEED = 150;

const Games = () => {
    const canvasRef = useRef(null);
    const [gameRunning, setGameRunning] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [ranking, setRanking] = useState([]);
    const gameState = useRef({
        snake: [{ x: 10, y: 10 }],
        food: { x: 15, y: 15 },
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        score: 0,
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchRanking = useCallback(async () => {
        try {
            const res = await api.get('/snake/ranking');
            setRanking(res.data);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchRanking(); }, [fetchRanking]);

    const spawnFood = useCallback(() => {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
        } while (gameState.current.snake.some(s => s.x === food.x && s.y === food.y));
        return food;
    }, []);

    const saveScore = useCallback(async (finalScore) => {
        if (!user.username || finalScore === 0) return;
        try {
            await api.post('/snake', { username: user.username, score: finalScore });
            fetchRanking();
        } catch (e) { console.error(e); }
    }, [user.username, fetchRanking]);

    const startGame = useCallback(() => {
        gameState.current = {
            snake: [{ x: 10, y: 10 }],
            food: spawnFood(),
            direction: { x: 1, y: 0 },
            nextDirection: { x: 1, y: 0 },
            score: 0,
        };
        setScore(0);
        setGameOver(false);
        setGameRunning(true);
    }, [spawnFood]);

    const draw = useCallback((ctx) => {
        const { snake, food } = gameState.current;
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Grid
        ctx.strokeStyle = 'rgba(241,164,22,0.08)';
        for (let i = 0; i < GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * CELL_SIZE);
            ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
            ctx.stroke();
        }

        // Snake
        snake.forEach((seg, i) => {
            const gradient = ctx.createLinearGradient(
                seg.x * CELL_SIZE, seg.y * CELL_SIZE,
                (seg.x + 1) * CELL_SIZE, (seg.y + 1) * CELL_SIZE
            );
            if (i === 0) {
                gradient.addColorStop(0, '#2095A2');
                gradient.addColorStop(1, '#F1A416');
            } else {
                gradient.addColorStop(0, '#F1A416');
                gradient.addColorStop(1, '#E73B43');
            }
            ctx.fillStyle = gradient;
            ctx.shadowColor = i === 0 ? '#2095A2' : '#F1A416';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.roundRect(seg.x * CELL_SIZE + 1, seg.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2, 4);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Food
        ctx.fillStyle = '#E73B43';
        ctx.shadowColor = '#E73B43';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Score on canvas
        ctx.fillStyle = '#F1A416';
        ctx.font = 'bold 14px "League Spartan", sans-serif';
        ctx.fillText(`Pontos: ${gameState.current.score}`, 10, 20);
    }, []);

    useEffect(() => {
        if (!gameRunning) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const gameLoop = setInterval(() => {
            const state = gameState.current;
            state.direction = state.nextDirection;
            const head = {
                x: state.snake[0].x + state.direction.x,
                y: state.snake[0].y + state.direction.y,
            };

            // Wall collision
            if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                clearInterval(gameLoop);
                setGameRunning(false);
                setGameOver(true);
                if (state.score > highScore) setHighScore(state.score);
                saveScore(state.score);
                return;
            }

            // Self collision
            if (state.snake.some(s => s.x === head.x && s.y === head.y)) {
                clearInterval(gameLoop);
                setGameRunning(false);
                setGameOver(true);
                if (state.score > highScore) setHighScore(state.score);
                saveScore(state.score);
                return;
            }

            state.snake.unshift(head);

            // Eat food
            if (head.x === state.food.x && head.y === state.food.y) {
                state.score += 10;
                setScore(state.score);
                state.food = spawnFood();
            } else {
                state.snake.pop();
            }

            draw(ctx);
        }, INITIAL_SPEED);

        draw(ctx);
        return () => clearInterval(gameLoop);
    }, [gameRunning, draw, spawnFood, highScore, saveScore]);

    useEffect(() => {
        const handleKey = (e) => {
            if (!gameRunning) return;
            const dir = gameState.current.direction;
            switch (e.key) {
                case 'ArrowUp': if (dir.y !== 1) gameState.current.nextDirection = { x: 0, y: -1 }; break;
                case 'ArrowDown': if (dir.y !== -1) gameState.current.nextDirection = { x: 0, y: 1 }; break;
                case 'ArrowLeft': if (dir.x !== 1) gameState.current.nextDirection = { x: -1, y: 0 }; break;
                case 'ArrowRight': if (dir.x !== -1) gameState.current.nextDirection = { x: 1, y: 0 }; break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameRunning]);

    // Touch controls
    const touchStart = useRef(null);
    const handleTouchStart = (e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const handleTouchEnd = (e) => {
        if (!touchStart.current || !gameRunning) return;
        const dx = e.changedTouches[0].clientX - touchStart.current.x;
        const dy = e.changedTouches[0].clientY - touchStart.current.y;
        const dir = gameState.current.direction;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 30 && dir.x !== -1) gameState.current.nextDirection = { x: 1, y: 0 };
            else if (dx < -30 && dir.x !== 1) gameState.current.nextDirection = { x: -1, y: 0 };
        } else {
            if (dy > 30 && dir.y !== -1) gameState.current.nextDirection = { x: 0, y: 1 };
            else if (dy < -30 && dir.y !== 1) gameState.current.nextDirection = { x: 0, y: -1 };
        }
    };

    const handleMobileDir = (dx, dy) => {
        if (!gameRunning) return;
        const dir = gameState.current.direction;
        if (dx === 1 && dir.x !== -1) gameState.current.nextDirection = { x: 1, y: 0 };
        if (dx === -1 && dir.x !== 1) gameState.current.nextDirection = { x: -1, y: 0 };
        if (dy === 1 && dir.y !== -1) gameState.current.nextDirection = { x: 0, y: 1 };
        if (dy === -1 && dir.y !== 1) gameState.current.nextDirection = { x: 0, y: -1 };
    };

    return (
        <div className="games-page">
            <h1 className="games-title">🎮 Jogos PHV</h1>

            <div className="snake-container">
                <h2 className="snake-title">🐍 Cobrinha PHV</h2>

                <div className="snake-scores">
                    <span className="snake-score">Pontos: <strong>{score}</strong></span>
                    <span className="snake-high">Recorde: <strong>{highScore}</strong></span>
                </div>

                <div className="snake-canvas-wrapper"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        className="snake-canvas"
                    />
                    {!gameRunning && (
                        <div className="snake-overlay">
                            {gameOver ? (
                                <>
                                    <p className="snake-game-over">Game Over!</p>
                                    <p className="snake-final-score">Pontuação: {score}</p>
                                </>
                            ) : (
                                <p className="snake-start-text">🐍 Cobrinha PHV</p>
                            )}
                            <button className="snake-start-btn" onClick={startGame}>
                                {gameOver ? 'Jogar Novamente' : 'Iniciar Jogo'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="snake-mobile-controls">
                    <button onClick={() => handleMobileDir(0, -1)}>▲</button>
                    <div>
                        <button onClick={() => handleMobileDir(-1, 0)}>◄</button>
                        <button onClick={() => handleMobileDir(1, 0)}>►</button>
                    </div>
                    <button onClick={() => handleMobileDir(0, 1)}>▼</button>
                </div>
            </div>

            <div className="snake-ranking">
                <h3>🏆 Ranking</h3>
                {ranking.length === 0 ? (
                    <p className="ranking-empty">Nenhuma pontuação ainda. Seja o primeiro!</p>
                ) : (
                    <table>
                        <thead>
                            <tr><th>#</th><th>Jogador</th><th>Pontos</th></tr>
                        </thead>
                        <tbody>
                            {ranking.map((r, i) => (
                                <tr key={r.id} className={i < 3 ? `top-${i + 1}` : ''}>
                                    <td>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                                    <td>{r.username}</td>
                                    <td>{r.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Games;
