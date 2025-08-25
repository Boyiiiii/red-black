import React from "react";
import type { Card as CardType } from "../types";
import { getSuitSymbol } from "../utils/cardUtils";
import "./Card.css";

interface CardProps {
  card?: CardType | null;
  isFlipping: boolean;
  showBack?: boolean;
  isPullingOut?: boolean;
}

const Card: React.FC<CardProps> = ({
  card,
  isFlipping,
  showBack = true,
  isPullingOut = false,
}) => {
  return (
    <div
      className={`card-container ${isFlipping ? "flipping" : ""} ${
        isPullingOut ? "pulling-out" : ""
      }`}
    >
      <div className="card">
        <div className={`card-front ${card?.isGolden ? 'golden' : ''}`}>
          {card ? (
            <div className={`card-content ${card.color} ${card.isGolden ? 'golden' : ''}`}>
              <div className="card-corner top-left">
                <span className="value">{card.value}</span>
                <span className="suit">{getSuitSymbol(card.suit)}</span>
              </div>
              <div className="card-center">{getSuitSymbol(card.suit)}</div>
              <div className="card-corner bottom-right">
                <span className="value">{card.value}</span>
                <span className="suit">{getSuitSymbol(card.suit)}</span>
              </div>
            </div>
          ) : (
            <div className="card-placeholder">
              <span>?</span>
            </div>
          )}
        </div>
        {showBack ? (
          <div className="card-back">
            <div className="card-back-pattern"></div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Card;
