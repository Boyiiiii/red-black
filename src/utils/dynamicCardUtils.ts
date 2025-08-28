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
  isNewPlayer: boolean = false
): Card => {
  const isColorBet = userChoice === "red" || userChoice === "black";

  // Sweepstake model: High base win rates to build pending prizes and keep players engaged
  const baseWinChance = isColorBet ? 0.65 : 0.35; // Let players win to build pending prizes

  // Dynamic adjustments for retention and cashout progression
  let winChanceModifier = 0;

  // NEW PLAYER HOOK: Give new players great wins to build engagement
  if (isNewPlayer && bettingStats.totalBets < 10) {
    winChanceModifier += 0.25; // 25% boost for first 10 bets to hook them
  }

  // LOSING STREAK PREVENTION: Keep players engaged with quick comebacks
  if (bettingStats.consecutiveLosses >= 3) {
    winChanceModifier += 0.3; // Strong boost after 3+ losses to prevent churn
  } else if (bettingStats.consecutiveLosses >= 2) {
    winChanceModifier += 0.15; // Moderate boost after 2 losses
  }

  // STRATEGIC WIN PROGRESSION: Build up their pending prize, then make them lose it
  if (consecutiveWins >= 1 && consecutiveWins < 15) {
    // Let them win to build pending prizes and get excited about big cashouts
    winChanceModifier += 0.2; // Boost wins to build pending prize
  }

  // GREED PUNISHMENT: Players who don't cashout at milestones get punished
  const wasCashoutOpportunity = [3, 6, 9, 12, 15].some(
    (milestone) =>
      consecutiveWins > milestone && consecutiveWins <= milestone + 2
  );

  if (wasCashoutOpportunity) {
    // They had a cashout opportunity but didn't take it - make them lose
    winChanceModifier -= 0.4; // Heavy penalty for not cashing out
  }

  // ENGAGEMENT BOOSTING: Keep them playing and building pending prizes
  if (bettingStats.recentWinRate < 0.4) {
    // Poor recent performance - big boost to get them back in
    winChanceModifier += 0.25;
  }

  // COMEBACK MECHANICS: Let them build back up after losing pending prizes
  const hasLostBigRecently =
    bettingStats.recentResults.slice(0, 5).filter((r) => !r).length >= 3;
  if (hasLostBigRecently) {
    // They recently lost - give them wins to build confidence again
    winChanceModifier += 0.3;
  }

  // TIMER EXPIRY PUNISHMENT: Players who let timer expire without cashing out
  // This would need to be tracked separately, but for now simulate with high consecutive wins
  if (consecutiveWins >= 16) {
    // They've gone past the max cashout milestone - make them lose everything
    winChanceModifier -= 0.5; // Almost guaranteed loss
  }

  // Apply caps - allow extreme swings for the strategy to work
  winChanceModifier = Math.max(-0.6, Math.min(0.4, winChanceModifier));
  const finalWinChance = Math.max(
    0.05,
    Math.min(0.95, baseWinChance + winChanceModifier)
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
