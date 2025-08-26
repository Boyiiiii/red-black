import { useState } from "react";
import { useGameState } from "./hooks/useGameState";
import Card from "./components/Card";
import Shop from "./components/Shop";
import ResultAnimation from "./components/ResultAnimation";
import RulesModal from "./components/RulesModal";
import "./App.css";

function App() {
  const { gameState, addChips, playGame, closeResult } = useGameState();
  const [showShop, setShowShop] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showChipAnimation, setShowChipAnimation] = useState(false);
  const [purchasedAmount, setPurchasedAmount] = useState(0);

  const handleBuyChips = (amount: number) => {
    addChips(amount);
    setPurchasedAmount(amount);
    setShowChipAnimation(true);
    setTimeout(() => setShowChipAnimation(false), 2000);
  };

  return (
    <div className="app">
      <div className="game-header">
        <div className="game-title">
          <span className="title-icon">🎰</span>
          RED & BLACK
          <span className="title-icon">🎰</span>
        </div>
        <button className="shop-button" onClick={() => setShowShop(true)}>
          🏪 SHOP
        </button>
      </div>

      <div className="rules-section">
        <button className="rules-button" onClick={() => setShowRules(true)}>
          Rules
        </button>
      </div>

      {/* ---- MAIN CONTENT ---- */}
      <div className="game-content">
        {/* Left Section - Red Controls */}
        <div className="left-section section-border">
          <div className="gamble-amount">
            <h3>RED GAMBLE</h3>
            <p>Gamble Amount</p>

            <span className="chips-amount">🪙{gameState.chips}</span>

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

          <button
            className="color-button red-main"
            onClick={() => playGame("red")}
            disabled={
              gameState.chips < 100 ||
              gameState.isFlipping ||
              gameState.showResult
            }
          >
            RED
          </button>

          <div className="red-buttons">
            <button
              className="suit-button red-button hearts"
              onClick={() => playGame("red")}
              disabled={
                gameState.chips < 100 ||
                gameState.isFlipping ||
                gameState.showResult
              }
            >
              <div className="suit-icon">♥</div>
            </button>
            <button
              className="suit-button red-button diamonds"
              onClick={() => playGame("red")}
              disabled={
                gameState.chips < 100 ||
                gameState.isFlipping ||
                gameState.showResult
              }
            >
              <div className="suit-icon">♦</div>
            </button>
          </div>
        </div>

        {/* Center Section - Card */}
        <div className="center-section">
          <div className="history-section">
            <h4>HISTORY</h4>
            <div className="history-progress">
              {gameState.cardHistory.slice(0, 5).map((entry) => {
                const getSuitSymbol = (suit: string) => {
                  switch (suit) {
                    case "hearts":
                      return "♥";
                    case "diamonds":
                      return "♦";
                    case "clubs":
                      return "♣";
                    case "spades":
                      return "♠";
                    default:
                      return "?";
                  }
                };

                return (
                  <div
                    key={entry.timestamp}
                    className={`history-dot ${entry.card.color} ${entry.result}`}
                  >
                    {getSuitSymbol(entry.card.suit)}
                  </div>
                );
              })}

              {/* Fill remaining slots with empty dots */}
              {Array.from({
                length: Math.max(0, 5 - gameState.cardHistory.length),
              }).map((_, index) => (
                <div key={`empty-${index}`} className="history-dot empty" />
              ))}
            </div>
          </div>

          <div className="card-flip-area centered">
            <Card
              card={gameState.currentCard}
              isFlipping={gameState.isFlipping}
              showBack={true}
              isPullingOut={false}
              isDisappearing={gameState.isCardDisappearing}
            />
          </div>
        </div>

        {/* Right Section - Black Controls & History */}
        <div className="right-section section-border">
          <div className="win-amount">
            <div className="history-header">WIN AMOUNT</div>
            <div className="suit-gamble-info">
              <span>Total Winnings</span>
              <span className="win-value">🪙{gameState.totalWinnings}</span>
            </div>
          </div>

          <button
            className="color-button black-main"
            onClick={() => playGame("black")}
            disabled={
              gameState.chips < 100 ||
              gameState.isFlipping ||
              gameState.showResult
            }
          >
            BLACK
          </button>

          <div className="black-buttons">
            <button
              className="suit-button black-button clubs"
              onClick={() => playGame("black")}
              disabled={
                gameState.chips < 100 ||
                gameState.isFlipping ||
                gameState.showResult
              }
            >
              <div className="suit-icon">♣</div>
            </button>
            <button
              className="suit-button black-button spades"
              onClick={() => playGame("black")}
              disabled={
                gameState.chips < 100 ||
                gameState.isFlipping ||
                gameState.showResult
              }
            >
              <div className="suit-icon">♠</div>
            </button>
          </div>
        </div>
      </div>

      {gameState.chips === 0 && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>You're out of chips! Visit the shop to buy more.</p>
          <button onClick={() => setShowShop(true)}>Go to Shop</button>
        </div>
      )}

      <Shop
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        onBuyChips={handleBuyChips}
        currentChips={gameState.chips}
      />

      {gameState.gameResult && (
        <ResultAnimation
          result={gameState.gameResult}
          show={gameState.showResult}
          betAmount={gameState.bet}
          onClose={closeResult}
        />
      )}

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      <div className="game-footer">
        <p>🎲 Good luck! May the cards be in your favor! 🎲</p>
      </div>
    </div>
  );
}

export default App;
