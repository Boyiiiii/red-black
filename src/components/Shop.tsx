import React, { useState } from "react";
import "./Shop.css";

interface ShopProps {
  isOpen: boolean;
  onClose: () => void;
  onBuySweepstakeCoins: (amount: number) => void;
  currentSweepstakeCoins: number;
  currentGoldCoins: number;
  hasHistoryExtension: boolean;
  hasDoubleProgress: boolean;
  onBuyHistoryExtension: () => boolean;
  onBuyDoubleProgress: () => boolean;
  onBuySweepstakeCoinsWithGC: (scAmount: number, gcCost: number) => boolean;
}

const Shop: React.FC<ShopProps> = ({
  isOpen,
  onClose,
  onBuySweepstakeCoins,
  currentSweepstakeCoins,
  currentGoldCoins,
  hasHistoryExtension,
  hasDoubleProgress,
  onBuyHistoryExtension,
  onBuyDoubleProgress,
  onBuySweepstakeCoinsWithGC,
}) => {
  const [activeTab, setActiveTab] = useState<'sweepstake' | 'properties'>('sweepstake');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{chips: number, price: number, gcCost?: number} | null>(null);
  
  // PayPal packages (real money)
  const paypalPackages = [
    { chips: 1000, price: 1.99, popular: false },
    { chips: 3000, price: 3.99, popular: true },
    { chips: 5000, price: 6.99, popular: false },
  ];

  // Gold Coin packages (use GC to buy SC)
  const goldCoinPackages = [
    { chips: 500, gcCost: 0.5, popular: false },
    { chips: 1000, gcCost: 1.0, popular: true },
    { chips: 2000, gcCost: 1.8, popular: false },
  ];

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  const handleBuy = (pkg: {chips: number, price: number}) => {
    // Calculate Gold Coin cost (price in USD / 0.10 per GC)
    const gcCost = pkg.price / 0.10;
    setSelectedPackage({ ...pkg, gcCost });
    setShowPaymentModal(true);
  };

  const handlePayment = (method: string) => {
    if (selectedPackage) {
      let success = false;
      
      if (method === 'Gold Coin' && selectedPackage.gcCost) {
        // Use Gold Coins to buy Sweepstake Coins
        success = onBuySweepstakeCoinsWithGC(selectedPackage.chips, selectedPackage.gcCost);
        if (!success) {
          alert(`Not enough Gold Coins! You need ${selectedPackage.gcCost} GC.`);
          return;
        }
      } else {
        // PayPal payment (demo - just add the chips)
        console.log(`Processing ${method} payment for ${selectedPackage.chips} Sweepstake Coins`);
        onBuySweepstakeCoins(selectedPackage.chips);
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

  const handleBuyProperty = (propertyType: 'history' | 'doubleProgress') => {
    let success = false;
    if (propertyType === 'history') {
      success = onBuyHistoryExtension();
    } else if (propertyType === 'doubleProgress') {
      success = onBuyDoubleProgress();
    }
    
    if (success) {
      alert('Property purchased successfully!');
    } else {
      alert('Not enough chips or already owned!');
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
          Current Sweepstake Coins: <span className="chips-count">{currentSweepstakeCoins}</span>
        </div>

        <div className="shop-tabs">
          <button 
            className={`tab-button ${activeTab === 'sweepstake' ? 'active' : ''}`}
            onClick={() => setActiveTab('sweepstake')}
          >
            🪙 Sweepstake Coins
          </button>
          <button 
            className={`tab-button ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            ⚡ Properties
          </button>
        </div>

        {activeTab === 'sweepstake' ? (
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
                  <button
                    className="buy-button"
                    onClick={() => handleBuy(pkg)}
                  >
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
            <div className={`property-card ${hasHistoryExtension ? 'owned' : ''}`}>
              <div className="property-icon">📜</div>
              <div className="property-name">History Extension</div>
              <div className="property-description">
                Show 10 card history instead of 5
              </div>
              <div className="property-price">🪙 5,000</div>
              <button
                className={`buy-button ${hasHistoryExtension ? 'owned' : ''}`}
                onClick={() => handleBuyProperty('history')}
                disabled={hasHistoryExtension}
              >
                {hasHistoryExtension ? 'OWNED' : 'Buy'}
              </button>
            </div>

            <div className={`property-card ${hasDoubleProgress ? 'owned' : ''}`}>
              <div className="property-icon">⚡</div>
              <div className="property-name">Double Progress</div>
              <div className="property-description">
                Win one round counts as 2 progress in bonus track
              </div>
              <div className="property-price">🪙 10,000</div>
              <button
                className={`buy-button ${hasDoubleProgress ? 'owned' : ''}`}
                onClick={() => handleBuyProperty('doubleProgress')}
                disabled={hasDoubleProgress}
              >
                {hasDoubleProgress ? 'OWNED' : 'Buy'}
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
              <p>Purchase: {selectedPackage?.chips} Sweepstake Coins</p>
              <p>Price: ${selectedPackage?.price} (or {selectedPackage?.gcCost} GC)</p>
              <p>Your Gold Coins: {currentGoldCoins.toFixed(1)} GC</p>
            </div>
            <div className="payment-methods">
              <button 
                className="payment-button paypal"
                onClick={() => handlePayment('PayPal')}
              >
                💳 PayPal
              </button>
              <button 
                className="payment-button gold-coin"
                onClick={() => handlePayment('Gold Coin')}
                disabled={!selectedPackage?.gcCost || currentGoldCoins < selectedPackage.gcCost}
              >
                🏆 Gold Coins {selectedPackage?.gcCost && currentGoldCoins < selectedPackage.gcCost ? '(Insufficient)' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
