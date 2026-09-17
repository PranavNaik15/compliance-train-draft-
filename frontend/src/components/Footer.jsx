'use client';

import React from 'react';
import Link from 'next/link';
import '../styles/footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-clean" role="contentinfo">
      <div className="container footer-clean-inner">
        <div className="footer-top-grid">
          <div className="footer-brand-col">
            <div className="footer-brand-logo">
              <div className="footer-brand-badge">CT</div>
              <span className="footer-brand-title">Compliance<span style={{ color: 'var(--color-blue-primary)' }}>Train</span></span>
            </div>
            <p className="footer-about-text">
              A comprehensive HIPAA &amp; SAMHSA healthcare compliance training platform connecting healthcare organizations with certified auditors for live webinars and customized onsite programs.
            </p>
            <div className="footer-direct-contact">
              <div><strong>Toll-Free:</strong> +1-888-222-5917</div>
              <div><strong>Email:</strong> contactus@compliancetrain.com</div>
            </div>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-col-heading">Compliance Programs</h4>
            <ul className="footer-links-list">
              <li><Link href="/live-webinars">Live Interactive Webinars</Link></li>
              <li><Link href="/recorded-webinars">Recorded On-Demand Library</Link></li>
              <li><Link href="/onsite-training">Customized Onsite Training</Link></li>
              <li><Link href="/live-webinars?category=HIPAA%20Privacy%20%26%20Security">HIPAA Privacy &amp; Security</Link></li>
              <li><Link href="/live-webinars?category=SAMHSA%2042%20CFR%20Part%202">SAMHSA 42 CFR Part 2</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-col-heading">Company &amp; Help</h4>
            <ul className="footer-links-list">
              <li><Link href="/about">About ComplianceTrain</Link></li>
              <li><Link href="/about">Brian L. Tuttle &amp; Faculty</Link></li>
              <li><Link href="/onsite-training">Clinic &amp; Hospital Inquiries</Link></li>
              <li><Link href="/about">Contact Advisory Team</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-col-heading">Headquarters</h4>
            <address className="footer-address">
              50 E. Corona Ave<br />
              Oakland, CA 94601<br />
              United States of America<br />
              <span style={{ display: 'block', marginTop: '0.5rem', color: 'var(--color-text-subtle)' }}>
                Mon - Fri: 8:00 AM - 6:00 PM EST
              </span>
            </address>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>&copy; {currentYear} ComplianceTrain Healthcare Learning Network. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <span>&bull;</span>
            <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            <span>&bull;</span>
            <a href="#accessibility" onClick={(e) => e.preventDefault()}>Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
