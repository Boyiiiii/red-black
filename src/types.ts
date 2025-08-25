export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  color: 'red' | 'black';
}

export interface GameState {
  chips: number;
  bet: number;
  currentCard: Card | null;
  isFlipping: boolean;
  gameResult: 'win' | 'lose' | null;
  showResult: boolean;
}

export type BetChoice = 'red' | 'black';