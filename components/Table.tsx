
import React from 'react';
import { Card } from './Card';
import { PlayerState, GamePhase, CardData } from '../types';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface TableProps {
    player: PlayerState;
    cpu: PlayerState;
    onPlayCard: (cardId: number) => void;
    onCardClick: (cardId: number) => void;
    selectedCardId: number | null;
    phase: GamePhase;
    vira: CardData | null;
    roundWinners: ( 'player' | 'cpu' | 'draw' | null )[];
}

export const Table: React.FC<TableProps> = ({ player, cpu, onPlayCard, onCardClick, selectedCardId, phase, vira, roundWinners }) => {

    const getStatusInfo = () => {
        switch(phase) {
            case GamePhase.PlayerTurn: 
                return { text: "TU TURNO", color: "text-green-400 border-green-500/50 bg-green-900/40" };
            case GamePhase.CpuTurn: 
                return { text: "PENSANDO...", color: "text-red-400 border-red-500/50 bg-red-900/40" };
            case GamePhase.Dealing: 
                return { text: "BARAJANDO", color: "text-gray-400 border-gray-500/50 bg-gray-900/40" };
            case GamePhase.GameOver:
                return { text: "FINALIZADO", color: "text-purple-400 border-purple-500/50 bg-purple-900/40" };
            default: 
                return { text: "", color: "opacity-0" };
        }
    };

    const status = getStatusInfo();

    // Fake Deck generator for visual stack
    const renderDeckStack = () => (
        <div className="relative w-14 h-20 md:w-24 md:h-36 transition-all">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="absolute inset-0 bg-blue-900 border border-gray-400 rounded-lg shadow-sm" 
                     style={{ transform: `translate(-${i*2}px, -${i*2}px)`, zIndex: i }}></div>
            ))}
             <div className="absolute inset-0 bg-blue-900 rounded-lg border-2 border-gray-200 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] shadow-md" style={{ transform: 'translate(-6px, -6px)', zIndex: 10 }}></div>
        </div>
    );

    // --- NEW: RENDER SLOT SYSTEM ---
    // Renders the 3 slots for the rounds
    const renderRoundSlots = () => {
        return (
            <div className="flex justify-center items-center gap-3 md:gap-16 z-10 w-full max-w-5xl px-4">
                {[0, 1, 2].map((roundIndex) => {
                    const cpuCard = cpu.playedCards[roundIndex] || null;
                    const playerCard = player.playedCards[roundIndex] || null;
                    const winner = roundWinners[roundIndex];

                    return (
                        <div key={roundIndex} className="relative w-20 h-48 md:w-32 md:h-80 flex flex-col items-center justify-center group">
                            
                            {/* Round Background / Outline (The "Mat") */}
                            <div className="absolute inset-0 border-2 border-dashed border-white/5 rounded-2xl bg-black/5 group-hover:bg-black/10 transition-colors flex flex-col items-center justify-center pointer-events-none">
                                {/* Round Number Watermark */}
                                <span className="text-white/5 font-serif text-5xl md:text-8xl font-bold select-none">{roundIndex + 1}</span>
                            </div>

                            {/* CPU Card Slot (Top) */}
                            <div className="absolute top-2 md:top-4 w-full flex justify-center h-[45%] items-start">
                                {cpuCard ? (
                                    <div className="animate-in slide-in-from-top-10 fade-in duration-500 z-20">
                                        <Card card={cpuCard} hidden={cpuCard.isCovered} small className="shadow-2xl" />
                                    </div>
                                ) : (
                                    <div className="w-11 h-16 md:w-24 md:h-36 border-2 border-dashed border-white/10 rounded-lg opacity-30 flex items-center justify-center">
                                        <span className="text-white/10 text-xs">CPU</span>
                                    </div>
                                )}
                            </div>

                            {/* Winner Indicator (Middle) */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-500 transform scale-75 md:scale-125">
                                {winner === 'player' && <CheckCircle2 className="text-green-500 bg-black rounded-full shadow-lg border border-green-900" size={24} />}
                                {winner === 'cpu' && <XCircle className="text-red-500 bg-black rounded-full shadow-lg border border-red-900" size={24} />}
                                {winner === 'draw' && <div className="w-4 h-4 md:w-6 md:h-6 bg-yellow-500 rounded-full border-2 border-black shadow-lg"></div>}
                            </div>

                            {/* Player Card Slot (Bottom) */}
                            <div className="absolute bottom-2 md:bottom-4 w-full flex justify-center h-[45%] items-end">
                                {playerCard ? (
                                    <div className="animate-in slide-in-from-bottom-10 fade-in duration-500 z-20">
                                        <Card card={playerCard} hidden={playerCard.isCovered} small className="shadow-2xl" />
                                    </div>
                                ) : (
                                    <div className="w-11 h-16 md:w-24 md:h-36 border-2 border-dashed border-white/10 rounded-lg opacity-30 flex items-center justify-center">
                                         <span className="text-white/10 text-xs">YO</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="relative w-full h-full overflow-hidden">
            
            {/* --- TOP BAR: CPU INFO & STATUS --- */}
            <div className="absolute top-0 left-0 right-0 flex justify-center items-start pt-3 z-30 pointer-events-none">
                <div className="flex items-center space-x-6">
                     {/* CPU Avatar */}
                     <div className={`
                        flex items-center space-x-3 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 transition-all duration-500
                        ${phase === GamePhase.CpuTurn ? 'bg-red-900/60 ring-2 ring-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-105' : 'bg-black/40'}
                     `}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white font-bold text-sm border-2 border-white/20 shadow-inner">CPU</div>
                        <div className="flex flex-col">
                             <span className="text-white text-sm font-bold tracking-wide drop-shadow-md">{cpu.name}</span>
                             {cpu.isHand && <span className="text-yellow-400 text-[10px] uppercase font-black tracking-widest">Es Mano</span>}
                        </div>
                     </div>

                     {/* Turn Status Pill */}
                     {status.text && (
                         <div className={`px-5 py-2 rounded-full border backdrop-blur-md flex items-center gap-2 ${status.color} transition-all duration-300 shadow-lg`}>
                             {phase === GamePhase.CpuTurn && <Loader2 className="animate-spin" size={14} />}
                             <span className="text-xs md:text-sm font-bold tracking-widest uppercase">{status.text}</span>
                         </div>
                     )}
                </div>
            </div>

            {/* --- CPU HAND (TOP LEFT FAN) --- */}
            {/* Moved from center top to top-left corner fan style */}
            <div className="absolute top-14 left-0 z-20 pointer-events-none opacity-90 pl-2">
                <div className="relative">
                    {cpu.hand.map((card, idx) => (
                        <div key={card.id} 
                             className="absolute top-0 left-0 transition-all duration-500 origin-top-left shadow-xl"
                             style={{ 
                                 transform: `rotate(${10 + (idx * 15)}deg) translate(${idx * 5}px, 0)`,
                                 zIndex: idx 
                             }}>
                            <Card card={card} hidden={phase !== GamePhase.GameOver} small /> 
                        </div>
                    ))}
                </div>
            </div>


            {/* --- CENTER TABLE (Battlefield) --- */}
            <div className="absolute inset-0 top-24 bottom-32 flex items-center justify-center pointer-events-none">
                 
                 {/* Left: Deck & Vira (Pushed a bit to center-left to avoid CPU hand overlap) */}
                 <div className="absolute left-2 md:left-16 lg:left-24 flex flex-col items-center opacity-100 pointer-events-auto transition-all duration-500 hover:scale-105 z-10">
                     <div className="relative group scale-75 md:scale-100 origin-left">
                         {vira && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 rotate-90 ml-12 md:ml-20 transition-transform duration-700 hover:ml-24 hover:rotate-[100deg] z-0">
                                <Card card={vira} small className="shadow-xl" />
                            </div>
                         )}
                         <div className="relative z-10">{renderDeckStack()}</div>
                     </div>
                 </div>

                 {/* Center: Played Cards Grid */}
                 {renderRoundSlots()}

            </div>


            {/* --- BOTTOM AREA: PLAYER --- */}
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end z-30 pointer-events-none">
                
                {/* Player Info Badge (Bottom Left floating) */}
                <div className="absolute bottom-32 md:bottom-6 left-2 md:left-6 flex items-center space-x-2 md:space-x-3 px-3 py-1.5 md:px-4 md:py-2 rounded-full backdrop-blur-md bg-black/60 border border-white/10 shadow-lg scale-75 md:scale-100 origin-bottom-left">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs md:text-sm border-2 border-white/20 shadow-inner">YO</div>
                    <div className="flex flex-col leading-none">
                        <span className="text-white text-xs md:text-sm font-bold tracking-wide drop-shadow">{player.name}</span>
                        {player.isHand && <span className="text-yellow-400 text-[8px] md:text-[10px] uppercase font-black tracking-widest mt-0.5">Es Mano</span>}
                    </div>
                </div>

                {/* Player Hand - Pushed to very bottom (pb-1) and scaled slightly on mobile */}
                <div className="pointer-events-auto flex justify-center -space-x-2 md:-space-x-8 pb-1 md:pb-4 perspective-1000 w-full overflow-visible">
                    {player.hand.map((card, idx) => (
                        <div key={card.id} 
                             className={`transform transition-all duration-300 ease-out hover:z-50 cursor-pointer
                                ${selectedCardId === card.id ? 'z-40 -translate-y-6 md:-translate-y-10 scale-105' : 'z-auto hover:-translate-y-4 md:hover:-translate-y-6 hover:scale-105'}
                             `}
                             style={{ 
                                 transformOrigin: 'bottom center',
                                 transform: selectedCardId === card.id ? undefined : `rotate(${(idx - 1) * 5}deg) translateY(${idx%2===1 ? '-4px' : '0'})`,
                                 zIndex: idx + 10
                             }}
                        >
                            <Card 
                                card={card} 
                                playable={phase === GamePhase.PlayerTurn} 
                                isSelected={selectedCardId === card.id}
                                onClick={() => onCardClick(card.id)}
                                onDoubleClick={() => onPlayCard(card.id)}
                                className="shadow-2xl"
                            />
                        </div>
                    ))}
                </div>
            </div>
            
        </div>
    );
};
