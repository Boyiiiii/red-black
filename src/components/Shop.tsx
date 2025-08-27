import React, { useState } from "react";
import "./Shop.css";

interface ShopProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyChips: (amount: number) => void;
  currentChips: number;
  hasHistoryExtension: boolean;
  hasDoubleProgress: boolean;
  onBuyHistoryExtension: () => boolean;
  onBuyDoubleProgress: () => boolean;
}

const Shop: React.FC<ShopProps> = ({
  isOpen,
  onClose,
  onBuyChips,
  currentChips,
  hasHistoryExtension,
  hasDoubleProgress,
  onBuyHistoryExtension,
  onBuyDoubleProgress,
}) => {
  const [activeTab, setActiveTab] = useState<'chips' | 'properties'>('chips');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{chips: number, price: number} | null>(null);
  
  const packages = [
    { chips: 1000, price: 1.99, popular: false },
    { chips: 3000, price: 3.99, popular: true },
    { chips: 5000, price: 6.99, popular: false },
  ];

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  const handleBuy = (pkg: {chips: number, price: number}) => {
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
  };

  const handlePayment = (method: string) => {
    if (selectedPackage) {
      // In a real app, integrate with actual payment processors
      console.log(`Processing ${method} payment for ${selectedPackage.chips} chips`);
      onBuyChips(selectedPackage.chips);
      setShowPaymentModal(false);
      setSelectedPackage(null);
      onClose();
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
          Current Chips: <span className="chips-count">{currentChips}</span>
        </div>

        <div className="shop-tabs">
          <button 
            className={`tab-button ${activeTab === 'chips' ? 'active' : ''}`}
            onClick={() => setActiveTab('chips')}
          >
            🪙 Chips
          </button>
          <button 
            className={`tab-button ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            ⚡ Properties
          </button>
        </div>

        {activeTab === 'chips' ? (
          <>
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
              <p>Purchase: {selectedPackage?.chips} chips</p>
              <p>Price: ${selectedPackage?.price}</p>
            </div>
            <div className="payment-methods">
              <button 
                className="payment-button paypal"
                onClick={() => handlePayment('PayPal')}
              >
                💳 PayPal
              </button>
              {isIOS && (
                <button 
                  className="payment-button apple-pay"
                  onClick={() => handlePayment('Apple Pay')}
                >
                  🍎 Apple Pay
                </button>
              )}
              {isAndroid && (
                <button 
                  className="payment-button google-pay"
                  onClick={() => handlePayment('Google Pay')}
                >
                  🔵 Google Pay
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
