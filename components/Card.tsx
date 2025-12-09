
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

const SuitIcon: React.FC<{ suit: Suit, size?: number, className?: string }> = ({ suit, size = 24, className }) => {
    switch (suit) {
        case Suit.Espadas: return <Sword size={size} className={`text-blue-600 ${className}`} fill="currentColor" />;
        case Suit.Bastos: return (
            <svg 
                viewBox="0 0 24 24" 
                width={size} 
                height={size} 
                className={`text-green-700 ${className}`} 
                fill="currentColor" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            >
                {/* Garrote/Cudgel Shape - Slimmer and more elongated to avoid lightbulb look */}
                <path d="M12 2 C14.5 2 16.5 4.5 16.5 8.5 C16.5 12.5 15 15.5 14 17.5 L14 20.5 C14 21.5 13 22 12 22 C11 22 10 21.5 10 20.5 L10 17.5 C9 15.5 7.5 12.5 7.5 8.5 C7.5 4.5 9.5 2 12 2 Z" />
                
                {/* Wood Details - Asymmetrical knots */}
                <path d="M12 5 L12 9" strokeOpacity="0.5" />
                <path d="M9.5 11 L14.5 11" strokeOpacity="0.5" />
                <path d="M11 15 L13 16" strokeOpacity="0.5" />
            </svg>
        );
        case Suit.Oros: return <div className={`rounded-full border-4 border-yellow-500 bg-yellow-200 flex items-center justify-center ${className}`} style={{width: size, height: size}}><div className="w-1/2 h-1/2 bg-yellow-600 rounded-full opacity-50"></div></div>;
        case Suit.Copas: return <Trophy size={size} className={`text-red-700 ${className}`} fill="currentColor" />;
        default: return null;
    }
};

export const Card: React.FC<CardProps> = ({ card, onDoubleClick, onClick, playable = false, isSelected = false, hidden = false, small = false, className = '' }) => {
    
    if (hidden) {
        return (
            <div 
                className={`
                    relative rounded-lg shadow-md border-2 border-white bg-blue-900 
                    ${small ? 'w-12 h-20' : 'w-24 h-36'} 
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
                ${small ? 'w-12 h-20 text-xs' : 'w-24 h-36 text-lg'} 
                ${playable ? 'cursor-pointer hover:-translate-y-4 hover:shadow-2xl' : ''}
                ${isSelected ? '-translate-y-6 ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] z-10' : 'border border-gray-300'}
                flex flex-col items-center justify-between p-1
                ${className}
            `}
        >
            {/* Top Left Number */}
            <div className="w-full flex justify-start pl-1 font-bold font-serif text-gray-800">
                {card.value}
            </div>

            {/* Center Art */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-1 w-full pointer-events-none">
                {/* Simplified visual representation of quantity */}
                {card.suit === Suit.Oros && <SuitIcon suit={card.suit} size={small ? 16 : 32} />}
                {card.suit !== Suit.Oros && <SuitIcon suit={card.suit} size={small ? 20 : 40} />}
                
                {/* Decorative lines for spanish style */}
                <div className={`w-full h-px ${card.suit === Suit.Oros ? 'bg-yellow-500' : card.suit === Suit.Copas ? 'bg-red-300' : card.suit === Suit.Espadas ? 'bg-blue-300' : 'bg-green-300' } opacity-50`}></div>
            </div>

            {/* Bottom Right Number (Inverted) */}
            <div className="w-full flex justify-end pr-1 font-bold font-serif text-gray-800 transform rotate-180">
                {card.value}
            </div>

            {/* Border Box (Marco) */}
            <div className="absolute inset-1 border border-gray-400 rounded opacity-30 pointer-events-none"></div>
            
            {/* La Pinta (The border gap indicating suit) */}
            {card.suit === Suit.Oros && <div className="absolute inset-x-0 top-0 h-1 bg-white" style={{left:'30%', right:'30%'}}></div>} {/* No gap for Oros usually, or full line */}
            {card.suit === Suit.Copas && <div className="absolute inset-x-0 top-0 h-1 flex justify-between px-2"><div className="w-2 h-1 bg-white"></div></div>} {/* 1 gap */}
            {card.suit === Suit.Espadas && <div className="absolute inset-x-0 top-0 h-1 flex justify-between px-2"><div className="w-2 h-1 bg-white"></div><div className="w-2 h-1 bg-white"></div></div>} {/* 2 gaps */}
            {card.suit === Suit.Bastos && <div className="absolute inset-x-0 top-0 h-1 flex justify-between px-2"><div className="w-2 h-1 bg-white"></div><div className="w-2 h-1 bg-white"></div><div className="w-2 h-1 bg-white"></div></div>} {/* 3 gaps */}

        </div>
    );
};
