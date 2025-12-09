import React from 'react';
import { WIN_SCORE } from '../constants';

interface ScoreBoardProps {
    playerScore: number;
    cpuScore: number;
}

const MatchStick: React.FC<{ rotate?: number, className?: string }> = ({ rotate = 0, className }) => (
    <div 
        className={`w-1 h-8 bg-yellow-200 border border-yellow-600 rounded-sm shadow-sm relative ${className}`}
        style={{ transform: `rotate(${rotate}deg)` }}
    >
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500 rounded-t-sm"></div>
    </div>
);

const PointGroup: React.FC<{ points: number }> = ({ points }) => {
    // 5 points per square
    if (points <= 0) return <div className="w-12 h-12"></div>;

    return (
        <div className="relative w-12 h-12 m-1">
            {points >= 1 && <MatchStick className="absolute left-1 top-2" />}
            {points >= 2 && <MatchStick className="absolute left-1 top-2" rotate={90} />}
            {points >= 3 && <MatchStick className="absolute right-1 top-2" />}
            {points >= 4 && <MatchStick className="absolute right-1 top-2" rotate={90} />}
            {points >= 5 && <MatchStick className="absolute left-4 top-2 rotate-45" />}
        </div>
    );
};

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ playerScore, cpuScore }) => {
    const renderPoints = (score: number) => {
        const groups = [];
        let remaining = score;
        while (remaining > 0) {
            const val = Math.min(5, remaining);
            groups.push(val);
            remaining -= 5;
        }
        // Fill empty slots for layout stability up to 15 (3 groups) or 30 (6 groups)
        while (groups.length < 3) groups.push(0);

        return (
            <div className="flex flex-wrap w-full justify-center">
                {groups.map((p, i) => <PointGroup key={i} points={p} />)}
            </div>
        );
    };

    return (
        <div className="fixed top-4 right-4 bg-wood-texture border-4 border-yellow-900 bg-[#5d4037] rounded-lg shadow-2xl p-4 w-64 z-50">
            <h3 className="text-center text-yellow-100 font-serif font-bold text-lg mb-2 border-b border-yellow-800 pb-1">PUNTUACIÓN</h3>
            <div className="flex justify-between items-start">
                <div className="flex flex-col items-center w-1/2 border-r border-yellow-800 pr-2">
                    <span className="text-white font-bold text-xs mb-2">NOSOTROS</span>
                    {renderPoints(playerScore)}
                    <span className="text-2xl font-bold text-yellow-400 mt-1">{playerScore}</span>
                </div>
                <div className="flex flex-col items-center w-1/2 pl-2">
                    <span className="text-white font-bold text-xs mb-2">ELLOS</span>
                    {renderPoints(cpuScore)}
                    <span className="text-2xl font-bold text-yellow-400 mt-1">{cpuScore}</span>
                </div>
            </div>
        </div>
    );
};
