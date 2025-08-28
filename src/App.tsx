import { useState, useEffect, useRef } from "react";
import { useGameState } from "./hooks/useGameState";
import Card from "./components/Card";
import Shop from "./components/Shop";
import ResultAnimation from "./components/ResultAnimation";
import RulesModal from "./components/RulesModal";
import "./App.css";

function App() {
  const {
    gameState,
    addGoldCoins,
    addSweepCoins,
    playGame,
    closeResult,
    cashOut,
    buyHistoryExtension,
    buyDoubleProgress,
    buyGoldCoinsWithSC,
    setPendingPrizeCurrency,
  } = useGameState();
  const [showShop, setShowShop] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showChipAnimation, setShowChipAnimation] = useState(false);
  const [purchasedAmount, setPurchasedAmount] = useState(0);
  const [betAmount, setBetAmount] = useState(100);
  const [inputBetAmount, setInputBetAmount] = useState("100");
  const [bettingCurrency, setBettingCurrency] = useState<"gold" | "sweep">(
    "gold"
  );
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleBuyGoldCoins = (amount: number) => {
    addGoldCoins(amount);
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

  const handleSwitchCurrency = (newCurrency?: "gold" | "sweep") => {
    if (newCurrency) {
      if (newCurrency === "sweep" && gameState.sweepstakeCoins < 100) {
        return; // Don't switch if not enough sweep coins
      }
      setBettingCurrency(newCurrency);
      setPendingPrizeCurrency(newCurrency); // Update pending prize currency
      setShowCurrencyDropdown(false);
    } else {
      // Toggle dropdown
      setShowCurrencyDropdown(!showCurrencyDropdown);
    }
  };

  const getCurrentBalance = () => {
    return bettingCurrency === "gold"
      ? gameState.goldCoins
      : gameState.sweepstakeCoins;
  };

  // const canSwitchToSweep = () => {
  //   return gameState.sweepstakeCoins >= 100;
  // };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCurrencyDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="app">
      {/* GAME DISPLAY AREA */}
      <div className="game-display-section">
        {/* Consecutive Wins Display as Footprint */}
        <div className="progress-display">
          <div className="footprint-display">
            <div className="footprint-header">
              <div className={`pending-prize-info ${gameState.pendingPrize > 500 ? 'big-prize' : ''} ${gameState.pendingPrize > 1000 ? 'huge-prize' : ''}`}>
                💰 Pending Prize: {gameState.pendingPrize.toFixed(0)}{" "}
                {gameState.pendingPrizeCurrency === "gold" ? "GC" : "SC"}
                {gameState.pendingPrize > 800 && <span className="fire-emoji"> 🔥</span>}
              </div>
              <div className="bonus-info">
                {gameState.canCashout && gameState.cashoutTimer ? (
                  <div className="cashout-info">
                    <span className="cashout-timer-small">
                      {gameState.cashoutTimer}s
                    </span>
                    <button
                      className="cashout-button-small"
                      onClick={() => cashOut(gameState.pendingPrizeCurrency)}
                    >
                      Cashout{" "}
                      {(
                        gameState.pendingPrize * gameState.cashoutBonus
                      ).toFixed(2)}{" "}
                      {gameState.pendingPrizeCurrency === "gold" ? "GC" : "SC"}
                    </button>
                  </div>
                ) : (
                  <span className="next-bonus-display">
                    Next Bonus:{" "}
                    {gameState.consecutiveWins < 3
                      ? "🚀 5x @ 3 wins"
                      : gameState.consecutiveWins < 6
                      ? "⭐ 15x @ 6 wins"
                      : gameState.consecutiveWins < 9
                      ? "💎 50x @ 9 wins"
                      : gameState.consecutiveWins < 12
                      ? "👑 150x @ 12 wins"
                      : gameState.consecutiveWins < 15
                      ? "🔥 500x @ 15 wins"
                      : "🏆 JACKPOT!"}
                  </span>
                )}
              </div>
            </div>

            <div className="footprint-trail">
              {Array.from({ length: 15 }, (_, i) => {
                const position = i + 1;
                const isActive = position <= gameState.consecutiveWins;
                const isBonusStep = [3, 6, 9, 12, 15].includes(position);
                const bonusMultiplier =
                  position === 3
                    ? 5.0
                    : position === 6
                    ? 15.0
                    : position === 9
                    ? 50.0
                    : position === 12
                    ? 150.0
                    : position === 15
                    ? 500.0
                    : 1.0;

                return (
                  <div
                    key={position}
                    className={`footprint ${isActive ? "active" : ""} ${
                      isBonusStep ? "bonus-step" : ""
                    }`}
                  >
                    <div className="footprint-number">{position}</div>
                    {isBonusStep && (
                      <div className="bonus-multiplier">{bonusMultiplier}x</div>
                    )}
                  </div>
                );
              })}
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
        {/* Currency Selector with Dropdown */}
        <div className="bet-section-header">
          <div className="currency-selector-container" ref={dropdownRef}>
            <div
              className={`currency-selector ${
                bettingCurrency === "sweep" ? "sweep-selected" : "gold-selected"
              }`}
              onClick={() => handleSwitchCurrency()}
            >
              <span className="currency-type-with-balance">
                {bettingCurrency === "gold"
                  ? `🪙 Gold Balance: ${gameState.goldCoins}`
                  : `💰 Sweep Balance: ${gameState.sweepstakeCoins.toFixed(1)}`}
              </span>
              <span
                className={`dropdown-arrow ${
                  showCurrencyDropdown ? "open" : ""
                }`}
              >
                ▼
              </span>
            </div>

            {showCurrencyDropdown && (
              <div className="currency-dropdown">
                <div
                  className={`currency-option ${
                    bettingCurrency === "gold" ? "active" : ""
                  }`}
                  onClick={() => handleSwitchCurrency("gold")}
                >
                  🪙 Gold Balance: {gameState.goldCoins}
                </div>
                <div
                  className={`currency-option ${
                    bettingCurrency === "sweep" ? "active" : ""
                  } ${gameState.sweepstakeCoins < 100 ? "disabled" : ""}`}
                  onClick={() => handleSwitchCurrency("sweep")}
                  title={
                    gameState.sweepstakeCoins < 100
                      ? "Need 100+ Sweep Coins"
                      : ""
                  }
                >
                  💰 Sweep Balance: {gameState.sweepstakeCoins.toFixed(1)}
                  {gameState.sweepstakeCoins < 100 && (
                    <span className="insufficient-badge">Insufficient</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Game Title and Controls - Combined row */}
        <div className="game-title-actions-row">
          <h2 className="game-title">Red & Black</h2>
          <div className="action-buttons">
            <button className="rules-button" onClick={() => setShowRules(true)}>
              Rules
            </button>
            <button className="shop-button" onClick={() => setShowShop(true)}>
              🏪 Shop
            </button>
          </div>
        </div>

        {/* Combined Bet Amount and Slider Controls */}
        <div className="bet-amount-section">
          <div className="bet-amount-header">
            <span className="bet-label">Bet Amount</span>
            <span className="bet-amount">
              {bettingCurrency === "gold" ? "🪙" : "💰"}
              {betAmount}
            </span>
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
                getCurrentBalance() < betAmount ||
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
                getCurrentBalance() < betAmount ||
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
                getCurrentBalance() < betAmount ||
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
                getCurrentBalance() < betAmount ||
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
                getCurrentBalance() < betAmount ||
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
                getCurrentBalance() < betAmount ||
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
      {getCurrentBalance() < 100 && !gameState.showResult && (
        <div className="game-over-overlay">
          <div className="game-over">
            <h2>Game Over!</h2>
            <p>
              You're out of{" "}
              {bettingCurrency === "gold" ? "Gold Coins" : "Sweep Coins"}!{" "}
              {bettingCurrency === "gold"
                ? "Visit the shop to buy more."
                : "Switch to Gold Coins or visit the shop."}
            </p>
            <button onClick={() => setShowShop(true)}>Go to Shop</button>
            {bettingCurrency === "sweep" && gameState.goldCoins >= 100 && (
              <button
                onClick={() => handleSwitchCurrency("gold")}
                style={{ marginLeft: "8px" }}
              >
                Switch to Gold Coins
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <Shop
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        onBuyGoldCoins={handleBuyGoldCoins}
        onBuySweepCoins={addSweepCoins}
        currentSweepstakeCoins={gameState.sweepstakeCoins}
        currentGoldCoins={gameState.goldCoins}
        hasHistoryExtension={gameState.hasHistoryExtension}
        hasDoubleProgress={gameState.hasDoubleProgress}
        onBuyHistoryExtension={buyHistoryExtension}
        onBuyDoubleProgress={buyDoubleProgress}
        onBuyGoldCoinsWithSC={buyGoldCoinsWithSC}
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
