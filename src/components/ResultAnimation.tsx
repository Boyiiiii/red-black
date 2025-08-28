import React, { useEffect } from 'react';
import './ResultAnimation.css';

interface ResultAnimationProps {
  result: 'win' | 'lose' | 'golden-win';
  show: boolean;
  betAmount: number;
  onClose: () => void;
}

const ResultAnimation: React.FC<ResultAnimationProps> = ({ result, show, betAmount, onClose }) => {
  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      onClose();
    }, 1200);

    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  const getText = () => {
    switch (result) {
      case 'golden-win':
        return `+${betAmount * 2} GOLDEN!`;
      case 'win':
        return `+${betAmount}`;
      case 'lose':
        return `-${betAmount}`;
    }
  };

  const getColor = () => {
    switch (result) {
      case 'golden-win':
        return '#FFD700';
      case 'win':
        return '#4CAF50';
      case 'lose':
        return '#F44336';
    }
  };

  return (
    <div className="simple-result-overlay">
      <div 
        className={`simple-result-text ${result}`}
        style={{ 
          color: getColor(),
          textShadow: `0 0 20px ${getColor()}`,
        }}
      >
        {getText()}
      </div>
    </div>
  );
};

export default ResultAnimation;