export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  color: 'red' | 'black';
  isGolden?: boolean;
}

export interface CardHistoryEntry {
  card: Card;
  result: 'win' | 'lose' | 'golden-win';
  timestamp: number;
  betChoice: BetChoice;
  betAmount: number;
}

export interface BettingStats {
  totalBets: number;
  colorBets: { red: number; black: number };
  suitBets: { hearts: number; diamonds: number; clubs: number; spades: number };
  recentWinRate: number;
  consecutiveLosses: number;
  favoriteChoice: BetChoice | null;
  recentResults: boolean[]; // Track last 10-15 results for better win rate calculation
  totalWins: number;
  sessionLength: number; // Minutes played
}

export interface GameState {
  sweepstakeCoins: number; // SC - real money value (Sweep Coins)
  goldCoins: number; // GC - for betting
  bet: number;
  currentCard: Card | null;
  isFlipping: boolean;
  gameResult: 'win' | 'lose' | 'golden-win' | null;
  showResult: boolean;
  consecutiveWins: number; // Current winning streak
  isGoldenRound: boolean;
  isCardDisappearing: boolean;
  totalWinnings: number;
  cardHistory: CardHistoryEntry[];
  hasHistoryExtension: boolean;
  hasDoubleProgress: boolean;
  bettingStats: BettingStats;
  // New cashout system
  cashoutBonus: number; // Bonus multiplier for current streak
  cashoutTimer: number | null; // Countdown timer in seconds
  canCashout: boolean; // Whether cashout is available
  sweepCoinValue: number; // USD value per sweep coin
  baseCashoutRate: number; // Base SC earned per consecutive win
}

export type BetChoice = 'red' | 'black' | 'hearts' | 'diamonds' | 'clubs' | 'spades';