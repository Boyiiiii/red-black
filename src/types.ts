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
}

export interface GameState {
  chips: number;
  bet: number;
  currentCard: Card | null;
  isFlipping: boolean;
  gameResult: 'win' | 'lose' | 'golden-win' | null;
  showResult: boolean;
  consecutiveWins: number;
  isGoldenRound: boolean;
  isCardDisappearing: boolean;
  totalWinnings: number;
  cardHistory: CardHistoryEntry[];
  cashoutWins: number;
  pendingWinnings: number;
  hasHistoryExtension: boolean;
  hasDoubleProgress: boolean;
}

export type BetChoice = 'red' | 'black' | 'hearts' | 'diamonds' | 'clubs' | 'spades';