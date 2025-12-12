import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useState } from "react";
import { combinations } from "../components/assets/CardDeck";
import Hand from "../components/assets/Hand";

export function NotFound() {

    const [gameDeck, setGameDeck] = useState(combinations);
    const [playerHand, setPlayerHand] = useState<Array<{ suit: string; rank: string }>>([]);
    const [dealerHand, setDealerHand] = useState<Array<{ suit: string; rank: string }>>([]);
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
            handleGameOver({ type: "loss", message: "You busted!" });
        } else if (handValue === 21) {
            handleGameOver({ type: "win", message: "Blackjack!" });
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
            handleGameOver({ type: "win", message: "¡El dealer se pasó! Ganaste!" });
        } else if (dealerValue > userHand) {
            handleGameOver({ type: "loss", message: "El dealer gana!" });
        } else if (dealerValue === userHand) {
            handleGameOver({ type: "draw", message: "¡Empate!" });
        } else {
            handleGameOver({ type: "win", message: "¡Ganaste!" });
        }
    }

    const calculateHandValue = (hand: Array<{ suit: string; rank: string }>) => {
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


    const handleGameOver = (result: { type: string; message: string }) => {
        setGameOver(true);
        setResult(result);
        setNewGame(true);
        setDealerCardHidden(false);
        switch (result.type) {
            case "win":
                setChips(chips + (bet * 2));
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
            setBet(bet + (bet * 0.5))
            handleGameOver({ type: "win", message: "¡Blackjack!" });

        }
    }

    return (
        <div className="h-screen overflow-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">

            {/* Background Effects */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full opacity-20 blur-3xl mix-blend-multiply filter animate-blob" />
                <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-500 rounded-full opacity-20 blur-3xl mix-blend-multiply filter animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full opacity-20 blur-3xl mix-blend-multiply filter animate-blob animation-delay-4000" />
            </div>

            <div className="relative text-center space-y-8 max-w-5xl mx-auto z-10 w-full">

                <div className="space-y-4">
                    {/* Número 404 grande */}
                    <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 drop-shadow-2xl">
                        404
                    </h1>

                    {/* Título */}
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
                        Página no encontrada
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        Lo sentimos, la página que buscas no existe. Pero puedes jugar una mano de Blackjack mientras te lo piensas.
                    </p>

                    <Link to="/">
                        <Button className="bg-white text-black border border-gray-300 hover:bg-gray-100 hover:text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition-all">
                            Volver al Inicio
                        </Button>
                    </Link>
                </div>

                {/* BlackJack Container */}
                <div className="backdrop-blur-xl bg-white/60 dark:bg-black/40 border border-white/40 dark:border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-violet-500/30 transition-colors duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <h2 className="relative text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                        Blackjack Compensatorio
                    </h2>

                    {/* Mostrar fichas */}
                    <div className="relative inline-block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-violet-600 dark:text-violet-400 text-xl font-bold px-8 py-3 rounded-full mb-8 shadow-sm">
                        Fichas: <span className="text-gray-900 dark:text-white">${chips}</span>
                    </div>

                    {/* Fase de apuestas */}
                    {bettingPhase && (
                        <div className="relative flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 w-full max-w-md">
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 uppercase tracking-wider font-semibold">Apuesta actual</p>
                                <p className="text-4xl font-bold text-gray-900 dark:text-white">${bet}</p>
                                <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">Mínimo para jugar: $50</p>
                            </div>

                            <div className="flex gap-3 flex-wrap justify-center">
                                <Button
                                    variant="outline"
                                    className="h-12 border-emerald-500/30 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                    disabled={chips < 10}
                                    onClick={() => betMore(10)}
                                >
                                    +$10
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 border-emerald-500/30 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                    disabled={chips < 50}
                                    onClick={() => betMore(50)}
                                >
                                    +$50
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 border-emerald-500/30 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                    disabled={chips < 100}
                                    onClick={() => betMore(100)}
                                >
                                    +$100
                                </Button>
                            </div>

                            <div className="flex gap-3 flex-wrap justify-center">
                                <Button
                                    variant="outline"
                                    className="h-12 border-red-500/30 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                    disabled={bet < 10}
                                    onClick={() => betLess(10)}
                                >
                                    -$10
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 border-red-500/30 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                    disabled={bet < 50}
                                    onClick={() => betLess(50)}
                                >
                                    -$50
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 border-red-500/30 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                    disabled={bet < 100}
                                    onClick={() => betLess(100)}
                                >
                                    -$100
                                </Button>
                            </div>

                            <Button
                                className={`w-full max-w-sm h-14 text-lg font-bold rounded-xl transition-all transform active:scale-95 ${bet >= 50
                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-black shadow-lg hover:shadow-violet-500/25'
                                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                    }`}
                                disabled={bet < 50}
                                onClick={confirmBet}
                            >
                                {bet >= 50 ? '¡Repartir cartas!' : 'Realiza tu apuesta'}
                            </Button>
                        </div>
                    )}

                    {/* Juego */}
                    {!bettingPhase && gameStarted && (
                        <div className="relative animate-in fade-in zoom-in-95 duration-500">
                            {/* Mostrar apuesta actual */}
                            <div className="flex justify-center mb-8">
                                <div className="bg-gray-100 dark:bg-gray-800 px-6 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Jugando por: <span className="text-gray-900 dark:text-white font-bold ml-1">${bet}</span>
                                </div>
                            </div>

                            {newGame && (
                                <div className={`
                            absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-3xl
                            animate-in fade-in duration-300
                        `}>
                                    <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 max-w-sm mx-4 transform transition-all scale-100">
                                        <div className="text-6xl mb-4">{result.type === "win" ? "🎉" : result.type === "loss" ? "�" : "🤝"}</div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{result.message}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                            {result.type === "win" ? `Ganaste $${bet * 2} whuuu!` : result.type === "loss" ? "Mejor suerte la próxima." : "Nadie pierde dinero."}
                                        </p>
                                        <Button
                                            className="w-full h-12 bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-black font-bold rounded-xl"
                                            onClick={resetGame}
                                        >
                                            Jugar de nuevo
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 mb-8">
                                {/* Dealer Area */}
                                <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 min-h-[200px]">
                                    <Hand
                                        cards={dealerHand}
                                        handValue={calculateHandValue(dealerHand)}
                                        hideFirstCard={dealerCardHidden}
                                        title="Croupier"
                                    />
                                </div>

                                {/* Player Area */}
                                <div className="flex-1 bg-violet-50 dark:bg-violet-900/10 rounded-2xl p-6 border border-violet-100 dark:border-violet-500/20 min-h-[200px]">
                                    <Hand cards={playerHand} handValue={calculateHandValue(playerHand)} title="Tú" />
                                </div>
                            </div>

                            {!newGame && (
                                <div className="flex justify-center gap-4">
                                    <Button
                                        className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl font-bold text-lg shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95"
                                        onClick={dealCardToPlayer}
                                    >
                                        Pedir Carta
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="h-14 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-red-500/20 transition-all active:scale-95"
                                        onClick={playerStand}
                                    >
                                        Plantarse
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}