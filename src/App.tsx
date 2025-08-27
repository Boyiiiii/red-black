import { useState } from "react";
import { useGameState } from "./hooks/useGameState";
import Card from "./components/Card";
import Shop from "./components/Shop";
import ResultAnimation from "./components/ResultAnimation";
import RulesModal from "./components/RulesModal";
import "./App.css";

function App() {
  const {
    gameState,
    addSweepstakeCoins,
    playGame,
    closeResult,
    cashOut,
    buyHistoryExtension,
    buyDoubleProgress,
    buySweepstakeCoinsWithGC,
  } = useGameState();
  const [showShop, setShowShop] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showChipAnimation, setShowChipAnimation] = useState(false);
  const [purchasedAmount, setPurchasedAmount] = useState(0);
  const [betAmount, setBetAmount] = useState(100);
  const [inputBetAmount, setInputBetAmount] = useState("100");

  const handleBuySweepstakeCoins = (amount: number) => {
    addSweepstakeCoins(amount);
    setPurchasedAmount(amount);
    setShowChipAnimation(true);
    setTimeout(() => setShowChipAnimation(false), 2000);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setBetAmount(value);
    setInputBetAmount(value.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputBetAmount(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 100 && numValue <= 500) {
      setBetAmount(numValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputBetAmount);
    if (isNaN(numValue) || numValue < 100) {
      setBetAmount(100);
      setInputBetAmount("100");
    } else if (numValue > 500) {
      setBetAmount(500);
      setInputBetAmount("500");
    } else {
      setBetAmount(numValue);
      setInputBetAmount(numValue.toString());
    }
  };

  return (
    <div className="app">
      {/* GAME DISPLAY AREA */}
      <div className="game-display-section">
        {/* Consecutive Wins Display */}
        <div className="progress-display">
          <div className="consecutive-wins-display">
            <div className="wins-section">
              <div className="wins-label">Consecutive Wins:</div>
              <div className="wins-count">{gameState.consecutiveWins}</div>
            </div>

            <div className="cashout-section">
              {/* Always show potential GC and bonus rate */}
              <div className="potential-earnings">
                Potential:{" "}
                {(
                  (gameState.consecutiveWins || 1) *
                  gameState.baseCashoutRate *
                  gameState.cashoutBonus
                ).toFixed(2)}{" "}
                Golden Coins
              </div>
              <div className="bonus-rate">
                Bonus: {gameState.cashoutBonus.toFixed(1)}x
              </div>

              {/* Show cashout controls when available */}
              {gameState.canCashout && gameState.cashoutTimer && (
                <div className="cashout-controls-row">
                  <div className="cashout-timer-large">
                    {gameState.cashoutTimer}s
                  </div>
                  <button className="cashout-button-large" onClick={cashOut}>
                    Cashout {(
                      gameState.consecutiveWins *
                      gameState.baseCashoutRate *
                      gameState.cashoutBonus
                    ).toFixed(2)} Golden Coins
                  </button>
                  <div className="potential-amount-large">
                    {(
                      gameState.consecutiveWins *
                      gameState.baseCashoutRate *
                      gameState.cashoutBonus
                    ).toFixed(2)}{" "}
                    GC
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Display Area */}
        <div className="card-display">
          <Card
            card={gameState.currentCard}
            isFlipping={gameState.isFlipping}
            showBack={true}
            isPullingOut={false}
            isDisappearing={gameState.isCardDisappearing}
            hasGoldenBack={[2, 5, 11, 14, 19].includes(
              gameState.consecutiveWins
            )}
          />
        </div>

        {/* History Display */}
        <div className="history-display">
          <div className="history-title">Recent Results</div>
          <div className="history-dots">
            {gameState.cardHistory
              .slice(0, gameState.hasHistoryExtension ? 8 : 5)
              .map((entry) => {
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

            {Array.from({
              length: Math.max(
                0,
                (gameState.hasHistoryExtension ? 8 : 5) -
                  gameState.cardHistory.length
              ),
            }).map((_, index) => (
              <div key={`empty-${index}`} className="history-dot empty" />
            ))}
          </div>
        </div>
      </div>

      {/* BETTING/ACTION PANEL */}
      <div className="betting-action-section">
        {/* Header with Sweepstake Coins and GC Display */}
        <div className="bet-section-header">
          <div className="gold-coins-display">
            <div className="gold-coins-label">Golden Coin</div>
            <div className="gold-coins-amount">
              💰 {gameState.goldCoins.toFixed(1)}
            </div>
          </div>
          <div className="balance-info">
            <div className="balance-item">
              <div className="balance-label">Sweepstake Coins</div>
              <div className="balance-amount">
                🪙{gameState.sweepstakeCoins}
              </div>
            </div>
          </div>
        </div>

        {/* Game Title and Controls - 2 rows */}
        <div className="game-title-section">
          <h2 className="game-title">Red & Black</h2>
        </div>
        <div className="action-buttons-row">
          <button className="rules-button" onClick={() => setShowRules(true)}>
            Rules
          </button>
          <button className="shop-button" onClick={() => setShowShop(true)}>
            🏪 Shop
          </button>
        </div>

        {/* Combined Bet Amount and Slider Controls */}
        <div className="bet-amount-section">
          <div className="bet-amount-header">
            <span className="bet-label">Bet Amount</span>
            <span className="bet-amount">🪙{betAmount}</span>
          </div>
          <div className="bet-slider-container">
            <input
              type="range"
              min="100"
              max="500"
              step="25"
              value={betAmount}
              onChange={handleSliderChange}
              className="bet-slider"
            />
            <div className="bet-input-container">
              <input
                type="number"
                min="100"
                max="500"
                value={inputBetAmount}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="bet-input"
              />
            </div>
          </div>
        </div>

        {/* Main Betting Panel */}
        <div className="betting-panel">
          {/* Color Betting Row */}
          <div className="betting-row color-row">
            <button
              className="bet-btn red-bet"
              onClick={() => playGame("red", betAmount)}
              disabled={
                gameState.sweepstakeCoins < betAmount ||
                gameState.isFlipping ||
                gameState.showResult
              }
            >
              <span className="bet-name">RED</span>
              <span className="bet-payout">2:1</span>
            </button>
            <button
              className="bet-btn black-bet"
              onClick={() => playGame("black", betAmount)}
              disabled={
                gameState.sweepstakeCoins < betAmount ||
                gameState.isFlipping ||
                gameState.showResult
              }
            >
              <span className="bet-name">BLACK</span>
              <span className="bet-payout">2:1</span>
            </button>
          </div>

          {/* Suit Betting Row */}
          <div className="betting-row suit-row">
            <button
              className="bet-btn suit-btn hearts-bet"
              onClick={() => playGame("hearts", betAmount)}
              disabled={
                gameState.sweepstakeCoins < betAmount ||
                gameState.isFlipping ||
                gameState.showResult
              }
            >
              <span className="suit-symbol">♥</span>
              <span className="bet-payout">4:1</span>
            </button>
            <button
              className="bet-btn suit-btn diamonds-bet"
              onClick={() => playGame("diamonds", betAmount)}
              disabled={
                gameState.sweepstakeCoins < betAmount ||
                gameState.isFlipping ||
                gameState.showResult
              }
            >
              <span className="suit-symbol">♦</span>
              <span className="bet-payout">4:1</span>
            </button>
            <button
              className="bet-btn suit-btn clubs-bet"
              onClick={() => playGame("clubs", betAmount)}
              disabled={
                gameState.sweepstakeCoins < betAmount ||
                gameState.isFlipping ||
                gameState.showResult
              }
            >
              <span className="suit-symbol">♣</span>
              <span className="bet-payout">4:1</span>
            </button>
            <button
              className="bet-btn suit-btn spades-bet"
              onClick={() => playGame("spades", betAmount)}
              disabled={
                gameState.sweepstakeCoins < betAmount ||
                gameState.isFlipping ||
                gameState.showResult
              }
            >
              <span className="suit-symbol">♠</span>
              <span className="bet-payout">4:1</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chip Purchase Animation */}
      {showChipAnimation && (
        <div className="chip-animation-overlay">
          <div className="chip-success-msg">Purchase Successful!</div>
          <div className="chip-amount-msg">+🪙{purchasedAmount}</div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState.sweepstakeCoins === 0 && !gameState.showResult && (
        <div className="game-over-overlay">
          <div className="game-over">
            <h2>Game Over!</h2>
            <p>You're out of Sweepstake Coins! Visit the shop to buy more.</p>
            <button onClick={() => setShowShop(true)}>Go to Shop</button>
          </div>
        </div>
      )}

      {/* Modals */}
      <Shop
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        onBuySweepstakeCoins={handleBuySweepstakeCoins}
        currentSweepstakeCoins={gameState.sweepstakeCoins}
        currentGoldCoins={gameState.goldCoins}
        hasHistoryExtension={gameState.hasHistoryExtension}
        hasDoubleProgress={gameState.hasDoubleProgress}
        onBuyHistoryExtension={buyHistoryExtension}
        onBuyDoubleProgress={buyDoubleProgress}
        onBuySweepstakeCoinsWithGC={buySweepstakeCoinsWithGC}
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
    </div>
  );
}

export default App;
