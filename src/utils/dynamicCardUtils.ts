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
  cashoutWins: number = 0,
  consecutiveWins: number = 0,
  isNewPlayer: boolean = false
): Card => {
  const isColorBet = userChoice === "red" || userChoice === "black";

  // Sweepstake model: Higher base win rates to keep players engaged
  const baseWinChance = isColorBet ? 0.55 : 0.3; // Better than casino odds

  // Dynamic adjustments for retention and cashout progression
  let winChanceModifier = 0;

  // NEW PLAYER HOOK: Give new players early wins to build engagement
  if (isNewPlayer && bettingStats.totalBets < 10) {
    winChanceModifier += 0.2; // 20% boost for first 10 bets
  }

  // LOSING STREAK PREVENTION: Aggressive catch-up to prevent churn
  if (bettingStats.consecutiveLosses >= 5) {
    winChanceModifier += 0.25; // 25% boost after 5+ losses
  } else if (bettingStats.consecutiveLosses >= 3) {
    winChanceModifier += 0.18; // 18% boost after 3-4 losses
  } else if (bettingStats.consecutiveLosses >= 2) {
    winChanceModifier += 0.12; // 12% boost after 2 losses
  }

  if (cashoutWins === 0) {
    // First cashout win is crucial - boost significantly
    winChanceModifier += 0.15;
  } else if (cashoutWins === 4) {
    // Almost at cashout - give them the final push
    winChanceModifier += 0.2;
  } else if (cashoutWins >= 1 && cashoutWins <= 3) {
    // Mid-progress - moderate boost to maintain momentum
    winChanceModifier += 0.1;
  }

  // RECENT PERFORMANCE BALANCING
  if (bettingStats.recentWinRate < 0.35) {
    // Poor recent performance - significant boost
    winChanceModifier += 0.15;
  } else if (bettingStats.recentWinRate > 0.75) {
    // Too much winning - slight reduction but not punitive
    winChanceModifier -= 0.08;
  }

  // LOYALTY REWARDS: Reward consistent play patterns
  if (bettingStats.totalBets > 20) {
    const sessionBonus = Math.min(0.1, bettingStats.totalBets * 0.002); // Up to 10% bonus for long sessions
    winChanceModifier += sessionBonus;
  }

  // FAVORITE CHOICE BONUS: Reward pattern consistency occasionally
  if (
    bettingStats.favoriteChoice === userChoice &&
    bettingStats.totalBets > 8
  ) {
    const favoriteCount = isColorBet
      ? bettingStats.colorBets[userChoice as "red" | "black"]
      : bettingStats.suitBets[
          userChoice as "hearts" | "diamonds" | "clubs" | "spades"
        ];

    if (favoriteCount > bettingStats.totalBets * 0.5) {
      // If 50%+ of bets are this choice
      winChanceModifier += 0.08; // Reward loyalty
    }
  }

  // CONSECUTIVE WIN BALANCING: Prevent runaway wins but don't kill momentum
  if (consecutiveWins >= 6) {
    winChanceModifier -= 0.15; // Reduce chance after 6+ consecutive wins
  } else if (consecutiveWins >= 3) {
    winChanceModifier -= 0.08; // Slight reduction after 3+ wins
  }

  // Apply caps with sweepstake-friendly ranges
  winChanceModifier = Math.max(-0.25, Math.min(0.35, winChanceModifier));
  const finalWinChance = Math.max(
    0.15,
    Math.min(0.85, baseWinChance + winChanceModifier)
  );

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
