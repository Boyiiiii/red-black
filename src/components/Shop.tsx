import React from "react";
import "./Shop.css";

interface ShopProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyChips: (amount: number) => void;
  currentChips: number;
}

const Shop: React.FC<ShopProps> = ({
  isOpen,
  onClose,
  onBuyChips,
  currentChips,
}) => {
  const packages = [
    { chips: 50, price: 0.99, popular: false },
    { chips: 100, price: 1.99, popular: true },
    { chips: 250, price: 4.99, popular: false },
    { chips: 500, price: 9.99, popular: false },
  ];

  const handleBuy = (chips: number) => {
    onBuyChips(chips);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="shop-overlay">
      <div className="shop-modal">
        <div className="shop-header">
          <h2>🪙 Chip Shop</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="current-chips">
          Current Chips: <span className="chips-count">{currentChips}</span>
        </div>

        <div className="packages-grid">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={`package-card ${pkg.popular ? "popular" : ""}`}
            >
              {pkg.popular && <div className="popular-badge">POPULAR</div>}
              <div className="package-chips">
                <div className="chips-icon">🪙</div>
                <div className="chips-amount">{pkg.chips}</div>
              </div>
              <div className="package-price">${pkg.price}</div>
              <button
                className="buy-button"
                onClick={() => handleBuy(pkg.chips)}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>

        <div className="shop-note">
          * This is a demo. No real money transactions.
        </div>
      </div>
    </div>
  );
};

export default Shop;
