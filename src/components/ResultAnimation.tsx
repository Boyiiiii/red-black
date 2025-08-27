import React, { useEffect, useState } from 'react';
import './ResultAnimation.css';

interface ResultAnimationProps {
  result: 'win' | 'lose' | 'golden-win';
  show: boolean;
  betAmount: number;
  onClose: () => void;
}

const ResultAnimation: React.FC<ResultAnimationProps> = ({ result, show, betAmount, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!show) {
      setIsClosing(false);
      return;
    }

    const timer = setTimeout(() => {
      handleClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [show]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!show) return null;

  return (
    <div className={`result-animation ${result} ${isClosing ? 'closing' : ''}`}>
      <div className="result-content">
        <div className="result-icon">
          {result === 'golden-win' ? '👑' : result === 'win' ? '🎉' : '💔'}
        </div>
        <div className="result-text">
          {result === 'golden-win' ? 'YOU WON A GOLDEN REWARD!' : result === 'win' ? 'YOU WIN!' : 'YOU LOSE!'}
        </div>
        <div className="result-amount">
          {result === 'golden-win' ? `+${betAmount * 2}` : result === 'win' ? `+${betAmount}` : `-${betAmount}`} chips
        </div>
        <button className="x-button" onClick={handleClose}>
          ×
        </button>
        {(result === 'win' || result === 'golden-win') && (
          <div className="confetti">
            {Array.from({ length: result === 'golden-win' ? 30 : 20 }).map((_, i) => (
              <div key={i} className={`confetti-piece ${result === 'golden-win' ? 'golden' : ''}`} style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: result === 'golden-win' ? 
                  ['#ffd700', '#ffed4e', '#ffc107', '#ffb300', '#ff8f00'][Math.floor(Math.random() * 5)] :
                  ['#ffd700', '#ff4757', '#3742fa', '#2ed573', '#ff6b6b'][Math.floor(Math.random() * 5)]
              }} />
            ))}
          </div>
        )}
        {result === 'golden-win' && (
          <div className="golden-sparkles">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="sparkle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
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