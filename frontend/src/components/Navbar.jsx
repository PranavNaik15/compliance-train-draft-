'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import '../styles/navbar.css';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/live-webinars?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/live-webinars');
    }
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

            <div className="header-cart" title="Shopping Cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="cart-text">Cart</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>

            <div className="auth-buttons">
              <button 
                type="button" 
                className="btn-pill-outline"
                onClick={() => alert('Corporate SSO Login')}
              >
                Sign In <span style={{ fontSize: '0.7rem' }}>&#9662;</span>
              </button>
              <Link href="/live-webinars" className="btn-pill-primary">
                Sign Up
              </Link>
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
    </header>
  );
}
