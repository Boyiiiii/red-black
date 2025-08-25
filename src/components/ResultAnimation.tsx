import React from 'react';
import './ResultAnimation.css';

interface ResultAnimationProps {
  result: 'win' | 'lose';
  show: boolean;
  betAmount: number;
}

const ResultAnimation: React.FC<ResultAnimationProps> = ({ result, show, betAmount }) => {
  if (!show) return null;

  return (
    <div className={`result-animation ${result}`}>
      <div className="result-content">
        <div className="result-icon">
          {result === 'win' ? '🎉' : '💔'}
        </div>
        <div className="result-text">
          {result === 'win' ? 'YOU WIN!' : 'YOU LOSE!'}
        </div>
        <div className="result-amount">
          {result === 'win' ? `+${betAmount}` : `-${betAmount}`} chips
        </div>
        {result === 'win' && (
          <div className="confetti">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="confetti-piece" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#ffd700', '#ff4757', '#3742fa', '#2ed573', '#ff6b6b'][Math.floor(Math.random() * 5)]
              }} />
            ))}
          </div>
        )}
        {result === 'lose' && (
          <div className="smoke">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="smoke-particle" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultAnimation;