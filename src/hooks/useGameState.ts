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

      const newCard = generateRandomCard();

      setGameState((prev) => ({
        ...prev,
        isFlipping: true,
        currentCard: newCard,
        gameResult: null,
        showResult: false,
      }));

      setTimeout(() => {
        const won = newCard.color === choice;
        setGameState((prev) => ({
          ...prev,
          isFlipping: false,
          gameResult: won ? "win" : "lose",
          showResult: true,
          chips: won ? prev.chips + prev.bet : prev.chips - prev.bet,
        }));

        setTimeout(() => {
          setGameState((prev) => ({
            ...prev,
            showResult: false,
            gameResult: null,
            currentCard: null,
          }));
        }, 2000);
      }, 1500);
    },
    [gameState.chips, gameState.bet, gameState.isFlipping]
  );

  const resetGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      currentCard: null,
      gameResult: null,
      showResult: false,
      isFlipping: false,
    }));
  }, []);

  return {
    gameState,
    setBet,
    addChips,
    playGame,
    resetGame,
  };
};
