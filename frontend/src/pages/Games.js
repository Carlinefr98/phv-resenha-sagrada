import React, { useRef, useEffect, useState, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import './Games.css';

// ==================== SNAKE ====================
const CELL_SIZE = 20;
const CANVAS_SIZE = 400;
const GRID_SIZE = CANVAS_SIZE / CELL_SIZE;
const INITIAL_SPEED = 150;

const SnakeGame = () => {
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
        try { const res = await api.get('/snake/ranking'); setRanking(res.data); } catch (e) { console.error(e); }
    }, []);
    useEffect(() => { fetchRanking(); }, [fetchRanking]);

    const spawnFood = useCallback(() => {
        let food;
        do { food = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) }; }
        while (gameState.current.snake.some(s => s.x === food.x && s.y === food.y));
        return food;
    }, []);

    const saveScore = useCallback(async (finalScore) => {
        if (!user.username || finalScore === 0) return;
        try { await api.post('/snake', { username: user.username, score: finalScore }); fetchRanking(); } catch (e) { console.error(e); }
    }, [user.username, fetchRanking]);

    const startGame = useCallback(() => {
        gameState.current = { snake: [{ x: 10, y: 10 }], food: spawnFood(), direction: { x: 1, y: 0 }, nextDirection: { x: 1, y: 0 }, score: 0 };
        setScore(0); setGameOver(false); setGameRunning(true);
    }, [spawnFood]);

    const draw = useCallback((ctx) => {
        const { snake, food } = gameState.current;
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.strokeStyle = 'rgba(241,164,22,0.08)';
        for (let i = 0; i < GRID_SIZE; i++) {
            ctx.beginPath(); ctx.moveTo(i * CELL_SIZE, 0); ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i * CELL_SIZE); ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE); ctx.stroke();
        }
        snake.forEach((seg, i) => {
            const g = ctx.createLinearGradient(seg.x * CELL_SIZE, seg.y * CELL_SIZE, (seg.x + 1) * CELL_SIZE, (seg.y + 1) * CELL_SIZE);
            if (i === 0) { g.addColorStop(0, '#2095A2'); g.addColorStop(1, '#F1A416'); }
            else { g.addColorStop(0, '#F1A416'); g.addColorStop(1, '#E73B43'); }
            ctx.fillStyle = g; ctx.shadowColor = i === 0 ? '#2095A2' : '#F1A416'; ctx.shadowBlur = 6;
            ctx.beginPath(); ctx.roundRect(seg.x * CELL_SIZE + 1, seg.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2, 4); ctx.fill();
            ctx.shadowBlur = 0;
        });
        ctx.fillStyle = '#E73B43'; ctx.shadowColor = '#E73B43'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#F1A416'; ctx.font = 'bold 14px "League Spartan", sans-serif'; ctx.fillText(`Pontos: ${gameState.current.score}`, 10, 20);
    }, []);

    useEffect(() => {
        if (!gameRunning) return;
        const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
        const gameLoop = setInterval(() => {
            const state = gameState.current; state.direction = state.nextDirection;
            const head = { x: state.snake[0].x + state.direction.x, y: state.snake[0].y + state.direction.y };
            if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE ||
                state.snake.some(s => s.x === head.x && s.y === head.y)) {
                clearInterval(gameLoop); setGameRunning(false); setGameOver(true);
                if (state.score > highScore) setHighScore(state.score); saveScore(state.score); return;
            }
            state.snake.unshift(head);
            if (head.x === state.food.x && head.y === state.food.y) { state.score += 10; setScore(state.score); state.food = spawnFood(); }
            else { state.snake.pop(); }
            draw(ctx);
        }, INITIAL_SPEED);
        draw(ctx); return () => clearInterval(gameLoop);
    }, [gameRunning, draw, spawnFood, highScore, saveScore]);

    useEffect(() => {
        const handleKey = (e) => {
            if (!gameRunning) return; const dir = gameState.current.direction;
            switch (e.key) {
                case 'ArrowUp': if (dir.y !== 1) gameState.current.nextDirection = { x: 0, y: -1 }; break;
                case 'ArrowDown': if (dir.y !== -1) gameState.current.nextDirection = { x: 0, y: 1 }; break;
                case 'ArrowLeft': if (dir.x !== 1) gameState.current.nextDirection = { x: -1, y: 0 }; break;
                case 'ArrowRight': if (dir.x !== -1) gameState.current.nextDirection = { x: 1, y: 0 }; break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey);
    }, [gameRunning]);

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
        if (!gameRunning) return; const dir = gameState.current.direction;
        if (dx === 1 && dir.x !== -1) gameState.current.nextDirection = { x: 1, y: 0 };
        if (dx === -1 && dir.x !== 1) gameState.current.nextDirection = { x: -1, y: 0 };
        if (dy === 1 && dir.y !== -1) gameState.current.nextDirection = { x: 0, y: 1 };
        if (dy === -1 && dir.y !== 1) gameState.current.nextDirection = { x: 0, y: -1 };
    };

    return (
        <div className="game-section">
            <h2 className="game-section-title">🐍 Cobrinha PHV</h2>
            <div className="snake-scores">
                <span className="snake-score">Pontos: <strong>{score}</strong></span>
                <span className="snake-high">Recorde: <strong>{highScore}</strong></span>
            </div>
            <div className="snake-canvas-wrapper" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="snake-canvas" />
                {!gameRunning && (
                    <div className="snake-overlay">
                        {gameOver ? (<><p className="snake-game-over">Game Over!</p><p className="snake-final-score">Pontuação: {score}</p></>) :
                            (<p className="snake-start-text">🐍 Cobrinha PHV</p>)}
                        <button className="snake-start-btn" onClick={startGame}>{gameOver ? 'Jogar Novamente' : 'Iniciar Jogo'}</button>
                    </div>
                )}
            </div>
            <div className="snake-mobile-controls">
                <button onClick={() => handleMobileDir(0, -1)}>▲</button>
                <div><button onClick={() => handleMobileDir(-1, 0)}>◄</button><button onClick={() => handleMobileDir(1, 0)}>►</button></div>
                <button onClick={() => handleMobileDir(0, 1)}>▼</button>
            </div>
            <div className="snake-ranking">
                <h3>🏆 Ranking</h3>
                {ranking.length === 0 ? <p className="ranking-empty">Nenhuma pontuação ainda.</p> : (
                    <table><thead><tr><th>#</th><th>Jogador</th><th>Pontos</th></tr></thead>
                        <tbody>{ranking.map((r, i) => (
                            <tr key={r.id} className={i < 3 ? `top-${i + 1}` : ''}><td>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td><td>{r.username}</td><td>{r.score}</td></tr>
                        ))}</tbody></table>
                )}
            </div>
        </div>
    );
};

