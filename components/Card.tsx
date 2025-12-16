
import React from 'react';
import { CardData, Suit } from '../types';
import { Sword, Trophy } from 'lucide-react';

interface CardProps {
    card: CardData;
    onDoubleClick?: () => void;
    onClick?: () => void;
    playable?: boolean;
    isSelected?: boolean;
    hidden?: boolean; // Fully hidden (opponent hand or face down)
    small?: boolean;
    className?: string;
}

// Helper to make icons responsive via classes instead of hardcoded pixels
const SuitIcon: React.FC<{ suit: Suit, className?: string }> = ({ suit, className }) => {
    const commonClass = `w-full h-full ${className}`;
    
    switch (suit) {
        case Suit.Espadas: return <Sword className={`text-blue-600 ${commonClass}`} fill="currentColor" />;
        case Suit.Bastos: return (
            <svg 
                viewBox="0 0 24 24" 
                className={`text-green-700 ${commonClass}`} 
                fill="currentColor" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            >
                <path d="M12 2 C14.5 2 16.5 4.5 16.5 8.5 C16.5 12.5 15 15.5 14 17.5 L14 20.5 C14 21.5 13 22 12 22 C11 22 10 21.5 10 20.5 L10 17.5 C9 15.5 7.5 12.5 7.5 8.5 C7.5 4.5 9.5 2 12 2 Z" />
                <path d="M12 5 L12 9" strokeOpacity="0.5" />
                <path d="M9.5 11 L14.5 11" strokeOpacity="0.5" />
                <path d="M11 15 L13 16" strokeOpacity="0.5" />
            </svg>
        );
        case Suit.Oros: return (
            <div className={`rounded-full border-4 border-yellow-500 bg-yellow-200 flex items-center justify-center ${commonClass} shadow-inner`}>
                <div className="w-1/2 h-1/2 bg-yellow-600 rounded-full opacity-50"></div>
            </div>
        );
        case Suit.Copas: return <Trophy className={`text-red-700 ${commonClass}`} fill="currentColor" />;
        default: return null;
    }
};

