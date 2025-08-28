import type { Card, BetChoice, BettingStats } from "../types";

const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
const values = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

export const generateDynamicCard = (
  userChoice: BetChoice,
  bettingStats: BettingStats,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _cashoutWins: number = 0,
  consecutiveWins: number = 0,
  isNewPlayer: boolean = false,
  currency: 'gold' | 'sweep' = 'gold'
): Card => {
  const isColorBet = userChoice === "red" || userChoice === "black";
  let finalWinChance: number;

  if (currency === 'sweep') {
    // SWEEP COINS (Real Money) - Leave empty for now as requested
    finalWinChance = isColorBet ? 0.5 : 0.25; // Basic fair odds for now
    
  } else {
    // GOLD COINS (Free Game Currency) - Burn their GC but keep them engaged
    const baseWinChance = isColorBet ? 0.45 : 0.20; // Suit bets 20% base since they pay 4:1
    let winChanceModifier = 0;

    // NEW PLAYER HOOK: Give them some early wins to get hooked
    if (isNewPlayer && bettingStats.totalBets < 8) {
      winChanceModifier += 0.2; // 20% boost for first 8 bets
    }

    // LOSING STREAK PREVENTION: Don't let them quit, give comebacks
    if (bettingStats.consecutiveLosses >= 5) {
      winChanceModifier += 0.25; // Strong comeback after 5+ losses
    } else if (bettingStats.consecutiveLosses >= 3) {
      winChanceModifier += 0.15; // Moderate comeback after 3-4 losses
    }

    // NATURAL WIN PATTERN STRATEGY: Make wins feel organic and varied
    if (consecutiveWins >= 1 && consecutiveWins <= 5) {
      // Early wins - good boost to build confidence
      if (isColorBet) {
        winChanceModifier += 0.2; // Good boost for early wins
      } else {
        winChanceModifier += 0.25; // Slightly better for suits
      }
    } else if (consecutiveWins >= 6 && consecutiveWins <= 8) {
      // Mid-range wins - vary the experience more naturally
      const randomFactor = Math.random();
      if (randomFactor > 0.7) {
        // 30% chance of good streak continuing
        winChanceModifier += 0.15;
      } else if (randomFactor > 0.4) {
        // 30% chance of neutral
        winChanceModifier += 0.05;
      } else {
        // 40% chance of slight penalty but not crushing
        winChanceModifier -= 0.05;
      }
    } else if (consecutiveWins === 9) {
      // At 9 wins - let them sometimes see that big multiplier
      winChanceModifier += 0.1; // Moderate boost
    } else if (consecutiveWins >= 10 && consecutiveWins <= 12) {
      // Higher wins - more varied, sometimes they get lucky
      const randomFactor = Math.random();
      if (randomFactor > 0.8) {
        // 20% chance they get really lucky
        winChanceModifier += 0.1;
      } else if (randomFactor > 0.5) {
        // 30% chance of moderate penalty
        winChanceModifier -= 0.1;
      } else {
        // 50% chance of bigger penalty
        winChanceModifier -= 0.2;
      }
    } else if (consecutiveWins >= 13) {
      // Very high wins - still possible but harder
      winChanceModifier -= 0.25;
    }

    // SUIT BET SPECIFIC LOGIC: Make them feel lucky occasionally
    if (!isColorBet) {
      // Suit bets get special treatment since they're higher risk/reward
      if (bettingStats.totalBets > 5) {
        const suitBetCount = Object.values(bettingStats.suitBets).reduce((a, b) => a + b, 0);
        const colorBetCount = Object.values(bettingStats.colorBets).reduce((a, b) => a + b, 0);
        
        if (suitBetCount > colorBetCount * 0.3) {
          // They're betting suits frequently - give them occasional big wins
          winChanceModifier += 0.1;
        }
      }
      
      // Make suit wins feel more "streaky" - if they just won a suit, boost next suit bet
      if (bettingStats.recentResults[0] === true && bettingStats.totalBets > 0) {
        winChanceModifier += 0.15; // Hot streak feeling
      }
    }

    // VARIED GREED PUNISHMENT: Sometimes they get away with it, sometimes they don't
    const wasCashoutOpportunity = [3, 6, 9, 12, 15].some(
      (milestone) =>
        consecutiveWins > milestone && consecutiveWins <= milestone + 2
    );
    
    if (wasCashoutOpportunity) {
      // They had a cashout opportunity but got greedy
      const greedPunishment = Math.random();
      if (greedPunishment > 0.6) {
        // 40% chance of heavy punishment
        winChanceModifier -= 0.4;
      } else if (greedPunishment > 0.3) {
        // 30% chance of moderate punishment
        winChanceModifier -= 0.2;
      } else {
        // 30% chance they get lucky and continue (makes them think they can beat the system)
        winChanceModifier -= 0.05;
      }
    }

    // GC BURNING ACCELERATION: If they're winning too much, burn them faster
    const totalWinRate = bettingStats.totalWins / Math.max(1, bettingStats.totalBets);
    if (totalWinRate > 0.6 && bettingStats.totalBets > 10) {
      winChanceModifier -= 0.2; // Reduce wins if they're winning too much
    }

    // SESSION VARIETY: Some sessions feel luckier than others
    const sessionSeed = Math.floor(bettingStats.totalBets / 20); // Changes every 20 bets
    const sessionLuck = (sessionSeed * 123456789) % 100; // Pseudo-random session modifier
    
    if (sessionLuck > 80) {
      // 20% of sessions are "lucky sessions"
      winChanceModifier += 0.1;
    } else if (sessionLuck < 20) {
      // 20% of sessions are "unlucky sessions" 
      winChanceModifier -= 0.08;
    }
    
    // ENGAGEMENT MAINTENANCE: Don't let them quit completely
    if (bettingStats.recentWinRate < 0.25) {
      winChanceModifier += 0.25; // Stronger comeback to prevent rage quit
    }

    // LONG SESSION BURNING: The longer they play, the more we take
    if (bettingStats.totalBets > 25) {
      winChanceModifier -= 0.1; // Gradual house edge increase
    }

    // HIGH CONSECUTIVE WINS: Make them lose everything eventually
    if (consecutiveWins >= 16) {
      winChanceModifier -= 0.6; // Almost guaranteed loss past max milestone
    }

    // Apply caps for GC burning strategy
    winChanceModifier = Math.max(-0.7, Math.min(0.35, winChanceModifier));
    finalWinChance = Math.max(
      0.02,
      Math.min(0.85, baseWinChance + winChanceModifier)
    );
  }

  // Generate card based on calculated win chance
  const shouldWin = Math.random() < finalWinChance;

  if (shouldWin) {
    return generateWinningCard(userChoice);
  } else {
    return generateLosingCard(userChoice);
  }
};

