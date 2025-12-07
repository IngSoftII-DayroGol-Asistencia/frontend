import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useState } from "react";
import { combinations } from "../components/assets/CardDeck";
import Hand from "../components/assets/Hand";

export function NotFound() {

    const [gameDeck, setGameDeck] = useState(combinations);
    const [playerHand, setPlayerHand] = useState<Array<{suit: string; rank: string}>>([]);
    const [dealerHand, setDealerHand] = useState<Array<{suit: string; rank: string}>>([]);
    const [gameOver, setGameOver] = useState(false);
    const [result, setResult] = useState({ type: "", message: "" });
    const [newGame, setNewGame] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [dealerCardHidden, setDealerCardHidden] = useState(true);
    const [chips, setChips] = useState(1000);
    const [bet, setBet] = useState(0);
    const [bettingPhase, setBettingPhase] = useState(true);


    const betMore = (amount: number) => {
        setChips(chips - amount);
        setBet(bet + amount);
    }

    const betLess = (amount: number) => {
        setChips(chips + amount);
        setBet(bet - amount);
    }

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
        const newHand = [...dealerHand];
        let dealerValue = calculateHandValue(newHand);
        const userHand = calculateHandValue(playerHand);
        
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

    const calculateHandValue = (hand: Array<{suit: string; rank: string}>) => {
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
    <div className="min-h-screen w-full relative overflow-auto bg-gray-100 dark:bg-gray-950">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-blue-600/30 dark:via-purple-600/30 dark:to-pink-600/30" />
      
      {/* Floating orbs for visual interest */}
      <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="fixed top-1/2 right-1/3 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />

      <div className="relative text-center space-y-6 p-8 max-w-4xl mx-auto">
        {/* Número 404 grande */}
        <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
          404
        </h1>
        
        {/* Título */}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Página no encontrada
        </h2>
        
        {/* BlackJack */}
        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-2xl py-10 px-10">
            <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                Blackjack Compensatorio
            </h2>
            
            {/* Mostrar fichas */}
            <div className="inline-block bg-gradient-to-r from-yellow-500 to-amber-500 text-purple-700 text-xl font-bold px-6 py-2 rounded-full mb-4 shadow-lg pb-10">
                Fichas: {chips}
            </div>
            
            {/* Fase de apuestas */}
            {bettingPhase && (
                <div className="flex flex-col items-center gap-4 pt-4">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-300 dark:border-gray-600">
                        <p className="text-gray-800 dark:text-gray-200 text-xl font-semibold">Apuesta actual: <span className="text-green-600 dark:text-green-400">${bet}</span></p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">(Mínimo: $50)</p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <Button 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg px-4 py-2 rounded-xl shadow-lg"
                            disabled={chips < 10}
                            onClick={() => betMore(10)}
                        >
                            +$10
                        </Button>
                        <Button 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg px-4 py-2 rounded-xl shadow-lg"
                            disabled={chips < 50}
                            onClick={() => betMore(50)}
                        >
                            +$50
                        </Button>
                        <Button 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg px-4 py-2 rounded-xl shadow-lg"
                            disabled={chips < 100}
                            onClick={() => betMore(100)}
                        >
                            +$100
                        </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <Button 
                            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white text-lg px-4 py-2 rounded-xl shadow-lg"
                            disabled={bet < 10}
                            onClick={() => betLess(10)}
                        >
                            -$10
                        </Button>
                        <Button 
                            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white text-lg px-4 py-2 rounded-xl shadow-lg"
                            disabled={bet < 50}
                            onClick={() => betLess(50)}
                        >
                            -$50
                        </Button>
                        <Button 
                            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white text-lg px-4 py-2 rounded-xl shadow-lg"
                            disabled={bet < 100}
                            onClick={() => betLess(100)}
                        >
                            -$100
                        </Button>
                    </div>
                    <Button 
                        className={`${bet >= 50 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' 
                            : 'bg-gray-400 cursor-not-allowed'} text-white text-xl px-8 py-3 mt-4 rounded-xl shadow-lg font-bold`}
                        disabled={bet < 50}
                        onClick={confirmBet}
                    >
                        {bet >= 50 ? `¡Jugar! (Apuesta: $${bet})` : 'Apuesta mínima: $50'}
                    </Button>
                </div>
            )}

            {/* Juego */}
            {!bettingPhase && gameStarted && (
                <>
                    {/* Mostrar apuesta actual */}
                    <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold px-4 py-1 rounded-full mb-4">
                        Apuesta: ${bet}
                    </div>
                    
                    {newGame && (
                        <div className={`${result.type === "win" 
                            ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                            : result.type === "loss" 
                            ? "bg-gradient-to-r from-red-500 to-rose-500" 
                            : "bg-gradient-to-r from-yellow-500 to-amber-500"} 
                            text-white p-4 rounded-xl mb-4 font-bold text-center shadow-lg`}>
                            <h3 className="text-2xl">{result.type === "win" ? "🎉" : result.type === "loss" ? "😢" : "🤝"} {result.message}</h3>
                        </div>
                    )}
                    <div className="flex justify-center gap-3 mt-4">
                        {!newGame ? (
                            <>
                                <Button 
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg px-8 py-3 rounded-xl shadow-lg font-bold" 
                                    onClick={dealCardToPlayer}
                                >
                                    🃏 Hit
                                </Button>
                                <Button 
                                    className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white text-lg px-8 py-3 rounded-xl shadow-lg font-bold" 
                                    onClick={playerStand}
                                >
                                    Stand
                                </Button>
                            </>
                        ) : (
                            <Button 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg px-8 py-3 rounded-xl shadow-lg font-bold" 
                                onClick={resetGame}
                            >
                                Nueva Partida
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-6">
                        <div className="bg-emerald-700 dark:bg-emerald-800 rounded-xl p-4 border-4 border-emerald-900 shadow-xl">
                            <Hand cards={playerHand} handValue={calculateHandValue(playerHand)} title="👤 Jugador" />
                        </div>
                        <div className="bg-emerald-700 dark:bg-emerald-800 rounded-xl p-4 border-4 border-emerald-900 shadow-xl">
                            <Hand 
                                cards={dealerHand} 
                                handValue={calculateHandValue(dealerHand)} 
                                hideFirstCard={dealerCardHidden}
                                title="Dealer"
                            />
                        </div>
                    </div>
                </>
            )}
        </div>

      </div>
    </div>
  );
}