export const Card: React.FC<CardProps> = ({ card, onDoubleClick, onClick, playable = false, isSelected = false, hidden = false, small = false, className = '' }) => {
    
    // Responsive Dimensions
    // Small: Played cards on table. 
    // Normal: Hand cards. Reduced mobile width (w-14) to fit better and be less obstructive.
    const sizeClasses = small 
        ? 'w-11 h-16 md:w-24 md:h-36 text-[10px] md:text-lg' 
        : 'w-16 h-24 md:w-32 md:h-48 text-sm md:text-2xl';

    // The logic: We always render both Front and Back. We rotate the container based on 'hidden'.
    // If card.isCovered is true, we treat it as hidden visually if it's on the table.
    const showBack = hidden;

    // Played as "Carta Nula" / Covered - we add a sticker to the back
    const isNula = card.isCovered && !hidden; 

    // Adjust: If card.isCovered (played as null), it should appear face down (Back showing).
    // So visualHidden is true if hidden OR isCovered.
    const visualHidden = hidden || card.isCovered;

    return (
        <div 
            className={`perspective-1000 select-none ${className}`}
            onDoubleClick={playable ? onDoubleClick : undefined}
            onClick={playable ? onClick : undefined}
            title={playable ? "Click para seleccionar, doble click para jugar" : ""}
        >
            <div className={`
                relative transition-transform duration-700 transform-style-3d 
                ${sizeClasses}
                ${visualHidden ? 'rotate-y-180' : ''} 
                ${isSelected ? '-translate-y-6 rotate-x-12 z-20' : ''}
                ${playable && !isSelected ? 'hover:-translate-y-3 hover:rotate-x-6 cursor-pointer' : ''}
            `}>
                
                {/* --- FRONT FACE --- */}
                <div className={`
                    absolute inset-0 backface-hidden bg-white rounded-lg md:rounded-xl overflow-hidden
                    border border-gray-200
                    flex flex-col items-center justify-between p-1 md:p-2
                    shadow-[1px_1px_4px_rgba(0,0,0,0.3)]
                    ${isSelected ? 'ring-2 md:ring-4 ring-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.6)]' : ''}
                `}>
                    {/* Gloss / Sheen */}
                    <div className="absolute inset-0 gloss-sheen pointer-events-none z-10"></div>

                    {/* Top Left Number */}
                    <div className="w-full flex justify-start pl-0.5 md:pl-1 font-bold font-serif text-gray-800 leading-none">
                        {card.value}
                    </div>

                    {/* Center Art */}
                    <div className="flex-1 flex flex-col items-center justify-center w-full pointer-events-none p-0.5">
                        <div className={`${small ? 'w-5 h-5 md:w-10 md:h-10' : 'w-6 h-6 md:w-14 md:h-14'} drop-shadow-md`}>
                            <SuitIcon suit={card.suit} />
                        </div>
                        {/* Decorative line */}
                        <div className={`mt-1 md:mt-2 w-3/4 h-0.5 rounded-full ${
                            card.suit === Suit.Oros ? 'bg-yellow-400' : 
                            card.suit === Suit.Copas ? 'bg-red-300' : 
                            card.suit === Suit.Espadas ? 'bg-blue-300' : 'bg-green-300' 
                        } opacity-60 shadow-sm`}></div>
                    </div>

                    {/* Bottom Right Number (Inverted) */}
                    <div className="w-full flex justify-end pr-0.5 md:pr-1 font-bold font-serif text-gray-800 transform rotate-180 leading-none">
                        {card.value}
                    </div>

                    {/* Border Box (Marco) */}
                    <div className="absolute inset-1 md:inset-1.5 border border-gray-300 rounded opacity-40 pointer-events-none"></div>

                    {/* Detail: La Pinta (The gaps in the border line) */}
                    {card.suit === Suit.Oros && <div className="absolute inset-x-0 top-0.5 h-1 bg-white z-0" style={{left:'30%', right:'30%'}}></div>}
                    {card.suit === Suit.Copas && <div className="absolute inset-x-0 top-0.5 h-1 flex justify-between px-2.5 bg-transparent z-0"><div className="w-2 h-full bg-white"></div></div>}
                    {card.suit === Suit.Espadas && <div className="absolute inset-x-0 top-0.5 h-1 flex justify-between px-2.5 bg-transparent z-0"><div className="w-2 h-full bg-white"></div><div className="w-2 h-full bg-white"></div></div>}
                    {card.suit === Suit.Bastos && <div className="absolute inset-x-0 top-0.5 h-1 flex justify-between px-2.5 bg-transparent z-0"><div className="w-2 h-full bg-white"></div><div className="w-2 h-full bg-white"></div><div className="w-2 h-full bg-white"></div></div>}
                </div>

                {/* --- BACK FACE --- */}
                <div className={`
                    absolute inset-0 backface-hidden rotate-y-180 rounded-lg md:rounded-xl overflow-hidden
                    border-2 border-gray-100
                    bg-blue-900 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]
                    flex items-center justify-center
                    shadow-[1px_1px_4px_rgba(0,0,0,0.3)]
                `}>
                    {/* Gloss / Sheen */}
                    <div className="absolute inset-0 gloss-sheen pointer-events-none z-10"></div>
                    
                    {/* Inner Pattern Box */}
                    <div className="w-[85%] h-[90%] border-2 border-blue-400/50 rounded-lg opacity-40"></div>
                    
                    {/* Central Design */}
                    <div className="absolute w-5 h-5 md:w-10 md:h-10 bg-blue-800 rounded-full flex items-center justify-center shadow-inner opacity-80 border border-blue-600">
                        <div className="w-1/2 h-1/2 bg-blue-400 rotate-45"></div>
                    </div>

                    {/* "NULA" Sticker if played covered */}
                    {card.isCovered && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
                            <span className="text-white text-[9px] md:text-sm font-bold uppercase tracking-widest -rotate-45 border-2 border-white px-2 py-1 rounded bg-black/40 backdrop-blur-sm shadow-lg">
                                Nula
                            </span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
