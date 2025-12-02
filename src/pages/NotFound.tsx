import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import { combinations } from "../components/assets/CardDeck";
import Hand from "../components/assets/Hand";

export function NotFound() {

    const [gameDeck, setGameDeck] = useState(combinations);
    const [playerHand, setPlayerHand] = useState<{suit: string; rank: string}[]>([]);
    const [dealerHand, setDealerHand] = useState<{suit: string; rank: string}[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [result, setResult] = useState({ type: "", message: "" });
    const [newGame, setNewGame] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [dealerCardHidden, setDealerCardHidden] = useState(true);
    const [chips, setChips] = useState(1000);
    const [bet, setBet] = useState(0);
    const [bettingPhase, setBettingPhase] = useState(true);

    // Ejecutar createPreference cuando las fichas lleguen a 0
    useEffect(() => {
        if (chips <= 0) {
            createPreference();
        }
    }, [chips]);

    const betMore = (amount: number) => {
        setChips(chips - amount);
        setBet(bet + amount);
    }

    const betLess = (amount: number) => {
        setChips(chips + amount);
        setBet(bet - amount);
    }

    const createPreference = async () => {
        
    };

    const getRandomCardFromDeck = () => {
        const randomIndex = Math.floor(Math.random() * gameDeck.length);
        const card = gameDeck[randomIndex];
        setGameDeck((prevDeck) => prevDeck.filter((_, index) => index !== randomIndex));
        return card;
    }

    const dealCardToPlayer = () => {
        const card = getRandomCardFromDeck();
        const newHand = [...playerHand, card];
        setPlayerHand(newHand);
        const handValue = calculateHandValue(newHand);
        if (handValue > 21) {
            handleGameOver({type: "loss", message: "You busted!"});
        } else if (handValue === 21) {
            handleGameOver({type: "win", message: "Blackjack!"});
        }
    }

    const playerStand = () => {
        setDealerCardHidden(false); 
        setGameOver(true);
        let newHand = [...dealerHand];
        let dealerValue = calculateHandValue(newHand);
        let userHand = calculateHandValue(playerHand);
        
        while (dealerValue < 17) {
            const card = getRandomCardFromDeck();
            newHand.push(card);
            dealerValue = calculateHandValue(newHand);
            setDealerHand([...newHand]);
        }
        
        if (dealerValue > 21) {
            handleGameOver({type: "win", message: "¡El dealer se pasó! Ganaste!"});
        } else if (dealerValue > userHand) {
            handleGameOver({type: "loss", message: "El dealer gana!"});
        } else if (dealerValue === userHand) {
            handleGameOver({type: "draw", message: "¡Empate!"});
        } else {
            handleGameOver({type: "win", message: "¡Ganaste!"});
        }
    }

    const calculateHandValue = (hand: {suit: string; rank: string}[]) => {
        let value = 0;
        let aceCount = 0;
        hand.forEach((card) => {
            if (["J", "Q", "K"].includes(card.rank)) {
                value += 10;
            } else if (card.rank === "A") {
                value += 11;
                aceCount += 1;
            } else {
                value += parseInt(card.rank);
            }
        });
        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount -= 1;
        }
        return value;
    }

    const dealCardToDealer = () => {
        const card = getRandomCardFromDeck();
        setDealerHand((prevHand) => [...prevHand, card]);
    }

    const handleGameOver = (result: {type: string; message: string}) => {
        setGameOver(true);
        setResult(result);
        setNewGame(true);
        setDealerCardHidden(false);
        switch (result.type) {
            case "win":
               setChips(chips + (bet *2)); 
            break;
            case "draw":
                setChips(chips + bet);
                break;
            default:
                break;
        }
    };

    const resetGame = () => {
        setPlayerHand([]);
        setDealerHand([]);
        setGameDeck(combinations);
        setGameOver(false);
        setResult({ type: "", message: "" });
        setNewGame(false);
        setDealerCardHidden(true);
        setGameStarted(false);
        setBet(0);
        setBettingPhase(true);
    }

    const confirmBet = () => {
        if (bet >= 50) {
            setBettingPhase(false);
            startGame();
        }
    }

    const startGame = () => {
        let currentDeck = [...combinations];
        
        const drawCard = () => {
            const randomIndex = Math.floor(Math.random() * currentDeck.length);
            const card = currentDeck[randomIndex];
            currentDeck = currentDeck.filter((_, index) => index !== randomIndex);
            return card;
        };

        const playerCard1 = drawCard();
        const playerCard2 = drawCard();
        
        const dealerCard1 = drawCard();
        const dealerCard2 = drawCard();

        setPlayerHand([playerCard1, playerCard2]);
        setDealerHand([dealerCard1, dealerCard2]);
        setGameDeck(currentDeck);
        setGameStarted(true);
        setDealerCardHidden(true);

        const playerValue = calculateHandValue([playerCard1, playerCard2]);
        if (playerValue === 21) {
            setDealerCardHidden(false);
            setBet(bet + (bet *0.5))
            handleGameOver({type: "win", message: "¡Blackjack!"});

        }
    }

    return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/30 dark:to-purple-950/30 overflow-auto">
      <div className="text-center space-y-6 p-8 max-w-4xl mx-auto">
        {/* Número 404 grande */}
        <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
          404
        </h1>
        
        {/* Título */}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Página no encontrada
        </h2>
        
        {/* BlackJack */}
        <div className="p-4 bg-slate-700 rounded-xl">
            <h2 className="text-4xl text-center mb-4 text-white">Blackjack compensatorio</h2>
            
            {/* Mostrar fichas */}
            <div className="text-black text-xl mb-4">Fichas: {chips}</div>
            
            {/* Fase de apuestas */}
            {bettingPhase && (
                <div className="flex flex-col items-center gap-4">
                    <p className="text-white text-xl">Apuesta actual: ${bet}</p>
                    <p className="text-gray-300 text-sm">(Mínimo: 50)</p>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <Button 
                            style={{ backgroundColor: '#eab308', color: 'black' }}
                            className="hover:opacity-80 text-lg px-4 py-2"
                            onClick={() => betMore(10)}
                            disabled={chips < 10}
                        >
                            +10
                        </Button>
                        <Button 
                            style={{ backgroundColor: '#eab308', color: 'black' }}
                            className="hover:opacity-80 text-lg px-4 py-2"
                            onClick={() => betMore(50)}
                            disabled={chips < 50}
                        >
                            +50
                        </Button>
                        <Button 
                            style={{ backgroundColor: '#eab308', color: 'black' }}
                            className="hover:opacity-80 text-lg px-4 py-2"
                            onClick={() => betMore(100)}
                            disabled={chips < 100}
                        >
                            +100
                        </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <Button 
                            style={{ backgroundColor: '#6b7280', color: 'white' }}
                            className="hover:opacity-80 text-lg px-4 py-2"
                            onClick={() => betLess(10)}
                            disabled={bet < 10}
                        >
                            -10
                        </Button>
                        <Button 
                            style={{ backgroundColor: '#6b7280', color: 'white' }}
                            className="hover:opacity-80 text-lg px-4 py-2"
                            onClick={() => betLess(50)}
                            disabled={bet < 50}
                        >
                            -50
                        </Button>
                        <Button 
                            style={{ backgroundColor: '#6b7280', color: 'white' }}
                            className="hover:opacity-80 text-lg px-4 py-2"
                            onClick={() => betLess(100)}
                            disabled={bet < 100}
                        >
                            -100
                        </Button>
                    </div>
                    <Button 
                        style={{ backgroundColor: bet >= 50 ? '#16a34a' : '#4b5563', color: 'white' }}
                        className="hover:opacity-80 text-xl px-8 py-3 mt-4"
                        onClick={confirmBet}
                        disabled={bet < 50}
                    >
                        {bet >= 50 ? `¡Jugar! (Apuesta: ${bet})` : 'Apuesta mínima: 50'}
                    </Button>
                </div>
            )}

            {/* Juego */}
            {!bettingPhase && gameStarted && (
                <>
                    {/* Mostrar apuesta actual */}
                    <div className="text-yellow-400 text-lg mb-2">Apuesta: ${bet}</div>
                    
                    {newGame && (
                        <div className={`text-white ${result.type === "win" ? "bg-green-500" : result.type === "loss" ? "bg-red-500" : "bg-yellow-500"} 
                        p-4 rounded mb-4 font-bold text-center`}>
                            <h3 className="text-2xl text-center mb-4">{result.message}</h3>
                        </div>
                    )}
                    <div className="flex justify-center gap-2 mt-4">
                        {!newGame ? (
                            <>
                                <Button 
                                    style={{ backgroundColor: '#2563eb', color: 'white' }}
                                    className="hover:opacity-80 text-lg px-6 py-2" 
                                    onClick={dealCardToPlayer}
                                >
                                    Hit
                                </Button>
                                <Button 
                                    style={{ backgroundColor: '#dc2626', color: 'white' }}
                                    className="hover:opacity-80 text-lg px-6 py-2" 
                                    onClick={playerStand}
                                >
                                    Stand
                                </Button>
                            </>
                        ) : (
                            <Button 
                                style={{ backgroundColor: '#16a34a', color: 'white' }}
                                className="hover:opacity-80 text-lg px-6 py-2" 
                                onClick={resetGame}
                            >
                                Nueva Partida
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-4">
                        <Hand cards={playerHand} title="Jugador" handValue={calculateHandValue(playerHand)} />
                        <Hand 
                            cards={dealerHand} 
                            title="Dealer" 
                            handValue={calculateHandValue(dealerHand)}
                            hideFirstCard={dealerCardHidden}
                        />
                    </div>
                </>
            )}
        </div>

      </div>
    </div>
  );
}