
import React from 'react';
import { GameStats } from '../types';
import { getRankInfo } from '../services/storageService';
import { X, Trophy, TrendingUp, Skull, Activity, Target } from 'lucide-react';

interface StatsModalProps {
    stats: GameStats;
    onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
    const rank = getRankInfo(stats.wins);
    const winRate = stats.gamesPlayed > 0 
        ? Math.round((stats.wins / stats.gamesPlayed) * 100) 
        : 0;

    return (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-[#1e1e1e] border-4 border-yellow-600/50 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-[#3e2723] to-[#271a17] p-4 flex justify-between items-center border-b border-yellow-600/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/50">
                            <Trophy className="text-yellow-400 w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold font-serif text-yellow-100 leading-none">Estadísticas</h2>
                            <span className="text-xs text-yellow-500/70 font-bold tracking-wider uppercase">Tu Progreso</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    
                    {/* Rank Card */}
                    <div className="mb-6 bg-gradient-to-br from-gray-800 to-black p-4 md:p-6 rounded-xl border border-white/10 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="text-6xl md:text-7xl filter drop-shadow-lg animate-bounce-slow">
                            {rank.icon}
                        </div>
                        
                        <div className="flex-1 text-center md:text-left z-10">
                            <h3 className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">Rango Actual</h3>
                            <h2 className={`text-2xl md:text-4xl font-black ${rank.color} mb-2`}>{rank.title}</h2>
                            {rank.next !== null ? (
                                <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden mt-2 border border-gray-600">
                                    <div 
                                        className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full rounded-full transition-all duration-1000" 
                                        style={{ width: `${Math.min(100, (stats.wins / rank.next) * 100)}%` }}
                                    ></div>
                                    <p className="text-[10px] text-right mt-1 text-gray-400">{stats.wins} / {rank.next} Victorias</p>
                                </div>
                            ) : (
                                <p className="text-yellow-400 font-bold text-sm">¡Rango Máximo Alcanzado!</p>
                            )}
                        </div>
                    </div>

                    {/* Grid Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center hover:bg-white/10 transition-colors">
                            <Trophy className="text-yellow-500 mb-2 w-6 h-6" />
                            <span className="text-3xl font-bold text-white font-serif">{stats.wins}</span>
                            <span className="text-xs text-gray-400 uppercase font-bold tracking-wide">Victorias</span>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center hover:bg-white/10 transition-colors">
                            <Skull className="text-red-500 mb-2 w-6 h-6" />
                            <span className="text-3xl font-bold text-white font-serif">{stats.losses}</span>
                            <span className="text-xs text-gray-400 uppercase font-bold tracking-wide">Derrotas</span>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center hover:bg-white/10 transition-colors">
                            <Activity className="text-green-500 mb-2 w-6 h-6" />
                            <span className="text-3xl font-bold text-white font-serif">{winRate}%</span>
                            <span className="text-xs text-gray-400 uppercase font-bold tracking-wide">Efectividad</span>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center hover:bg-white/10 transition-colors">
                            <TrendingUp className="text-blue-500 mb-2 w-6 h-6" />
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-white font-serif">{stats.currentStreak}</span>
                                <span className="text-xs text-gray-500">({stats.bestStreak})</span>
                            </div>
                            <span className="text-xs text-gray-400 uppercase font-bold tracking-wide">Racha (Max)</span>
                        </div>

                    </div>
                    
                    {/* Total Points */}
                    <div className="mt-4 bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                             <Target className="text-purple-400 w-5 h-5" />
                             <span className="text-gray-300 font-bold text-sm">Puntos Totales Anotados</span>
                        </div>
                        <span className="text-2xl font-bold text-white">{stats.totalPointsScored}</span>
                    </div>

                </div>
            </div>
        </div>
    );
};
