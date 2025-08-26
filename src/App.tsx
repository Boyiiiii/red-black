import { useState, useEffect } from "react";
import { useGameState } from "./hooks/useGameState";
import Card from "./components/Card";
import BettingPanel from "./components/BettingPanel";
import Shop from "./components/Shop";
import ResultAnimation from "./components/ResultAnimation";
import RulesModal from "./components/RulesModal";
import "./types/fullscreen";
import "./App.css";

function App() {
  const { gameState, setBet, addChips, playGame, closeResult } = useGameState();
  const [showShop, setShowShop] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleBuyChips = (amount: number) => {
    addChips(amount);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      const elem = document.documentElement;

      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement
      ) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          await elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }
    } catch (error) {
      console.log("Fullscreen not supported or blocked:", error);
    }
  };

  return (
    <div className="app">
      <div className="game-header">
        <div className="game-title">
          <span className="title-icon">🎰</span>
          RED & BLACK
          <span className="title-icon">🎰</span>
        </div>
        <div className="header-buttons">
          <button className="fullscreen-button" onClick={toggleFullscreen}>
            {isFullscreen ? "⛶" : "⛶"}
          </button>
          <button className="shop-button" onClick={() => setShowShop(true)}>
            🏪 SHOP
          </button>
        </div>
      </div>

      <div className="rules-section">
        <button className="rules-button" onClick={() => setShowRules(true)}>
          Rules
        </button>
      </div>

      <div className="game-content">
        <div className="card-area">
          <div className="card-display">
            <div className="card-deck">
              <div className="deck-card"></div>
              <div className="deck-card"></div>
              <div className="deck-card"></div>
              <div
                className={`deck-card top-card ${
                  gameState.isFlipping ? "pulling" : ""
                } ${gameState.consecutiveWins >= 2 ? "golden" : ""}`}
              ></div>
            </div>
            <div className="card-flip-area">
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
        </div>

        <BettingPanel
          chips={gameState.chips}
          bet={gameState.bet}
          onBetChange={setBet}
          onPlayGame={playGame}
          isGameInProgress={gameState.isFlipping}
          showResult={gameState.showResult}
        />
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

      <ResultAnimation
        result={gameState.gameResult!}
        show={gameState.showResult}
        betAmount={gameState.bet}
        onClose={closeResult}
      />

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      <div className="game-footer">
        <p>🎲 Good luck! May the cards be in your favor! 🎲</p>
      </div>
    </div>
  );
}

export default App;