// ==================== DANNY EXCUSE GENERATOR ====================
const desculpas = [
    "Gente, não vai dar... meu cachorro comeu minha carteira e eu tô sem dinheiro pro Uber 😭",
    "Ai, eu ia, juro! Mas minha mãe ligou e tá precisando de mim urgente 🙏",
    "Tô com uma dor de cabeça absurda, acho que peguei uma gripe 🤧",
    "Meu despertador não tocou e eu acabei de acordar agora... já era 😴",
    "Gente, o trânsito tá impossível, não vou conseguir chegar a tempo 🚗",
    "Tô com um trabalho pra entregar amanhã e nem comecei 📚",
    "Meu celular morreu e eu nem vi as mensagens, desculpa! 📱",
    "Acabou a luz aqui em casa, não consigo nem me arrumar 🕯️",
    "Tô passando mal, acho que foi algo que eu comi 🤢",
    "Minha roupa tá toda suja, não tenho nada pra vestir 👕",
    "O pneu do meu carro furou, tô esperando o guincho 🛞",
    "Minha avó chegou de surpresa, não posso sair agora 👵",
    "Esqueci que tinha dentista hoje, remarcaram pra esse horário 🦷",
    "Meu gato tá doente, preciso levar no veterinário 🐱",
    "Choveu muito e alagou tudo aqui, não consigo sair de casa 🌧️",
    "Tô sem grana até o dia do pagamento, semana que vem eu vou! 💸",
    "Meu irmão pegou meu carro sem avisar 😤",
    "Dormi de tarde e acordei agora, já perdi a hora total 😅",
    "Tô num compromisso de família que apareceu de última hora 👨‍👩‍👧",
    "Minha internet caiu e eu tava terminando um negócio importante 💻",
    "Tô com preguiça mas não posso falar isso... então tô doente 🤒",
    "Tive que ficar com meu sobrinho porque minha irmã saiu 👶",
    "Acho que tô com conjuntivite, melhor não sair hoje 👁️",
    "O Uber cancelou 3 vezes, desisti 😩",
    "Tô de castigo (sim, com essa idade) 🔒",
    "Descobri que tem uma maratona de série hoje e... prioridades 📺",
    "Meu banho demorou demais e agora já era 🚿",
    "Minha bike furou e é meu único transporte 🚲",
    "Tô esperando uma encomenda que chega hoje, não posso sair 📦",
    "Jurei pra mim mesma que ia economizar esse mês 🤑",
];

const DannyExcuses = () => {
    const [desculpa, setDesculpa] = useState(null);
    const [animating, setAnimating] = useState(false);

    const gerar = () => {
        setAnimating(true);
        setTimeout(() => {
            const random = desculpas[Math.floor(Math.random() * desculpas.length)];
            setDesculpa(random);
            setAnimating(false);
        }, 500);
    };

    return (
        <div className="game-section">
            <h2 className="game-section-title">🙈 Gerador de Desculpas da Danny</h2>
            <p className="game-desc">Precisa de uma desculpa pra não ir? A Danny te salva!</p>
            <div className="excuse-container">
                {desculpa && (
                    <div className={`excuse-bubble ${animating ? 'animating' : ''}`}>
                        <p>{desculpa}</p>
                    </div>
                )}
                <button className="excuse-btn" onClick={gerar} disabled={animating}>
                    {animating ? '🔄 Pensando...' : '🎲 Gerar Desculpa'}
                </button>
            </div>
        </div>
    );
};

// ==================== MOMENTO KSZEI ====================
const piadas = [
    "Por que o cemitério é o lugar mais popular? Porque tá todo mundo morrendo pra entrar! 💀",
    "Qual é o cúmulo da velocidade? Dar a volta no quarteirão e bater na própria bunda! 🏃",
    "Sabe qual é o wifi do cemitério? Rest in Peace, sem senha 📶",
    "Qual a diferença entre o elevador e meu humor? O elevador tem limite pra descer 📉",
    "Fui no médico e ele disse: 'Tenho duas notícias ruins pra você.' Eu: 'Qual a primeira?' Ele: 'Você tem 24h de vida.' Eu: 'E a segunda?' Ele: 'Eu esqueci de te ligar ontem.' ⏰",
    "Por que o esqueleto não briga com ninguém? Porque ele não tem estômago pra isso 💀",
    "Minha carteira é como minha vida social: vazia 👛",
    "Qual o animal mais antigo do mundo? A zebra, porque é em preto e branco 🦓",
    "Sabe por que eu gosto de humor negro? Porque ele nunca fica velho... tipo as crianças na África 🌍",
    "Qual é o cúmulo da confiança? Peidar na primeira consulta com o psicólogo 💨",
    "Meu futuro é tão brilhante que preciso de óculos escuros... pra não ver ele 😎",
    "Por que a Barbie nunca engravida? Porque o Ken vem em outra caixa 📦",
    "Qual o contrário de voltar? Não ir, igual a Danny 🙈",
    "Sabe o que é um pontinho marrom no canto da sala? Uma formiga tomando café ☕",
    "Por que o livro de matemática se suicidou? Porque tinha muitos problemas 📕",
    "Quem é o padroeiro dos preguiçosos? São Nunca 🛌",
    "Minha mãe falou: 'Você nasceu pra ser alguém na vida.' Acho que ela quis dizer figurante 🎬",
    "Qual a semelhança entre eu e um software? Os dois travam quando tem muita coisa acontecendo 💻",
    "Tenho medo de elevador. Tô tomando medidas pra evitar 📐",
    "Qual a piada mais curta do mundo? O salário 💰",
];

const MomentoKszei = () => {
    const [piada, setPiada] = useState(null);
    const [animating, setAnimating] = useState(false);

    const gerar = () => {
        setAnimating(true);
        setTimeout(() => {
            const random = piadas[Math.floor(Math.random() * piadas.length)];
            setPiada(random);
            setAnimating(false);
        }, 500);
    };

    return (
        <div className="game-section">
            <h2 className="game-section-title">😈 Momento Kszei</h2>
            <p className="game-desc">Humor negro pesado. Clique por sua conta e risco!</p>
            <div className="kszei-container">
                {piada && (
                    <div className={`kszei-bubble ${animating ? 'animating' : ''}`}>
                        <p>{piada}</p>
                    </div>
                )}
                <button className="kszei-btn" onClick={gerar} disabled={animating}>
                    {animating ? '💀 Buscando...' : '🔥 Momento Kszei'}
                </button>
            </div>
        </div>
    );
};

