
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
}

export const Table: React.FC<TableProps> = ({ player, cpu, onPlayCard, onCardClick, selectedCardId, phase, vira }) => {

    const getStatusInfo = () => {
        switch(phase) {
            case GamePhase.PlayerTurn: 
                return { text: "TU TURNO", color: "bg-green-600 border-green-400 text-white shadow-green-500/50" };
            case GamePhase.CpuTurn: 
                return { text: "TURNO RIVAL", color: "bg-red-800 border-red-600 text-red-100 shadow-red-500/50" };
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

    return (
        <div className="relative w-full h-full flex md:flex-col items-center justify-between py-2 md:py-4 overflow-hidden">
            
            {/* CPU Label - Top Center */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 mt-1 md:mt-2 z-20 flex items-center space-x-2 md:space-x-3 px-3 py-1 md:px-4 md:py-1.5 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 ${phase === GamePhase.CpuTurn ? 'bg-red-900/90 ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] scale-105' : 'bg-black/40 shadow-lg'}`}>
                <div className="relative">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center text-white font-bold border-2 border-white/20 shadow-inner text-xs md:text-sm">
                        CPU
                    </div>
                    {phase === GamePhase.CpuTurn && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2 md:h-3 md:w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-full w-full bg-yellow-500"></span>
                        </span>
                    )}
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-white font-medium text-xs md:text-sm drop-shadow-md tracking-wide">{cpu.name}</span>
                    {cpu.isHand && <span className="text-yellow-400 text-[8px] md:text-[10px] font-bold uppercase tracking-wider mt-0.5">Es Mano</span>}
                </div>
            </div>

            {/* CPU Cards Area 
                Mobile: Absolute Top Left, Scaled Down
                Desktop: Relative Top Center, Normal Size
            */}
            <div className={`
                absolute top-12 -left-4 scale-[0.85] origin-top-left
                md:relative md:top-auto md:left-auto md:mt-14 md:scale-100 md:origin-center
                flex flex-col items-center space-y-2 transition-all duration-500 z-10
                ${phase === GamePhase.PlayerTurn ? 'opacity-60 md:scale-95' : 'opacity-100'}
            `}>
                <div className="flex space-x-[-1rem]">
                    {cpu.hand.map((card, idx) => (
                        <div key={card.id} style={{ transform: `rotate(${(idx - 1) * 5}deg)` }}>
                            <Card card={card} hidden={phase !== GamePhase.GameOver} /> 
                        </div>
                    ))}
                </div>
            </div>

            {/* Center Play Area */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 
                 {/* LA VIRA (La Muestra) - Left Middle */}
                 {vira && (
                    <div className="absolute left-1 top-1/2 transform -translate-y-1/2 flex flex-col items-center opacity-90 animate-in fade-in zoom-in duration-700 z-0 pointer-events-none">
                        <div className="text-yellow-200 font-bold text-[8px] md:text-[10px] lg:text-xs mb-1 tracking-widest uppercase text-shadow">La Vira</div>
                        <div className="transform rotate-90 shadow-2xl border-2 border-yellow-500/50 rounded-lg">
                            <Card card={vira} small className="scale-90 md:scale-110 lg:scale-125 origin-center" />
                        </div>
                    </div>
                 )}

                 {/* Status Indicator - Right Middle */}
                 <div className="absolute right-1 top-1/2 transform -translate-y-1/2 z-20 flex flex-col items-end">
                    {status.text && (
                        <div className={`flex items-center px-3 py-2 md:px-4 md:py-3 rounded-xl font-bold tracking-widest shadow-2xl border-2 backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-10 ${status.color} max-w-[100px] md:max-w-[140px] lg:max-w-none text-center text-[10px] md:text-xs lg:text-sm`}>
                            {phase === GamePhase.CpuTurn && <Loader2 className="animate-spin mr-1 md:mr-2 shrink-0" size={14} />}
                            {status.text}
                        </div>
                    )}
                 </div>

                 {/* Played Cards Drop Zone - CENTER */}
                 <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center z-10">
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-16 md:-translate-y-24 flex space-x-2 md:space-x-4">
                        {cpu.playedCards.map((card, i) => (
                            card ? <div key={`cpu-played-${i}`} className="animate-in fade-in zoom-in duration-300 shadow-xl transform rotate-3"><Card card={card} /></div> : null
                        ))}
                     </div>
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-4 md:translate-y-4 flex space-x-2 md:space-x-4">
                        {player.playedCards.map((card, i) => (
                            card ? <div key={`pl-played-${i}`} className="animate-in fade-in zoom-in duration-300 shadow-xl transform -rotate-3"><Card card={card} /></div> : null
                        ))}
                     </div>
                 </div>
            </div>

            {/* Player Area 
                Mobile: Absolute Bottom Right, Scaled Down
                Desktop: Relative Bottom Center, Normal Size
            */}
            <div className={`
                absolute bottom-20 -right-2 scale-[0.85] origin-bottom-right
                md:relative md:bottom-auto md:right-auto md:mb-4 md:scale-100 md:origin-center
                flex flex-col items-center space-y-2 md:space-y-4 transition-all duration-500 z-30
                ${phase === GamePhase.CpuTurn ? 'opacity-80 md:scale-95' : 'opacity-100'}
            `}>
                 <div className="flex space-x-2 md:space-x-4 pr-4 md:pr-0">
                    {player.hand.map((card, idx) => (
                        <div key={card.id} 
                             className={`transform transition-transform duration-300 ${selectedCardId === card.id ? '' : 'hover:-translate-y-2 md:hover:-translate-y-4'} ${player.playedCards.length === cpu.playedCards.length || (player.isHand && player.playedCards.length === cpu.playedCards.length) ? '' : ''}`}
                             style={{ transform: `translateY(${idx%2===0 ? '0px' : '4px'}) rotate(${(idx - 1) * 3}deg)` }}
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
                
                {/* Player Label */}
                <div className={`flex items-center space-x-2 md:space-x-3 px-3 py-1 md:px-4 md:py-1.5 rounded-full backdrop-blur-sm transition-all duration-300 mr-8 md:mr-0 ${phase === GamePhase.PlayerTurn ? 'bg-green-900/80 ring-2 ring-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-black/30'}`}>
                   <div className="relative">
                       <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-white/20 shadow-inner text-xs md:text-sm">
                            YO
                       </div>
                        {phase === GamePhase.PlayerTurn && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2 md:h-3 md:w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-full w-full bg-green-500"></span>
                            </span>
                       )}
                   </div>
                   <div className="flex flex-col leading-none">
                       <span className="text-white font-medium text-xs md:text-sm drop-shadow-md">{player.name}</span>
                       {player.isHand && <span className="text-yellow-400 text-[8px] md:text-[10px] font-bold uppercase tracking-wider mt-0.5">Es Mano</span>}
                   </div>
                </div>
            </div>
            
        </div>
    );
};
