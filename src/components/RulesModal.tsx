import React from 'react';
import './RulesModal.css';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="rules-modal-overlay" onClick={onClose}>
      <div className="rules-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="rules-modal-header">
          <h2>Game Rules</h2>
          <button className="rules-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="rules-modal-body">
          <div className="rule-section">
            <h3>🎯 Basic Gameplay</h3>
            <ul>
              <li>Select your bet amount from the available options</li>
              <li>Choose either RED or BLACK color</li>
              <li>A card will be drawn from the deck</li>
              <li>If the card color matches your choice, you win!</li>
            </ul>
          </div>

          <div className="rule-section">
            <h3>💰 Betting & Rewards</h3>
            <ul>
              <li>Win: Get back your bet amount as profit</li>
              <li>Lose: Lose your bet amount</li>
              <li>You can only bet with chips you have</li>
              <li>Visit the shop to buy more chips when needed</li>
            </ul>
          </div>

          <div className="rule-section">
            <h3>👑 Golden Card Special</h3>
            <ul>
              <li>Win 2 rounds in a row to unlock golden cards</li>
              <li>Golden cards appear with special visual effects</li>
              <li>Winning with a golden card gives 2x rewards!</li>
              <li>Losing resets your consecutive win streak</li>
            </ul>
          </div>

          <div className="rule-section">
            <h3>🃏 Card Colors</h3>
            <ul>
              <li><span className="red-text">RED:</span> Hearts ♥ and Diamonds ♦</li>
              <li><span className="black-text">BLACK:</span> Clubs ♣ and Spades ♠</li>
              <li>Each color has equal chances of appearing</li>
            </ul>
          </div>
        </div>

        <div className="rules-modal-footer">
          <button className="rules-modal-button" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;