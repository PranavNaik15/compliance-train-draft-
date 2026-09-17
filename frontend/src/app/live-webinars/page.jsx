'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getWebinars } from '../../api/webinarApi';
import WebinarCard from '../../components/WebinarCard';

function LiveWebinarsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const [sortBy, setSortBy] = useState('upcoming');

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
          setError(err.message || 'Failed to load live HIPAA & SAMHSA webinars.');
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

  const handleCategoryChange = (cat) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    router.push(`/live-webinars?${params.toString()}`);
  };

  const filteredWebinars = webinars.filter((w) => {
    const matchesCategory =
      currentCategory === 'All' ||
      w.category.toLowerCase().includes(currentCategory.toLowerCase()) ||
      currentCategory.toLowerCase().includes(w.category.toLowerCase());

    const query = currentSearch.toLowerCase();
    const matchesSearch =
      !query ||
      w.title.toLowerCase().includes(query) ||
      w.shortDescription.toLowerCase().includes(query) ||
      w.speaker.name.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="live-webinars-page">
      <section className="subpage-hero" style={{ backgroundColor: '#0A3366', color: '#FFFFFF', padding: '3.5rem 0 3.25rem 0' }}>
        <div className="container">
          <div style={{ maxWidth: '820px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.025em' }}>
              Live Healthcare Webinars
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#D6E4F0', lineHeight: 1.6 }}>
              Interactive, instructor-led training sessions on HIPAA, SAMHSA 42 CFR Part 2, and OCR audit readiness with real-time Q&amp;A.
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
                className={`filter-pill ${currentCategory === cat ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="sort-select" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              <option value="upcoming">Upcoming Sessions</option>
              <option value="newest">Newest First</option>
              <option value="duration">Duration (90 Mins)</option>
            </select>
          </div>
        </div>

        {currentSearch && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Showing results for "<strong>{currentSearch}</strong>"
            </span>
            <button 
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete('search');
                router.push(`/live-webinars?${params.toString()}`);
              }}
              style={{ fontSize: '0.85rem', color: 'var(--color-blue-primary)', fontWeight: 600, textDecoration: 'underline' }}
            >
              Clear
            </button>
          </div>
        )}

        {loading && (
          <div className="state-box">
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Fetching live compliance sessions...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-box" style={{ borderColor: 'var(--color-red-accent)' }}>
            <h3 style={{ color: 'var(--color-red-accent)' }}>Error loading sessions</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredWebinars.length === 0 && (
          <div className="state-box">
            <h3>No live sessions match your filter</h3>
            <button
              type="button"
              className="btn btn-outline"
              style={{ marginTop: '1rem' }}
              onClick={() => router.push('/live-webinars')}
            >
              Reset All Filters
            </button>
          </div>
        )}

        {!loading && !error && filteredWebinars.length > 0 && (
          <div className="webinars-cards-grid">
            {filteredWebinars.map((webinar) => (
              <WebinarCard key={webinar.id} webinar={webinar} isRecorded={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function LiveWebinarsPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="state-box">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Loading live webinars...</p>
        </div>
      </div>
    }>
      <LiveWebinarsContent />
    </Suspense>
  );
}
