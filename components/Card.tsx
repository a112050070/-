
import React from 'react';
import { CardData } from '../types';

interface CardProps {
  card: CardData;
  onClick: (id: number) => void;
  icon: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ card, onClick, icon }) => {
  return (
    <div 
      className="card-container w-full aspect-square cursor-pointer"
      onClick={() => onClick(card.id)}
    >
      <div className={`card-inner w-full h-full relative ${card.isFlipped || card.isMatched ? 'is-flipped' : ''}`}>
        {/* Card Back (Shown initially) */}
        <div className="card-front neon-border border-opacity-20 flex flex-col items-center justify-center bg-zinc-900 group">
          <div className="w-1/2 h-1/2 border border-zinc-700 rounded-sm group-hover:border-pink-500 transition-colors"></div>
        </div>
        
        {/* Card Front (The content) */}
        <div className={`card-back neon-border ${card.isMatched ? 'match-success' : 'border-blue-400'} bg-black`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Card;
