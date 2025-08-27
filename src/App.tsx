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
    addChips,
    playGame,
    closeResult,
    cashOut,
    buyHistoryExtension,
    buyDoubleProgress,
  } = useGameState();
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
          <button
            className="rules-button-title"
            onClick={() => setShowRules(true)}
          >
            Rules
          </button>
        </div>
        <button className="shop-button" onClick={() => setShowShop(true)}>
          🏪 SHOP
        </button>
      </div>

      <div className="progress-section">
        <div className="progress-container">
          <div className="cashout-progress">
            <div className="progress-label">Cashout Progress</div>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(gameState.cashoutWins / 5) * 100}%` }}
                ></div>
              </div>
              <span className="progress-text">{gameState.cashoutWins}/5</span>
              {gameState.cashoutWins >= 5 && (
                <button className="cashout-button" onClick={cashOut}>
                  Cash Out
                </button>
              )}
            </div>
          </div>

          <div className="bonus-progress">
            <div className="progress-label">Bonus Progress</div>
            <div className="bonus-slider-wrapper">
              <div className="bonus-slider-track">
                {/* Golden card backgrounds for 3,6,12 */}
                {[3, 6, 12].map((milestone) => {
                  const isAchieved = gameState.consecutiveWins >= milestone;
                  const justReached =
                    gameState.consecutiveWins === milestone &&
                    gameState.isGoldenRound;
                  const almostReached =
                    gameState.consecutiveWins === milestone - 1;
                  const isWinning =
                    gameState.gameResult === "win" ||
                    gameState.gameResult === "golden-win";

                  return (
                    <div
                      key={milestone}
                      className={`golden-card-bg ${
                        isAchieved ? "achieved" : ""
                      }`}
                      style={{ left: `${((milestone - 1) / 19) * 100}%` }}
                    >
                      <div
                        className={`mini-card ${
                          justReached && gameState.showResult
                            ? "milestone-reached"
                            : ""
                        } ${
                          isAchieved && isWinning && gameState.showResult
                            ? "super-gold"
                            : ""
                        } ${almostReached ? "almost-reached" : ""}`}
                      >
                        <span className="milestone-num">{milestone}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Golden multiplier backgrounds for 15,20 */}
                {[
                  { num: 15, mult: "X15" },
                  { num: 20, mult: "X20" },
                ].map(({ num, mult }) => {
                  const isAchieved = gameState.consecutiveWins >= num;
                  const justReached =
                    gameState.consecutiveWins === num &&
                    gameState.isGoldenRound;
                  const almostReached = gameState.consecutiveWins === num - 1;
                  const isWinning =
                    gameState.gameResult === "win" ||
                    gameState.gameResult === "golden-win";

                  return (
                    <div
                      key={num}
                      className={`golden-multiplier-bg ${
                        isAchieved ? "achieved" : ""
                      }`}
                      style={{ left: `${((num - 1) / 19) * 100}%` }}
                    >
                      <div
                        className={`multiplier-card ${
                          justReached && gameState.showResult
                            ? "milestone-reached"
                            : ""
                        } ${
                          isAchieved && isWinning && gameState.showResult
                            ? "super-gold"
                            : ""
                        } ${almostReached ? "almost-reached" : ""}`}
                      >
                        <span className="milestone-num">{num}</span>
                        <span className="multiplier-text">{mult}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Small dots for other positions */}
                {Array.from({ length: 20 }, (_, i) => i + 1)
                  .filter((num) => ![3, 6, 12, 15, 20].includes(num))
                  .map((num) => {
                    const isLitUp = gameState.consecutiveWins >= num;

                    return (
                      <div
                        key={num}
                        className={`bonus-dot ${isLitUp ? "achieved" : ""}`}
                        style={{ left: `${((num - 1) / 19) * 100}%` }}
                      ></div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- MAIN CONTENT ---- */}
      <div className="game-content">
        {/* Left Section - Red Controls */}
        <div className="left-section section-border">
          <div className="gamble-amount">
            <h3>GAMBLE </h3>
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
              onClick={() => playGame("hearts")}
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
              onClick={() => playGame("diamonds")}
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
              {gameState.cardHistory
                .slice(0, gameState.hasHistoryExtension ? 10 : 5)
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

              {/* Fill remaining slots with empty dots */}
              {Array.from({
                length: Math.max(
                  0,
                  (gameState.hasHistoryExtension ? 10 : 5) -
                    gameState.cardHistory.length
                ),
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
              hasGoldenBack={[2, 5, 11, 14, 19].includes(
                gameState.consecutiveWins
              )}
            />
          </div>
        </div>

        {/* Right Section - Black Controls & History */}
        <div className="right-section section-border">
          <div className="win-amount">
            <div className="history-header">WIN AMOUNT</div>
            <div className="suit-gamble-info">
              <div>Pending Winnings</div>
              <div className="win-value">🪙{gameState.pendingWinnings}</div>
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
              onClick={() => playGame("clubs")}
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
              onClick={() => playGame("spades")}
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
        hasHistoryExtension={gameState.hasHistoryExtension}
        hasDoubleProgress={gameState.hasDoubleProgress}
        onBuyHistoryExtension={buyHistoryExtension}
        onBuyDoubleProgress={buyDoubleProgress}
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
