import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LiveSupportWidget from '../components/LiveSupportWidget';
import '../styles/main.css';
import '../styles/navbar.css';
import '../styles/home.css';
import '../styles/details.css';
import '../styles/info-pages.css';
import '../styles/membership.css';
import '../styles/register.css';
import '../styles/success.css';
import '../styles/footer.css';
import '../styles/live-support.css';

export const metadata = {
  title: 'ComplianceTrain — HIPAA & SAMHSA Compliance Training',
  description: 'Expert-led HIPAA & SAMHSA compliance training for healthcare professionals, hospital systems, and covered entities.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Navbar />
        <main className="main-content">
          {children}
        </main>
        <LiveSupportWidget />
        <Footer />
      </body>
    </html>
  );
}
