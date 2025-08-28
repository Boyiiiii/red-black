import React, { useState } from "react";
import "./Shop.css";

interface ShopProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyGoldCoins: (amount: number) => void;
  currentSweepstakeCoins: number;
  currentGoldCoins: number;
  hasHistoryExtension: boolean;
  hasDoubleProgress: boolean;
  onBuyHistoryExtension: () => boolean;
  onBuyDoubleProgress: () => boolean;
  onBuyGoldCoinsWithSC: (gcAmount: number, scCost: number) => boolean;
}

const Shop: React.FC<ShopProps> = ({
  isOpen,
  onClose,
  onBuyGoldCoins,
  currentSweepstakeCoins,
  currentGoldCoins,
  hasHistoryExtension,
  hasDoubleProgress,
  onBuyHistoryExtension,
  onBuyDoubleProgress,
  onBuyGoldCoinsWithSC,
}) => {
  const [activeTab, setActiveTab] = useState<"gold" | "properties">(
    "gold"
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{
    chips: number;
    price: number;
    gcCost?: number;
  } | null>(null);

  // PayPal packages (buy gold coins with real money)
  const paypalPackages = [
    { chips: 1000, price: 1.99, popular: false },
    { chips: 3000, price: 3.99, popular: true },
    { chips: 5000, price: 6.99, popular: false },
  ];

  const handleBuy = (pkg: { chips: number; price: number }) => {
    // Calculate Sweepstake Coin cost (price in USD / 0.10 per SC)
    const scCost = pkg.price / 0.1;
    setSelectedPackage({ ...pkg, gcCost: scCost });
    setShowPaymentModal(true);
  };

  const handlePayment = (method: string) => {
    if (selectedPackage) {
      let success = false;

      if (method === "Sweepstake Coin" && selectedPackage.gcCost) {
        // Use Sweep Coins to buy Gold Coins
        success = onBuyGoldCoinsWithSC(
          selectedPackage.chips,
          selectedPackage.gcCost
        );
        if (!success) {
          alert(
            `Not enough Sweep Coins! You need ${selectedPackage.gcCost} SC.`
          );
          return;
        }
      } else {
        // PayPal payment (demo - just add the gold coins)
        console.log(
          `Processing ${method} payment for ${selectedPackage.chips} Gold Coins`
        );
        onBuyGoldCoins(selectedPackage.chips);
        success = true;
      }

      if (success) {
        setShowPaymentModal(false);
        setSelectedPackage(null);
        onClose();
      }
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPackage(null);
  };

  const handleBuyProperty = (propertyType: "history" | "doubleProgress") => {
    let success = false;
    if (propertyType === "history") {
      success = onBuyHistoryExtension();
    } else if (propertyType === "doubleProgress") {
      success = onBuyDoubleProgress();
    }

    if (success) {
      alert("Property purchased successfully!");
    } else {
      alert("Not enough chips or already owned!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="shop-overlay">
      <div className="shop-modal">
        <div className="shop-header">
          <h2>🏪 Shop</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="current-chips">
          Current Gold Coins:{" "}
          <span className="chips-count">{currentGoldCoins}</span>
        </div>
        <div className="current-chips">
          Current Sweep Coins:{" "}
          <span className="chips-count">{currentSweepstakeCoins.toFixed(1)}</span>
        </div>

        <div className="shop-tabs">
          <button
            className={`tab-button ${
              activeTab === "gold" ? "active" : ""
            }`}
            onClick={() => setActiveTab("gold")}
          >
            🪙 Gold Coins
          </button>
          <button
            className={`tab-button ${
              activeTab === "properties" ? "active" : ""
            }`}
            onClick={() => setActiveTab("properties")}
          >
            ⚡ Properties
          </button>
        </div>

        {activeTab === "gold" ? (
          <>
            <div className="packages-grid">
              {paypalPackages.map((pkg, index) => (
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
                  <button className="buy-button" onClick={() => handleBuy(pkg)}>
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
            <div className="shop-note">
              * This is a demo. No real money transactions.
            </div>
          </>
        ) : (
          <div className="properties-grid">
            <div
              className={`property-card ${hasHistoryExtension ? "owned" : ""}`}
            >
              <div className="property-icon">📜</div>
              <div className="property-name">History Extension</div>
              <div className="property-description">
                Show 10 card history instead of 5
              </div>
              <div className="property-price">🪙 5,000</div>
              <button
                className={`buy-button ${hasHistoryExtension ? "owned" : ""}`}
                onClick={() => handleBuyProperty("history")}
                disabled={hasHistoryExtension}
              >
                {hasHistoryExtension ? "OWNED" : "Buy"}
              </button>
            </div>

            <div
              className={`property-card ${hasDoubleProgress ? "owned" : ""}`}
            >
              <div className="property-icon">⚡</div>
              <div className="property-name">Double Progress</div>
              <div className="property-description">
                Win one round counts as 2 progress in bonus track
              </div>
              <div className="property-price">🪙 10,000</div>
              <button
                className={`buy-button ${hasDoubleProgress ? "owned" : ""}`}
                onClick={() => handleBuyProperty("doubleProgress")}
                disabled={hasDoubleProgress}
              >
                {hasDoubleProgress ? "OWNED" : "Buy"}
              </button>
            </div>
          </div>
        )}
      </div>

      {showPaymentModal && (
        <div className="payment-overlay">
          <div className="payment-modal">
            <div className="payment-header">
              <h3>Select Payment Method</h3>
              <button className="close-button" onClick={closePaymentModal}>
                ×
              </button>
            </div>
            <div className="payment-details">
              <p>Purchase: {selectedPackage?.chips} Gold Coins</p>
              <p>
                Price: ${selectedPackage?.price} (or {selectedPackage?.gcCost}{" "}
                SC)
              </p>
              <p>Your Sweep Coins: {currentSweepstakeCoins.toFixed(1)} SC</p>
            </div>
            <div className="payment-methods">
              <button
                className="payment-button paypal"
                onClick={() => handlePayment("PayPal")}
              >
                💳 PayPal
              </button>
              <button
                className="payment-button sweepstake-coin"
                onClick={() => handlePayment("Sweepstake Coin")}
                disabled={
                  !selectedPackage?.gcCost ||
                  currentSweepstakeCoins < selectedPackage.gcCost
                }
              >
                💰 Sweep Coins{" "}
                {selectedPackage?.gcCost &&
                currentSweepstakeCoins < selectedPackage.gcCost
                  ? "(Insufficient)"
                  : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
