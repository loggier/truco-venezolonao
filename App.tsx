
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Table } from './components/Table';
import { ScoreBoard } from './components/ScoreBoard';
import { StatsModal } from './components/StatsModal';
import { createDeck, WIN_SCORE } from './constants';
import { determineWinner, calculateEnvidoPoints, calculateFlorPoints, checkHasFlor, shuffleDeck, calculateVenecoPower } from './services/trucoLogic';
import { speak, playCardSound, playShuffleSound } from './services/soundService';
import { getStats, updateGameStats } from './services/storageService';
import { GamePhase, PlayerState, CardData, CallType, Suit, ResponseRequest, GameStats } from './types';
import { AlertTriangle, Info, Hand, HelpCircle, X, PlayCircle, Flower2, Trophy, Ghost, Swords, Ban, BarChart2 } from 'lucide-react';

const INITIAL_PLAYER: PlayerState = { name: "Jugador", hand: [], playedCards: [], points: 0, isHand: true, hasFlor: false, florPoints: 0 };
const INITIAL_CPU: PlayerState = { name: "Computadora", hand: [], playedCards: [], points: 0, isHand: false, hasFlor: false, florPoints: 0 };

// --- CONFETTI COMPONENT ---
const Confetti: React.FC = () => {
    // Generate static particles for performance
    const particles = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100 + '%',
        bg: ['#FFD700', '#FF0000', '#00FF00', '#0000FF', '#FFFFFF'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 2 + 's',
        duration: (Math.random() * 3 + 2) + 's'
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[100]">
            {particles.map(p => (
                <div 
                    key={p.id}
                    className="absolute w-3 h-3 rounded-sm opacity-80 animate-fall"
                    style={{
                        left: p.left,
                        backgroundColor: p.bg,
                        top: '-10px',
                        animationDelay: p.delay,
                        animationDuration: p.duration
                    }}
                />
            ))}
            <style>{`
                @keyframes fall {
                    0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
                }
                .animate-fall { animation-name: fall; animation-timing-function: linear; animation-iteration-count: infinite; }
            `}</style>
        </div>
    );
};

// --- PHRASES BANK ---
const PHRASES = {
    bluffSuccess: [
        "¡Jajaja, te corrí con un cuatro!",
        "Puro ruido compadre.",
        "Te asustaste muy rápido.",
        "¡Era mentira chico!",
        "Cayó la paloma."
    ],
    caughtBluffing: [
        "Ay mamá...",
        "Bueno, a ver qué traes.",
        "Se me cayó la cédula.",
        "Upa, te pusiste bravo.",
        "Ya va, déjame ver bien las cartas."
    ],
    singingBluff: [
        "¡TRUCO! Y no estoy jugando.",
        "¡Envido! Agárrate duro que voy.",
        "¡Falta Envido! A ver si eres guapo.",
        "¡TRUCO! Cuidado que muerdo."
    ],
    raising: [
        "¡Quiero y te la parto en dos!",
        "¡Quiero y Envido!",
        "¿Ah sí? ¡Entonces Retruco!",
        "¡No te tengo miedo, Vale Nueve!",
        "¡Si eres guapo, Vale Juego pues!"
    ],
    winning: [
        "Esto es pan comido.",
        "¿Vas a seguir jugando así?",
        "Soy la máquina de ganar."
    ],
    fold: [
        "Barajeamos de nuevo.",
        "Nada en esta mano, chamo.",
        "No pego una hoy.",
        "Creo que ni suerte tengo.",
        "Me voy, no llevo vida.",
        "Vámonos pa' la otra.",
        "Esta mano está podrida."
    ]
};

const getRandomPhrase = (list: string[]) => list[Math.floor(Math.random() * list.length)];

