'use client';

import React, { useState } from 'react';
import '../../styles/info-pages.css';

export default function OnsiteTrainingPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    industry: '',
    preferredTime: '',
    specificNeeds: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.industry) {
      alert('Please fill in all required fields marked with *');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="onsite-clean-page">
      <div className="container onsite-container">
        <div className="onsite-two-col-grid">
          {/* Left Column: Onsite Training / Consulting & Benefits */}
          <main className="onsite-content-col">
            {/* Heading 1: Onsite Training / Consulting */}
            <div className="onsite-heading-block">
              <h1 className="onsite-maroon-heading">Onsite Traning / Consulting</h1>
              <hr className="onsite-maroon-divider" />
            </div>

            {/* Description Paragraph */}
            <p className="onsite-desc-text">
              <strong>ComplianceTrain.com</strong> establishes a secure and "always there service". Train your employees and customize trainings to your companys specific requirements. Our Top-rated and Renowned Experts will be at your facility and at your Convenience! We help our clients expand and gain access to all compliance rules, by fulfilling all the training and consultation required. Get On-site training at your facility by filling the form below. Let us know your requirement and you could be rest assured on high quality deliverance.
            </p>

            {/* Heading 2: Benefits */}
            <div className="onsite-benefits-heading-block">
              <h2 className="onsite-maroon-heading">Benefits</h2>
            </div>

            {/* 8 Benefits Bullet Points */}
            <ul className="onsite-benefits-list">
              <li>
                <span className="benefit-dot">&bull;</span>
                <span><strong>Flexible:</strong> You get to choose the time and the location or environment to train your team, including evenings or weekends.</span>
              </li>
              <li>
                <span className="benefit-dot">&bull;</span>
                <span><strong>Time Efficient:</strong> Your employees do not have to travel any further than usual.</span>
              </li>
              <li>
                <span className="benefit-dot">&bull;</span>
                <span><strong>Cost Control:</strong> You have control over costs with pricing based on class size, duration and complexity</span>
              </li>
              <li>
                <span className="benefit-dot">&bull;</span>
                <span><strong>Cost Efficient:</strong> Cost of travelling and accommodation are eliminated for your employees</span>
              </li>
              <li>
                <span className="benefit-dot">&bull;</span>
                <span><strong>Lower Training Costs:</strong> You save around 30% - 60% off the price of standard courses by booking group training and therefore you can spend more of your training budget on other training needs.</span>
              </li>
              <li>
                <span className="benefit-dot">&bull;</span>
                <span><strong>Right Fit:</strong> You have a choice of courses delivered off-the-shelf(standard) or tailored (bespoke) to fulfil your corporate needs.</span>
              </li>
              <li>
                <span className="benefit-dot">&bull;</span>
                <span><strong>Consistent Learning Experience:</strong> The training enables employees to have the same and consistent learning experience.</span>
              </li>
              <li>
                <span className="benefit-dot">&bull;</span>
                <span><strong>Better Result:</strong> Your team gains the specific job skills they need for a particular project, reinforced via hands-on labs to maximise the learning experience.</span>
              </li>
            </ul>
          </main>

          {/* Right Column: REQUEST TO KNOW MORE Form Card */}
          <aside className="onsite-form-col" aria-label="Request to know more about onsite training">
            <div className="request-more-card">
              <h2 className="request-card-title">REQUEST TO KNOW MORE</h2>

              {submitted ? (
                <div className="request-sent-box">
                  <div className="request-sent-icon">✓</div>
                  <h3>Request Received!</h3>
                  <p>
                    Thank you, <strong>{form.name}</strong>. A ComplianceTrain coordinator will contact you promptly at <strong>{form.phone || form.email}</strong> to customize your onsite program.
                  </p>
                  <button 
                    type="button" 
                    className="btn-send-another"
                    style={{ marginTop: '1rem' }}
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', phone: '', industry: '', preferredTime: '', specificNeeds: '' });
                    }}
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form className="request-form-inputs" onSubmit={handleSubmit}>
                  {/* Name */}
                  <div className="request-field-group">
                    <label htmlFor="onsite-name" className="request-label">
                      <span className="req-star">*</span> Name
                    </label>
                    <div className="request-input-box">
                      <span className="request-field-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#0066CC"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                      </span>
                      <input
                        id="onsite-name"
                        type="text"
                        required
                        className="request-text-input"
                        placeholder="Enter the full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="request-field-group">
                    <label htmlFor="onsite-email" className="request-label">
                      <span className="req-star">*</span> Email Address
                    </label>
                    <div className="request-input-box">
                      <span className="request-field-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                      </span>
                      <input
                        id="onsite-email"
                        type="email"
                        required
                        className="request-text-input"
                        placeholder="Enter your email address"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="request-field-group">
                    <label htmlFor="onsite-phone" className="request-label">
                      <span className="req-star">*</span> Phone number
                    </label>
                    <div className="request-input-box">
                      <span className="request-field-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      </span>
                      <input
                        id="onsite-phone"
                        type="tel"
                        required
                        className="request-text-input"
                        placeholder="Enter your Phone number"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Industry */}
                  <div className="request-field-group">
                    <label htmlFor="onsite-industry" className="request-label">
                      <span className="req-star">*</span> Your Industry
                    </label>
                    <div className="request-input-box">
                      <span className="request-field-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                      </span>
                      <select
                        id="onsite-industry"
                        required
                        className="request-text-input"
                        value={form.industry}
                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      >
                        <option value="">Select your industry</option>
                        <option value="Healthcare & Hospital">Healthcare &amp; Hospital</option>
                        <option value="Behavioral Health & SAMHSA">Behavioral Health &amp; SAMHSA</option>
                        <option value="Medical Device">Medical Device</option>
                        <option value="Pharma & Life Sciences">Pharma &amp; Life Sciences</option>
                        <option value="Health IT & EHR">Health IT &amp; EHR</option>
                        <option value="Business Associates & Billing">Business Associates &amp; Billing</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Preferred Time */}
                  <div className="request-field-group">
                    <label htmlFor="onsite-time" className="request-label">
                      Preferred Time
                    </label>
                    <div className="request-input-box">
                      <span className="request-field-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </span>
                      <select
                        id="onsite-time"
                        className="request-text-input"
                        value={form.preferredTime}
                        onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                      >
                        <option value="">Preferred Time of Contact</option>
                        <option value="Morning (8am - 12pm EST)">Morning (8am - 12pm EST)</option>
                        <option value="Afternoon (12pm - 4pm EST)">Afternoon (12pm - 4pm EST)</option>
                        <option value="Evening (4pm - 8pm EST)">Evening (4pm - 8pm EST)</option>
                        <option value="Anytime">Anytime</option>
                      </select>
                    </div>
                  </div>

                  {/* Specific Training Needs */}
                  <div className="request-field-group">
                    <label htmlFor="onsite-needs" className="request-label">
                      Specific training needs
                    </label>
                    <div className="request-input-box" style={{ alignItems: 'flex-start' }}>
                      <span className="request-field-icon" style={{ marginTop: '8px' }} aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#0066CC"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                      </span>
                      <textarea
                        id="onsite-needs"
                        rows={3}
                        className="request-text-input"
                        placeholder="Any specific training needs"
                        value={form.specificNeeds}
                        onChange={(e) => setForm({ ...form, specificNeeds: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Privacy Policy & Submit */}
                  <div className="request-submit-row">
                    <p className="request-privacy-text">
                      Your privacy is important to us. Please read our <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                    </p>
                    <button type="submit" className="btn-submit-training">
                      Submit training request
                    </button>
                  </div>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
