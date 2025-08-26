import { useState, useCallback } from "react";
import type { GameState, BetChoice, CardHistoryEntry } from "../types";
import { generateRandomCard } from "../utils/cardUtils";

const INITIAL_CHIPS = 1000;

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    chips: INITIAL_CHIPS,
    bet: 100,
    currentCard: null,
    isFlipping: false,
    gameResult: null,
    showResult: false,
    consecutiveWins: 0,
    isGoldenRound: false,
    isCardDisappearing: false,
    totalWinnings: 0,
    cardHistory: [],
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
      const fixedBet = 100;
      if (gameState.chips < fixedBet || gameState.isFlipping) return;

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
        bet: fixedBet,
      }));

      setTimeout(() => {
        const won = newCard.color === choice;
        const reward = won && isGoldenRound ? fixedBet * 2 : fixedBet;
        const newConsecutiveWins = won ? gameState.consecutiveWins + 1 : 0;
        const gameResult = won
          ? isGoldenRound
            ? "golden-win"
            : "win"
          : "lose";

        // Create history entry
        const historyEntry: CardHistoryEntry = {
          card: newCard,
          result: gameResult,
          timestamp: Date.now(),
        };

        setGameState((prev) => ({
          ...prev,
          isFlipping: false,
          gameResult,
          showResult: true,
          chips: won ? prev.chips + reward : prev.chips - fixedBet,
          totalWinnings: won ? prev.totalWinnings + reward : prev.totalWinnings,
          consecutiveWins: newConsecutiveWins,
          isGoldenRound: false,
          cardHistory: [historyEntry, ...prev.cardHistory.slice(0, 4)], // Keep last 5
        }));

        // Removed automatic timeout - now handled by close button or auto-dismiss
      }, 1500);
    },
    [gameState.chips, gameState.isFlipping, gameState.consecutiveWins]
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
