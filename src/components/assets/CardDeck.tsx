const suits = ["♠", "♥", "♦", "♣"];
const ranks = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
const combinations = suits.flatMap((suit) =>
  ranks.map((rank) => ({ suit, rank }))
);

export { combinations };

import React from "react";

interface CardProps {
  card: {
    suit: string;
    rank: string;
  };
  faceDown?: boolean;
}

const Card: React.FC<CardProps> = ({ card, faceDown = false }) => {
  if (faceDown) {
    return (
      <div className="w-28 h-40 bg-white border-2 border-gray-300 rounded-lg shadow-md flex flex-col items-center justify-center">
        <span className="text-3xl font-bold leading-none">🂠🂠🂠🂠🂠🂠🂠</span>
      </div>
    );
  }

  const isRed = card.suit === "♥" || card.suit === "♦";
  const textColor = isRed ? "text-red-600" : "text-slate-800";

  return (
    <div className={`w-28 h-40 bg-white border-2 border-gray-300 rounded-lg shadow-md flex flex-col items-center justify-center ${textColor}`}>
      <p className="text-3xl font-bold leading-none">{card.rank}</p>
      <div className="w-16 h-16 flex items-center justify-center">
        <span className="text-5xl leading-none">{card.suit}</span>
      </div>
    </div>
  );
};

export default Card;
