
import { CardData, Suit } from '../types';

export const shuffleDeck = (deck: CardData[]): CardData[] => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
};

// Venezuelan Power Calculation
export const calculateVenecoPower = (card: CardData, viraSuit: Suit): { power: number, isPieza: boolean } => {
    // 1. Check for Piezas (The Vira Effect)
    if (card.suit === viraSuit) {
        if (card.value === 11) return { power: 100, isPieza: true }; // Perico
        if (card.value === 10) return { power: 99, isPieza: true };  // Perica
    }

    // 2. Standard Hierarchy (Veneco Base)
    if (card.value === 1 && card.suit === Suit.Espadas) return { power: 90, isPieza: false };
    if (card.value === 1 && card.suit === Suit.Bastos) return { power: 89, isPieza: false };
    
    if (card.value === 7 && card.suit === Suit.Espadas) return { power: 80, isPieza: false };
    if (card.value === 7 && card.suit === Suit.Oros) return { power: 79, isPieza: false };
    
    if (card.value === 3) return { power: 70, isPieza: false };
    if (card.value === 2) return { power: 60, isPieza: false };
    if (card.value === 1) return { power: 50, isPieza: false }; // 1 Copas/Oros
    
    if (card.value === 12) return { power: 40, isPieza: false };
    if (card.value === 11) return { power: 35, isPieza: false }; // Non-Perico 11
    if (card.value === 10) return { power: 30, isPieza: false }; // Non-Perica 10
    
    if (card.value === 7) return { power: 20, isPieza: false }; // 7 Copas/Bastos
    if (card.value === 6) return { power: 10, isPieza: false };
    if (card.value === 5) return { power: 5, isPieza: false };
    if (card.value === 4) return { power: 0, isPieza: false };
    
    return { power: 0, isPieza: false };
};

// --- FLOR LOGIC ---

export const checkHasFlor = (hand: CardData[], viraSuit: Suit): boolean => {
    if (hand.length < 3) return false;

    // Separate Piezas from regular cards
    const piezas = hand.filter(c => c.isPieza);
    const nonPiezas = hand.filter(c => !c.isPieza);

    // Rule 1: If you have 2 or more Piezas (e.g., Perico + Perica), it is automatically Flor 
    // (combined with the 3rd card whatever it is).
    if (piezas.length >= 2) return true;

    // Rule 2: If you have 1 Pieza, the other 2 cards must be of the same suit.
    // The Pieza acts as a wildcard (comodín) to complete the trio.
    if (piezas.length === 1) {
        return nonPiezas[0].suit === nonPiezas[1].suit;
    }

    // Rule 3: If you have 0 Piezas, all 3 cards must be of the same suit.
    if (piezas.length === 0) {
        return (hand[0].suit === hand[1].suit && hand[1].suit === hand[2].suit);
    }

    return false;
};

export const calculateFlorPoints = (hand: CardData[], viraSuit: Suit): number => {
    // If not Flor, return 0
    if (!checkHasFlor(hand, viraSuit)) return 0;

    let total = 20;

    hand.forEach(card => {
        if (card.isPieza) {
            // Perico (11) worth 10 envido points (total 30 roughly in context)
            if (card.value === 11) total += 10; 
            // Perica (10) worth 9 envido points
            else if (card.value === 10) total += 9; 
        } else {
            // Standard Envido values (10, 11, 12 worth 0)
            if (card.value >= 10) total += 0;
            else total += card.value;
        }
    });

    return total;
};


// Helper for Envido (kept for legacy support, though checkHasFlor logic is now superior for Flors)
const getEffectiveSuit = (card: CardData, viraSuit: Suit): Suit => {
    if (card.isPieza) return viraSuit;
    return card.suit;
};

export const calculateEnvidoPoints = (cards: CardData[], viraSuit: Suit): number => {
    
    const bySuit: Record<string, number[]> = {
        [Suit.Espadas]: [],
        [Suit.Bastos]: [],
        [Suit.Oros]: [],
        [Suit.Copas]: []
    };

    cards.forEach(c => {
        let val = c.value >= 10 ? 0 : c.value;
        const effSuit = getEffectiveSuit(c, viraSuit);
        
        // Value mapping for Envido with Piezas
        if (c.isPieza) {
            if (c.value === 11) val = 10; 
            if (c.value === 10) val = 9;
        }
        
        bySuit[effSuit].push(val);
    });

    let maxPoints = 0;

    Object.values(bySuit).forEach(vals => {
        if (vals.length >= 2) {
            // Sort desc
            vals.sort((a, b) => b - a);
            // Take top 2
            let score = 20 + vals[0] + vals[1];
            if (score > maxPoints) maxPoints = score;
        } else if (vals.length === 1) {
            let score = vals[0];
            // Standalone single card values (rarely wins but needed logic)
            if (score === 10) score = 30; // Standalone Perico? (Debatable rule, usually Envido needs 2)
            if (score === 9) score = 29;
            
            if (score > maxPoints) maxPoints = score;
        }
    });
    
    return maxPoints;
};


export const determineWinner = (p1Card: CardData, p2Card: CardData): 'player' | 'cpu' | 'draw' => {
    if (p1Card.power > p2Card.power) return 'player';
    if (p2Card.power > p1Card.power) return 'cpu';
    return 'draw';
};