const generateWinningCard = (userChoice: BetChoice): Card => {
  const value = values[Math.floor(Math.random() * values.length)];

  if (userChoice === "red") {
    const suit = Math.random() < 0.5 ? "hearts" : "diamonds";
    return { suit, value, color: "red" };
  } else if (userChoice === "black") {
    const suit = Math.random() < 0.5 ? "clubs" : "spades";
    return { suit, value, color: "black" };
  } else {
    // Specific suit bet
    const color =
      userChoice === "hearts" || userChoice === "diamonds" ? "red" : "black";
    return { suit: userChoice as never, value, color };
  }
};

const generateLosingCard = (userChoice: BetChoice): Card => {
  const value = values[Math.floor(Math.random() * values.length)];

  if (userChoice === "red") {
    const suit = Math.random() < 0.5 ? "clubs" : "spades";
    return { suit, value, color: "black" };
  } else if (userChoice === "black") {
    const suit = Math.random() < 0.5 ? "hearts" : "diamonds";
    return { suit, value, color: "red" };
  } else {
    // Specific suit bet - choose any other suit
    const otherSuits = suits.filter((s) => s !== userChoice);
    const suit = otherSuits[Math.floor(Math.random() * otherSuits.length)];
    const color = suit === "hearts" || suit === "diamonds" ? "red" : "black";
    return { suit, value, color };
  }
};

export const updateBettingStats = (
  stats: BettingStats,
  betChoice: BetChoice,
  _betAmount: number,
  won: boolean
): BettingStats => {
  const isColorBet = betChoice === "red" || betChoice === "black";

  // Update bet counts
  const newStats = { ...stats };
  newStats.totalBets += 1;
  newStats.totalWins += won ? 1 : 0;

  if (isColorBet) {
    newStats.colorBets[betChoice as "red" | "black"] += 1;
  } else {
    newStats.suitBets[
      betChoice as "hearts" | "diamonds" | "clubs" | "spades"
    ] += 1;
  }

  // Update consecutive losses
  newStats.consecutiveLosses = won ? 0 : stats.consecutiveLosses + 1;

  // Update recent results (keep last 12 results)
  const newRecentResults = [won, ...stats.recentResults].slice(0, 12);
  newStats.recentResults = newRecentResults;

  // Calculate accurate recent win rate from actual results
  if (newRecentResults.length > 0) {
    const recentWins = newRecentResults.filter((result) => result).length;
    newStats.recentWinRate = recentWins / newRecentResults.length;
  } else {
    newStats.recentWinRate = 0.5; // Default
  }

  // Update session length (simple increment for now)
  newStats.sessionLength += 1; // Increment per bet as rough session measure

  // Determine favorite choice
  let maxCount = 0;
  let favorite: BetChoice | null = null;

  Object.entries(newStats.colorBets).forEach(([choice, count]) => {
    if (count > maxCount) {
      maxCount = count;
      favorite = choice as BetChoice;
    }
  });

  Object.entries(newStats.suitBets).forEach(([choice, count]) => {
    if (count > maxCount) {
      maxCount = count;
      favorite = choice as BetChoice;
    }
  });

  newStats.favoriteChoice = favorite;

  return newStats;
};
