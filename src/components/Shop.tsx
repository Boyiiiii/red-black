import React, { useState } from "react";
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{chips: number, price: number} | null>(null);
  
  const packages = [
    { chips: 50, price: 0.99, popular: false },
    { chips: 100, price: 1.99, popular: true },
    { chips: 250, price: 4.99, popular: false },
    { chips: 500, price: 9.99, popular: false },
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
