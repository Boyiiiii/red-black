import { useState, useCallback } from "react";
import type { GameState, BetChoice } from "../types";
import { generateRandomCard } from "../utils/cardUtils";

const INITIAL_CHIPS = 100;

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    chips: INITIAL_CHIPS,
    bet: 10,
    currentCard: null,
    isFlipping: false,
    gameResult: null,
    showResult: false,
    consecutiveWins: 0,
    isGoldenRound: false,
    isCardDisappearing: false,
  });

  const setBet = useCallback((amount: number) => {
    setGameState((prev) => ({
      ...prev,
      bet: Math.min(amount, prev.chips),
    }));
  }, []);

  const addChips = useCallback((amount: number) => {
    setGameState((prev) => ({
      ...prev,
      chips: prev.chips + amount,
    }));
  }, []);

  const playGame = useCallback(
    (choice: BetChoice) => {
      if (gameState.chips < gameState.bet || gameState.isFlipping) return;

      const isGoldenRound = gameState.consecutiveWins >= 2;
      const newCard = generateRandomCard();
      if (isGoldenRound) {
        newCard.isGolden = true;
      }

      setGameState((prev) => ({
        ...prev,
        isFlipping: true,
        currentCard: newCard,
        gameResult: null,
        showResult: false,
        isGoldenRound,
      }));

      setTimeout(() => {
        const won = newCard.color === choice;
        const reward = won && isGoldenRound ? gameState.bet * 2 : gameState.bet;
        const newConsecutiveWins = won ? gameState.consecutiveWins + 1 : 0;
        
        setGameState((prev) => ({
          ...prev,
          isFlipping: false,
          gameResult: won ? (isGoldenRound ? "golden-win" : "win") : "lose",
          showResult: true,
          chips: won ? prev.chips + reward : prev.chips - prev.bet,
          consecutiveWins: newConsecutiveWins,
          isGoldenRound: false,
        }));

        // Removed automatic timeout - now handled by close button or auto-dismiss
      }, 1500);
    },
    [gameState.chips, gameState.bet, gameState.isFlipping, gameState.consecutiveWins]
  );

  const resetGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      currentCard: null,
      gameResult: null,
      showResult: false,
      isFlipping: false,
      isCardDisappearing: false,
    }));
  }, []);

  const closeResult = useCallback(() => {
    // Start card disappearing animation
    setGameState((prev) => ({
      ...prev,
      showResult: false,
      gameResult: null,
      isCardDisappearing: true,
    }));
    
    // Remove card after animation completes
    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        currentCard: null,
        isCardDisappearing: false,
      }));
    }, 600);
  }, []);

  return {
    gameState,
    setBet,
    addChips,
    playGame,
    resetGame,
    closeResult,
  };
};
