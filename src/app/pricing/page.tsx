'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import Link from 'next/link';
import { PayPalSubscription } from '@/components/PayPalSubscription';

// Extend window object for TypeScript
declare global {
  interface Window {
    paypal: any;
  }
}

export default function PricingPage() {
  const { user, session } = useAuth();
  const { profile, refreshProfile } = useUserProfile();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; amount: string; coins: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openModal = (planName: string, amount: string, coins: number) => {
    setSelectedPlan({ name: planName, amount, coins });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
  };

  if (!mounted) return null;

  // Modal component
  const PaymentModal = () => (
    showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative animate-scaleIn">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {selectedPlan && (
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">{selectedPlan.name} Plan</h3>
              <p className="text-gray-600 mb-4">{selectedPlan.coins} coins for ${selectedPlan.amount}</p>
              
              <div className="mt-6">
                <PayPalSubscription 
                  planId="P-37D43660E4028554FNB2I7FQ"
                  amount={selectedPlan.amount}
                  coins={selectedPlan.coins}
                  onSuccess={(paymentId) => {
                    console.log('Payment successful:', paymentId);
                    closeModal();
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  );

  // Navigation component
  const Navigation = () => (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 cursor-pointer group transition-all duration-200">
            <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200">Notopy</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-900 relative">
              Pricing
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black rounded-full"></div>
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200">
              About
            </Link>
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <Link href="/notes" className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95">
                    Create Note
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">
                    Sign In
                  </Link>
                  <Link href="/signup" className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
            >
              <svg 
                className={`w-6 h-6 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-6 py-4 space-y-4">
              <Link href="/features" className="block w-full text-left text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200 py-2">
                Features
              </Link>
              <Link href="/pricing" className="block w-full text-left text-sm font-medium text-gray-900 font-semibold py-2">
                Pricing
              </Link>
              <Link href="/about" className="block w-full text-left text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200 py-2">
                About
              </Link>
              <div className="border-t border-gray-100 pt-4 mt-4">
                {user ? (
                  <Link href="/notes" className="block w-full bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-all duration-200 text-center">
                    Create Note
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="block w-full text-left text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 py-2">
                      Sign In
                    </Link>
                    <Link href="/signup" className="block w-full bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-all duration-200 mt-2 text-center">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );

  // Footer component
  const Footer = () => (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
              <span className="text-lg font-medium text-gray-900">Notopy</span>
            </div>
            <p className="text-sm text-gray-600">
              AI-powered note generation platform for researchers, students, and professionals.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Product</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <Link href="/features" className="block hover:text-gray-900 transition-colors duration-200">Features</Link>
              <Link href="/pricing" className="block hover:text-gray-900 transition-colors duration-200">Pricing</Link>
              <Link href="/notes" className="block hover:text-gray-900 transition-colors duration-200">Try Now</Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Company</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <Link href="/about" className="block hover:text-gray-900 transition-colors duration-200">About</Link>
              <a href="#" className="block hover:text-gray-900 transition-colors duration-200">Blog</a>
              <a href="#" className="block hover:text-gray-900 transition-colors duration-200">Contact</a>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Support</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <a href="#" className="block hover:text-gray-900 transition-colors duration-200">Help Center</a>
              <a href="#" className="block hover:text-gray-900 transition-colors duration-200">Documentation</a>
              <a href="#" className="block hover:text-gray-900 transition-colors duration-200">API</a>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-8 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            © 2025 Notopy. All rights reserved.
          </div>
          <div className="text-sm text-gray-500">
            Powered by Google Gemini AI
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <section className="max-w-7xl mx-auto px-6 py-24 pt-32">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-6xl font-light text-gray-900 mb-8 leading-tight">
            Simple, transparent
            <br />
            <span className="font-medium">pricing</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed font-light">
            Pay per note with our coin system. No subscriptions, no monthly fees - just pay for what you use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
          <div className="p-8 bg-white rounded-lg border border-gray-200 flex flex-col h-full">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-medium text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 mb-4">Try before you buy</p>
              <div className="text-4xl font-light text-gray-900">$0</div>
              <div className="text-gray-600">forever</div>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">10 free coins</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Generate up to 10 pages</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">All note formats</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">No credit card required</span>
              </li>
            </ul>
            <div className="space-y-2 mt-auto">
              <Link href="/signup" className="block w-full border border-gray-300 text-gray-900 px-6 py-3 rounded-md font-medium hover:border-gray-400 transition-colors text-center">
                Get started free
              </Link>
            </div>
          </div>

          <div className="p-8 bg-white rounded-lg border border-gray-200 flex flex-col h-full">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-medium text-gray-900 mb-2">100 Coins</h3>
              <p className="text-gray-600 mb-4">Perfect for getting started</p>
              <div className="text-4xl font-light text-gray-900">$4.99</div>
              <div className="text-gray-600">one-time payment</div>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">100 coins total</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Generate up to 100 pages</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">All note formats</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">PDF export</span>
              </li>
            </ul>
            <div className="space-y-2 mt-auto">
              <button
                onClick={() => openModal('100 Coins', '4.99', 100)}
                className="w-full bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                Subscribe
              </button>
            </div>
          </div>

          <div className="p-8 bg-white rounded-lg border-2 border-black relative flex flex-col h-full">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium">Best Value</span>
            </div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-medium text-gray-900 mb-2">500 Coins</h3>
              <p className="text-gray-600 mb-4">For students and professionals</p>
              <div className="text-4xl font-light text-gray-900">$19.99</div>
              <div className="text-gray-600">one-time payment</div>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">500 coins total</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Generate up to 500 pages</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">All note formats</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">PDF export</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Priority support</span>
              </li>
            </ul>
            <div className="space-y-2 mt-auto">
              <button
                onClick={() => openModal('500 Coins', '19.99', 500)}
                className="w-full bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                Subscribe
              </button>
            </div>
          </div>

          <div className="p-8 bg-white rounded-lg border border-gray-200 flex flex-col h-full">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-medium text-gray-900 mb-2">1500 Coins</h3>
              <p className="text-gray-600 mb-4">For power users and teams</p>
              <div className="text-4xl font-light text-gray-900">$59.99</div>
              <div className="text-gray-600">one-time payment</div>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">1500 coins total</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Generate up to 1500 pages</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">All note formats</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">PDF export</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Priority support</span>
              </li>
            </ul>
            <div className="space-y-2 mt-auto">
              <button
                onClick={() => openModal('1500 Coins', '59.99', 1500)}
                className="w-full bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-medium text-gray-900 mb-4">How the coin system works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">1 Coin = 1 Page</h4>
              <p className="text-gray-600 text-sm">Each page of notes costs exactly 1 coin. Multi-page notes cost coins per page.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">💳</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Pay Once, Use Forever</h4>
              <p className="text-gray-600 text-sm">Your coins never expire. Buy once and use them whenever you need notes.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">⚡</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Instant Generation</h4>
              <p className="text-gray-600 text-sm">Generate notes instantly. No waiting, no queues, just fast AI-powered content.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <PaymentModal />
    </div>
  );
}
