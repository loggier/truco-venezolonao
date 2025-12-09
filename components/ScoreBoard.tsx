
import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ScoreBoardProps {
    playerScore: number;
    cpuScore: number;
}

// SVG based matchstick drawing for clean scaling without pixelation
const PointGroup: React.FC<{ points: number }> = ({ points }) => {
    // If 0 points, hide it but keep DOM structure if needed, or handle in parent
    const isEmpty = points <= 0;
    
    return (
        <svg viewBox="0 0 40 40" className={`w-6 h-6 md:w-10 md:h-10 transition-all duration-300 ${isEmpty ? 'opacity-0 w-0 h-0 md:w-0 md:h-0' : 'drop-shadow-sm'}`}>
             <defs>
                <linearGradient id="stickGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fcd34d" />
                    <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
             </defs>
             
             {/* 1: Left Vertical */}
             {points >= 1 && <path d="M10 10 L10 30" stroke="url(#stickGradient)" strokeWidth="3" strokeLinecap="round" />}
             {/* 2: Top Horizontal */}
             {points >= 2 && <path d="M10 10 L30 10" stroke="url(#stickGradient)" strokeWidth="3" strokeLinecap="round" />}
             {/* 3: Right Vertical */}
             {points >= 3 && <path d="M30 10 L30 30" stroke="url(#stickGradient)" strokeWidth="3" strokeLinecap="round" />}
             {/* 4: Bottom Horizontal */}
             {points >= 4 && <path d="M10 30 L30 30" stroke="url(#stickGradient)" strokeWidth="3" strokeLinecap="round" />}
             {/* 5: Diagonal (The "Cross") */}
             {points >= 5 && <path d="M10 10 L30 30" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />}
        </svg>
    );
};

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ playerScore, cpuScore }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const renderPoints = (score: number) => {
        const groups = [];
        let remaining = score;
        while (remaining > 0) {
            const val = Math.min(5, remaining);
            groups.push(val);
            remaining -= 5;
        }
        // Ensure at least one element exists to maintain some height consistency if needed, 
        // though logic below handles empty well.
        if (groups.length === 0) groups.push(0);
        
        return (
            <div className="flex flex-wrap justify-center gap-0.5 md:gap-1 max-w-[4rem] md:max-w-[7rem]">
                {groups.map((p, i) => <PointGroup key={i} points={p} />)}
            </div>
        );
    };

    return (
        <div className="fixed top-2 right-2 z-50 flex flex-col items-end">
            <div className={`
                transition-all duration-300 ease-in-out
                bg-[#3e2723] border border-yellow-600/50 rounded-lg shadow-2xl overflow-hidden
                ${isCollapsed ? 'w-auto' : 'w-auto'}
            `}>
                 {/* Header / Toggle Bar */}
                 <div 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="bg-[#271a17] px-2 py-1 md:px-3 md:py-1.5 cursor-pointer flex items-center justify-between space-x-2 active:bg-black/40 hover:bg-black/20 transition-colors"
                 >
                    <span className="text-yellow-500 font-serif font-bold text-[10px] md:text-xs tracking-widest uppercase flex items-center">
                        {isCollapsed ? (
                            <span className="flex items-center space-x-2">
                                <span className="text-white">{playerScore}</span>
                                <span className="text-yellow-600 text-[8px]">vs</span>
                                <span className="text-white">{cpuScore}</span>
                            </span>
                        ) : 'Puntos'}
                    </span>
                    {isCollapsed ? <ChevronDown size={14} className="text-yellow-500/80" /> : <ChevronUp size={14} className="text-yellow-500/80" />}
                 </div>

                 {/* Content Area */}
                 <div className={`
                    transition-all duration-300 ease-in-out origin-top overflow-hidden
                    ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-64 opacity-100'}
                 `}>
                    <div className="p-1.5 md:p-3 flex items-start space-x-2 md:space-x-4 bg-wood-texture relative">
                        {/* Background Overlay for better text contrast if texture is busy */}
                        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

                        {/* Player Column */}
                        <div className="flex flex-col items-center min-w-[3rem] md:min-w-[4rem] relative z-10">
                            <span className="text-[8px] md:text-[10px] text-yellow-200/80 font-bold mb-1 tracking-wider uppercase">Nosotros</span>
                            {renderPoints(playerScore)}
                            <div className="mt-1 w-full h-px bg-yellow-800/30"></div>
                            <span className="text-xs md:text-lg font-bold text-white mt-0.5 font-serif">{playerScore}</span>
                        </div>
                        
                        {/* Vertical Divider */}
                        <div className="w-px bg-yellow-800/50 self-stretch my-1 relative z-10"></div>

                        {/* CPU Column */}
                        <div className="flex flex-col items-center min-w-[3rem] md:min-w-[4rem] relative z-10">
                            <span className="text-[8px] md:text-[10px] text-yellow-200/80 font-bold mb-1 tracking-wider uppercase">Ellos</span>
                            {renderPoints(cpuScore)}
                            <div className="mt-1 w-full h-px bg-yellow-800/30"></div>
                            <span className="text-xs md:text-lg font-bold text-white mt-0.5 font-serif">{cpuScore}</span>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};
