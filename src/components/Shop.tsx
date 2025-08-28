import React, { useState } from "react";
import "./Shop.css";

interface ShopProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyGoldCoins: (amount: number) => void;
  onBuySweepCoins: (amount: number) => void;
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
  onBuySweepCoins,
  currentSweepstakeCoins,
  hasHistoryExtension,
  hasDoubleProgress,
  onBuyHistoryExtension,
  onBuyDoubleProgress,
  onBuyGoldCoinsWithSC,
}) => {
  const [activeTab, setActiveTab] = useState<"gold" | "properties">("gold");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{
    chips: number;
    price: number;
    gcCost?: number;
  } | null>(null);

  // PayPal packages with free SC bonuses
  const paypalPackages = [
    {
      chips: 1000,
      price: 1.99,
      popular: false,
      bonusSC: 2.0,
      badge: null,
    },
    {
      chips: 3000,
      price: 3.99,
      popular: true,
      bonusSC: 5.0,
      badge: "MOST POPULAR",
    },
    {
      chips: 5000,
      price: 6.99,
      popular: false,
      bonusSC: 10.0,
      badge: "BEST VALUE",
    },
    {
      chips: 10000,
      price: 12.99,
      popular: false,
      bonusSC: 25.0,
      badge: "MEGA PACK",
    },
  ];

  const handleBuy = (pkg: {
    chips: number;
    price: number;
    bonusSC: number;
  }) => {
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
        // PayPal payment (demo - add gold coins + bonus sweep coins)
        console.log(
          `Processing ${method} payment for ${
            selectedPackage.chips
          } Gold Coins + ${(selectedPackage as any).bonusSC} bonus SC`
        );
        onBuyGoldCoins(selectedPackage.chips);
        if ((selectedPackage as any).bonusSC) {
          onBuySweepCoins((selectedPackage as any).bonusSC);
        }
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
          <div className="shop-title-section">
            <div className="shop-icon">💎</div>
            <div className="shop-title-text">
              <h2>Premium Store</h2>
              <p>Exclusive packages & power-ups</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="shop-tabs">
          <button
            className={`tab-button ${activeTab === "gold" ? "active" : ""}`}
            onClick={() => setActiveTab("gold")}
          >
            <div className="tab-icon">💰</div>
            <span>Coin Packages</span>
          </button>
          <button
            className={`tab-button ${
              activeTab === "properties" ? "active" : ""
            }`}
            onClick={() => setActiveTab("properties")}
          >
            <div className="tab-icon">⚡</div>
            <span>Power-Ups</span>
          </button>
        </div>

        {activeTab === "gold" ? (
          <>
            <div className="packages-grid">
              {paypalPackages.map((pkg, index) => (
                <div
                  key={index}
                  className={`package-card ${pkg.popular ? "popular" : ""} ${
                    pkg.badge === "MEGA PACK" ? "mega" : ""
                  } ${pkg.badge === "BEST VALUE" ? "best-value" : ""}`}
                >
                  {pkg.badge && (
                    <div className="package-badge">{pkg.badge}</div>
                  )}

                  <div className="package-content">
                    <div className="package-main">
                      <div className="package-chips">
                        <div className="chips-icon">🪙</div>
                        <div className="chips-amount">
                          {pkg.chips.toLocaleString()}
                        </div>
                        <div className="chips-label">Gold Coins</div>
                      </div>

                      <div className="package-bonus">
                        <div className="bonus-header">+ FREE BONUS</div>
                        <div className="bonus-sc">
                          <div className="bonus-icon">💰</div>
                          <div className="bonus-amount">{pkg.bonusSC}</div>
                          <div className="bonus-label">Sweep Coins</div>
                        </div>
                      </div>
                    </div>

                    <div className="package-footer">
                      <button
                        className="buy-button premium"
                        onClick={() => handleBuy(pkg)}
                      >
                        Buy ${pkg.price}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
              <button
                className={`buy-button ${hasHistoryExtension ? "owned" : ""}`}
                onClick={() => handleBuyProperty("history")}
                disabled={hasHistoryExtension}
              >
                {hasHistoryExtension ? "OWNED" : "Buy 🪙 5,000"}
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
              <button
                className={`buy-button ${hasDoubleProgress ? "owned" : ""}`}
                onClick={() => handleBuyProperty("doubleProgress")}
                disabled={hasDoubleProgress}
              >
                {hasDoubleProgress ? "OWNED" : "Buy 🪙 10,000"}
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