const App: React.FC = () => {
    // --- State ---
    const [deck, setDeck] = useState<CardData[]>([]);
    const [vira, setVira] = useState<CardData | null>(null); 
    
    const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER);
    const [cpu, setCpu] = useState<PlayerState>(INITIAL_CPU);
    const [phase, setPhase] = useState<GamePhase>(GamePhase.Dealing);
    const [showHelp, setShowHelp] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [stats, setStats] = useState<GameStats>(getStats());
    
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
    
    const [roundWinners, setRoundWinners] = useState<( 'player' | 'cpu' | 'draw' | null )[]>([null, null, null]);
    const [trucoLevel, setTrucoLevel] = useState(0); 
    const [lastTrucoCaller, setLastTrucoCaller] = useState<'player' | 'cpu' | null>(null);
    
    const [chantState, setChantState] = useState<{ called: boolean, finished: boolean, points: number, type: CallType }>({ 
        called: false, finished: false, points: 0, type: CallType.None 
    });

    const [pendingResponse, setPendingResponse] = useState<ResponseRequest | null>(null);
    const [lastActionMessage, setLastActionMessage] = useState<string>("");
    const [cpuThinking, setCpuThinking] = useState(false);
    const [lastCpuBluff, setLastCpuBluff] = useState(false); 
    
    const playerRef = useRef(player);
    const cpuRef = useRef(cpu);
    const viraRef = useRef(vira);
    
    useEffect(() => { 
        playerRef.current = player; 
        cpuRef.current = cpu; 
        viraRef.current = vira;
    }, [player, cpu, vira]);

    const addMessage = (msg: string) => {
        setLastActionMessage(msg);
        setTimeout(() => setLastActionMessage(""), 3000); 
    };

    // --- Core Cycle ---

    const startNewHand = useCallback(() => {
        if (playerRef.current.points >= WIN_SCORE || cpuRef.current.points >= WIN_SCORE) return;

        setPhase(GamePhase.Dealing);
        playShuffleSound();
        addMessage("Barajando...");

        setTimeout(() => {
            let newDeck = shuffleDeck(createDeck());
            
            const viraCard = newDeck[newDeck.length - 1];
            setVira(viraCard);
            
            newDeck = newDeck.map(card => {
                const { power, isPieza } = calculateVenecoPower(card, viraCard.suit);
                return { ...card, power, isPieza, isCovered: false };
            });

            const pHand = newDeck.slice(0, 3);
            const cHand = newDeck.slice(3, 6);
            
            const pIsHand = !playerRef.current.isHand; 

            const pHasFlor = checkHasFlor(pHand, viraCard.suit);
            const pFlorPts = calculateFlorPoints(pHand, viraCard.suit);
            const cHasFlor = checkHasFlor(cHand, viraCard.suit);
            const cFlorPts = calculateFlorPoints(cHand, viraCard.suit);

            setPlayer(p => ({ ...p, hand: pHand, playedCards: [], isHand: pIsHand, hasFlor: pHasFlor, florPoints: pFlorPts }));
            setCpu(c => ({ ...c, hand: cHand, playedCards: [], isHand: !pIsHand, hasFlor: cHasFlor, florPoints: cFlorPts }));
            setDeck(newDeck);
            
            setRoundWinners([null, null, null]);
            setTrucoLevel(0);
            setLastTrucoCaller(null);
            setChantState({ called: false, finished: false, points: 0, type: CallType.None });
            setPendingResponse(null);
            setSelectedCardId(null);
            setLastCpuBluff(false);
            
            setPhase(pIsHand ? GamePhase.PlayerTurn : GamePhase.CpuTurn);
            addMessage(pIsHand ? "Tu turno (Eres Mano)" : "Turno CPU (Es Mano)");
        }, 2000); 

    }, []);

    useEffect(() => {
        startNewHand();
        setStats(getStats());
    }, []);

    // Game Over & Stats Update Logic
    useEffect(() => {
        if (phase === GamePhase.GameOver) return; // Prevent loop

        if (player.points >= WIN_SCORE) {
            setPhase(GamePhase.GameOver);
            addMessage("¡GANASTE EL PARTIDO!");
            speak("¡Ganaste el partido! Bien jugado chamo.", false);
            
            // Update Stats
            const newStats = updateGameStats(true, player.points);
            setStats(newStats);
            setTimeout(() => setShowStats(true), 1500); // Auto show stats on win

        } else if (cpu.points >= WIN_SCORE) {
            setPhase(GamePhase.GameOver);
            addMessage("¡LA CPU GANÓ EL PARTIDO!");
            speak("Ja ja ja, gané el partido. Más suerte la próxima.", true);
            
            // Update Stats
            const newStats = updateGameStats(false, player.points);
            setStats(newStats);
            setTimeout(() => setShowStats(true), 1500);
        }
    }, [player.points, cpu.points]);

    // --- Card Playing Logic ---

    const playCard = (who: 'player' | 'cpu', cardId: number, isCovered: boolean = false) => {
        const actor = who === 'player' ? player : cpu;
        const card = actor.hand.find(c => c.id === cardId);
        if (!card) return;

        playCardSound();

        const newHand = actor.hand.filter(c => c.id !== cardId);
        const playedCard = { ...card, isCovered }; 
        const newPlayed = [...actor.playedCards, playedCard];

        if (who === 'player') {
            setPlayer(p => ({ ...p, hand: newHand, playedCards: newPlayed }));
            setSelectedCardId(null);
            if (cpu.playedCards.length === newPlayed.length) setPhase(GamePhase.RoundResolution);
            else setPhase(GamePhase.CpuTurn);
        } else {
            setCpu(c => ({ ...c, hand: newHand, playedCards: newPlayed }));
            if (player.playedCards.length === newPlayed.length) setPhase(GamePhase.RoundResolution);
            else setPhase(GamePhase.PlayerTurn);
        }
    };

    // --- Round Resolution ---

    useEffect(() => {
        const pCount = player.playedCards.length;
        const cCount = cpu.playedCards.length;

        if (phase === GamePhase.RoundResolution) {
             if (pCount !== cCount) return; 
             
             const roundIdx = pCount - 1;
             if (roundWinners[roundIdx] !== null) return;

             const pCard = player.playedCards[roundIdx];
             const cCard = cpu.playedCards[roundIdx];
             if (!pCard || !cCard) return;

             setTimeout(() => {
                 const winner = determineWinner(pCard, cCard);
                 const newWinners = [...roundWinners];
                 newWinners[roundIdx] = winner;
                 setRoundWinners(newWinners);

                 let handWinner: 'player' | 'cpu' | null = null;
                 
                 const pWins = newWinners.filter(w => w === 'player').length;
                 const cWins = newWinners.filter(w => w === 'cpu').length;

                 if (pWins >= 2) handWinner = 'player';
                 else if (cWins >= 2) handWinner = 'cpu';
                 else {
                     const r1 = newWinners[0];
                     const r2 = newWinners[1];
                     const r3 = newWinners[2];

                     if (r1 === 'draw') {
                         if (r2 !== null && r2 !== 'draw') handWinner = r2; 
                         else if (r2 === 'draw' && r3 !== null) {
                             if (r3 !== 'draw') handWinner = r3; 
                             else handWinner = player.isHand ? 'player' : 'cpu'; 
                         }
                     } else if (r1 !== null) {
                         if (r2 === 'draw') handWinner = r1; 
                         else if (r2 !== null && r3 === 'draw') handWinner = r1;
                     }
                 }

                 if (handWinner) {
                     let ptsToAdd = trucoLevel === 0 ? 1 : trucoLevel;
                     
                     if (trucoLevel >= WIN_SCORE) {
                         const currentScore = handWinner === 'player' ? player.points : cpu.points;
                         ptsToAdd = WIN_SCORE - currentScore; 
                     }

                     addMessage(handWinner === 'player' ? `¡Ganaste esta mano! (+${ptsToAdd})` : `Perdiste esta mano. (+${ptsToAdd})`);
                     
                     if (handWinner === 'player') setPlayer(p => ({...p, points: Math.min(WIN_SCORE, p.points + ptsToAdd)}));
                     else setCpu(c => ({...c, points: Math.min(WIN_SCORE, c.points + ptsToAdd)}));
                     
                     setTimeout(startNewHand, 2500);
                 } else {
                     let nextTurn = GamePhase.PlayerTurn;
                     if (winner === 'cpu') nextTurn = GamePhase.CpuTurn;
                     else if (winner === 'player') nextTurn = GamePhase.PlayerTurn;
                     else {
                         nextTurn = player.isHand ? GamePhase.PlayerTurn : GamePhase.CpuTurn;
                     }
                     setPhase(nextTurn);
                 }

             }, 1200);
        }
        else if (phase === GamePhase.CpuTurn && !pendingResponse) {
            if (!cpuThinking) {
                setCpuThinking(true);
                setTimeout(cpuPlayTurn, 1500);
            }
        }
    }, [player.playedCards, cpu.playedCards, phase, roundWinners, cpuThinking, pendingResponse]);


    // --- AI Logic ---

    useEffect(() => {
        if (phase === GamePhase.WaitingForResponse && pendingResponse && pendingResponse.caller === 'player') {
            const timer = setTimeout(() => {
                cpuEvaluateRequest(pendingResponse);
            }, 1500 + Math.random() * 1000); 
            return () => clearTimeout(timer);
        }
    }, [phase, pendingResponse]);

    const cpuPlayTurn = () => {
        setCpuThinking(false);
        if (phase !== GamePhase.CpuTurn) return;
        
        const bluffChance = Math.random();
        const scoreDiff = cpu.points - player.points;
        const isDesperate = scoreDiff < -5;

        if (player.playedCards.length === 0 && cpu.playedCards.length === 0 && !chantState.called && !chantState.finished) {
            if (cpu.hasFlor) {
                triggerRequest('cpu', 'flor', CallType.Flor, 3);
                return;
            }
            if (viraRef.current) {
                const myPoints = calculateEnvidoPoints(cpu.hand, viraRef.current.suit);
                const goodPoints = myPoints >= 26;
                const fakeEnvido = !goodPoints && (bluffChance > 0.8 || (isDesperate && bluffChance > 0.6));

                if (goodPoints || fakeEnvido) {
                    if (fakeEnvido) {
                         setLastCpuBluff(true);
                         speak(getRandomPhrase(PHRASES.singingBluff), true);
                    }
                    triggerRequest('cpu', 'envido', CallType.Envido, 2);
                    return;
                }
            }
        }

        if (trucoLevel === 0) {
            const hasGood = hasGoodCards(cpu.hand);
            const fakeTruco = !hasGood && (bluffChance > 0.85 || (isDesperate && bluffChance > 0.7));

            if (hasGood || fakeTruco) {
                 if (fakeTruco) {
                     setLastCpuBluff(true);
                     speak(getRandomPhrase(PHRASES.singingBluff), true);
                 }
                 triggerRequest('cpu', 'truco', CallType.Truco, 3);
                 return;
            }
        }
        
        const bestCard = selectBestCard(cpu.hand, player.playedCards, cpu.playedCards);
        playCard('cpu', bestCard.id, false);
    };

    const hasGoodCards = (hand: CardData[]) => {
        return hand.some(c => c.power >= 80);
    };

    const selectBestCard = (hand: CardData[], pPlayed: (CardData|null)[], cPlayed: (CardData|null)[]) => {
        const round = pPlayed.length;
        const sorted = [...hand].sort((a,b) => a.power - b.power); 
        
        if (pPlayed.length === cPlayed.length) {
            return sorted[0]; 
        }

        const pCard = pPlayed[round];
        if (pCard) {
            // Check if player played "Covered"
            if (pCard.isCovered) return sorted[0]; // Any card beats -1, play lowest

            const winners = sorted.filter(c => c.power > pCard.power);
            if (winners.length > 0) return winners[0]; 
            return sorted[0]; 
        }
        return sorted[0];
    };

    // --- Interaction System ---

    const triggerRequest = (who: 'player' | 'cpu', type: 'envido' | 'truco' | 'flor', call: CallType, points: number) => {
        setPendingResponse({ caller: who, type, call, pointsAtStake: points });
        setSelectedCardId(null); 
        setPhase(GamePhase.WaitingForResponse);

        const isCpu = who === 'cpu';
        if (isCpu && lastCpuBluff) {
        } else {
            if (call === CallType.Truco) speak("¡Truco!", isCpu);
            else if (call === CallType.Retruco) speak("¡Retruco!", isCpu);
            else if (call === CallType.ValeNueve) speak("¡Vale Nueve!", isCpu);
            else if (call === CallType.ValeJuego) speak("¡Vale Juego, Partido!", isCpu);
            else if (call === CallType.Envido) speak("¡Envido!", isCpu);
            else if (call === CallType.Flor) speak("¡Flor!", isCpu);
        }
    };

    const cpuEvaluateRequest = (request: ResponseRequest) => {
        const { type, call, pointsAtStake } = request;
        const myCards = cpuRef.current.hand;
        
        const bluffChance = Math.random();
        setLastCpuBluff(false); 

        if (type === 'flor') {
            if (cpuRef.current.hasFlor) {
                 handleResponse(true, false, CallType.None); 
            } else {
                 handleResponse(false);
            }
        }
        else if (type === 'envido') {
             if (cpuRef.current.hasFlor) {
                  handleResponse(false, true, CallType.Flor);
                  return;
             }

             if (viraRef.current) {
                const myPoints = calculateEnvidoPoints(myCards, viraRef.current.suit);
                
                if (pointsAtStake >= 4 && myPoints >= 31) {
                     if (pointsAtStake < WIN_SCORE) {
                         handleResponse(false, true, CallType.ValeJuego);
                         speak("¡Quiero y Vale Juego!", true);
                         return;
                     }
                }

                if (pointsAtStake === 2 && myPoints >= 28) {
                    handleResponse(false, true, CallType.Envido);
                    speak("¡Quiero y Envido!", true);
                    return;
                }
                
                if (myPoints >= 26) { handleResponse(true); return; }
                
                if (bluffChance > 0.9) {
                     setLastCpuBluff(true);
                     if (pointsAtStake === 2) {
                        handleResponse(false, true, CallType.Envido);
                        speak("¡Quiero y Envido! (Mentira)", true);
                     } else {
                         handleResponse(false);
                     }
                     return;
                }

                handleResponse(false);
             }
        } 
        else {
            const matas = myCards.filter(c => c.power >= 80).length;
            const decent = myCards.filter(c => c.power >= 50).length;
            
            let confidence = 0;
            if (matas >= 2) confidence = 3;
            else if (matas === 1 && decent >= 1) confidence = 2;
            else if (matas === 1) confidence = 1;

            let accept = false;
            let raise = false;
            let fakeRaise = false;

            if (confidence >= 1) accept = true;
            if (call === CallType.Retruco && confidence < 2) accept = false;
            if (call === CallType.ValeNueve && confidence < 2) accept = false;
            if (call === CallType.ValeJuego && confidence < 3) accept = false;

            if (confidence >= 2 && Math.random() > 0.4) raise = true;
            if (confidence >= 3) raise = true;

            if (confidence === 0 && bluffChance > 0.85) { raise = true; fakeRaise = true; }

            if (raise) {
                let nextCall = CallType.None;
                if (call === CallType.Truco) { nextCall = CallType.Retruco; }
                else if (call === CallType.Retruco) { nextCall = CallType.ValeNueve; }
                else if (call === CallType.ValeNueve) { nextCall = CallType.ValeJuego; }

                if (nextCall !== CallType.None) {
                    if (fakeRaise) setLastCpuBluff(true);
                    handleResponse(false, true, nextCall);
                }
                else handleResponse(accept);
            } else {
                handleResponse(accept);
            }
        }
    };

    const handleResponse = (accept: boolean, isRaise: boolean = false, raiseCall: CallType = CallType.None) => {
        if (!pendingResponse) return;
        const { caller, type, call, pointsAtStake } = pendingResponse;
        const responder = caller === 'player' ? 'cpu' : 'player';
        const isResponderCpu = responder === 'cpu';

        if (caller === 'cpu' && isResponderCpu === false) { 
             if (lastCpuBluff) {
                 if (accept) {
                     speak(getRandomPhrase(PHRASES.caughtBluffing), true);
                 } else {
                     speak(getRandomPhrase(PHRASES.bluffSuccess), true);
                 }
             }
        }

        if (isRaise) {
            let newPoints = 0;
            if (raiseCall === CallType.Flor) {
                 newPoints = 3;
                 addMessage(`${isResponderCpu ? 'CPU' : 'YO'}: ¡Flor mata Envido!`);
                 triggerRequest(responder, 'flor', CallType.Flor, 3);
                 return;
            }

            if (type === 'envido') {
                 if (raiseCall === CallType.Envido) newPoints = 4;
                 else if (raiseCall === CallType.ValeJuego) newPoints = WIN_SCORE;
                 else newPoints = pointsAtStake + 2; 
            } else {
                if (raiseCall === CallType.Retruco) newPoints = 6;
                else if (raiseCall === CallType.ValeNueve) newPoints = 9;
                else if (raiseCall === CallType.ValeJuego) newPoints = WIN_SCORE; // VALE JUEGO: Max points
            }

            if (isResponderCpu) {
                speak(getRandomPhrase(PHRASES.raising), true);
            } else {
                if (raiseCall === CallType.Envido) speak("¡Quiero y Envido!", false);
                else if (raiseCall === CallType.ValeJuego) speak("¡Quiero y Vale Juego!", false);
                else if (raiseCall === CallType.Retruco) speak("¡Quiero y Retruco!", false);
                else if (raiseCall === CallType.ValeNueve) speak("¡Quiero y Vale Nueve!", false);
            }

            if (!lastCpuBluff) { 
                 addMessage(`${isResponderCpu ? 'CPU' : 'YO'}: ¡${raiseCall.replace('Vale', '').toUpperCase()}!`);
            }
            triggerRequest(responder, type, raiseCall, newPoints);
            return;
        }

        if (accept) {
            if (type === 'flor') {
                 speak("Con mi flor quiero", isResponderCpu);
                 addMessage(`${isResponderCpu ? 'CPU' : 'YO'}: CON FLOR QUIERO`);
                 
                 const pPts = playerRef.current.florPoints;
                 const cPts = cpuRef.current.florPoints;
                 let winner = '';
                 
                 if (pPts >= cPts) {
                      if (pPts === cPts) winner = playerRef.current.isHand ? 'player' : 'cpu';
                      else winner = 'player';
                 } else {
                     winner = 'cpu';
                 }
                 
                 const msg = `Flor: YO ${pPts} - CPU ${cPts}. Gana ${winner==='player'?'Jugador':'CPU'}`;
                 addMessage(msg);
                 speak(winner === 'player' ? `${pPts} son mejores.` : `${cPts} son mejores.`, isResponderCpu);

                 if (winner === 'player') setPlayer(p => ({...p, points: Math.min(WIN_SCORE, p.points + 3)})); 
                 else setCpu(c => ({...c, points: Math.min(WIN_SCORE, c.points + 3)}));

                 setChantState({ called: true, finished: true, points: 3, type: CallType.Flor });
            } 
            else if (type === 'envido') {
                speak("Quiero", isResponderCpu);
                addMessage(`${isResponderCpu ? 'CPU' : 'YO'}: QUIERO`);
                
                if (viraRef.current) {
                    const pPoints = calculateEnvidoPoints(playerRef.current.hand, viraRef.current.suit); 
                    const cPoints = calculateEnvidoPoints(cpuRef.current.hand, viraRef.current.suit);
                    
                    let winPoints = pointsAtStake;
                    
                    // Logic for Vale Juego in Envido (Rare but possible: "Falta Envido")
                    if (pointsAtStake >= WIN_SCORE) {
                        // Calculate remainder
                        const leaderScore = Math.max(playerRef.current.points, cpuRef.current.points);
                        winPoints = WIN_SCORE - leaderScore;
                    }

                    let winner = '';
                    if (pPoints >= cPoints) {
                        if (pPoints === cPoints) winner = playerRef.current.isHand ? 'player' : 'cpu';
                        else winner = 'player';
                    } else {
                        winner = 'cpu';
                    }

                    const msg = `Envido: YO ${pPoints} - CPU ${cPoints}. Gana ${winner === 'player' ? 'Jugador' : 'CPU'}`;
                    addMessage(msg);
                    speak(winner === 'player' ? `${pPoints} son mejores.` : `${cPoints} son mejores.`, isResponderCpu);

                    if (winner === 'player') setPlayer(p => ({...p, points: Math.min(WIN_SCORE, p.points + winPoints)}));
                    else setCpu(c => ({...c, points: Math.min(WIN_SCORE, c.points + winPoints)}));
                    
                    setChantState({ called: true, finished: true, points: winPoints, type: call });
                }
            } else {
                if (!isResponderCpu || !lastCpuBluff) speak("Quiero", isResponderCpu);
                addMessage(`${isResponderCpu ? 'CPU' : 'YO'}: QUIERO`);
                setTrucoLevel(pointsAtStake);
                setLastTrucoCaller(caller);
            }
        } else {
            // REJECTED
            if (type === 'flor') {
                speak("Es buena", isResponderCpu);
                addMessage(`${isResponderCpu ? 'CPU' : 'YO'}: ES BUENA (NO TENGO FLOR)`);
                if (caller === 'player') setPlayer(p => ({...p, points: Math.min(WIN_SCORE, p.points + 3)}));
                else setCpu(c => ({...c, points: Math.min(WIN_SCORE, c.points + 3)}));
                setChantState({ called: true, finished: true, points: 3, type: CallType.Flor });
            }
            else {
                speak("No quiero", isResponderCpu);
                addMessage(`${isResponderCpu ? 'CPU' : 'YO'}: NO QUIERO`);
                
                let rejectPoints = 1;
                if (type === 'envido') {
                    if (pointsAtStake === 4) rejectPoints = 2; 
                    else if (pointsAtStake > 4) rejectPoints = 4; // Falta envido rejected is usually points accumulated or 1
                    else rejectPoints = 1; 
                }
                else if (type === 'truco') {
                    if (call === CallType.Retruco) rejectPoints = 3;
                    else if (call === CallType.ValeNueve) rejectPoints = 6;
                    else if (call === CallType.ValeJuego) rejectPoints = 9; // Rejecting Vale Juego gives previous level (9) or game rules
                    else rejectPoints = 1;
                }
                
                const winnerIsCaller = caller === 'player';
                if (winnerIsCaller) setPlayer(p => ({...p, points: Math.min(WIN_SCORE, p.points + rejectPoints)}));
                else setCpu(c => ({...c, points: Math.min(WIN_SCORE, c.points + rejectPoints)}));

                if (type === 'envido') {
                    setChantState({ called: true, finished: true, points: 0, type: CallType.None });
                } else {
                    startNewHand();
                    return; 
                }
            }
        }

        setPendingResponse(null);
        const pCards = playerRef.current.playedCards.length;
        const cCards = cpuRef.current.playedCards.length;
        if (pCards === cCards) setPhase(playerRef.current.isHand ? GamePhase.PlayerTurn : GamePhase.CpuTurn);
        else setPhase(pCards < cCards ? GamePhase.PlayerTurn : GamePhase.CpuTurn);
    };

    const handleHumanPlay = (cardId: number, asCovered: boolean = false) => {
        if (phase !== GamePhase.PlayerTurn) return;
        if (pendingResponse) { addMessage("¡Responde primero!"); return; }
        playCard('player', cardId, asCovered);
    };

    const handleCardClick = (cardId: number) => {
        if (phase !== GamePhase.PlayerTurn) { addMessage("Espera tu turno"); return; }
        if (pendingResponse) { addMessage("¡Responde primero!"); return; }
        // Toggle selection
        if (selectedCardId === cardId) setSelectedCardId(null);
        else setSelectedCardId(cardId);
    };

    const userCalls = (type: 'envido' | 'truco' | 'flor', call: CallType) => {
        let pts = 0;
        if (call === CallType.Envido) pts = 2;
        if (call === CallType.Flor) pts = 3;
        if (call === CallType.Truco) pts = 3; 
        if (call === CallType.Retruco) pts = 6;
        if (call === CallType.ValeNueve) pts = 9;
        if (call === CallType.ValeJuego) pts = WIN_SCORE;
        triggerRequest('player', type, call, pts);
    };

    // --- Dynamic Controls (HUD moved to Bottom Right) ---
    const renderActionControls = () => {
        if (phase === GamePhase.GameOver) {
            return ( <button onClick={() => window.location.reload()} className="px-6 py-3 md:px-8 md:py-4 bg-yellow-600 text-white font-bold text-lg md:text-xl rounded-full shadow-2xl animate-bounce pointer-events-auto">JUGAR OTRA VEZ</button> );
        }

        // --- RESPONSE MODE (Responding to CPU) ---
        if (pendingResponse && pendingResponse.caller === 'cpu') {
            const { type, call } = pendingResponse;
            const isFlor = type === 'flor';
            
            return (
                <div className="flex flex-col items-end gap-2 bg-black/80 p-3 md:p-4 rounded-xl border-l-4 border-red-500 shadow-2xl animate-in slide-in-from-right-10 pointer-events-auto max-w-[280px] md:max-w-sm">
                    <div className="text-white font-bold mb-1 flex items-center justify-end text-sm md:text-base animate-pulse text-yellow-400 text-right">
                         CPU CANTA: {call.replace('Vale', '').toUpperCase()} <AlertTriangle className="ml-2" size={18}/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 w-full">
                        {isFlor ? (
                            <>
                                {player.hasFlor && <button onClick={() => handleResponse(true)} className="btn-hud bg-pink-600 col-span-2">QUIERO CON FLOR</button>}
                                <button onClick={() => handleResponse(false)} className="btn-hud bg-gray-600 col-span-2">ES BUENA (NO TENGO)</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => handleResponse(true)} className="btn-hud bg-green-600 hover:bg-green-500 ring-1 ring-green-400">QUIERO</button>
                                <button onClick={() => handleResponse(false)} className="btn-hud bg-red-600 hover:bg-red-500 ring-1 ring-red-400">NO QUIERO</button>
                                
                                {type === 'envido' && player.hasFlor && (
                                     <button onClick={() => handleResponse(false, true, CallType.Flor)} className="btn-hud bg-pink-600 animate-pulse col-span-2">¡TENGO FLOR!</button>
                                )}

                                {type === 'truco' && (
                                    <>
                                        {call === CallType.Truco && <button onClick={() => handleResponse(false, true, CallType.Retruco)} className="btn-hud bg-orange-700 col-span-2">RETRUCO</button>}
                                        {call === CallType.Retruco && <button onClick={() => handleResponse(false, true, CallType.ValeNueve)} className="btn-hud bg-orange-800 col-span-2">VALE 9</button>}
                                        {call === CallType.ValeNueve && <button onClick={() => handleResponse(false, true, CallType.ValeJuego)} className="btn-hud bg-purple-800 col-span-2">PARTIDO</button>}
                                    </>
                                )}

                                {type === 'envido' && (
                                    <>
                                        {call === CallType.Envido && pendingResponse.pointsAtStake === 2 && (
                                             <button onClick={() => handleResponse(false, true, CallType.Envido)} className="btn-hud bg-green-700 col-span-2">ENVIDO (+2)</button>
                                        )}
                                        {pendingResponse.pointsAtStake >= 4 && call !== CallType.ValeJuego && (
                                            <button onClick={() => handleResponse(false, true, CallType.ValeJuego)} className="btn-hud bg-purple-800 col-span-2">VALE JUEGO</button>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            );
        }

        // --- ACTION MODE (Player Turn) ---
        if (phase === GamePhase.PlayerTurn && !pendingResponse) {
            const isFirstRound = player.playedCards.length === 0;
            const canSingChant = isFirstRound && !chantState.called && !chantState.finished;
            const canSingTruco = trucoLevel === 0;
            const canSingRetruco = trucoLevel === 3 && lastTrucoCaller === 'cpu';
            const canSingVale9 = trucoLevel === 6 && lastTrucoCaller === 'cpu';
            const canSingJuego = trucoLevel === 9 && lastTrucoCaller === 'cpu';

            return (
                <div className="flex flex-col items-end gap-3 pointer-events-auto">
                    
                    {/* Compact HUD Box */}
                    <div className="bg-black/70 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-xl flex flex-col gap-2 min-w-[140px]">
                        
                        {/* Truco Section */}
                        <div className="flex flex-col gap-1 w-full">
                             {canSingTruco && <button onClick={() => userCalls('truco', CallType.Truco)} className="btn-hud bg-orange-600 border-orange-400">TRUCO</button>}
                             {canSingRetruco && <button onClick={() => userCalls('truco', CallType.Retruco)} className="btn-hud bg-orange-700 border-orange-500">RETRUCO</button>}
                             {canSingVale9 && <button onClick={() => userCalls('truco', CallType.ValeNueve)} className="btn-hud bg-orange-800 border-orange-600">VALE 9</button>}
                             {canSingJuego && <button onClick={() => userCalls('truco', CallType.ValeJuego)} className="btn-hud bg-purple-900 border-purple-600">PARTIDO</button>}
                             
                             {!canSingTruco && !canSingRetruco && !canSingVale9 && !canSingJuego && (
                                 <div className="text-white/20 text-[10px] text-center uppercase font-bold py-1">Sin Truco</div>
                             )}
                        </div>

                        <div className="h-px bg-white/10 w-full"></div>

                        {/* Envido/Flor Section */}
                        <div className="flex flex-col gap-1 w-full">
                            {canSingChant && (
                                <>
                                    {player.hasFlor ? (
                                        <button onClick={() => userCalls('flor', CallType.Flor)} className="btn-hud bg-pink-700 border-pink-500 flex items-center justify-center"><Flower2 size={14} className="mr-1"/> FLOR</button>
                                    ) : (
                                        <button onClick={() => userCalls('envido', CallType.Envido)} className="btn-hud bg-green-700 border-green-500">ENVIDO</button>
                                    )}
                                </>
                            )}
                             {!canSingChant && <div className="text-white/20 text-[10px] text-center uppercase font-bold py-1">Sin Canto</div>}
                        </div>
                        
                        <div className="h-px bg-white/10 w-full"></div>

                        {/* Fold */}
                        <button onClick={() => { 
                                const phrase = getRandomPhrase(PHRASES.fold);
                                addMessage("ME FUI"); 
                                speak(phrase, false); 
                                setCpu(c => ({...c, points: Math.min(WIN_SCORE, c.points + (trucoLevel || 1))})); 
                                startNewHand(); 
                        }} className="btn-hud bg-red-900/40 hover:bg-red-800 text-red-200 border-red-800/30 w-full flex items-center justify-center gap-1">
                                <X size={14}/> ME VOY
                        </button>

                    </div>
                </div>
            );
        }
        return null;
    };

    // --- SEPARATE PLAY BUTTON (Center Screen) ---
    const renderPlayButton = () => {
         const canPlayCovered = player.playedCards.length < 2; 

         if (phase === GamePhase.PlayerTurn && !pendingResponse && selectedCardId !== null) {
             return (
                 <div className="absolute top-[-5rem] left-1/2 transform -translate-x-1/2 flex items-center gap-4 animate-in fade-in zoom-in pointer-events-auto z-50">
                     <button onClick={() => handleHumanPlay(selectedCardId, false)} className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-black py-2 px-6 md:px-8 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.6)] flex items-center text-base md:text-lg border-2 border-white transform hover:scale-105 transition-all whitespace-nowrap">
                        <PlayCircle className="mr-2" size={24} /> JUGAR CARTA
                     </button>
                     {canPlayCovered && (
                         <button onClick={() => handleHumanPlay(selectedCardId, true)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold p-3 rounded-full shadow-lg border border-gray-400" title="Jugar Tapada (Nula)">
                            <Ghost size={20} />
                         </button>
                     )}
                 </div>
             );
         }
         return null;
    }


    return (
        <div className="w-screen h-screen bg-neutral-900 overflow-hidden relative flex flex-col font-sans select-none">
            {phase === GamePhase.GameOver && player.points >= WIN_SCORE && <Confetti />}

            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-50 flex gap-2">
                <button onClick={() => setShowHelp(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-sm" title="Ayuda"><HelpCircle size={20} className="md:w-7 md:h-7" /></button>
                <button onClick={() => setShowStats(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-yellow-400 transition-all backdrop-blur-sm" title="Estadísticas"><BarChart2 size={20} className="md:w-7 md:h-7" /></button>
            </div>
            
            {/* Help Modal */}
            {showHelp && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#5d4037] border-4 border-yellow-600 rounded-lg max-w-lg w-full p-6 text-yellow-100 shadow-2xl relative">
                        <button onClick={() => setShowHelp(false)} className="absolute top-2 right-2 p-1 hover:bg-black/20 rounded-full"><X size={24} /></button>
                        <h2 className="text-xl md:text-2xl font-bold font-serif text-center mb-4 text-yellow-400">Truco Venezolano</h2>
                        <ul className="space-y-2 text-sm md:text-base">
                            <li><strong>Flor:</strong> Mata envido. Si tienes 3 del palo (o piezas).</li>
                            <li><strong>Perico (11 Vira):</strong> Pieza más alta.</li>
                            <li><strong>Perica (10 Vira):</strong> Segunda Pieza.</li>
                            <li><strong>Vale Juego (Partido):</strong> Se juega el resto de los puntos para ganar.</li>
                            <li><strong>Pasar (Nula):</strong> Juegas la carta boca abajo (tapada), valor 0.</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Stats Modal */}
            {showStats && <StatsModal stats={stats} onClose={() => setShowStats(false)} />}
            
            {/* Main Game Area */}
            <div className="absolute inset-2 md:inset-4 rounded-3xl felt-texture border-[8px] md:border-[16px] border-[#3e2723] shadow-[inset_0_0_100px_rgba(0,0,0,0.6)] flex flex-col z-0">
                <Table 
                    player={player} 
                    cpu={cpu} 
                    phase={phase} 
                    onPlayCard={handleHumanPlay}
                    onCardClick={handleCardClick}
                    selectedCardId={selectedCardId}
                    vira={vira}
                    roundWinners={roundWinners}
                />
            </div>

            <ScoreBoard playerScore={player.points} cpuScore={cpu.points} />

            {/* MESSAGE TOAST (Top Center) */}
            {lastActionMessage && (
                <div className="absolute top-[18%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none w-full flex justify-center px-4 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className={`
                        px-6 py-2 rounded-full text-sm md:text-xl font-bold border shadow-2xl text-center tracking-wider backdrop-blur-md
                        ${phase === GamePhase.GameOver 
                            ? (player.points >= WIN_SCORE ? 'bg-yellow-600/90 text-white border-white scale-110' : 'bg-red-800/90 text-white border-red-500') 
                            : 'bg-black/70 text-yellow-400 border-yellow-500/50'}
                    `}>
                        {phase === GamePhase.GameOver && player.points >= WIN_SCORE && <Trophy className="inline-block mr-2 text-yellow-200 mb-1" size={20} />}
                        {lastActionMessage}
                    </div>
                </div>
            )}

            {/* CENTER PLAY BUTTON CONTAINER */}
            <div className="absolute bottom-32 left-0 right-0 flex justify-center z-40 pointer-events-none">
                 {renderPlayButton()}
            </div>

            {/* BOTTOM RIGHT ACTIONS CONTAINER (Response & Chanting) */}
            <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-4 pointer-events-none">
                 {renderActionControls()}
            </div>
            
            <style>{`
                .btn-hud {
                    padding: 0.6rem 1rem;
                    border-radius: 0.5rem;
                    color: white;
                    font-weight: 800;
                    font-size: 0.75rem;
                    line-height: 1;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    transition: all 0.2s;
                    text-transform: uppercase;
                    border-width: 1px;
                }
                @media (min-width: 768px) {
                    .btn-hud {
                        font-size: 0.85rem;
                    }
                }
                .btn-hud:hover { filter: brightness(1.1); transform: translateX(-2px); }
                .btn-hud:active { transform: translateX(0); filter: brightness(0.9); }
            `}</style>
        </div>
    );
};

export default App;
