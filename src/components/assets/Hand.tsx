import React from "react";
import Card from "./CardDeck";

interface HandProps {
    cards: {suit: string; rank: string}[];
    title: string;
    handValue: number;
    hideFirstCard?: boolean;
}

export default function Hand({cards, title, handValue, hideFirstCard = false}: HandProps) {
    const displayValue = hideFirstCard && cards.length > 0 
        ? "?" 
        : handValue;

    return (
        <div>
            {/* Hand component content */}
            <div className="p-4">
                <h2 className="text-2xl mb-2">{title}: {displayValue}</h2>
                <div className="flex flex-col sm:flex-row gap-1">
                    {cards.map((card, index) => (
                        <Card 
                            key={index} 
                            card={card} 
                            faceDown={hideFirstCard && index === 0}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}