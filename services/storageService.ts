
import { GameStats } from '../types';

const STORAGE_KEY = 'truco_venezolano_stats_v1';

const INITIAL_STATS: GameStats = {
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalPointsScored: 0
};

export const getStats = (): GameStats => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error reading stats", e);
    }
    return INITIAL_STATS;
};

export const updateGameStats = (isWin: boolean, playerPoints: number): GameStats => {
    const current = getStats();
    
    const newStats: GameStats = {
        ...current,
        gamesPlayed: current.gamesPlayed + 1,
        totalPointsScored: current.totalPointsScored + playerPoints,
        wins: isWin ? current.wins + 1 : current.wins,
        losses: !isWin ? current.losses + 1 : current.losses,
        currentStreak: isWin ? current.currentStreak + 1 : 0,
        bestStreak: isWin 
            ? Math.max(current.bestStreak, current.currentStreak + 1) 
            : current.bestStreak
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
    } catch (e) {
        console.error("Error saving stats", e);
    }

    return newStats;
};

// Rank System Logic
export const getRankInfo = (wins: number) => {
    if (wins >= 100) return { title: "Leyenda del Truco", icon: "👑", next: null, color: "text-yellow-400" };
    if (wins >= 50) return { title: "Maestro de la Mesa", icon: "💎", next: 100, color: "text-blue-400" };
    if (wins >= 25) return { title: "Jugador Experto", icon: "🔥", next: 50, color: "text-red-400" };
    if (wins >= 10) return { title: "Competidor", icon: "⚔️", next: 25, color: "text-orange-400" };
    if (wins >= 5) return { title: "Iniciado", icon: "🎲", next: 10, color: "text-green-400" };
    return { title: "Novato", icon: "🌱", next: 5, color: "text-gray-400" };
};
