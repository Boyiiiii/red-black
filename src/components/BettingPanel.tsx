import React from "react";
import type { BetChoice } from "../types";
import "./BettingPanel.css";

interface BettingPanelProps {
  chips: number;
  bet: number;
  onBetChange: (amount: number) => void;
  onPlayGame: (choice: BetChoice) => void;
  isGameInProgress: boolean;
  showResult: boolean;
  showChipAnimation?: boolean;
  purchasedAmount?: number;
}

const BettingPanel: React.FC<BettingPanelProps> = ({
  chips,
  bet,
  onBetChange,
  onPlayGame,
  isGameInProgress,
  showResult,
  showChipAnimation = false,
  purchasedAmount = 0,
}) => {
  const betAmounts = [5, 10, 25, 50];

  return (
    <div className="betting-panel">
      <div className="chips-display">
        <div className="chips-icon">🪙</div>
        <span className="chips-amount">{chips}</span>
        {showChipAnimation && (
          <div className="chip-animation-container">
            <div className="chip-animation-success">
              Purchase Successful!
            </div>
            <div className="chip-animation-amount">
              Here is your chips: {purchasedAmount}
            </div>
          </div>
        )}
      </div>

      <div className="bet-selection">
        <h3>Select Bet Amount</h3>
        <div className="bet-buttons">
          {betAmounts.map((amount) => (
            <button
              key={amount}
              className={`bet-button ${bet === amount ? "selected" : ""}`}
              onClick={() => onBetChange(amount)}
              disabled={amount > chips || isGameInProgress || showResult}
            >
              ${amount}
            </button>
          ))}
        </div>
      </div>

      <div className="color-selection">
        <h3>Choose Color</h3>
        <div className="color-buttons">
          <button
            className="color-button red"
            onClick={() => onPlayGame("red")}
            disabled={chips < bet || isGameInProgress || showResult}
          >
            <div className="color-indicator red-indicator"></div>
            RED
          </button>
          <button
            className="color-button black"
            onClick={() => onPlayGame("black")}
            disabled={chips < bet || isGameInProgress || showResult}
          >
            <div className="color-indicator black-indicator"></div>
            BLACK
          </button>
        </div>
      </div>
    </div>
  );
};

export default BettingPanel;
