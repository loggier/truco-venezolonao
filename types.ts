
export enum Suit {
    Espadas = 'Espadas',
    Bastos = 'Bastos',
    Oros = 'Oros',
    Copas = 'Copas'
}

export interface CardData {
    id: number;
    value: number;
    suit: Suit;
    power: number;
    isPieza?: boolean; // Perico or Perica
}

export enum GamePhase {
    Dealing,
    PlayerTurn,
    CpuTurn,
    RoundResolution,
    HandResolution,
    GameOver,
    WaitingForResponse // New phase for interruptions
}

export enum CallType {
    None = 'None',
    Envido = 'Envido', 
    RealEnvido = 'Real Envido', 
    FaltaEnvido = 'Falta Envido',
    Flor = 'Flor', // New
    ContraFlor = 'Contra Flor', // New
    Truco = 'Truco',
    Retruco = 'Retruco',
    ValeNueve = 'Vale Nueve', 
    ValeJuego = 'Vale Juego'  
}

export interface PlayerState {
    name: string;
    hand: CardData[];
    playedCards: (CardData | null)[];
    points: number;
    isHand: boolean;
    hasFlor: boolean; // New: pre-calculated at deal
    florPoints: number; // New
}

export interface ResponseRequest {
    type: 'envido' | 'truco' | 'flor';
    call: CallType;
    pointsAtStake: number;
    caller: 'player' | 'cpu';
}

export interface GameState {
    phase: GamePhase;
    player: PlayerState;
    cpu: PlayerState;
    roundWinners: ( 'player' | 'cpu' | 'draw' | null )[];
    
    trucoLevel: number; 
    trucoCaller: 'player' | 'cpu' | null;
    
    // Unified chanting state
    chantState: {
        called: boolean;
        finished: boolean;
        points: number;
        type: CallType;
    };
    
    messages: string[];
}
