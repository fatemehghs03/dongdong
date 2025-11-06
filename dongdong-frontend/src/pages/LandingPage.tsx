import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calculator, 
  CreditCard, 
  Shield, 
  Smartphone, 
  CheckCircle,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav">
            <div className="logo">
              <div className="logo-icon">💰</div>
              <span className="logo-text">Dong-Dong</span>
            </div>
            <nav className="nav-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How it Works</a>
              <a href="#pricing">Pricing</a>
            </nav>
            <div className="nav-actions">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/signup" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Split Expenses <span className="highlight">Smartly</span> with Friends
              </h1>
              <p className="hero-description">
                Dong-Dong makes expense splitting effortless. Create groups, track shared expenses, 
                and automatically calculate who owes what. No more awkward money conversations!
              </p>
              <div className="hero-actions">
                <Link to="/signup" className="btn-primary btn-large">
                  Start Splitting <ArrowRight className="btn-icon" />
                </Link>
                <Link to="/login" className="btn-outline btn-large">
                  Sign In
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">10K+</span>
                  <span className="stat-label">Active Users</span>
                </div>
                <div className="stat">
                  <span className="stat-number">$2M+</span>
                  <span className="stat-label">Expenses Tracked</span>
                </div>
                <div className="stat">
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">Groups Created</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="app-interface">
                    <div className="app-header">
                      <div className="app-title">Trip to Paris</div>
                      <div className="app-balance">+$45.50</div>
                    </div>
                    <div className="expense-list">
                      <div className="expense-item">
                        <div className="expense-info">
                          <div className="expense-name">Hotel Booking</div>
                          <div className="expense-amount">$300.00</div>
                        </div>
                        <div className="expense-shares">
                          <div className="share">You: $150.00</div>
                          <div className="share">Sarah: $150.00</div>
                        </div>
                      </div>
                      <div className="expense-item">
                        <div className="expense-info">
                          <div className="expense-name">Dinner</div>
                          <div className="expense-amount">$89.00</div>
                        </div>
                        <div className="expense-shares">
                          <div className="share">You: $29.67</div>
                          <div className="share">Sarah: $29.67</div>
                          <div className="share">Mike: $29.66</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything you need to split expenses</h2>
            <p className="section-description">
              Powerful features designed to make group expense management simple and fair
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Users className="icon" />
              </div>
              <h3 className="feature-title">Group Management</h3>
              <p className="feature-description">
                Create groups, invite friends, and manage memberships with role-based permissions.
              </p>
              <ul className="feature-list">
                <li><CheckCircle className="check-icon" /> Create unlimited groups</li>
                <li><CheckCircle className="check-icon" /> Invite friends easily</li>
                <li><CheckCircle className="check-icon" /> Role-based access control</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Calculator className="icon" />
              </div>
              <h3 className="feature-title">Smart Calculations</h3>
              <p className="feature-description">
                Automatic expense splitting and balance calculations. No more manual math!
              </p>
              <ul className="feature-list">
                <li><CheckCircle className="check-icon" /> Automatic calculations</li>
                <li><CheckCircle className="check-icon" /> Custom share amounts</li>
                <li><CheckCircle className="check-icon" /> Real-time balance updates</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <CreditCard className="icon" />
              </div>
              <h3 className="feature-title">Expense Tracking</h3>
              <p className="feature-description">
                Track all shared expenses with detailed descriptions and payment history.
              </p>
              <ul className="feature-list">
                <li><CheckCircle className="check-icon" /> Detailed expense records</li>
                <li><CheckCircle className="check-icon" /> Payment history</li>
                <li><CheckCircle className="check-icon" /> Receipt attachments</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Shield className="icon" />
              </div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-description">
                Your data is protected with enterprise-grade security and privacy controls.
              </p>
              <ul className="feature-list">
                <li><CheckCircle className="check-icon" /> JWT authentication</li>
                <li><CheckCircle className="check-icon" /> Data encryption</li>
                <li><CheckCircle className="check-icon" /> Privacy controls</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Smartphone className="icon" />
              </div>
              <h3 className="feature-title">Mobile Ready</h3>
              <p className="feature-description">
                Access your expenses anywhere with our responsive mobile-friendly interface.
              </p>
              <ul className="feature-list">
                <li><CheckCircle className="check-icon" /> Responsive design</li>
                <li><CheckCircle className="check-icon" /> Mobile-optimized</li>
                <li><CheckCircle className="check-icon" /> Offline support</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Zap className="icon" />
              </div>
              <h3 className="feature-title">Real-time Updates</h3>
              <p className="feature-description">
                Get instant notifications and updates when expenses are added or modified.
              </p>
              <ul className="feature-list">
                <li><CheckCircle className="check-icon" /> Instant notifications</li>
                <li><CheckCircle className="check-icon" /> Live updates</li>
                <li><CheckCircle className="check-icon" /> Push notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How it works</h2>
            <p className="section-description">
              Get started in minutes with our simple 3-step process
            </p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Create a Group</h3>
                <p className="step-description">
                  Start by creating a group and inviting your friends. Set a name and description for your shared expenses.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Add Expenses</h3>
                <p className="step-description">
                  Add shared expenses and specify how much each person should pay. Our smart calculator handles the rest.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Settle Up</h3>
                <p className="step-description">
                  View who owes what and settle up easily. No more awkward money conversations!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to start splitting expenses?</h2>
            <p className="cta-description">
              Join thousands of users who trust Dong-Dong for their expense management
            </p>
            <div className="cta-actions">
              <Link to="/signup" className="btn-primary btn-large">
                Get Started Free
                <ArrowRight className="btn-icon" />
              </Link>
              <Link to="/login" className="btn-outline btn-large">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <div className="logo-icon">💰</div>
                <span className="logo-text">Dong-Dong</span>
              </div>
              <p className="footer-description">
                Smart expense splitting made simple
              </p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4 className="footer-title">Product</h4>
                <a href="#" className="footer-link">Features</a>
                <a href="#" className="footer-link">Pricing</a>
                <a href="#" className="footer-link">API</a>
              </div>
              <div className="footer-column">
                <h4 className="footer-title">Company</h4>
                <a href="#" className="footer-link">About</a>
                <a href="#" className="footer-link">Blog</a>
                <a href="#" className="footer-link">Contact</a>
              </div>
              <div className="footer-column">
                <h4 className="footer-title">Support</h4>
                <a href="#" className="footer-link">Help Center</a>
                <a href="#" className="footer-link">Documentation</a>
                <a href="#" className="footer-link">Status</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2024 Dong-Dong. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
