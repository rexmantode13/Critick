import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userApi } from '../api/userApi';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import './Pro.css';

export const Pro = () => {
  const { user, isAuthenticated, updateUserState } = useAuth();
  const toast = useToast();

  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null); // 'free' | 'pro' | 'critic'
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const calculatePrice = (monthlyPrice) => {
    if (monthlyPrice === 0) return '₹0';
    if (isYearly) {
      const yearlyMonthlyRate = Math.round(monthlyPrice * 0.8);
      return `₹${yearlyMonthlyRate}`;
    }
    return `₹${monthlyPrice}`;
  };

  const handleSelectPlan = (planKey) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to upgrade your plan.');
      return;
    }
    setSelectedPlan(planKey);
    setConfirmModalOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) return;
    setUpgrading(true);
    try {
      const res = await userApi.demoUpgradePlan(selectedPlan);
      if (res.success && res.data?.user) {
        updateUserState(res.data.user);
        toast.success(`Plan upgraded to ${selectedPlan.toUpperCase()} (Demo Mode)!`);
        setConfirmModalOpen(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update plan');
    } finally {
      setUpgrading(false);
    }
  };

  const FAQS = [
    {
      q: 'What is Critick?',
      a: 'Critick is a dark, minimal editorial platform where film lovers discover real movies and web series, write authentic human reviews, and track their personal viewing history.',
    },
    {
      q: 'How are ratings calculated?',
      a: 'Critick displays two independent rating metrics: the Critick Community Rating (computed directly from real user reviews in our MongoDB database) and external ratings (IMDb, Rotten Tomatoes, Metacritic) sourced live from OMDb.',
    },
    {
      q: 'Can I write reviews?',
      a: 'Yes! Registered users can publish star ratings (1-5 stars) and detailed written reviews for any movie or web series in the catalog.',
    },
    {
      q: 'Can I create a watchlist?',
      a: 'Absolutely. Watchlists allow you to bookmark titles to watch later and mark them as watched once completed. Guests can save items locally, which merge automatically upon signing in.',
    },
    {
      q: 'Is Pro required to use Critick?',
      a: 'No! Critick is 100% free to search, read reviews, create watchlists, and publish reviews. Pro and Critic tiers are optional demo memberships.',
    },
    {
      q: 'How do recommendations work?',
      a: 'Recommendations are computed dynamically based on shared genres and directors with your recently viewed or reviewed titles.',
    },
    {
      q: 'Can I edit my review?',
      a: 'Yes, you can edit or delete your own reviews at any time directly from the movie page or your profile.',
    },
    {
      q: 'Where does movie information come from?',
      a: 'All movie titles, posters, release dates, genres, directors, and ratings are sourced exclusively from the OMDb API (omdbapi.com).',
    },
  ];

  return (
    <div className="pro-page-root container">
      <div className="pro-header text-center">
        <span className="editorial-tag">MEMBERSHIP TIERS</span>
        <h1 className="pro-title">Elevate Your Film Experience</h1>
        <p className="pro-subtitle">
          Demonstration membership plans. No payment or credit card is required.
        </p>

        {/* Billing Toggle (Monthly / Yearly 20% OFF) */}
        <div className="billing-toggle-container">
          <span className={`toggle-label ${!isYearly ? 'active' : ''}`}>Monthly</span>
          <button
            className={`billing-switch ${isYearly ? 'yearly' : ''}`}
            onClick={() => setIsYearly(!isYearly)}
            aria-label="Toggle annual billing discount"
          >
            <span className="switch-handle" />
          </button>
          <span className={`toggle-label ${isYearly ? 'active' : ''}`}>
            Yearly <span className="discount-badge">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="pricing-cards-grid">
        {/* Free Plan */}
        <div className="pricing-card">
          <div className="card-header">
            <h3 className="plan-name">Free</h3>
            <p className="plan-desc">For casual movie enthusiasts</p>
            <div className="plan-price-row">
              <span className="price-val">₹0</span>
              <span className="price-period">/ forever</span>
            </div>
          </div>
          <ul className="plan-features">
            <li>✓ Unlimited search & catalog discovery</li>
            <li>✓ Write & edit personal reviews</li>
            <li>✓ Manage personal watchlist</li>
            <li>✓ Rate movies 1-5 stars</li>
          </ul>
          <div className="card-action">
            <Button
              variant="outline"
              onClick={() => handleSelectPlan('free')}
              disabled={user?.plan === 'free'}
            >
              {user?.plan === 'free' ? 'Current Plan' : 'Select Free Plan'}
            </Button>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="pricing-card featured">
          <div className="card-header">
            <span className="featured-badge">MOST POPULAR</span>
            <h3 className="plan-name">Critick Pro</h3>
            <p className="plan-desc">For dedicated film lovers</p>
            <div className="plan-price-row">
              <span className="price-val">{calculatePrice(199)}</span>
              <span className="price-period">/ month</span>
            </div>
          </div>
          <ul className="plan-features">
            <li>✓ All Free tier features</li>
            <li>✓ Official "Critick Pro" profile badge</li>
            <li>✓ Priority catalog search indexing</li>
            <li>✓ Early access to new platform updates</li>
          </ul>
          <div className="card-action">
            <Button
              variant="primary"
              onClick={() => handleSelectPlan('pro')}
              disabled={user?.plan === 'pro'}
            >
              {user?.plan === 'pro' ? 'Current Plan' : 'Demo Upgrade to Pro'}
            </Button>
          </div>
        </div>

        {/* Critic Plan */}
        <div className="pricing-card">
          <div className="card-header">
            <h3 className="plan-name">Verified Critic</h3>
            <p className="plan-desc">For published film journalists</p>
            <div className="plan-price-row">
              <span className="price-val">{calculatePrice(399)}</span>
              <span className="price-period">/ month</span>
            </div>
          </div>
          <ul className="plan-features">
            <li>✓ All Pro tier features</li>
            <li>✓ "Verified Critic" badge on reviews</li>
            <li>✓ Unlocks Review Insights panel</li>
            <li>✓ High-visibility critic profile status</li>
          </ul>
          <div className="card-action">
            <Button
              variant="secondary"
              onClick={() => handleSelectPlan('critic')}
              disabled={user?.plan === 'critic'}
            >
              {user?.plan === 'critic' ? 'Current Plan' : 'Demo Upgrade to Critic'}
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <section className="pro-section">
        <h2 className="section-title text-center">Compare Plan Features</h2>
        <div className="table-responsive">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th>Pro</th>
                <th>Critic</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Search & Read Reviews</td>
                <td>✓</td>
                <td>✓</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>Watchlist & Favourites</td>
                <td>✓</td>
                <td>✓</td>
                <td>✓</td>
              </tr>
              <tr>
                <td>Profile Badge</td>
                <td>—</td>
                <td>Critick Pro</td>
                <td>Verified Critic</td>
              </tr>
              <tr>
                <td>Review Insights Metrics</td>
                <td>—</td>
                <td>—</td>
                <td>✓ Unlocked</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="pro-section">
        <h2 className="section-title text-center">Frequently Asked Questions</h2>
        <div className="faq-accordion-container">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="faq-item">
                <button
                  className="faq-question-btn"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && <div className="faq-answer-content">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Demo Checkout Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Demo Checkout Confirmation"
      >
        <div className="demo-checkout-modal-body">
          <div className="demo-alert-notice">
            <strong>ℹ Demo Checkout Notice:</strong> No payment gateway is integrated and no real money will be charged.
          </div>
          <p>
            You are selecting the <strong>{selectedPlan?.toUpperCase()}</strong> plan. Clicking below will instantly update your user plan in the database.
          </p>
          <div className="modal-footer-actions">
            <Button variant="ghost" onClick={() => setConfirmModalOpen(false)} disabled={upgrading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmUpgrade} loading={upgrading}>
              Confirm Demo Upgrade
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
