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
    cashoutWins: 0,
    pendingWinnings: 0,
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

      const isGoldenRound = [2, 5, 11, 14, 19].includes(gameState.consecutiveWins);
      const newCard = generateRandomCard();
      if (isGoldenRound) {
        newCard.isGolden = true;
      }

      setGameState((prev) => ({
        ...prev,
        isFlipping: true,
        currentCard: null, // Don't show card data yet
        gameResult: null,
        showResult: false,
        isGoldenRound,
        bet: fixedBet,
      }));

      // Show the card data after a short delay so the flip starts with the back
      setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          currentCard: newCard,
        }));
      }, 400); // Show card after flip animation starts

      setTimeout(() => {
        const won = choice === 'red' || choice === 'black' 
          ? newCard.color === choice 
          : newCard.suit === choice;
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

        setGameState((prev) => {
          const newCashoutWins = won ? prev.cashoutWins + 1 : prev.cashoutWins;
          const shouldResetCashout = newCashoutWins > 5;

          return {
            ...prev,
            isFlipping: false,
            gameResult,
            showResult: true,
            chips: won ? prev.chips : prev.chips - fixedBet, // Only deduct on loss
            pendingWinnings: won ? prev.pendingWinnings + reward : prev.pendingWinnings, // Add wins to pending
            totalWinnings: won ? prev.totalWinnings + reward : prev.totalWinnings, // Keep total for tracking
            consecutiveWins: newConsecutiveWins,
            cashoutWins: shouldResetCashout ? 1 : newCashoutWins, // Reset to 1 if over 5, otherwise use newCashoutWins
            isGoldenRound: false,
            cardHistory: [historyEntry, ...prev.cardHistory.slice(0, 4)], // Keep last 5
          };
        });

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
    // Just clear the result and card immediately, no zoom out animation
    setGameState((prev) => ({
      ...prev,
      showResult: false,
      gameResult: null,
      currentCard: null,
      isCardDisappearing: false,
    }));
  }, []);

  const cashOut = useCallback(() => {
    if (gameState.cashoutWins >= 5) {
      const cashoutAmount = gameState.cashoutWins * 200; // 200 chips per win
      setGameState((prev) => ({
        ...prev,
        chips: prev.chips + cashoutAmount + prev.pendingWinnings, // Cash out both
        cashoutWins: 0,
        pendingWinnings: 0, // Clear pending winnings too
      }));
    }
  }, [gameState.cashoutWins, gameState.pendingWinnings]);


  return {
    gameState,
    setBet,
    addChips,
    playGame,
    resetGame,
    closeResult,
    cashOut,
  };
};
