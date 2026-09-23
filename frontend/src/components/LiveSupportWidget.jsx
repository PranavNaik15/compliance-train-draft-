'use client';

import React, { useState } from 'react';
import '../styles/live-support.css';

export default function LiveSupportWidget() {
  const [isOpen, setIsOpen] = useState(true);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'Customer Service',
      text: 'Welcome, Last few seats to register for this MOST important HIPAA & SAMHSA topic in 2026! Get trained by one of the leading industry experts. Schedule conflict? No problem, avail of the recorded version of the session NOW!',
      time: 'Just now'
    }
  ]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    setMessages((prev) => [
      ...prev,
      { sender: 'You', text: userText, time: 'Just now' }
    ]);
    setInputMsg('');

    try {
      let userName = undefined;
      let userEmail = undefined;
      try {
        const storedUser = localStorage.getItem('ct_auth_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          userName = parsed.name;
          userEmail = parsed.email;
        }
      } catch (err) {}

      const res = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          name: userName,
          email: userEmail,
          category: 'Live Support Chat',
          subject: 'Live Support Chat',
        }),
      });

      const data = await res.json();
      const replyText = data.message || 'Thank you for reaching out! A HIPAA & SAMHSA compliance advisor is available to help with clinic registrations or custom group training.';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'Live Support',
          text: replyText,
          time: 'Just now'
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'Live Support',
          text: 'Thank you for reaching out! A HIPAA & SAMHSA compliance advisor is available to help with clinic registrations or custom group training.',
          time: 'Just now'
        }
      ]);
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="live-support-floating-trigger"
        onClick={() => setIsOpen(true)}
        aria-label="Open Live Support Chat"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Live Support</span>
      </button>
    );
  }

  return (
    <div className="live-support-widget" role="complementary" aria-label="Customer Live Support Chat">
      <div className="support-header">
        <span className="support-header-title">Live Support</span>
        <div className="support-header-actions">
          <button 
            type="button" 
            className="support-head-btn"
            title="Pop out chat"
            onClick={() => window.open('/about', '_blank')}
            aria-label="Expand"
          >
            &#8599;
          </button>
          <button 
            type="button" 
            className="support-head-btn"
            title="Minimize chat"
            onClick={() => setIsOpen(false)}
            aria-label="Minimize"
          >
            &minus;
          </button>
        </div>
      </div>

      <div className="support-agent-bar">
        <div className="support-avatar-circle" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </div>
        <div className="support-agent-details">
          <h4 className="agent-name">Live Support</h4>
          <p className="agent-tag">Empowering you! Training by GRC Experts</p>
        </div>
      </div>

      <div className="support-chat-body">
        <div className="chat-started-divider">
          <span>Chat started</span>
        </div>

        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`chat-message-group ${msg.sender === 'You' ? 'user-msg' : 'agent-msg'}`}
          >
            <span className="msg-sender-label">{msg.sender}</span>
            <div className="msg-bubble">
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form className="support-input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="support-text-input"
          placeholder="Type a message here..."
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          aria-label="Type a message for support"
        />
        <div className="support-footer-row">
          <span className="zendesk-brand">zendesk</span>
          <div className="support-input-icons">
            <button type="button" className="icon-btn" title="Copy transcript">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
            <button type="button" className="icon-btn" title="Attach file">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <button type="submit" className="icon-btn" title="Send message" style={{ color: 'var(--color-blue-primary)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="2 21 23 12 2 3 2 10 17 12 2 14 2 21"/></svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
