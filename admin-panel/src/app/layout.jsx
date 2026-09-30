import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/admin.css';

export const metadata = {
  title: 'Compliance Hub — Central Admin Panel',
  description: 'Centralized business administration dashboard for Original Website (:5173) and Compliance Bridge (:5174)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="admin-layout">
          <Sidebar />
          <div className="admin-main-wrapper">
            <Header />
            <main className="admin-content">
              <div className="stage1-notice-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span className="stage1-notice-pill">STAGE 1</span>
                  <span>
                    <strong>Central Admin Architecture Active:</strong> Managing Both <em>Original Website (:5173)</em> &amp; <em>Compliance Bridge (:5174)</em>. Data is ready for Stage 2 backend linking.
                  </span>
                </div>
              </div>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
