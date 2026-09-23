'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../styles/info-pages.css';

export default function AboutPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    queryType: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#contact') {
      const el = document.getElementById('contact');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.message) {
      alert('Please fill in all required fields marked with *');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          queryType: form.queryType || undefined,
          subject: form.queryType || undefined,
          message: form.message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || (data.errors && data.errors[0]) || 'Failed to submit query. Please try again.');
      }

      setSubmitted(true);
    } catch (err) {
      alert(err.message || 'An error occurred while submitting your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="about-contact-unified-page">
      {/* Top Section: About Us & Onsite Promo Sidebar */}
      <section className="about-top-section">
        <div className="container">
          <div className="about-layout-grid">
            {/* Left Content Area: About Us & Mission */}
            <div className="about-main-content">
              {/* About & Contact Header */}
              <div className="about-heading-row">
                <h1 className="about-red-title">About &amp; Contact :</h1>
                <hr className="about-red-divider" />
              </div>

              {/* Paragraphs */}
              <div className="about-paragraphs-flow">
                <p>
                  ComplianceTrain.com is a comprehensive compliance training platform for professionals across various industries. We constantly strive to be pioneers in imparting professional education. We ensure that we connect with prominent experienced coaches from different industries to design and deliver high-quality online webinars on diverse themes. We take it as our responsibility to help build a more compliant responsible enterprise, for the same, we operate under a stringent code of ethics, and with process discipline to ensure greater shareholder returns. Our trainings are high on value, but not on cost.
                </p>

                <p>
                  We at ComplianceTrain.com, have helped many organizations stay updated with the recent happenings/news in their industry and explore the complex challenges in corporate governance, enterprise risk management, and regulatory compliance. Our e-learning programs include relevant and updated topics from industries like Healthcare, Medical Device, Pharma and Drugs, BFSI, Trade and Logistics, HR and much more. Keeping things simple and straight forward, so that we all can indeed improve the quality of our processes, our work, our businesses and enhance compliance globally.
                </p>

                <p>
                  It is well researched that multimedia instructional material enhance higher-level cognitive skills. Our webinars and seminars target the complex and ever changing nature of compliance regulations our clients and their compliance officers have to comply with. Our clients also have the ability to explore information in depth, from experts, on demand and interact with instructional material on a self-paced mode. Our experience, backed by external research, shows that while print instructional materials provided a sound means to guide, the use of multimedia does improve our perceived higher-order cognitive skills. With ComplianceTrain.com, professionals can make use of the best benefits relating to their professional training. They can get the benefit of advice from experts in the field. Professionals will have the flexibility of viewing recorded webinars at their convenience. ComplianceTrain.com offers online interactive participation. Using this, professionals, no matter which part of the world they are based in, will have the opportunity to listen to and interact with some of the most accomplished experts in the healthcare industry.
                </p>
              </div>

              {/* Our Mission Header */}
              <div className="mission-heading-row">
                <h2 className="about-red-title">Our Mission:</h2>
                <hr className="about-red-divider" />
              </div>

              {/* Mission Bullets */}
              <ul className="mission-bullet-list">
                <li>
                  <span className="bullet-dot">&bull;</span>
                  <span>Lower our clients stress and increasing knowledge about the compliance requirement are among our primary targets. We want to ensure that we have a defining impact on our clients compliance needs and can deliver significant savings in keeping their compliance team up to date.</span>
                </li>
                <li>
                  <span className="bullet-dot">&bull;</span>
                  <span>Ensure that our clients can continue focusing on their core business processes while delegating all their compliance related training processes to us and be sure we would keep them up there.</span>
                </li>
                <li>
                  <span className="bullet-dot">&bull;</span>
                  <span>Safeguarding our clients, by being their bridge, and us working on tapping in to and leverage a complete knowledge base. So that our clients could have access to world class training for their compliance staff.</span>
                </li>
              </ul>
            </div>

            {/* Right Sidebar: ONSITE TRAINING Promo Card */}
            <aside className="about-sidebar-col" aria-label="Onsite Training Promotion">
              <div className="onsite-promo-card">
                <div className="promo-img-frame">
                  <img 
                    src="/hero-executive.jpg" 
                    alt="Advanced Regulatory Trainings at your facility" 
                    className="promo-top-img"
                  />
                </div>
                <div className="promo-body">
                  <h3 className="promo-blue-heading">ONSITE TRAINING</h3>
                  <h4 className="promo-subheading">
                    Advanced Regulatory<br />
                    Trainings at your facility
                  </h4>
                  <div className="promo-accent-line"></div>
                  <p className="promo-desc-text">
                    Cost-Effective way to train your employees and customize trainings to your companys specific requirements. Top-rated and Renowned Experts at your facility and at your Convenience!
                  </p>
                  <div className="promo-link-row">
                    <Link href="/onsite-training" className="promo-more-link">
                      More +
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Bottom Section: Contact Us Box with Map and Form */}
      <section className="contact-bottom-section" id="contact" aria-label="Contact ComplianceTrain">
        <div className="container">
          <div className="contact-unified-card">
            <div className="contact-two-columns">
              {/* Left Column: Contact us at */}
              <div className="contact-info-col">
                <div className="contact-col-heading-wrap">
                  <h2 className="contact-col-heading">Contact us at</h2>
                  <div className="contact-blue-underline"></div>
                </div>

                {/* Address Item */}
                <div className="contact-detail-row">
                  <div className="contact-detail-icon" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2">
                      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                      <line x1="8" y1="2" x2="8" y2="18"></line>
                      <line x1="16" y1="6" x2="16" y2="22"></line>
                    </svg>
                  </div>
                  <address className="contact-detail-text">
                    50 E. Corona Ave Oakland, CA 94601 - USA
                  </address>
                </div>

                {/* Email Item */}
                <div className="contact-detail-row">
                  <div className="contact-detail-icon" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2">
                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                  </div>
                  <div className="contact-detail-text">
                    <a href="mailto:contactus@compliancetrain.com" className="email-link">
                      contactus@compliancetrain.com
                    </a>
                  </div>
                </div>

                {/* Phone & Fax Item */}
                <div className="contact-detail-row">
                  <div className="contact-detail-icon" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2">
                      <rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect>
                      <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    </svg>
                  </div>
                  <div className="contact-detail-text">
                    <div><strong>Direct:</strong> +1-888-222-5917</div>
                    <div><strong>Fax:</strong> +1-484-270-4440</div>
                  </div>
                </div>

                {/* Oakland Map Widget Mockup */}
                <div className="contact-map-frame">
                  <iframe
                    title="ComplianceTrain Headquarters Oakland Location"
                    src="https://maps.google.com/maps?q=50%20E.%20Corona%20Ave%20Oakland,%20CA%2094601&t=&z=14&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="170"
                    style={{ border: 0, borderRadius: '4px' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>

              {/* Right Column: Send us a message Form */}
              <div className="contact-form-col">
                <div className="contact-col-heading-wrap">
                  <h2 className="contact-col-heading">Send us a message</h2>
                  <div className="contact-blue-underline"></div>
                </div>

                {submitted ? (
                  <div className="message-sent-confirmation">
                    <div className="sent-check-icon">✓</div>
                    <h3>Thank you for reaching out!</h3>
                    <p>Your inquiry has been sent to our healthcare compliance team. We will respond promptly.</p>
                    <button 
                      type="button" 
                      className="btn-send-another"
                      onClick={() => {
                        setSubmitted(false);
                        setForm({ name: '', email: '', phone: '', queryType: '', message: '' });
                      }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form className="contact-inputs-grid" onSubmit={handleSubmit}>
                    {/* Name */}
                    <div className="input-field-group">
                      <label htmlFor="ct-name" className="input-label">
                        <span className="required-star">*</span> Name
                      </label>
                      <div className="icon-input-wrapper">
                        <span className="input-prefix-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#64748B"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </span>
                        <input
                          id="ct-name"
                          type="text"
                          required
                          className="styled-form-input"
                          placeholder="Enter the full name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="input-field-group">
                      <label htmlFor="ct-email" className="input-label">
                        <span className="required-star">*</span> Email Address
                      </label>
                      <div className="icon-input-wrapper">
                        <span className="input-prefix-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                        </span>
                        <input
                          id="ct-email"
                          type="email"
                          required
                          className="styled-form-input"
                          placeholder="Enter your email address"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="input-field-group">
                      <label htmlFor="ct-phone" className="input-label">
                        <span className="required-star">*</span> Phone number
                      </label>
                      <div className="icon-input-wrapper">
                        <span className="input-prefix-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        </span>
                        <input
                          id="ct-phone"
                          type="tel"
                          required
                          className="styled-form-input"
                          placeholder="Enter your Phone number"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Query */}
                    <div className="input-field-group">
                      <label htmlFor="ct-query" className="input-label">
                        Query
                      </label>
                      <div className="icon-input-wrapper">
                        <span className="input-prefix-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </span>
                        <select
                          id="ct-query"
                          className="styled-form-input"
                          value={form.queryType}
                          onChange={(e) => setForm({ ...form, queryType: e.target.value })}
                        >
                          <option value="">Select your Query</option>
                          <option value="HIPAA Compliance Training">HIPAA Compliance Training</option>
                          <option value="SAMHSA 42 CFR Part 2">SAMHSA 42 CFR Part 2</option>
                          <option value="Onsite Training Inquiry">Onsite Facility Training Inquiry</option>
                          <option value="Registration & Billing">Registration &amp; Invoice Billing</option>
                          <option value="General Question">General Question</option>
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="input-field-group">
                      <label htmlFor="ct-message" className="input-label">
                        Specify your message
                      </label>
                      <div className="icon-input-wrapper" style={{ alignItems: 'flex-start' }}>
                        <span className="input-prefix-icon" style={{ marginTop: '10px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#64748B"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                        </span>
                        <textarea
                          id="ct-message"
                          rows={4}
                          required
                          className="styled-form-input"
                          placeholder="Message"
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Privacy & Submit Button */}
                    <div className="form-submit-row">
                      <p className="privacy-consent-text">
                        Your privacy is important to us. Please read our <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                      </p>
                      <button type="submit" className="btn-submit-query">
                        Submit Query
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
