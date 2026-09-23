'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import '../styles/navbar.css';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(2);
  const [currentUser, setCurrentUser] = useState(null);

  // Auth modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check cart count
    const updateCount = () => {
      try {
        const stored = localStorage.getItem('ct_cart_items');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const totalQty = parsed.reduce((sum, item) => sum + (item.quantity || 1), 0);
            setCartCount(totalQty);
            return;
          }
        }
      } catch (e) {}
      setCartCount(2);
    };

    // Check logged in user
    try {
      const storedUser = localStorage.getItem('ct_auth_user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (e) {}

    updateCount();
    window.addEventListener('storage', updateCount);
    return () => window.removeEventListener('storage', updateCount);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/live-webinars?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/live-webinars');
    }
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setAuthError('');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError('');
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: authName.trim(),
            email: authEmail.trim(),
            password: authPassword,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || (data.errors && data.errors[0]) || 'Registration failed.');
        }

        if (data.token) {
          localStorage.setItem('ct_auth_token', data.token);
          localStorage.setItem('ct_auth_user', JSON.stringify(data.user));
          setCurrentUser(data.user);
        }
        closeAuthModal();
      } else {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail.trim(),
            password: authPassword,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || (data.errors && data.errors[0]) || 'Invalid credentials.');
        }

        if (data.token) {
          localStorage.setItem('ct_auth_token', data.token);
          localStorage.setItem('ct_auth_user', JSON.stringify(data.user));
          setCurrentUser(data.user);
        }
        closeAuthModal();
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication request failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ct_auth_token');
    localStorage.removeItem('ct_auth_user');
    setCurrentUser(null);
  };

  return (
    <header className="site-header" role="banner">
      {/* Top Utility Header */}
      <div className="top-header">
        <div className="container top-header-inner">
          {/* Logo */}
          <Link href="/" className="brand-logo" aria-label="ComplianceTrain Home">
            <div className="brand-badge-circle" aria-hidden="true">
              <span>CT</span>
            </div>
            <div className="brand-text">
              <span className="brand-title">Compliance <span className="brand-title-sub">Train</span></span>
              <span className="brand-tagline">Trained by GRC Experts</span>
            </div>
          </Link>

          {/* Search Bar */}
          <form className="header-search-form" onSubmit={handleSearch} role="search">
            <div className="search-input-wrap">
              <input
                type="text"
                className="header-search-input"
                placeholder="Search for webinars, seminars, and training..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search webinars and training"
              />
              <button type="submit" className="header-search-btn" aria-label="Execute search">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>
          </form>

          {/* Right Action Utilities */}
          <div className="header-actions">
            <a href="tel:+18882225917" className="header-phone" title="Call support">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>+1-888-222-5917</span>
            </a>

            <Link href="/cart" className="header-cart" title="Shopping Cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              <span className="cart-text">Cart</span>
            </Link>

            <div className="auth-buttons">
              {currentUser ? (
                <>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0A3366', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                    {currentUser.name || 'Member'}
                  </span>
                  <button 
                    type="button" 
                    className="btn-pill-outline"
                    onClick={handleLogout}
                    style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button 
                    type="button" 
                    className="btn-pill-outline"
                    onClick={() => openAuthModal('login')}
                  >
                    Sign In <span style={{ fontSize: '0.7rem' }}>&#9662;</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn-pill-primary"
                    onClick={() => openAuthModal('register')}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navy Navigation Bar with Icons */}
      <nav className="main-nav-bar" aria-label="Main Navigation">
        <div className="container main-nav-inner">
          <ul className="nav-links-list">
            <li>
              <Link 
                href="/" 
                className={`nav-item-link ${pathname === '/' ? 'active' : ''}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                <span>Live Webinars</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/recorded-webinars" 
                className={`nav-item-link ${pathname === '/recorded-webinars' ? 'active' : ''}`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Recorded Webinars</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/onsite-training" 
                className={`nav-item-link ${pathname === '/onsite-training' ? 'active' : ''}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>Onsite Training</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/membership" 
                className={`nav-item-link ${pathname === '/membership' ? 'active' : ''}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                <span>Membership</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/about" 
                className={`nav-item-link ${pathname === '/about' || pathname === '/contact' ? 'active' : ''}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>About &amp; Contact</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(10, 30, 60, 0.65)',
            backdropFilter: 'blur(3px)',
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAuthModal();
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 30px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Modal Header */}
            <div style={{ backgroundColor: '#0A3366', padding: '1.25rem 1.5rem', color: '#FFFFFF', position: 'relative' }}>
              <button
                type="button"
                onClick={closeAuthModal}
                aria-label="Close modal"
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
              <h2 id="auth-modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                {authMode === 'login' ? 'Sign In to ComplianceTrain' : 'Create an Account'}
              </h2>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#93C5FD' }}>
                {authMode === 'login' ? 'Access your webinars, recordings, and certificates.' : 'Join thousands of healthcare compliance professionals.'}
              </p>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              {authError && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#991B1B',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    marginBottom: '1rem',
                  }}
                >
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit}>
                {authMode === 'register' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#1E293B', marginBottom: '0.35rem' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Sarah Jenkins"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#1E293B', marginBottom: '0.35rem' }}>
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@organization.org"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#1E293B', marginBottom: '0.35rem' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  style={{
                    width: '100%',
                    backgroundColor: '#0066CC',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: authLoading ? 'not-allowed' : 'pointer',
                    opacity: authLoading ? 0.7 : 1,
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {authLoading
                    ? 'Processing...'
                    : authMode === 'login'
                    ? 'Sign In →'
                    : 'Create Account →'}
                </button>
              </form>

              {/* Toggle Mode */}
              <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748B' }}>
                {authMode === 'login' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => openAuthModal('register')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0066CC',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                      }}
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0066CC',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                      }}
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
