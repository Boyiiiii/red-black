import type { Card } from "../types";

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

export const generateRandomCard = (): Card => {
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const value = values[Math.floor(Math.random() * values.length)];
  const color = suit === "hearts" || suit === "diamonds" ? "red" : "black";

  return { suit, value, color };
};

export const getSuitSymbol = (suit: Card["suit"]): string => {
  switch (suit) {
    case "hearts":
      return "♥";
    case "diamonds":
      return "♦";
    case "clubs":
      return "♣";
    case "spades":
      return "♠";
  }
};
