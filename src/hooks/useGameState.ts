import { useState, useCallback, useEffect, useRef } from "react";
import type { GameState, BetChoice, CardHistoryEntry } from "../types";
import {
  generateDynamicCard,
  updateBettingStats,
} from "../utils/dynamicCardUtils";

const INITIAL_SC = 100.0; // Starting Sweep Coins (real money value)
const INITIAL_GC = 1000; // Starting Gold Coins (game currency for betting)
const SWEEP_COIN_USD_VALUE = 0.1; // Each sweep coin = $0.10
const BASE_CASHOUT_RATE = 100; // Base prize per consecutive win
const CASHOUT_TIMER_SECONDS = 6; // 6 seconds to decide

export const useGameState = () => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    sweepstakeCoins: INITIAL_SC,
    goldCoins: INITIAL_GC,
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
    hasHistoryExtension: false,
    hasDoubleProgress: false,
    bettingStats: {
      totalBets: 0,
      colorBets: { red: 0, black: 0 },
      suitBets: { hearts: 0, diamonds: 0, clubs: 0, spades: 0 },
      recentWinRate: 0.5,
      consecutiveLosses: 0,
      favoriteChoice: null,
      recentResults: [],
      totalWins: 0,
      sessionLength: 0,
    },
    // New cashout system
    cashoutBonus: 1.0,
    cashoutTimer: null,
    canCashout: false,
    sweepCoinValue: SWEEP_COIN_USD_VALUE,
    baseCashoutRate: BASE_CASHOUT_RATE,
    pendingPrize: 0,
    pendingPrizeCurrency: "gold" as "gold" | "sweep",
  });

  const setBet = useCallback((amount: number) => {
    setGameState((prev) => ({
      ...prev,
      bet: Math.min(amount, prev.goldCoins),
    }));
  }, []);

  // Timer effect for cashout countdown
  useEffect(() => {
    if (gameState.cashoutTimer !== null && gameState.cashoutTimer > 0) {
      timerRef.current = setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          cashoutTimer: prev.cashoutTimer! - 1,
        }));
      }, 1000);
    } else if (gameState.cashoutTimer === 0) {
      // Timer expired - lose cashout opportunity but keep the winning streak growing
      setGameState((prev) => ({
        ...prev,
        cashoutTimer: null,
        canCashout: false,
        cashoutBonus: Math.min(prev.cashoutBonus + 0.2, 3.0), // Increase bonus for next time
      }));
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameState.cashoutTimer]);

  const addGoldCoins = useCallback((amount: number) => {
    setGameState((prev) => ({
      ...prev,
      goldCoins: prev.goldCoins + amount,
    }));
  }, []);

  const playGame = useCallback(
    (choice: BetChoice, betAmount: number = 100) => {
      if (gameState.goldCoins < betAmount || gameState.isFlipping) return;

      const isGoldenRound = [2, 5, 11, 14, 19].includes(
        gameState.consecutiveWins
      );
      const isNewPlayer = gameState.bettingStats.totalBets < 15; // Consider first 15 bets as new player

      const newCard = generateDynamicCard(
        choice,
        gameState.bettingStats,
        gameState.consecutiveWins,
        gameState.consecutiveWins,
        isNewPlayer
      );

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
        bet: betAmount,
      }));

      // Show the card data after a short delay so the flip starts with the back
      setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          currentCard: newCard,
        }));
      }, 400); // Show card after flip animation starts

      setTimeout(() => {
        const won =
          choice === "red" || choice === "black"
            ? newCard.color === choice
            : newCard.suit === choice;

        const reward = won && isGoldenRound ? betAmount * 2 : betAmount;
        const progressIncrease = won
          ? gameState.hasDoubleProgress
            ? 2
            : 1
          : 0;
        let newConsecutiveWins = won
          ? gameState.consecutiveWins + progressIncrease
          : 0;

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
          betChoice: choice,
          betAmount: betAmount,
        };

        // Update betting statistics
        const updatedBettingStats = updateBettingStats(
          gameState.bettingStats,
          choice,
          betAmount,
          won
        );

        setGameState((prev) => {
          // Handle consecutive wins and cashout logic
          let newCashoutTimer = prev.cashoutTimer;
          let newCanCashout = prev.canCashout;
          let newCashoutBonus = prev.cashoutBonus;
          let newPendingPrize = prev.pendingPrize;

          const isCashoutMilestone = [3, 6, 9, 12, 15].includes(newConsecutiveWins);
          
          if (won && isCashoutMilestone) {
            // Reached a cashout milestone - start timer and set bonus
            newCashoutTimer = CASHOUT_TIMER_SECONDS;
            newCanCashout = true;
            newPendingPrize += betAmount;
            // Set bonus based on milestone
            if (newConsecutiveWins === 3) newCashoutBonus = 1.1;
            else if (newConsecutiveWins === 6) newCashoutBonus = 1.3;
            else if (newConsecutiveWins === 9) newCashoutBonus = 1.6;
            else if (newConsecutiveWins === 12) newCashoutBonus = 2.0;
            else if (newConsecutiveWins === 15) newCashoutBonus = 3.0;
          } else if (won) {
            // Regular win - just add to pending, no cashout opportunity
            newPendingPrize += betAmount;
          } else if (!won) {
            // Lost - reset everything including pending prize
            newConsecutiveWins = 0;
            newCashoutTimer = null;
            newCanCashout = false;
            newCashoutBonus = 1.0;
            newPendingPrize = 0; // Reset pending prize on loss
          }

          return {
            ...prev,
            isFlipping: false,
            gameResult,
            showResult: true,
            goldCoins: won ? prev.goldCoins : prev.goldCoins - betAmount, // Don't add reward to goldCoins, it goes to pending
            totalWinnings: won
              ? prev.totalWinnings + reward
              : prev.totalWinnings,
            consecutiveWins: newConsecutiveWins,
            cashoutTimer: newCashoutTimer,
            canCashout: newCanCashout,
            cashoutBonus: newCashoutBonus,
            pendingPrize: newPendingPrize,
            pendingPrizeCurrency: prev.pendingPrizeCurrency, // Keep current currency
            isGoldenRound: false,
            cardHistory: [
              historyEntry,
              ...prev.cardHistory.slice(0, prev.hasHistoryExtension ? 9 : 4),
            ],
            bettingStats: updatedBettingStats,
          };
        });

        // Wait for card flip animation to complete before showing result
      }, 1400);
    },
    [
      gameState.goldCoins,
      gameState.isFlipping,
      gameState.consecutiveWins,
      gameState.bettingStats,
      gameState.hasDoubleProgress,
    ]
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

  const cashOut = useCallback(
    (currency: "gold" | "sweep" = "sweep") => {
      if (gameState.canCashout && gameState.consecutiveWins >= 3) {
        // Award the pending prize with bonus multiplier
        const bonusWinnings =
          gameState.pendingPrize * (gameState.cashoutBonus - 1);
        const totalWinnings = gameState.pendingPrize + bonusWinnings;

        setGameState((prev) => ({
          ...prev,
          sweepstakeCoins:
            currency === "sweep"
              ? prev.sweepstakeCoins + totalWinnings
              : prev.sweepstakeCoins,
          goldCoins:
            currency === "gold"
              ? prev.goldCoins + totalWinnings
              : prev.goldCoins,
          consecutiveWins: 0,
          cashoutTimer: null,
          canCashout: false,
          cashoutBonus: 1.0,
          pendingPrize: 0, // Reset pending prize after cashout
        }));
      }
    },
    [
      gameState.canCashout,
      gameState.consecutiveWins,
      gameState.pendingPrize,
      gameState.cashoutBonus,
    ]
  );

  const buyHistoryExtension = useCallback(() => {
    if (gameState.goldCoins >= 5000 && !gameState.hasHistoryExtension) {
      setGameState((prev) => ({
        ...prev,
        goldCoins: prev.goldCoins - 5000,
        hasHistoryExtension: true,
      }));
      return true;
    }
    return false;
  }, [gameState.goldCoins, gameState.hasHistoryExtension]);

  const buyDoubleProgress = useCallback(() => {
    if (gameState.goldCoins >= 10000 && !gameState.hasDoubleProgress) {
      setGameState((prev) => ({
        ...prev,
        goldCoins: prev.goldCoins - 10000,
        hasDoubleProgress: true,
      }));
      return true;
    }
    return false;
  }, [gameState.goldCoins, gameState.hasDoubleProgress]);

  const buyGoldCoinsWithSC = useCallback(
    (gcAmount: number, scCost: number) => {
      if (gameState.sweepstakeCoins >= scCost) {
        setGameState((prev) => ({
          ...prev,
          sweepstakeCoins: prev.sweepstakeCoins - scCost,
          goldCoins: prev.goldCoins + gcAmount,
        }));
        return true;
      }
      return false;
    },
    [gameState.sweepstakeCoins]
  );

  const setPendingPrizeCurrency = useCallback((currency: "gold" | "sweep") => {
    setGameState((prev) => ({
      ...prev,
      pendingPrizeCurrency: currency,
      // Reset pending prize when switching currency types
      pendingPrize:
        currency !== prev.pendingPrizeCurrency ? 0 : prev.pendingPrize,
      // Reset cashout state when switching
      consecutiveWins:
        currency !== prev.pendingPrizeCurrency ? 0 : prev.consecutiveWins,
      canCashout:
        currency !== prev.pendingPrizeCurrency ? false : prev.canCashout,
      cashoutTimer:
        currency !== prev.pendingPrizeCurrency ? null : prev.cashoutTimer,
      cashoutBonus:
        currency !== prev.pendingPrizeCurrency ? 1.0 : prev.cashoutBonus,
    }));
  }, []);

  return {
    gameState,
    setBet,
    addGoldCoins,
    playGame,
    resetGame,
    closeResult,
    cashOut,
    buyHistoryExtension,
    buyDoubleProgress,
    buyGoldCoinsWithSC,
    setPendingPrizeCurrency,
  };
};