// ==================== SPACE INVADERS ====================
const SI_WIDTH = 400;
const SI_HEIGHT = 500;

const SpaceInvaders = ({ adminMode }) => {
    const canvasRef = useRef(null);
    const { user } = useContext(AuthContext);
    const [gameRunning, setGameRunning] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [bosses, setBosses] = useState([]);
    const [bossImages, setBossImages] = useState({});
    const [uploadingBoss, setUploadingBoss] = useState(null);
    const gameRef = useRef(null);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${api.defaults.baseURL.replace('/api', '')}/${url}`;
    };

    useEffect(() => {
        api.get('/games/bosses').then(res => {
            setBosses(res.data);
            const imgs = {};
            res.data.forEach(b => {
                if (b.imageUrl) {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.src = getImageUrl(b.imageUrl);
                    imgs[b.id] = img;
                }
            });
            setBossImages(imgs);
        }).catch(e => console.error(e));
    }, []);

    const handleBossUpload = async (bossId, file) => {
        const formData = new FormData();
        formData.append('image', file);
        setUploadingBoss(bossId);
        try {
            const res = await api.put(`/games/bosses/${bossId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }
            });
            setBosses(prev => prev.map(b => b.id === bossId ? res.data : b));
            if (res.data.imageUrl) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = getImageUrl(res.data.imageUrl);
                setBossImages(prev => ({ ...prev, [bossId]: img }));
            }
        } catch (e) { console.error(e); }
        setUploadingBoss(null);
    };

    const startGame = () => {
        setScore(0); setLevel(1); setGameOver(false); setGameRunning(true);
        const state = {
            player: { x: SI_WIDTH / 2 - 20, y: SI_HEIGHT - 50, w: 40, h: 30 },
            bullets: [],
            enemies: [],
            enemyBullets: [],
            boss: null,
            bossHp: 0,
            score: 0,
            level: 1,
            keys: {},
            lastEnemyShot: 0,
            lastBossShot: 0,
            spawnTimer: 0,
        };
        // Spawn initial enemies
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 6; col++) {
                state.enemies.push({ x: 50 + col * 55, y: 40 + row * 40, w: 35, h: 25, hp: 1, dir: 1 });
            }
        }
        gameRef.current = state;
    };

    useEffect(() => {
        if (!gameRunning) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const state = gameRef.current;

        const keyDown = (e) => { state.keys[e.key] = true; };
        const keyUp = (e) => { state.keys[e.key] = false; };
        window.addEventListener('keydown', keyDown);
        window.addEventListener('keyup', keyUp);

        let lastShot = 0;
        const loop = setInterval(() => {
            const now = Date.now();
            // Player movement
            if (state.keys['ArrowLeft'] && state.player.x > 0) state.player.x -= 5;
            if (state.keys['ArrowRight'] && state.player.x < SI_WIDTH - state.player.w) state.player.x += 5;
            if (state.keys[' '] && now - lastShot > 250) {
                state.bullets.push({ x: state.player.x + state.player.w / 2 - 2, y: state.player.y, w: 4, h: 10 });
                lastShot = now;
            }

            // Bullets movement
            state.bullets = state.bullets.filter(b => { b.y -= 7; return b.y > -10; });
            state.enemyBullets = state.enemyBullets.filter(b => { b.y += 4; return b.y < SI_HEIGHT + 10; });

            // Enemy movement
            let edgeHit = false;
            state.enemies.forEach(e => {
                e.x += e.dir * 1.5;
                if (e.x <= 0 || e.x + e.w >= SI_WIDTH) edgeHit = true;
            });
            if (edgeHit) state.enemies.forEach(e => { e.dir *= -1; e.y += 15; });

            // Enemy shooting
            if (state.enemies.length > 0 && now - state.lastEnemyShot > 1500) {
                const shooter = state.enemies[Math.floor(Math.random() * state.enemies.length)];
                state.enemyBullets.push({ x: shooter.x + shooter.w / 2, y: shooter.y + shooter.h, w: 3, h: 8 });
                state.lastEnemyShot = now;
            }

            // Boss logic
            if (state.boss) {
                state.boss.x += state.boss.dir * 2;
                if (state.boss.x <= 0 || state.boss.x + state.boss.w >= SI_WIDTH) state.boss.dir *= -1;
                if (now - state.lastBossShot > 800) {
                    state.enemyBullets.push({ x: state.boss.x + state.boss.w / 4, y: state.boss.y + state.boss.h, w: 4, h: 10 });
                    state.enemyBullets.push({ x: state.boss.x + state.boss.w * 3 / 4, y: state.boss.y + state.boss.h, w: 4, h: 10 });
                    state.lastBossShot = now;
                }
            }

            // Collision: bullets vs enemies
            state.bullets = state.bullets.filter(b => {
                for (let i = state.enemies.length - 1; i >= 0; i--) {
                    const e = state.enemies[i];
                    if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
                        e.hp--;
                        if (e.hp <= 0) { state.enemies.splice(i, 1); state.score += 10; setScore(state.score); }
                        return false;
                    }
                }
                if (state.boss && b.x < state.boss.x + state.boss.w && b.x + b.w > state.boss.x &&
                    b.y < state.boss.y + state.boss.h && b.y + b.h > state.boss.y) {
                    state.bossHp--;
                    if (state.bossHp <= 0) {
                        state.score += 100; setScore(state.score);
                        state.boss = null;
                        state.level++;
                        setLevel(state.level);
                        if (state.level > 3) {
                            clearInterval(loop); setGameRunning(false); setGameOver(true); return false;
                        }
                        // Spawn next wave
                        for (let row = 0; row < 3; row++) {
                            for (let col = 0; col < 6; col++) {
                                state.enemies.push({ x: 50 + col * 55, y: 40 + row * 40, w: 35, h: 25, hp: 1, dir: 1 });
                            }
                        }
                    }
                    return false;
                }
                return true;
            });

            // Collision: enemy bullets vs player
            for (const b of state.enemyBullets) {
                if (b.x < state.player.x + state.player.w && b.x + b.w > state.player.x &&
                    b.y < state.player.y + state.player.h && b.y + b.h > state.player.y) {
                    clearInterval(loop); setGameRunning(false); setGameOver(true);
                    window.removeEventListener('keydown', keyDown);
                    window.removeEventListener('keyup', keyUp);
                    return;
                }
            }

            // Enemy reaches player
            for (const e of state.enemies) {
                if (e.y + e.h >= state.player.y) {
                    clearInterval(loop); setGameRunning(false); setGameOver(true);
                    window.removeEventListener('keydown', keyDown);
                    window.removeEventListener('keyup', keyUp);
                    return;
                }
            }

            // Spawn boss when enemies cleared
            if (state.enemies.length === 0 && !state.boss) {
                const bossData = bosses[state.level - 1];
                state.boss = { x: SI_WIDTH / 2 - 40, y: 30, w: 80, h: 60, dir: 1 };
                state.bossHp = 15 + state.level * 5;
            }

            // Draw
            ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, SI_WIDTH, SI_HEIGHT);
            // Stars
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            for (let i = 0; i < 30; i++) {
                const sx = (i * 137 + 50) % SI_WIDTH;
                const sy = (i * 97 + 30 + now * 0.01) % SI_HEIGHT;
                ctx.fillRect(sx, sy, 1, 1);
            }

            // Player
            ctx.fillStyle = '#2095A2'; ctx.shadowColor = '#2095A2'; ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(state.player.x + state.player.w / 2, state.player.y);
            ctx.lineTo(state.player.x, state.player.y + state.player.h);
            ctx.lineTo(state.player.x + state.player.w, state.player.y + state.player.h);
            ctx.closePath(); ctx.fill();
            ctx.shadowBlur = 0;

            // Bullets
            ctx.fillStyle = '#F1A416';
            state.bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
            ctx.fillStyle = '#E73B43';
            state.enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

            // Enemies
            state.enemies.forEach(e => {
                ctx.fillStyle = '#E73B43'; ctx.shadowColor = '#E73B43'; ctx.shadowBlur = 4;
                ctx.fillRect(e.x, e.y, e.w, e.h);
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#F1A416';
                ctx.fillRect(e.x + 8, e.y + 8, 6, 6);
                ctx.fillRect(e.x + e.w - 14, e.y + 8, 6, 6);
            });

            // Boss
            if (state.boss) {
                const bossData = bosses[state.level - 1];
                const bossImg = bossData ? bossImages[bossData.id] : null;
                if (bossImg && bossImg.complete) {
                    ctx.drawImage(bossImg, state.boss.x, state.boss.y, state.boss.w, state.boss.h);
                } else {
                    ctx.fillStyle = '#F1A416'; ctx.shadowColor = '#F1A416'; ctx.shadowBlur = 10;
                    ctx.fillRect(state.boss.x, state.boss.y, state.boss.w, state.boss.h);
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = '#E73B43';
                    ctx.fillRect(state.boss.x + 15, state.boss.y + 15, 12, 12);
                    ctx.fillRect(state.boss.x + state.boss.w - 27, state.boss.y + 15, 12, 12);
                }
                // HP bar
                const hpMax = 15 + state.level * 5;
                const hpPct = state.bossHp / hpMax;
                ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(state.boss.x, state.boss.y - 12, state.boss.w, 6);
                ctx.fillStyle = hpPct > 0.5 ? '#2095A2' : hpPct > 0.25 ? '#F1A416' : '#E73B43';
                ctx.fillRect(state.boss.x, state.boss.y - 12, state.boss.w * hpPct, 6);
            }

            // HUD
            ctx.fillStyle = '#F1A416'; ctx.font = 'bold 14px "League Spartan", sans-serif';
            ctx.fillText(`Pontos: ${state.score}`, 10, 20);
            ctx.fillText(`Fase: ${state.level}/3`, SI_WIDTH - 80, 20);
        }, 1000 / 60);

        return () => { clearInterval(loop); window.removeEventListener('keydown', keyDown); window.removeEventListener('keyup', keyUp); };
    }, [gameRunning, bosses, bossImages]);

    // Mobile controls
    const moveLeft = () => { if (gameRef.current) gameRef.current.keys['ArrowLeft'] = true; setTimeout(() => { if (gameRef.current) gameRef.current.keys['ArrowLeft'] = false; }, 100); };
    const moveRight = () => { if (gameRef.current) gameRef.current.keys['ArrowRight'] = true; setTimeout(() => { if (gameRef.current) gameRef.current.keys['ArrowRight'] = false; }, 100); };
    const shoot = () => { if (gameRef.current) { gameRef.current.keys[' '] = true; setTimeout(() => { if (gameRef.current) gameRef.current.keys[' '] = false; }, 100); } };

    return (
        <div className="game-section">
            <h2 className="game-section-title">👾 Space Invaders PHV</h2>
            <p className="game-desc">Derrote 3 chefões para vencer! Use ← → para mover e ESPAÇO para atirar.</p>

            {user && user.isAdmin && adminMode && (
                <div className="boss-config">
                    <h4>⚙️ Configurar Chefões (Admin)</h4>
                    <div className="boss-config-grid">
                        {bosses.map(b => (
                            <div key={b.id} className="boss-config-item">
                                <span>{b.name}</span>
                                {uploadingBoss === b.id ? (
                                    <div className="boss-uploading">⏳ Enviando...</div>
                                ) : b.imageUrl ? <img src={getImageUrl(b.imageUrl)} alt={b.name} className="boss-preview" /> :
                                    <div className="boss-preview-empty">👾</div>}
                                <input type="file" accept="image/*" disabled={uploadingBoss === b.id} onChange={e => e.target.files[0] && handleBossUpload(b.id, e.target.files[0])} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="si-canvas-wrapper">
                <canvas ref={canvasRef} width={SI_WIDTH} height={SI_HEIGHT} className="si-canvas" />
                {!gameRunning && (
                    <div className="si-overlay">
                        {gameOver ? (
                            <>
                                <p className="snake-game-over">{level > 3 ? '🎉 Você Venceu!' : 'Game Over!'}</p>
                                <p className="snake-final-score">Pontuação: {score}</p>
                            </>
                        ) : <p className="snake-start-text">👾 Space Invaders</p>}
                        <button className="snake-start-btn" onClick={startGame}>{gameOver ? 'Jogar Novamente' : 'Iniciar Jogo'}</button>
                    </div>
                )}
            </div>
            <div className="si-mobile-controls">
                <button onTouchStart={moveLeft} onClick={moveLeft}>◄</button>
                <button onTouchStart={shoot} onClick={shoot}>🔥</button>
                <button onTouchStart={moveRight} onClick={moveRight}>►</button>
            </div>
        </div>
    );
};

// ==================== LAURA E MARIANA ====================
const LM_WIDTH = 400;
const LM_HEIGHT = 400;
const LM_PLAYER_SIZE = 30;
const LM_SPEED = 3;
const LM_AI_SPEED = 2.2;
const LM_CATCH_DIST = 20;

const LauraMariana = ({ adminMode }) => {
    const canvasRef = useRef(null);
    const { user } = useContext(AuthContext);
    const [gameRunning, setGameRunning] = useState(false);
    const [caught, setCaught] = useState(false);
    const [assets, setAssets] = useState({ lauraImg: null, marianaImg: null, musicUrl: null });
    const [uploadingAsset, setUploadingAsset] = useState(null);
    const gameRef = useRef(null);
    const audioRef = useRef(null);
    const lauraImgRef = useRef(null);
    const marianaImgRef = useRef(null);

    const getAssetUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${api.defaults.baseURL.replace('/api', '')}/${url}`;
    };

    useEffect(() => {
        api.get('/games/assets').then(res => {
            setAssets(res.data);
            if (res.data.lauraImg) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = getAssetUrl(res.data.lauraImg);
                lauraImgRef.current = img;
            }
            if (res.data.marianaImg) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = getAssetUrl(res.data.marianaImg);
                marianaImgRef.current = img;
            }
        }).catch(e => console.error(e));
    }, []);

    const handleAssetUpload = async (type, file) => {
        const formData = new FormData();
        formData.append('file', file);
        setUploadingAsset(type);
        try {
            const res = await api.put(`/games/assets/${type}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }
            });
            setAssets(res.data);
            if (type === 'laura' && res.data.lauraImg) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = getAssetUrl(res.data.lauraImg);
                lauraImgRef.current = img;
            }
            if (type === 'mariana' && res.data.marianaImg) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = getAssetUrl(res.data.marianaImg);
                marianaImgRef.current = img;
            }
        } catch (e) { console.error(e); }
        setUploadingAsset(null);
    };

    const startGame = () => {
        setCaught(false);
        setGameRunning(true);
        const state = {
            laura: { x: 50, y: LM_HEIGHT / 2 },
            mariana: { x: LM_WIDTH - 80, y: LM_HEIGHT / 2 },
            keys: {},
            hearts: [],
        };
        // Decorative hearts
        for (let i = 0; i < 8; i++) {
            state.hearts.push({
                x: Math.random() * LM_WIDTH,
                y: Math.random() * LM_HEIGHT,
                size: 8 + Math.random() * 12,
                speed: 0.3 + Math.random() * 0.5,
            });
        }
        gameRef.current = state;

        // Play music
        if (assets.musicUrl && audioRef.current) {
            audioRef.current.src = getAssetUrl(assets.musicUrl);
            audioRef.current.loop = true;
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(() => {});
        }
    };

    const stopMusic = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    useEffect(() => {
        if (!gameRunning) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const state = gameRef.current;

        const keyDown = (e) => { state.keys[e.key] = true; };
        const keyUp = (e) => { state.keys[e.key] = false; };
        window.addEventListener('keydown', keyDown);
        window.addEventListener('keyup', keyUp);

        const loop = setInterval(() => {
            // Laura movement (player)
            if (state.keys['ArrowLeft'] || state.keys['a']) state.laura.x -= LM_SPEED;
            if (state.keys['ArrowRight'] || state.keys['d']) state.laura.x += LM_SPEED;
            if (state.keys['ArrowUp'] || state.keys['w']) state.laura.y -= LM_SPEED;
            if (state.keys['ArrowDown'] || state.keys['s']) state.laura.y += LM_SPEED;

            // Keep Laura in bounds
            state.laura.x = Math.max(0, Math.min(LM_WIDTH - LM_PLAYER_SIZE, state.laura.x));
            state.laura.y = Math.max(0, Math.min(LM_HEIGHT - LM_PLAYER_SIZE, state.laura.y));

            // Mariana AI - runs away from Laura with some randomness
            const dx = state.mariana.x - state.laura.x;
            const dy = state.mariana.y - state.laura.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                // Run away direction
                let moveX = (dx / dist) * LM_AI_SPEED;
                let moveY = (dy / dist) * LM_AI_SPEED;

                // Add some zigzag randomness
                const now = Date.now();
                moveX += Math.sin(now * 0.003) * 0.8;
                moveY += Math.cos(now * 0.004) * 0.8;

                // If too close, speed boost
                if (dist < 100) {
                    moveX *= 1.3;
                    moveY *= 1.3;
                }

                state.mariana.x += moveX;
                state.mariana.y += moveY;
            }

            // Keep Mariana in bounds (with bounce)
            if (state.mariana.x <= 0 || state.mariana.x >= LM_WIDTH - LM_PLAYER_SIZE) {
                state.mariana.x = Math.max(0, Math.min(LM_WIDTH - LM_PLAYER_SIZE, state.mariana.x));
            }
            if (state.mariana.y <= 0 || state.mariana.y >= LM_HEIGHT - LM_PLAYER_SIZE) {
                state.mariana.y = Math.max(0, Math.min(LM_HEIGHT - LM_PLAYER_SIZE, state.mariana.y));
            }

            // Check catch
            const catchDx = state.laura.x - state.mariana.x;
            const catchDy = state.laura.y - state.mariana.y;
            if (Math.sqrt(catchDx * catchDx + catchDy * catchDy) < LM_CATCH_DIST) {
                clearInterval(loop);
                setGameRunning(false);
                setCaught(true);
                stopMusic();
                window.removeEventListener('keydown', keyDown);
                window.removeEventListener('keyup', keyUp);
                return;
            }

            // Animate hearts
            state.hearts.forEach(h => {
                h.y -= h.speed;
                if (h.y < -20) {
                    h.y = LM_HEIGHT + 10;
                    h.x = Math.random() * LM_WIDTH;
                }
            });

            // Draw
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, LM_WIDTH, LM_HEIGHT);

            // Draw floating hearts
            ctx.fillStyle = 'rgba(231, 59, 67, 0.15)';
            state.hearts.forEach(h => {
                ctx.font = `${h.size}px sans-serif`;
                ctx.fillText('💕', h.x, h.y);
            });

            // Draw Laura (player)
            const lauraImg = lauraImgRef.current;
            if (lauraImg && lauraImg.complete && lauraImg.naturalWidth > 0) {
                ctx.drawImage(lauraImg, state.laura.x, state.laura.y, LM_PLAYER_SIZE, LM_PLAYER_SIZE);
            } else {
                ctx.fillStyle = '#E73B43';
                ctx.beginPath();
                ctx.arc(state.laura.x + LM_PLAYER_SIZE / 2, state.laura.y + LM_PLAYER_SIZE / 2, LM_PLAYER_SIZE / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px "League Spartan", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('L', state.laura.x + LM_PLAYER_SIZE / 2, state.laura.y + LM_PLAYER_SIZE / 2 + 4);
            }

            // Draw Mariana (AI)
            const marianaImg = marianaImgRef.current;
            if (marianaImg && marianaImg.complete && marianaImg.naturalWidth > 0) {
                ctx.drawImage(marianaImg, state.mariana.x, state.mariana.y, LM_PLAYER_SIZE, LM_PLAYER_SIZE);
            } else {
                ctx.fillStyle = '#2095A2';
                ctx.beginPath();
                ctx.arc(state.mariana.x + LM_PLAYER_SIZE / 2, state.mariana.y + LM_PLAYER_SIZE / 2, LM_PLAYER_SIZE / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px "League Spartan", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('M', state.mariana.x + LM_PLAYER_SIZE / 2, state.mariana.y + LM_PLAYER_SIZE / 2 + 4);
            }

            // HUD - distance indicator
            ctx.textAlign = 'left';
            ctx.fillStyle = '#F1A416';
            ctx.font = 'bold 12px "League Spartan", sans-serif';
            ctx.fillText(`Distância: ${Math.round(dist)}`, 10, 20);

        }, 1000 / 60);

        return () => {
            clearInterval(loop);
            window.removeEventListener('keydown', keyDown);
            window.removeEventListener('keyup', keyUp);
        };
    }, [gameRunning]);

    // Cleanup music on unmount
    useEffect(() => {
        return () => stopMusic();
    }, []);

    // Mobile controls
    const move = (key) => {
        if (gameRef.current) {
            gameRef.current.keys[key] = true;
            setTimeout(() => { if (gameRef.current) gameRef.current.keys[key] = false; }, 100);
        }
    };

    return (
        <div className="game-section">
            <h2 className="game-section-title">💕 Laura & Mariana</h2>
            <p className="game-desc">A Laura quer pegar a Mariana! Use as setas para se mover.</p>

            <audio ref={audioRef} />

            {user && user.isAdmin && adminMode && (
                <div className="boss-config">
                    <h4>⚙️ Configurar Personagens (Admin)</h4>
                    <div className="boss-config-grid">
                        <div className="boss-config-item">
                            <span>Laura (PNG)</span>
                            {uploadingAsset === 'laura' ? (
                                <div className="boss-uploading">⏳ Enviando...</div>
                            ) : assets.lauraImg ? (
                                <img src={getAssetUrl(assets.lauraImg)} alt="Laura" className="boss-preview" />
                            ) : <div className="boss-preview-empty">🔴</div>}
                            <input type="file" accept="image/*" disabled={uploadingAsset === 'laura'} onChange={e => e.target.files[0] && handleAssetUpload('laura', e.target.files[0])} />
                        </div>
                        <div className="boss-config-item">
                            <span>Mariana (PNG)</span>
                            {uploadingAsset === 'mariana' ? (
                                <div className="boss-uploading">⏳ Enviando...</div>
                            ) : assets.marianaImg ? (
                                <img src={getAssetUrl(assets.marianaImg)} alt="Mariana" className="boss-preview" />
                            ) : <div className="boss-preview-empty">🔵</div>}
                            <input type="file" accept="image/*" disabled={uploadingAsset === 'mariana'} onChange={e => e.target.files[0] && handleAssetUpload('mariana', e.target.files[0])} />
                        </div>
                        <div className="boss-config-item">
                            <span>Música 🎵</span>
                            {uploadingAsset === 'music' ? (
                                <div className="boss-uploading">⏳ Enviando...</div>
                            ) : assets.musicUrl ? (
                                <div className="boss-preview-empty">🎶</div>
                            ) : <div className="boss-preview-empty">🔇</div>}
                            <input type="file" accept="audio/*" disabled={uploadingAsset === 'music'} onChange={e => e.target.files[0] && handleAssetUpload('music', e.target.files[0])} />
                        </div>
                    </div>
                </div>
            )}

            <div className="lm-canvas-wrapper">
                <canvas ref={canvasRef} width={LM_WIDTH} height={LM_HEIGHT} className="lm-canvas" />
                {!gameRunning && (
                    <div className="lm-overlay">
                        {caught ? (
                            <div className="lm-caught">
                                <p className="lm-caught-text">💕 Agora você está namorando! 💕</p>
                                <p className="lm-caught-sub">Laura pegou a Mariana!</p>
                            </div>
                        ) : (
                            <p className="snake-start-text">💕 Laura & Mariana</p>
                        )}
                        <button className="snake-start-btn" onClick={startGame}>
                            {caught ? 'Jogar Novamente' : 'Iniciar Jogo'}
                        </button>
                    </div>
                )}
            </div>
            <div className="lm-mobile-controls">
                <button onClick={() => move('ArrowUp')}>▲</button>
                <div>
                    <button onClick={() => move('ArrowLeft')}>◄</button>
                    <button onClick={() => move('ArrowRight')}>►</button>
                </div>
                <button onClick={() => move('ArrowDown')}>▼</button>
            </div>
        </div>
    );
};

