import React, { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import Card from './components/Card';
import BettingPanel from './components/BettingPanel';
import Shop from './components/Shop';
import ResultAnimation from './components/ResultAnimation';
import './App.css';

function App() {
  const { gameState, setBet, addChips, playGame, resetGame } = useGameState();
  const [showShop, setShowShop] = useState(false);

  const handleBuyChips = (amount: number) => {
    addChips(amount);
  };

  return (
    <div className="app">
      <div className="game-header">
        <div className="game-title">
          <span className="title-icon">🎰</span>
          RED & BLACK
          <span className="title-icon">🎰</span>
        </div>
        <button 
          className="shop-button"
          onClick={() => setShowShop(true)}
        >
          🏪 SHOP
        </button>
      </div>

      <div className="game-content">
        <div className="card-area">
          <div className="card-display">
            <div className="card-deck">
              <div className="deck-card"></div>
              <div className="deck-card"></div>
              <div className="deck-card"></div>
              <div className={`deck-card top-card ${gameState.isFlipping ? 'pulling' : ''}`}></div>
            </div>
            {(gameState.currentCard || gameState.isFlipping) && (
              <Card 
                card={gameState.currentCard} 
                isFlipping={gameState.isFlipping}
                showBack={gameState.isFlipping}
                isPullingOut={gameState.isFlipping}
              />
            )}
          </div>
        </div>

        <BettingPanel
          chips={gameState.chips}
          bet={gameState.bet}
          onBetChange={setBet}
          onPlayGame={playGame}
          isGameInProgress={gameState.isFlipping}
        />
      </div>

      {gameState.chips === 0 && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>You're out of chips! Visit the shop to buy more.</p>
          <button onClick={() => setShowShop(true)}>
            Go to Shop
          </button>
        </div>
      )}

      <Shop
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        onBuyChips={handleBuyChips}
        currentChips={gameState.chips}
      />

      <ResultAnimation
        result={gameState.gameResult!}
        show={gameState.showResult}
        betAmount={gameState.bet}
      />

      <div className="game-footer">
        <p>🎲 Good luck! May the cards be in your favor! 🎲</p>
      </div>
    </div>
  );
}

export default App;
