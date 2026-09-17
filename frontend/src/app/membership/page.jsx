'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import '../../styles/membership.css';

export default function MembershipPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleSubscribe = (planName, price) => {
    alert(`Selected plan: ${planName} (${price}). Our advisory team will contact you to confirm activation.`);
  };

  const individualPlans = [
    {
      id: 'ind-1m',
      name: '1 Month Membership',
      duration: '1 Month',
      price: '$199',
      frequency: '/ month',
      effectiveRate: null,
      isBestValue: false,
      description: 'Flexible short-term compliance training access for individual professionals.',
      features: [
        'Access to scheduled live interactive webinars during active month',
        'Unlimited access to on-demand recorded webinar library',
        'Downloadable slide decks and reference handouts',
        'Official certificate of completion for attended sessions',
        'Standard customer & technical support',
      ],
    },
    {
      id: 'ind-6m',
      name: '6 Months Membership',
      duration: '6 Months',
      price: '$899',
      frequency: '/ 6 months',
      effectiveRate: '$150/month when billed semi-annually',
      isBestValue: false,
      description: 'Extended compliance training access for ongoing professional education.',
      features: [
        'Access to all live interactive webinars during 6-month period',
        'Unlimited access to on-demand recorded webinar library',
        'Downloadable slide decks and compliance reference materials',
        'Certificates of completion for all completed courses',
        'Member-only regulatory updates & guidance documents',
        'Standard customer & technical support',
      ],
    },
    {
      id: 'ind-1y',
      name: '1 Year Membership',
      duration: '1 Year',
      price: '$1,499',
      frequency: '/ year',
      effectiveRate: '$125/month when billed annually',
      isBestValue: true,
      description: 'Comprehensive year-round compliance training and resource access.',
      features: [
        'Full access to all scheduled live interactive webinars for 12 months',
        '24/7 unlimited access to complete on-demand recording library',
        'Complete training materials, checklists & slide decks',
        'Verified CEU & attendance certificates for all sessions',
        'Priority regulatory updates and compliance newsletters',
        'Priority customer & coordinator support',
      ],
    },
  ];

  const corporatePlans = [
    {
      id: 'corp-1m',
      name: '1 Month Corporate',
      duration: '1 Month',
      price: '$499',
      frequency: '/ month',
      effectiveRate: null,
      isBestValue: false,
      description: 'Flexible short-term compliance training access for healthcare teams and clinics.',
      features: [
        'Team access for up to 5 users from your organization',
        'Access to live interactive webinars for registered team members',
        'Unlimited access to on-demand recorded webinar library',
        'Downloadable training handouts & presentation decks',
        'Individual certificates of completion for each attendee',
        'Dedicated team coordination support',
      ],
    },
    {
      id: 'corp-6m',
      name: '6 Months Corporate',
      duration: '6 Months',
      price: '$2,399',
      frequency: '/ 6 months',
      effectiveRate: '$400/month when billed semi-annually',
      isBestValue: false,
      description: 'Extended organization access for clinics, medical groups, and hospital departments.',
      features: [
        'Team access for up to 10 users across your organization',
        'Access to all scheduled live interactive compliance webinars',
        'Full on-demand recording vault access with digital transcripts',
        'Departmental policy templates & training resources',
        'Verified staff CEU & compliance certificates',
        'Priority organization support & coordinator assistance',
      ],
    },
    {
      id: 'corp-1y',
      name: '1 Year Corporate',
      duration: '1 Year',
      price: '$3,999',
      frequency: '/ year',
      effectiveRate: '$333/month when billed annually',
      isBestValue: true,
      description: 'Complete annual compliance training solution for entire healthcare organizations.',
      features: [
        'Organization-wide team access with scalable user seats',
        'Unlimited team attendance across all scheduled live webinars',
        '24/7 full recording vault access for all authorized staff',
        'Complete library of regulatory templates, checklists & SOPs',
        'Organization-wide verified compliance tracking & certificates',
        'Dedicated compliance account manager & priority support',
      ],
    },
  ];

  const faqs = [
    {
      q: 'What is included with membership?',
      a: 'ComplianceTrain membership provides ongoing access to our live interactive webinars, our on-demand recorded webinar vault, downloadable presentation slides, compliance checklists, and verified certificates of completion for attended sessions throughout your membership period.',
    },
    {
      q: 'Can I attend live webinars?',
      a: 'Yes. All active membership plans include access to scheduled live interactive webinars. Individual memberships cover a single attendee, while Corporate memberships allow team attendance based on your selected seat tier.',
    },
    {
      q: 'Can I access recorded webinars?',
      a: 'Yes. Members receive 24/7 unlimited access to our entire library of recorded on-demand compliance sessions, including transcripts and supporting materials, for the full duration of their active membership term.',
    },
    {
      q: 'Can I use membership for multiple employees?',
      a: 'Corporate Membership plans are designed specifically for teams and organizations, providing multi-seat or organization-wide access. Individual Membership plans are licensed for a single professional.',
    },
    {
      q: 'What is the difference between Individual and Corporate membership?',
      a: 'Individual memberships provide access for one designated professional. Corporate memberships provide multi-user team seats, organization-wide compliance tracking, team certificates, and dedicated account support for healthcare facilities and clinics.',
    },
    {
      q: 'What happens when my membership expires?',
      a: 'You will receive advance notifications prior to your expiration date with renewal options. Upon expiration, access to live sessions and the on-demand recording vault is paused until your plan is renewed.',
    },
  ];

  return (
    <div className="membership-page">
      {/* Breadcrumbs Bar */}
      <div className="breadcrumbs-bar">
        <div className="container">
          <nav className="breadcrumbs-nav" aria-label="Breadcrumbs">
            <Link href="/" className="breadcrumb-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: '-1px', marginRight: '4px' }}>
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              Home
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Membership</span>
          </nav>
        </div>
      </div>

      {/* 1. Membership Page Hero */}
      <section className="membership-hero" aria-labelledby="membership-hero-heading">
        <div className="container">
          <div className="membership-hero-content">
            <h1 id="membership-hero-heading" className="membership-hero-title">
              Membership Plans
            </h1>
            <h2 className="membership-hero-subtitle">
              Compliance training that fits your needs.
            </h2>
            <p className="membership-hero-desc">
              Choose from flexible membership options designed for individual professionals and organizations.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Individual Membership Section */}
      <section className="container membership-section" aria-labelledby="individual-heading">
        <div className="section-header-block">
          <h2 id="individual-heading" className="section-heading-title">
            Individual Membership
          </h2>
          <p className="section-heading-sub">
            For professionals who want ongoing access to compliance training.
          </p>
        </div>

        <div className="membership-cards-row">
          {individualPlans.map((plan) => (
            <div
              key={plan.id}
              className={`membership-plan-card ${plan.isBestValue ? 'is-best-value' : ''}`}
            >
              {plan.isBestValue && (
                <span className="best-value-badge">BEST VALUE</span>
              )}

              <div className="card-top-area">
                <h3 className="card-plan-title">{plan.name}</h3>
                <p className="card-plan-desc">{plan.description}</p>
                <div className="card-pricing-block">
                  <div className="pricing-main-line">
                    <span className="pricing-currency">$</span>
                    <span className="pricing-amount">{plan.price.replace('$', '')}</span>
                    <span className="pricing-frequency">{plan.frequency}</span>
                  </div>
                  <div className="pricing-effective-rate">
                    {plan.effectiveRate ? plan.effectiveRate : ''}
                  </div>
                </div>
              </div>

              <div className="card-features-area">
                <h4 className="features-heading">What&apos;s Included</h4>
                <ul className="features-list">
                  {plan.features.map((feat, idx) => (
                    <li key={idx}>
                      <span className="feature-check" aria-hidden="true">✔</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card-action-area">
                <button
                  type="button"
                  className={`btn-subscribe ${plan.isBestValue ? 'btn-highlight' : ''}`}
                  onClick={() => handleSubscribe(plan.name, `${plan.price} ${plan.frequency}`)}
                >
                  Subscribe
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Corporate Membership Section */}
      <section className="container membership-section" aria-labelledby="corporate-heading">
        <div className="section-header-block">
          <h2 id="corporate-heading" className="section-heading-title">
            Corporate Membership
          </h2>
          <p className="section-heading-sub">
            For organizations that need ongoing compliance training access for their teams.
          </p>
        </div>

        <div className="membership-cards-row">
          {corporatePlans.map((plan) => (
            <div
              key={plan.id}
              className={`membership-plan-card ${plan.isBestValue ? 'is-best-value' : ''}`}
            >
              {plan.isBestValue && (
                <span className="best-value-badge">BEST VALUE</span>
              )}

              <div className="card-top-area">
                <h3 className="card-plan-title">{plan.name}</h3>
                <p className="card-plan-desc">{plan.description}</p>
                <div className="card-pricing-block">
                  <div className="pricing-main-line">
                    <span className="pricing-currency">$</span>
                    <span className="pricing-amount">{plan.price.replace('$', '')}</span>
                    <span className="pricing-frequency">{plan.frequency}</span>
                  </div>
                  <div className="pricing-effective-rate">
                    {plan.effectiveRate ? plan.effectiveRate : ''}
                  </div>
                </div>
              </div>

              <div className="card-features-area">
                <h4 className="features-heading">What&apos;s Included</h4>
                <ul className="features-list">
                  {plan.features.map((feat, idx) => (
                    <li key={idx}>
                      <span className="feature-check" aria-hidden="true">✔</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card-action-area">
                <button
                  type="button"
                  className={`btn-subscribe ${plan.isBestValue ? 'btn-highlight' : ''}`}
                  onClick={() => handleSubscribe(plan.name, `${plan.price} ${plan.frequency}`)}
                >
                  Subscribe
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Compare Membership Plans Section */}
      <section className="container comparison-section" aria-labelledby="compare-heading">
        <div className="section-header-block">
          <h2 id="compare-heading" className="section-heading-title">
            Compare Membership Plans
          </h2>
          <p className="section-heading-sub">
            A side-by-side comparison of individual and corporate ongoing membership benefits.
          </p>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-data-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: '34%' }}>Feature / Benefit</th>
                <th scope="col" style={{ width: '22%' }}>Individual (1M / 6M / 1Y)</th>
                <th scope="col" style={{ width: '22%' }}>Corporate (1M / 6M)</th>
                <th scope="col" style={{ width: '22%' }}>Corporate (1 Year)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="col-feature-title">Audience &amp; Target</td>
                <td>Single Professional</td>
                <td>Clinic &amp; Department Teams</td>
                <td>Full Healthcare Organization</td>
              </tr>
              <tr>
                <td className="col-feature-title">Authorized Users / Seats</td>
                <td>1 User</td>
                <td>5 to 10 Users</td>
                <td>Organization-wide</td>
              </tr>
              <tr>
                <td className="col-feature-title">Live Webinar Access</td>
                <td><span className="cell-check">✔ (1 Attendee)</span></td>
                <td><span className="cell-check">✔ (Team Attendance)</span></td>
                <td><span className="cell-check">✔ (Unlimited Team)</span></td>
              </tr>
              <tr>
                <td className="col-feature-title">On-Demand Recorded Library</td>
                <td><span className="cell-check">✔ Full Access</span></td>
                <td><span className="cell-check">✔ Full Access</span></td>
                <td><span className="cell-check">✔ 24/7 Full Vault</span></td>
              </tr>
              <tr>
                <td className="col-feature-title">Presentation Slide Decks &amp; Handouts</td>
                <td><span className="cell-check">✔</span></td>
                <td><span className="cell-check">✔</span></td>
                <td><span className="cell-check">✔</span></td>
              </tr>
              <tr>
                <td className="col-feature-title">Certificates of Completion</td>
                <td>1 Certificate per session</td>
                <td>Certificates for all team attendees</td>
                <td>Organization-wide verified tracking</td>
              </tr>
              <tr>
                <td className="col-feature-title">Regulatory Checklists &amp; Templates</td>
                <td>Standard</td>
                <td>Departmental Templates</td>
                <td>Full Enterprise Library</td>
              </tr>
              <tr>
                <td className="col-feature-title">Support Level</td>
                <td>Standard Support</td>
                <td>Priority Team Support</td>
                <td>Dedicated Account Manager</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="container faq-section" aria-labelledby="faq-heading">
        <div className="section-header-block" style={{ textAlign: 'center', borderBottom: 'none' }}>
          <h2 id="faq-heading" className="section-heading-title" style={{ textAlign: 'center' }}>
            Frequently Asked Questions
          </h2>
          <p className="section-heading-sub" style={{ textAlign: 'center' }}>
            Common questions regarding ComplianceTrain ongoing membership access.
          </p>
        </div>

        <div className="faq-accordion-list">
          {faqs.map((faq, idx) => (
            <div key={idx} className="faq-item">
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => toggleFaq(idx)}
                aria-expanded={expandedFaq === idx}
              >
                <span>{faq.q}</span>
                <span className="faq-icon-symbol" aria-hidden="true">
                  {expandedFaq === idx ? '−' : '+'}
                </span>
              </button>
              {expandedFaq === idx && (
                <div className="faq-answer-block">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
