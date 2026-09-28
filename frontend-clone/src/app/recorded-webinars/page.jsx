'use client';

import React, { useState, useEffect } from 'react';
import { getWebinars } from '../../api/webinarApi';
import WebinarCard from '../../components/WebinarCard';
import '../../styles/home.css';

export default function RecordedWebinarsPage() {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadWebinars() {
      try {
        setLoading(true);
        setError(null);
        const data = await getWebinars();
        if (isMounted) {
          setWebinars(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load recorded compliance webinars.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadWebinars();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    'All',
    'HIPAA Privacy & Security',
    'SAMHSA 42 CFR Part 2',
    'Risk Assessment (SRA)',
    'AI in Healthcare',
    'Compliance Officer Training',
    'Enforcement & Audits'
  ];

  const filtered = webinars.filter((w) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      w.category.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesSearch =
      !searchQuery.trim() ||
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.speaker.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="recorded-webinars-page">
      <section className="subpage-hero" style={{ background: 'linear-gradient(135deg, #071E3D 0%, #10376B 100%)', color: '#FFFFFF', padding: '3.5rem 0' }}>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>
            <span className="badge-ondemand" style={{ marginBottom: '1rem' }}>
              On-Demand 24/7 Healthcare Compliance Vault
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.025em' }}>
              Recorded HIPAA &amp; SAMHSA Webinars
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#CBD5E1', lineHeight: 1.6 }}>
              Access our complete on-demand video library of expert-led HIPAA, HITECH, and SAMHSA 42 CFR Part 2 training sessions with transcripts, policy templates, and staff CEU certificates.
            </p>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="filter-pills-bar" style={{ marginBottom: 0 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search recorded titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.85rem',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.85rem',
                backgroundColor: '#FFFFFF'
              }}
            />
          </div>
        </div>

        {loading && (
          <div className="state-box">
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Loading on-demand sessions...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-box" style={{ borderColor: 'var(--color-red-accent)' }}>
            <h3 style={{ color: 'var(--color-red-accent)' }}>Error loading recordings</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="webinars-cards-grid">
            {filtered.map((webinar) => (
              <WebinarCard key={webinar.id} webinar={webinar} isRecorded={true} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
