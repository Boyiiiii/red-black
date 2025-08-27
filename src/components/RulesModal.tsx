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
              <li>Each bet costs 100 chips</li>
              <li>Choose RED/BLACK color or specific suit (♥♦♣♠)</li>
              <li>A card will be drawn from the deck</li>
              <li>If the card matches your choice, you win!</li>
            </ul>
          </div>

          <div className="rule-section">
            <h3>💰 Rewards System</h3>
            <ul>
              <li>Win: Earn 100 chips (2x for golden cards)</li>
              <li>Winnings go to "Pending Winnings" - not chips directly</li>
              <li>Lose: Only lose chips, no effect on pending winnings</li>
              <li>Cash out pending winnings when cashout bar fills</li>
            </ul>
          </div>

          <div className="rule-section">
            <h3>📊 Progress Systems</h3>
            <ul>
              <li><strong>Cashout Progress:</strong> Fill 5 wins to cash out pending winnings</li>
              <li><strong>Bonus Progress:</strong> Consecutive wins unlock golden rewards</li>
              <li>Milestones at 3, 6, 12, 15, 20 consecutive wins</li>
              <li>Golden cards appear at milestone-1 (2, 5, 11, 14, 19)</li>
            </ul>
          </div>

          <div className="rule-section">
            <h3>🏪 Shop Features</h3>
            <ul>
              <li><strong>Chips Tab:</strong> Buy more chips with real money</li>
              <li><strong>Properties Tab:</strong> Upgrade game features</li>
              <li>History Extension: Show 10 history instead of 5 (5k chips)</li>
              <li>Double Progress: 2x bonus progress per win (10k chips)</li>
            </ul>
          </div>

          <div className="rule-section">
            <h3>🃏 Card Types</h3>
            <ul>
              <li><span className="red-text">RED:</span> Hearts ♥ and Diamonds ♦</li>
              <li><span className="black-text">BLACK:</span> Clubs ♣ and Spades ♠</li>
              <li>Choose specific suits for same payout but precise targeting</li>
              <li>Golden cards give 2x rewards at milestone rounds</li>
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