// ==================== FLAPPY BIRD (CARTEIRA DE TRABALHO) ====================
const FB_WIDTH = 320;
const FB_HEIGHT = 480;
const FB_GRAVITY = 0.35;
const FB_JUMP = -6;
const FB_PIPE_WIDTH = 50;
const FB_PIPE_GAP = 130;
const FB_PIPE_SPEED = 2.5;
const FB_BIRD_SIZE = 30;

const FlappyBird = ({ adminMode }) => {
    const canvasRef = useRef(null);
    const { user } = useContext(AuthContext);
    const [gameRunning, setGameRunning] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('flappy-best') || '0'));
    const [assets, setAssets] = useState({ flappyBirdImg: null });
    const [uploadingAsset, setUploadingAsset] = useState(false);
    const gameRef = useRef(null);
    const birdImgRef = useRef(null);

    const getAssetUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${api.defaults.baseURL.replace('/api', '')}/${url}`;
    };

    useEffect(() => {
        api.get('/games/assets').then(res => {
            setAssets(res.data);
            if (res.data.flappyBirdImg) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = getAssetUrl(res.data.flappyBirdImg);
                birdImgRef.current = img;
            }
        }).catch(e => console.error(e));
    }, []);

    const handleAssetUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        setUploadingAsset(true);
        try {
            const res = await api.put('/games/assets/flappybird', formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }
            });
            setAssets(res.data);
            if (res.data.flappyBirdImg) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = getAssetUrl(res.data.flappyBirdImg);
                birdImgRef.current = img;
            }
        } catch (e) { console.error(e); }
        setUploadingAsset(false);
    };

    const startGame = () => {
        setScore(0);
        setGameOver(false);
        setGameRunning(true);
        gameRef.current = {
            bird: { x: 60, y: FB_HEIGHT / 2, vy: 0 },
            pipes: [],
            score: 0,
            frame: 0,
        };
    };

    const jump = useCallback(() => {
        if (!gameRunning) return;
        if (gameRef.current) gameRef.current.bird.vy = FB_JUMP;
    }, [gameRunning]);

    useEffect(() => {
        if (!gameRunning) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const state = gameRef.current;

        const handleKey = (e) => {
            if (e.code === 'Space' || e.key === 'ArrowUp') {
                e.preventDefault();
                state.bird.vy = FB_JUMP;
            }
        };
        window.addEventListener('keydown', handleKey);

        const loop = setInterval(() => {
            state.frame++;

            // Bird physics
            state.bird.vy += FB_GRAVITY;
            state.bird.y += state.bird.vy;

            // Spawn pipes
            if (state.frame % 90 === 0) {
                const gapY = 80 + Math.random() * (FB_HEIGHT - FB_PIPE_GAP - 160);
                state.pipes.push({ x: FB_WIDTH, gapY, scored: false });
            }

            // Move pipes
            state.pipes.forEach(p => { p.x -= FB_PIPE_SPEED; });
            state.pipes = state.pipes.filter(p => p.x > -FB_PIPE_WIDTH);

            // Score
            state.pipes.forEach(p => {
                if (!p.scored && p.x + FB_PIPE_WIDTH < state.bird.x) {
                    p.scored = true;
                    state.score++;
                    setScore(state.score);
                }
            });

            // Collision with ground/ceiling
            if (state.bird.y < 0 || state.bird.y + FB_BIRD_SIZE > FB_HEIGHT) {
                clearInterval(loop);
                setGameRunning(false);
                setGameOver(true);
                if (state.score > bestScore) {
                    setBestScore(state.score);
                    localStorage.setItem('flappy-best', state.score.toString());
                }
                window.removeEventListener('keydown', handleKey);
                return;
            }

            // Collision with pipes
            for (const p of state.pipes) {
                const birdRight = state.bird.x + FB_BIRD_SIZE;
                const birdBottom = state.bird.y + FB_BIRD_SIZE;
                if (birdRight > p.x && state.bird.x < p.x + FB_PIPE_WIDTH) {
                    if (state.bird.y < p.gapY || birdBottom > p.gapY + FB_PIPE_GAP) {
                        clearInterval(loop);
                        setGameRunning(false);
                        setGameOver(true);
                        if (state.score > bestScore) {
                            setBestScore(state.score);
                            localStorage.setItem('flappy-best', state.score.toString());
                        }
                        window.removeEventListener('keydown', handleKey);
                        return;
                    }
                }
            }

            // Draw
            // Sky gradient
            const skyGrad = ctx.createLinearGradient(0, 0, 0, FB_HEIGHT);
            skyGrad.addColorStop(0, '#1a1a2e');
            skyGrad.addColorStop(1, '#16213e');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, FB_WIDTH, FB_HEIGHT);

            // Clouds
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            for (let i = 0; i < 5; i++) {
                const cx = ((i * 97 + state.frame * 0.3) % (FB_WIDTH + 60)) - 30;
                const cy = 40 + i * 80;
                ctx.beginPath();
                ctx.arc(cx, cy, 20 + i * 5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Pipes (carteira de trabalho style)
            state.pipes.forEach(p => {
                // Top pipe
                const topH = p.gapY;
                // Bottom pipe
                const bottomY = p.gapY + FB_PIPE_GAP;
                const bottomH = FB_HEIGHT - bottomY;

                // Carteira de trabalho - dark blue cover
                ctx.fillStyle = '#1a3a5c';
                ctx.fillRect(p.x, 0, FB_PIPE_WIDTH, topH);
                ctx.fillRect(p.x, bottomY, FB_PIPE_WIDTH, bottomH);

                // Gold trim
                ctx.strokeStyle = '#F1A416';
                ctx.lineWidth = 2;
                ctx.strokeRect(p.x + 3, 3, FB_PIPE_WIDTH - 6, topH - 6);
                ctx.strokeRect(p.x + 3, bottomY + 3, FB_PIPE_WIDTH - 6, bottomH - 6);

                // "CTPS" text
                ctx.fillStyle = '#F1A416';
                ctx.font = 'bold 9px "League Spartan", sans-serif';
                ctx.textAlign = 'center';
                if (topH > 30) ctx.fillText('CTPS', p.x + FB_PIPE_WIDTH / 2, topH - 10);
                if (bottomH > 30) ctx.fillText('CTPS', p.x + FB_PIPE_WIDTH / 2, bottomY + 20);

                // Coat of arms circle
                ctx.fillStyle = '#F1A416';
                ctx.beginPath();
                if (topH > 50) {
                    ctx.arc(p.x + FB_PIPE_WIDTH / 2, topH / 2, 10, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#1a3a5c';
                    ctx.beginPath();
                    ctx.arc(p.x + FB_PIPE_WIDTH / 2, topH / 2, 6, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = '#F1A416';
                ctx.beginPath();
                if (bottomH > 50) {
                    ctx.arc(p.x + FB_PIPE_WIDTH / 2, bottomY + bottomH / 2, 10, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#1a3a5c';
                    ctx.beginPath();
                    ctx.arc(p.x + FB_PIPE_WIDTH / 2, bottomY + bottomH / 2, 6, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Pipe caps
                ctx.fillStyle = '#0f2940';
                ctx.fillRect(p.x - 4, topH - 16, FB_PIPE_WIDTH + 8, 16);
                ctx.fillRect(p.x - 4, bottomY, FB_PIPE_WIDTH + 8, 16);
                ctx.strokeStyle = '#F1A416';
                ctx.lineWidth = 1;
                ctx.strokeRect(p.x - 4, topH - 16, FB_PIPE_WIDTH + 8, 16);
                ctx.strokeRect(p.x - 4, bottomY, FB_PIPE_WIDTH + 8, 16);
            });

            // Bird
            const birdImg = birdImgRef.current;
            ctx.save();
            ctx.translate(state.bird.x + FB_BIRD_SIZE / 2, state.bird.y + FB_BIRD_SIZE / 2);
            const angle = Math.min(Math.max(state.bird.vy * 3, -30), 90) * Math.PI / 180;
            ctx.rotate(angle);
            if (birdImg && birdImg.complete && birdImg.naturalWidth > 0) {
                ctx.drawImage(birdImg, -FB_BIRD_SIZE / 2, -FB_BIRD_SIZE / 2, FB_BIRD_SIZE, FB_BIRD_SIZE);
            } else {
                ctx.fillStyle = '#F1A416';
                ctx.beginPath();
                ctx.arc(0, 0, FB_BIRD_SIZE / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(6, -4, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#1a1a2e';
                ctx.beginPath();
                ctx.arc(7, -4, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#E73B43';
                ctx.beginPath();
                ctx.moveTo(FB_BIRD_SIZE / 2, -2);
                ctx.lineTo(FB_BIRD_SIZE / 2 + 8, 0);
                ctx.lineTo(FB_BIRD_SIZE / 2, 4);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();

            // HUD
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 28px "League Spartan", sans-serif';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.fillText(state.score, FB_WIDTH / 2, 45);
            ctx.shadowBlur = 0;

        }, 1000 / 60);

        return () => {
            clearInterval(loop);
            window.removeEventListener('keydown', handleKey);
        };
    }, [gameRunning, bestScore]);

    return (
        <div className="game-section">
            <h2 className="game-section-title">🐦 Flappy CTPS</h2>
            <p className="game-desc">Desvie das carteiras de trabalho! Toque ou pressione ESPAÇO para voar.</p>

            {user && user.isAdmin && adminMode && (
                <div className="boss-config">
                    <h4>⚙️ Configurar Passarinho (Admin)</h4>
                    <div className="boss-config-grid">
                        <div className="boss-config-item">
                            <span>Passarinho (PNG)</span>
                            {uploadingAsset ? (
                                <div className="boss-uploading">⏳ Enviando...</div>
                            ) : assets.flappyBirdImg ? (
                                <img src={getAssetUrl(assets.flappyBirdImg)} alt="Bird" className="boss-preview" />
                            ) : <div className="boss-preview-empty">🐦</div>}
                            <input type="file" accept="image/*" disabled={uploadingAsset} onChange={e => e.target.files[0] && handleAssetUpload(e.target.files[0])} />
                        </div>
                    </div>
                </div>
            )}

            <div className="fb-scores">
                <span className="snake-score">Pontos: <strong>{score}</strong></span>
                <span className="snake-high">Recorde: <strong>{bestScore}</strong></span>
            </div>

            <div className="fb-canvas-wrapper" onClick={jump} onTouchStart={jump}>
                <canvas ref={canvasRef} width={FB_WIDTH} height={FB_HEIGHT} className="fb-canvas" />
                {!gameRunning && (
                    <div className="fb-overlay">
                        {gameOver ? (
                            <>
                                <p className="snake-game-over">Game Over!</p>
                                <p className="snake-final-score">Pontuação: {score}</p>
                                {score >= bestScore && score > 0 && <p className="fb-new-record">🏆 Novo Recorde!</p>}
                            </>
                        ) : (
                            <p className="snake-start-text">🐦 Flappy CTPS</p>
                        )}
                        <button className="snake-start-btn" onClick={(e) => { e.stopPropagation(); startGame(); }}>
                            {gameOver ? 'Jogar Novamente' : 'Iniciar Jogo'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==================== MAIN GAMES PAGE ====================
const Games = () => {
    const [activeTab, setActiveTab] = useState('snake');
    const [loading, setLoading] = useState(false);
    const [adminMode, setAdminMode] = useState(false);
    const { user } = useContext(AuthContext);

    const switchTab = (tab) => {
        if (tab === activeTab) return;
        setLoading(true);
        setActiveTab(tab);
        setTimeout(() => setLoading(false), 400);
    };

    return (
        <div className="games-page">
            <h1 className="games-title">🎮 Jogos PHV</h1>

            {user && user.isAdmin && (
                <div className="games-admin-bar">
                    <button className="games-admin-toggle" onClick={() => setAdminMode(!adminMode)}>
                        {adminMode ? '🔒 Sair do modo Admin' : '🔧 Modo Admin'}
                    </button>
                </div>
            )}

            <div className="games-tabs">
                <button className={`game-tab ${activeTab === 'snake' ? 'active' : ''}`} onClick={() => switchTab('snake')}>🐍 Cobrinha</button>
                <button className={`game-tab ${activeTab === 'danny' ? 'active' : ''}`} onClick={() => switchTab('danny')}>🙈 Danny</button>
                <button className={`game-tab ${activeTab === 'kszei' ? 'active' : ''}`} onClick={() => switchTab('kszei')}>😈 Kszei</button>
                <button className={`game-tab ${activeTab === 'invaders' ? 'active' : ''}`} onClick={() => switchTab('invaders')}>👾 Invaders</button>
                <button className={`game-tab ${activeTab === 'laura' ? 'active' : ''}`} onClick={() => switchTab('laura')}>💕 Laura & Mariana</button>
                <button className={`game-tab ${activeTab === 'flappy' ? 'active' : ''}`} onClick={() => switchTab('flappy')}>🐦 Flappy CTPS</button>
            </div>

            {loading ? (
                <div className="games-loading">
                    <div className="games-loading-spinner"></div>
                    <p>Carregando...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'snake' && <SnakeGame />}
                    {activeTab === 'danny' && <DannyExcuses />}
                    {activeTab === 'kszei' && <MomentoKszei />}
                    {activeTab === 'invaders' && <SpaceInvaders adminMode={adminMode} />}
                    {activeTab === 'laura' && <LauraMariana adminMode={adminMode} />}
                    {activeTab === 'flappy' && <FlappyBird adminMode={adminMode} />}
                </>
            )}
        </div>
    );
};

export default Games;
