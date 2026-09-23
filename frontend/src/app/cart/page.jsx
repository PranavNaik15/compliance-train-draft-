'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../../styles/cart.css';

const DEFAULT_CART_ITEMS = [
  {
    id: 'webinar-hipaa-2',
    title: '2026 NEW HIPAA AND ARTIFICIAL INTELLIGENCE (AI) CHANGES AND UPDATES',
    price: 179,
    quantity: 1,
    type: 'LIVE',
    image: '/speaker-brian.jpg',
  },
  {
    id: 'webinar-hipaa-1',
    title: 'NEW HIPAA CHANGES AND UPDATES FOR 2026',
    price: 179,
    quantity: 1,
    type: 'LIVE',
    image: '/speaker-brian.jpg',
  },
];

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ct_cart_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(parsed);
          setIsLoaded(true);
          return;
        }
      }
    } catch (e) {
      // fallback
    }
    setCartItems(DEFAULT_CART_ITEMS);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('ct_cart_items', JSON.stringify(cartItems));
        // Dispatch storage event so navbar can update badge
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        // ignore
      }
    }
  }, [cartItems, isLoaded]);

  const handleUpdateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpgrade = () => {
    setIsUpgraded(true);
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    const code = promoCode.trim().toUpperCase();
    if (code === 'COMPLY10' || code === 'SAVE10' || code === 'COMPLIANCE10' || code === 'HIPAA10') {
      setPromoDiscount(0.1);
      setPromoMessage({ type: 'success', text: 'Promo code applied! $10 discount added.' });
    } else if (code === 'SAVE20' || code === 'COMPLIANCE20') {
      setPromoDiscount(0.2);
      setPromoMessage({ type: 'success', text: 'Promo code applied! 20% discount added.' });
    } else {
      setPromoDiscount(0);
      setPromoMessage({ type: 'error', text: 'Invalid promo code. Please check and try again.' });
    }
  };

  const itemsSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const upgradeCost = isUpgraded ? 120 : 0;
  const subtotal = itemsSubtotal + upgradeCost;
  const discountAmount = subtotal * promoDiscount;
  const total = Math.max(0, subtotal - discountAmount);

  const handleProceedCheckout = () => {
    if (cartItems.length === 0) return;
    const primaryItem = cartItems[0];
    sessionStorage.setItem('ct_cart_checkout', JSON.stringify({
      cartItems,
      isUpgraded,
      subtotal,
      total,
    }));
    router.push(`/webinars/${primaryItem.id}/register?option=combo&price=${total}`);
  };

  if (!isLoaded) {
    return (
      <div className="cart-page-ct">
        <div className="cart-container">
          <div className="cart-empty-state">
            <div className="loading-spinner"></div>
            <p style={{ color: 'var(--color-text-muted)' }}>Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="cart-page-ct">
      <div className="cart-container">
        {/* 1. Header Row */}
        <div className="cart-header-row">
          <h1 className="cart-page-title">My Cart</h1>
          <Link href="/live-webinars" className="btn-add-more-trainings">
            <span>Add More Trainings</span>
            <span aria-hidden="true">&rsaquo;</span>
          </Link>
        </div>

        {cartItems.length === 0 ? (
          /* Empty State */
          <div className="cart-empty-state">
            <div className="cart-empty-icon" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <h2 className="cart-empty-title">Your Cart is Empty</h2>
            <p className="cart-empty-desc">
              Browse our live and on-demand compliance webinars to find the training you need.
            </p>
            <Link href="/live-webinars" className="btn-add-more-trainings" style={{ marginTop: '0.5rem' }}>
              Explore Live Webinars &rarr;
            </Link>
          </div>
        ) : (
          <>
            {/* 2. Cart Items List */}
            <div className="cart-items-list" role="list">
              {cartItems.map((item) => {
                const itemTotal = item.price * item.quantity;
                return (
                  <article key={item.id} className="cart-item-card" role="listitem">
                    {/* Left: Thumbnail Image */}
                    <div className="cart-item-thumb-wrap">
                      <img 
                        src={item.image || '/speaker-brian.jpg'} 
                        alt={item.title} 
                        className="cart-item-thumb-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Left: Title & Live Badge */}
                    <div className="cart-item-meta">
                      <h2 className="cart-item-title">{item.title}</h2>
                      <span className="cart-live-badge">( LIVE )</span>
                    </div>

                    {/* Center: Quantity Selector */}
                    <div className="cart-quantity-col">
                      <div className="quantity-pill-box">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          aria-label={`Decrease quantity of ${item.title}`}
                        >
                          &minus;
                        </button>
                        <span className="qty-count">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          aria-label={`Increase quantity of ${item.title}`}
                        >
                          &#43;
                        </button>
                      </div>
                      <span className="qty-unit-price">x ${item.price.toFixed(2)}</span>
                    </div>

                    {/* Right: Item Total Price */}
                    <div className="cart-item-price-col">
                      <span className="cart-item-price-text">${itemTotal.toFixed(2)}</span>
                    </div>

                    {/* Far Right: Delete Trash Button */}
                    <button
                      type="button"
                      className="btn-cart-remove"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Remove item from cart"
                      aria-label={`Remove ${item.title} from cart`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </article>
                );
              })}
            </div>

            {/* 3. Upgrade / Recommended Package Promotional Banner */}
            <section className="cart-upgrade-banner" aria-label="Upgrade Offer">
              {/* Left Content */}
              <div className="upgrade-left-content">
                <div className="upgrade-header-row">
                  <span className="upgrade-best-badge">
                    <span aria-hidden="true">&#9733;</span> BEST VALUE
                  </span>
                  <h2 className="upgrade-banner-title">Upgrade to Live + Recorded Combo</h2>
                </div>
                <p className="upgrade-banner-desc">
                  For just <strong>$120.00 more</strong>, get significantly more value with our Live + Recorded Combo package!
                </p>
                <ul className="upgrade-checklist">
                  <li>
                    <span className="upgrade-check-icon" aria-hidden="true">&#10004;</span>
                    <span>Live session + permanent recording access</span>
                  </li>
                  <li>
                    <span className="upgrade-check-icon" aria-hidden="true">&#10004;</span>
                    <span>Best value for individual learners</span>
                  </li>
                  <li>
                    <span className="upgrade-check-icon" aria-hidden="true">&#10004;</span>
                    <span>Review materials anytime</span>
                  </li>
                  <li>
                    <span className="upgrade-check-icon" aria-hidden="true">&#10004;</span>
                    <span>Lifetime reference library</span>
                  </li>
                </ul>
              </div>

              {/* Right Box */}
              <div className="upgrade-right-box">
                <div className="upgrade-icon-badge" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <polygon points="10 8 16 12 10 16 10 8"></polygon>
                  </svg>
                </div>
                <div className="upgrade-price-text">${isUpgraded ? '120.00' : '120.00'}</div>
                <span className="upgrade-price-sub">Additional cost</span>
                <span className="upgrade-save-text">Save 60% vs buying separately</span>
                <button
                  type="button"
                  className="btn-upgrade-now"
                  onClick={handleUpgrade}
                  disabled={isUpgraded}
                >
                  {isUpgraded ? 'UPGRADED ✓' : 'UPGRADE NOW'}
                </button>
              </div>
            </section>

            {/* 4. Bottom Cart Area (Promo Code & Order Summary) */}
            <div className="cart-bottom-grid">
              {/* Promo Code Box */}
              <div className="cart-promo-card">
                <h3 className="promo-card-title">Have A Promo Code?</h3>
                <form onSubmit={handleApplyPromo} className="promo-input-group">
                  <input
                    type="text"
                    className="promo-input"
                    placeholder="Enter Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    aria-label="Enter promotional code"
                  />
                  <button type="submit" className="btn-promo-apply" aria-label="Apply promo code">
                    &gt;
                  </button>
                </form>
                {promoMessage && (
                  <p className={`promo-message-text ${promoMessage.type}`}>
                    {promoMessage.text}
                  </p>
                )}
              </div>

              {/* Order Summary Box */}
              <div className="cart-summary-card">
                <div className="summary-data-rows">
                  <div className="summary-row">
                    <span className="summary-label">SUBTOTAL</span>
                    <span className="summary-value">${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="summary-row" style={{ color: '#0066CC' }}>
                      <span className="summary-label" style={{ color: '#0066CC' }}>DISCOUNT</span>
                      <span className="summary-value" style={{ color: '#0066CC' }}>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="summary-divider" aria-hidden="true" />
                  <div className="summary-row total-row">
                    <span className="summary-label">TOTAL</span>
                    <span className="summary-value">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-checkout-proceed"
                  onClick={handleProceedCheckout}
                >
                  REGISTER AND PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
