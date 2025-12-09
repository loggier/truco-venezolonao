
import React from 'react';
import { CardData, Suit } from '../types';
import { Sword, Trophy } from 'lucide-react';

interface CardProps {
    card: CardData;
    onDoubleClick?: () => void;
    onClick?: () => void;
    playable?: boolean;
    isSelected?: boolean;
    hidden?: boolean;
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
            <div className={`rounded-full border-4 border-yellow-500 bg-yellow-200 flex items-center justify-center ${commonClass}`}>
                <div className="w-1/2 h-1/2 bg-yellow-600 rounded-full opacity-50"></div>
            </div>
        );
        case Suit.Copas: return <Trophy className={`text-red-700 ${commonClass}`} fill="currentColor" />;
        default: return null;
    }
};

export const Card: React.FC<CardProps> = ({ card, onDoubleClick, onClick, playable = false, isSelected = false, hidden = false, small = false, className = '' }) => {
    
    // Responsive Dimensions
    // Small: Used for Vira (tiny)
    // Normal: Mobile (compact) -> Desktop (large)
    const sizeClasses = small 
        ? 'w-9 h-14 md:w-12 md:h-20 text-[9px] md:text-xs' 
        : 'w-11 h-20 md:w-24 md:h-36 text-sm md:text-lg';

    if (hidden) {
        return (
            <div 
                className={`
                    relative rounded-lg shadow-md border-2 border-white bg-blue-900 
                    ${sizeClasses}
                    bg-opacity-90 flex items-center justify-center
                    bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]
                    ${className}
                `}
            >
                <div className="w-full h-full border-2 border-blue-400 rounded-md opacity-20"></div>
            </div>
        );
    }

    return (
        <div 
            onDoubleClick={playable ? onDoubleClick : undefined}
            onClick={playable ? onClick : undefined}
            title={playable ? "Click para seleccionar, otro click para jugar" : ""}
            className={`
                relative bg-white rounded-lg shadow-lg select-none overflow-hidden transition-all duration-300
                ${sizeClasses}
                ${playable ? 'cursor-pointer hover:-translate-y-2 md:hover:-translate-y-4 hover:shadow-2xl' : ''}
                ${isSelected ? '-translate-y-4 md:-translate-y-6 ring-2 md:ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] z-10' : 'border border-gray-300'}
                flex flex-col items-center justify-between p-0.5 md:p-1
                ${className}
            `}
        >
            {/* Top Left Number */}
            <div className="w-full flex justify-start pl-0.5 md:pl-1 font-bold font-serif text-gray-800 leading-none mt-0.5 md:mt-1">
                {card.value}
            </div>

            {/* Center Art - Responsive Icon Size */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-0.5 md:space-y-1 w-full pointer-events-none overflow-hidden p-0.5 md:p-1">
                <div className={`${small ? 'w-3 h-3' : 'w-6 h-6 md:w-10 md:h-10'}`}>
                    <SuitIcon suit={card.suit} />
                </div>
                
                {/* Decorative lines */}
                <div className={`w-full h-px ${card.suit === Suit.Oros ? 'bg-yellow-500' : card.suit === Suit.Copas ? 'bg-red-300' : card.suit === Suit.Espadas ? 'bg-blue-300' : 'bg-green-300' } opacity-50`}></div>
            </div>

            {/* Bottom Right Number (Inverted) */}
            <div className="w-full flex justify-end pr-0.5 md:pr-1 font-bold font-serif text-gray-800 transform rotate-180 leading-none mb-0.5 md:mb-1">
                {card.value}
            </div>

            {/* Border Box (Marco) */}
            <div className="absolute inset-1 border border-gray-400 rounded opacity-30 pointer-events-none"></div>
            
            {/* La Pinta */}
            {card.suit === Suit.Oros && <div className="absolute inset-x-0 top-0 h-0.5 md:h-1 bg-white" style={{left:'30%', right:'30%'}}></div>}
            {card.suit === Suit.Copas && <div className="absolute inset-x-0 top-0 h-0.5 md:h-1 flex justify-between px-2"><div className="w-2 h-full bg-white"></div></div>}
            {card.suit === Suit.Espadas && <div className="absolute inset-x-0 top-0 h-0.5 md:h-1 flex justify-between px-2"><div className="w-2 h-full bg-white"></div><div className="w-2 h-full bg-white"></div></div>}
            {card.suit === Suit.Bastos && <div className="absolute inset-x-0 top-0 h-0.5 md:h-1 flex justify-between px-2"><div className="w-2 h-full bg-white"></div><div className="w-2 h-full bg-white"></div><div className="w-2 h-full bg-white"></div></div>}

        </div>
    );
};
