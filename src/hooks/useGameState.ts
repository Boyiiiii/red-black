import { useState, useCallback, useEffect, useRef } from "react";
import type { GameState, BetChoice, CardHistoryEntry, BettingStats } from "../types";
import { generateDynamicCard, updateBettingStats } from "../utils/dynamicCardUtils";

const INITIAL_SC = 1000; // Starting Sweepstake Coins
const INITIAL_GC = 2.0; // Starting Gold Coins (for purchasing SC)
const GOLD_COIN_USD_VALUE = 0.10; // Each gold coin = $0.10
const BASE_CASHOUT_RATE = 0.1; // Base GC per consecutive win
const CASHOUT_TIMER_SECONDS = 6; // 6 seconds to decide

export const useGameState = () => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
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
    goldCoinValue: GOLD_COIN_USD_VALUE,
    baseCashoutRate: BASE_CASHOUT_RATE,
  });

  const setBet = useCallback((amount: number) => {
    setGameState((prev) => ({
      ...prev,
      bet: Math.min(amount, prev.sweepstakeCoins),
    }));
  }, []);

  // Timer effect for cashout countdown
  useEffect(() => {
    if (gameState.cashoutTimer !== null && gameState.cashoutTimer > 0) {
      timerRef.current = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          cashoutTimer: prev.cashoutTimer! - 1,
        }));
      }, 1000);
    } else if (gameState.cashoutTimer === 0) {
      // Timer expired - lose cashout opportunity but keep the winning streak growing
      setGameState(prev => ({
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

  const addSweepstakeCoins = useCallback((amount: number) => {
    setGameState((prev) => ({
      ...prev,
      sweepstakeCoins: prev.sweepstakeCoins + amount,
    }));
  }, []);

  const playGame = useCallback(
    (choice: BetChoice, betAmount: number = 100) => {
      if (gameState.sweepstakeCoins < betAmount || gameState.isFlipping) return;

      const isGoldenRound = [2, 5, 11, 14, 19].includes(gameState.consecutiveWins);
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
        const won = choice === 'red' || choice === 'black' 
          ? newCard.color === choice 
          : newCard.suit === choice;
        
        const reward = won && isGoldenRound ? betAmount * 2 : betAmount;
        const progressIncrease = won ? (gameState.hasDoubleProgress ? 2 : 1) : 0;
        let newConsecutiveWins = won ? gameState.consecutiveWins + progressIncrease : 0;
        
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
          
          if (won && newConsecutiveWins >= 3 && !prev.canCashout) {
            // First time reaching 3+ wins - start timer
            newCashoutTimer = CASHOUT_TIMER_SECONDS;
            newCanCashout = true;
          } else if (won && newConsecutiveWins >= 3 && prev.canCashout) {
            // Continue winning streak - increase bonus but keep timer
            newCashoutBonus = Math.min(prev.cashoutBonus + 0.1, 3.0);
          } else if (!won) {
            // Lost - reset everything
            newConsecutiveWins = 0;
            newCashoutTimer = null;
            newCanCashout = false;
            newCashoutBonus = 1.0;
          }

          return {
            ...prev,
            isFlipping: false,
            gameResult,
            showResult: true,
            sweepstakeCoins: won ? prev.sweepstakeCoins + reward : prev.sweepstakeCoins - betAmount,
            totalWinnings: won ? prev.totalWinnings + reward : prev.totalWinnings,
            consecutiveWins: newConsecutiveWins,
            cashoutTimer: newCashoutTimer,
            canCashout: newCanCashout,
            cashoutBonus: newCashoutBonus,
            isGoldenRound: false,
            cardHistory: [historyEntry, ...prev.cardHistory.slice(0, prev.hasHistoryExtension ? 9 : 4)],
            bettingStats: updatedBettingStats,
          };
        });

        // Wait for card flip animation to complete before showing result
      }, 1400);
    },
    [gameState.sweepstakeCoins, gameState.isFlipping, gameState.consecutiveWins, gameState.bettingStats]
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
    if (gameState.canCashout && gameState.consecutiveWins >= 3) {
      // Calculate Gold Coins based on consecutive wins and bonus multiplier
      const baseGoldCoins = gameState.consecutiveWins * gameState.baseCashoutRate;
      const bonusGoldCoins = baseGoldCoins * (gameState.cashoutBonus - 1);
      const totalGoldCoins = baseGoldCoins + bonusGoldCoins;
      
      setGameState((prev) => ({
        ...prev,
        goldCoins: prev.goldCoins + totalGoldCoins,
        consecutiveWins: 0,
        cashoutTimer: null,
        canCashout: false,
        cashoutBonus: 1.0,
      }));
    }
  }, [gameState.canCashout, gameState.consecutiveWins, gameState.baseCashoutRate, gameState.cashoutBonus]);

  const buyHistoryExtension = useCallback(() => {
    if (gameState.sweepstakeCoins >= 5000 && !gameState.hasHistoryExtension) {
      setGameState((prev) => ({
        ...prev,
        sweepstakeCoins: prev.sweepstakeCoins - 5000,
        hasHistoryExtension: true,
      }));
      return true;
    }
    return false;
  }, [gameState.sweepstakeCoins, gameState.hasHistoryExtension]);

  const buyDoubleProgress = useCallback(() => {
    if (gameState.sweepstakeCoins >= 10000 && !gameState.hasDoubleProgress) {
      setGameState((prev) => ({
        ...prev,
        sweepstakeCoins: prev.sweepstakeCoins - 10000,
        hasDoubleProgress: true,
      }));
      return true;
    }
    return false;
  }, [gameState.sweepstakeCoins, gameState.hasDoubleProgress]);

  const buySweepstakeCoinsWithGC = useCallback((scAmount: number, gcCost: number) => {
    if (gameState.goldCoins >= gcCost) {
      setGameState((prev) => ({
        ...prev,
        goldCoins: prev.goldCoins - gcCost,
        sweepstakeCoins: prev.sweepstakeCoins + scAmount,
      }));
      return true;
    }
    return false;
  }, [gameState.goldCoins]);


  return {
    gameState,
    setBet,
    addSweepstakeCoins,
    playGame,
    resetGame,
    closeResult,
    cashOut,
    buyHistoryExtension,
    buyDoubleProgress,
    buySweepstakeCoinsWithGC,
  };
};
