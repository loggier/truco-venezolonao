
import React from 'react';

interface ScoreBoardProps {
    playerScore: number;
    cpuScore: number;
}

const MatchStick: React.FC<{ rotate?: number, className?: string }> = ({ rotate = 0, className }) => (
    <div 
        className={`w-0.5 md:w-1 h-6 md:h-8 bg-yellow-200 border border-yellow-600 rounded-sm shadow-sm relative ${className}`}
        style={{ transform: `rotate(${rotate}deg)` }}
    >
        <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-red-500 rounded-t-sm"></div>
    </div>
);

const PointGroup: React.FC<{ points: number }> = ({ points }) => {
    // 5 points per square
    if (points <= 0) return <div className="w-8 h-8 md:w-12 md:h-12"></div>;

    return (
        <div className="relative w-8 h-8 md:w-12 md:h-12 m-0.5 md:m-1">
            {points >= 1 && <MatchStick className="absolute left-1 top-1 md:top-2" />}
            {points >= 2 && <MatchStick className="absolute left-1 top-1 md:top-2" rotate={90} />}
            {points >= 3 && <MatchStick className="absolute right-1 top-1 md:top-2" />}
            {points >= 4 && <MatchStick className="absolute right-1 top-1 md:top-2" rotate={90} />}
            {points >= 5 && <MatchStick className="absolute left-3 md:left-4 top-1 md:top-2 rotate-45" />}
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
        <div className="fixed top-2 right-2 md:top-4 md:right-4 bg-wood-texture border-2 md:border-4 border-yellow-900 bg-[#5d4037] rounded-lg shadow-2xl p-2 md:p-4 w-40 md:w-64 z-50 transform origin-top-right scale-75 md:scale-100">
            <h3 className="text-center text-yellow-100 font-serif font-bold text-sm md:text-lg mb-1 md:mb-2 border-b border-yellow-800 pb-1">PUNTUACIÓN</h3>
            <div className="flex justify-between items-start">
                <div className="flex flex-col items-center w-1/2 border-r border-yellow-800 pr-1 md:pr-2">
                    <span className="text-white font-bold text-[10px] md:text-xs mb-1 md:mb-2">NOSOTROS</span>
                    {renderPoints(playerScore)}
                    <span className="text-lg md:text-2xl font-bold text-yellow-400 mt-1">{playerScore}</span>
                </div>
                <div className="flex flex-col items-center w-1/2 pl-1 md:pl-2">
                    <span className="text-white font-bold text-[10px] md:text-xs mb-1 md:mb-2">ELLOS</span>
                    {renderPoints(cpuScore)}
                    <span className="text-lg md:text-2xl font-bold text-yellow-400 mt-1">{cpuScore}</span>
                </div>
            </div>
        </div>
    );
};
