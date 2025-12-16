
import React from 'react';
import { Card } from './Card';
import { PlayerState, GamePhase, CardData } from '../types';
import { Loader2 } from 'lucide-react';

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
                return { text: "TU TURNO", color: "bg-green-600 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.6)]" };
            case GamePhase.CpuTurn: 
                return { text: "TURNO RIVAL", color: "bg-red-800 border-red-600 text-red-100 shadow-[0_0_20px_rgba(220,38,38,0.6)]" };
            case GamePhase.WaitingForResponse: 
                return { text: "ESPERANDO...", color: "bg-yellow-600 border-yellow-400 text-yellow-100" };
            case GamePhase.RoundResolution: 
                return { text: "RESOLVIENDO...", color: "bg-blue-600 border-blue-400 text-blue-100" };
            case GamePhase.Dealing: 
                return { text: "BARAJANDO...", color: "bg-gray-700 border-gray-500 text-gray-300" };
            case GamePhase.GameOver:
                return { text: "FIN DEL JUEGO", color: "bg-purple-700 border-purple-500 text-white" };
            default: 
                return { text: "", color: "opacity-0" };
        }
    };

    const status = getStatusInfo();

    // Fake Deck generator for visual stack
    const renderDeckStack = () => (
        <div className="relative w-12 h-20 md:w-16 md:h-24">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="absolute inset-0 bg-blue-900 border border-gray-400 rounded-lg shadow-sm" 
                     style={{ transform: `translate(-${i*2}px, -${i*2}px)`, zIndex: i }}></div>
            ))}
             <div className="absolute inset-0 bg-blue-900 rounded-lg border-2 border-gray-200 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] shadow-md" style={{ transform: 'translate(-6px, -6px)', zIndex: 10 }}></div>
        </div>
    );

    // Render a single played card with position based on state
    const renderPlayedCard = (card: CardData | null, index: number, isCpu: boolean) => {
        if (!card) return null;

        // Check if this card belongs to a completed round (History)
        const isHistory = roundWinners[index] !== null;

        let style: React.CSSProperties = {};

        if (isHistory) {
            // HISTORY POSITION (Moved to LEFT side near deck to avoid hands on right)
            style = {
                top: '55%',
                left: '12%', // Near the deck/vira
                marginTop: isCpu ? `-${25 + index * 3}px` : `${25 + index * 3}px`,
                transform: `
                    translateY(-50%)
                    rotate(${isCpu ? Math.random() * 15 - 5 : Math.random() * 15 - 10}deg) 
                    scale(0.55)
                `,
                zIndex: index // Lower z-index for older cards
            };
        } else {
            // ACTIVE POSITION (Center Stage - The Ring)
            // Stays strictly in the middle
            style = {
                top: '50%',
                left: '50%',
                transform: `
                    translate(-50%, -50%) 
                    translateY(${isCpu ? '-65px' : '65px'}) 
                    rotate(${Math.random() * 4 - 2}deg) 
                    scale(1)
                `,
                zIndex: 50 + index // Higher z-index for active cards
            };
            
            // Mobile adjustments for active cards to ensure they are visible above/below center
            if (window.innerWidth < 768) {
                 style.transform = `
                    translate(-50%, -50%) 
                    translateY(${isCpu ? '-45px' : '45px'}) 
                    rotate(${Math.random() * 4 - 2}deg) 
                    scale(0.9)
                `;
            }
        }

        return (
            <div key={`${isCpu ? 'c' : 'p'}-${index}`} 
                 className="absolute transition-all duration-700 ease-in-out shadow-xl"
                 style={style}>
                <Card card={card} hidden={card.isCovered} />
            </div>
        );
    };

    return (
        <div className="relative w-full h-full overflow-hidden perspective-1000">
            
            {/* --- CPU SECTION --- */}
            
            {/* CPU Hand Area - Absolute Top Positioning */}
            <div className={`
                absolute z-30 transition-all duration-500 flex flex-col items-center
                /* Mobile: Top Right Corner */
                top-[-10px] right-[-15px] origin-top-right scale-[0.65]
                /* Desktop: Top Center */
                md:top-[-10px] md:right-auto md:left-1/2 md:-translate-x-1/2 md:origin-top md:scale-90
                
                ${phase === GamePhase.PlayerTurn ? 'opacity-70 blur-[0.5px]' : 'opacity-100'}
            `}>
                {/* CPU Label - Mobile Only (Above Hand) */}
                <div className={`
                    flex md:hidden items-center space-x-2 px-2 py-0.5 mb-1 rounded-full backdrop-blur-md border border-white/10 
                    ${phase === GamePhase.CpuTurn ? 'bg-red-900/80 ring-1 ring-red-500' : 'bg-black/30'}
                `}>
                     <div className="w-4 h-4 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-[8px]">CPU</div>
                     <span className="text-white text-[9px] font-bold">{cpu.name}</span>
                </div>

                <div className="flex justify-center -space-x-8 md:-space-x-12">
                    {cpu.hand.map((card, idx) => (
                        <div key={card.id} 
                             className="transform transition-transform duration-500"
                             style={{ 
                                 // Fan layout
                                 transform: `translateY(${idx % 2 === 0 ? '5px' : '0'}) rotate(${(idx - 1) * 8}deg)`,
                                 zIndex: idx 
                             }}>
                            <Card card={card} hidden={phase !== GamePhase.GameOver} /> 
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Desktop CPU Label (Separate from hand to position nicely) */}
            <div className={`hidden md:flex absolute top-4 left-1/2 -translate-x-1/2 z-20 items-center space-x-3 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 ${phase === GamePhase.CpuTurn ? 'bg-red-900/90 ring-2 ring-red-500 scale-105' : 'bg-black/40'}`}>
                <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center text-white font-bold border-2 border-white/20 text-xs">CPU</div>
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-white font-medium text-xs drop-shadow-md tracking-wide">{cpu.name}</span>
                    {cpu.isHand && <span className="text-yellow-400 text-[9px] font-bold uppercase tracking-wider mt-0.5">Es Mano</span>}
                </div>
            </div>


            {/* --- CENTER PLAY AREA --- */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none perspective-1000">
                 
                 {/* DECK & VIRA (Left Side) */}
                 <div className="absolute left-2 md:left-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center z-0 pointer-events-auto">
                    <div className="relative group scale-75 md:scale-100">
                         {/* Vira tucking under the deck */}
                         {vira && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 rotate-90 ml-8 md:ml-10 transition-transform duration-700 hover:ml-12 hover:rotate-[100deg]">
                                <Card card={vira} small className="shadow-2xl" />
                            </div>
                         )}
                         {/* The Deck Stack */}
                         <div className="relative z-10 shadow-2xl">
                             {renderDeckStack()}
                         </div>
                    </div>
                 </div>

                 {/* PLAYED CARDS CONTAINER */}
                 <div className="absolute inset-0 z-10 transform-style-3d">
                     {[0, 1, 2].map(rIdx => (
                         <React.Fragment key={rIdx}>
                             {renderPlayedCard(cpu.playedCards[rIdx] || null, rIdx, true)}
                             {renderPlayedCard(player.playedCards[rIdx] || null, rIdx, false)}
                         </React.Fragment>
                     ))}
                 </div>

                 {/* Status Indicator */}
                 <div className="absolute right-auto left-1/2 md:right-32 md:left-auto top-1/2 transform -translate-x-1/2 -translate-y-1/2 md:translate-x-0 z-20 flex flex-col items-center pointer-events-none">
                     {/* Spacer to avoid direct center overlap */}
                     <div className="h-24 w-1"></div>
                    {status.text && (
                        <div className={`flex items-center px-3 py-1.5 rounded-xl font-bold tracking-widest shadow-2xl border-2 backdrop-blur-md transition-all duration-300 animate-in zoom-in fade-in ${status.color} text-[9px] md:text-sm whitespace-nowrap`}>
                            {phase === GamePhase.CpuTurn && <Loader2 className="animate-spin mr-2 shrink-0" size={14} />}
                            {status.text}
                        </div>
                    )}
                 </div>
            </div>


            {/* --- PLAYER SECTION --- */}

            {/* Player Hand Area - Absolute Bottom Positioning */}
            <div className={`
                absolute z-30 transition-all duration-500 flex flex-col items-center
                /* Mobile: Bottom Right Corner */
                bottom-[-10px] right-[-15px] origin-bottom-right scale-[0.70]
                /* Desktop: Bottom Center (Very low to avoid covering center) */
                md:bottom-[-20px] md:right-auto md:left-1/2 md:-translate-x-1/2 md:origin-bottom md:scale-90
                
                ${phase === GamePhase.CpuTurn ? 'opacity-80 grayscale-[0.3]' : 'opacity-100'}
            `}>
                
                 <div className="flex justify-center -space-x-4 md:-space-x-6 pb-2 perspective-1000">
                    {player.hand.map((card, idx) => (
                        <div key={card.id} 
                             className={`transform transition-all duration-300 ease-out hover:z-50 hover:scale-110 
                                ${selectedCardId === card.id ? 'z-40 -translate-y-4 md:-translate-y-6' : 'z-auto'}
                             `}
                             style={{ 
                                 transformOrigin: 'bottom center',
                                 // Simple fan
                                 transform: `rotate(${(idx - 1) * 6}deg) translateY(${idx%2===1 ? '-3px' : '0'})`,
                                 zIndex: idx + 10
                             }}
                        >
                            <Card 
                                card={card} 
                                playable={phase === GamePhase.PlayerTurn} 
                                isSelected={selectedCardId === card.id}
                                onClick={() => onCardClick(card.id)}
                                onDoubleClick={() => onPlayCard(card.id)}
                            />
                        </div>
                    ))}
                </div>
                
                {/* Player Label - Mobile Only (Below Hand) */}
                 <div className={`
                    flex md:hidden items-center space-x-2 px-2 py-0.5 mt-1 mr-6 rounded-full backdrop-blur-md border border-white/10 
                    ${phase === GamePhase.PlayerTurn ? 'bg-green-900/80 ring-1 ring-green-500' : 'bg-black/30'}
                `}>
                     <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-[8px]">YO</div>
                     <span className="text-white text-[9px] font-bold">{player.name}</span>
                </div>
            </div>
            
            {/* Desktop Player Label (Separate from hand, sits just above action bar) */}
            <div className={`hidden md:flex absolute bottom-24 left-1/2 -translate-x-1/2 z-20 items-center space-x-3 px-5 py-1.5 rounded-full backdrop-blur-md transition-all duration-300 ${phase === GamePhase.PlayerTurn ? 'bg-green-900/90 ring-2 ring-green-500 scale-105' : 'bg-black/50 border border-white/10'}`}>
               <div className="relative">
                   <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-white/20 text-xs">YO</div>
               </div>
               <div className="flex flex-col leading-none">
                   <span className="text-white font-medium text-sm drop-shadow-md tracking-wide">{player.name}</span>
                   {player.isHand && <span className="text-yellow-400 text-[9px] font-bold uppercase tracking-wider mt-0.5">Es Mano</span>}
               </div>
            </div>
            
        </div>
    );
};
