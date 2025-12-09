
import { CardData, Suit } from './types';

// Venezuelan Truco is typically played to 24 points
export const WIN_SCORE = 24;

export const createDeck = (): CardData[] => {
    const suits = [Suit.Espadas, Suit.Bastos, Suit.Oros, Suit.Copas];
    const values = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
    const deck: CardData[] = [];
    let id = 0;

    suits.forEach(suit => {
        values.forEach(value => {
            deck.push({
                id: id++,
                value,
                suit,
                power: 0 // Power is calculated dynamically per hand based on Vira
            });
        });
    });
    return deck;
};
