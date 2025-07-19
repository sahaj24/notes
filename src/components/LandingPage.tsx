'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BeautifulNote } from './BeautifulNote';
import { CoinDisplay } from './CoinDisplay';
import { PayPalSubscription } from './PayPalSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [showApp, setShowApp] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; amount: string; coins: number } | null>(null);

  useEffect(() => {
    // Skip during SSR to prevent hydration mismatch
    if (typeof window === 'undefined') return;

    // Prevent multiple initializations
    if (mounted) return;

    setMounted(true);

    // Add a small delay then trigger animations
    const timer = setTimeout(() => {
      // Remove the opacity-0 class that's hiding elements
      const elements = document.querySelectorAll('.animate-on-load');
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.remove('animate-on-load');
        }, index * 100); // Stagger the animations
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [mounted]);

  const handleShowApp = () => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    setIsTransitioning(true);
    setTimeout(() => {
      setShowApp(true);
    }, 150);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubmitted(true);
      // Here you would typically send the email to your backend
      console.log('Newsletter signup:', newsletterEmail);
      setTimeout(() => {
        setNewsletterSubmitted(false);
        setNewsletterEmail('');
      }, 3000);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const openModal = (planName: string, amount: string, coins: number) => {
    setSelectedPlan({ name: planName, amount, coins });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
  };

  const faqData = [
    {
      question: "How does the AI-powered note generation work?",
      answer: "Our AI understands your requirements and generates beautifully formatted notes with hand-drawn elements, colorful layouts, and natural handwriting styles. Simply describe what you need, and our AI creates a visually stunning note for you."
    },
    {
      question: "Can I customize the appearance of my notes?",
      answer: "Yes! Notopy offers extensive customization options including color schemes, handwriting fonts, layout styles, and drawing elements. You can adjust the visual style to match your preferences or brand requirements."
    },
    {
      question: "Is my data secure and private?",
      answer: "Absolutely. We use enterprise-grade security measures to protect your data. All notes are encrypted in transit and at rest, and we never share your content with third parties. Your privacy is our top priority."
    },
    {
      question: "What file formats can I export my notes to?",
      answer: "Notopy supports multiple export formats including PDF, SVG, PNG, and JPEG. You can also copy notes to your clipboard or share them directly via email or social media."
    },
    {
      question: "Do you offer team collaboration features?",
      answer: "Yes! Our Pro and Enterprise plans include real-time collaboration, shared workspaces, comment systems, and team management tools. Perfect for educational institutions and businesses."
    },
    {
      question: "How accurate is the AI-generated content?",
      answer: "Our AI is highly accurate for note-taking purposes, but we always recommend reviewing and editing the generated content. The AI excels at formatting, structure, and visual design while you maintain control over the content accuracy."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "UX Designer",
      company: "TechCorp",
      content: "Notopy has revolutionized how I document my design process. The beautiful, hand-drawn notes make my presentations stand out and clients love the aesthetic.",
      rating: 5
    },
    {
      name: "Dr. Michael Rodriguez",
      role: "Professor",
      company: "Stanford University",
      content: "My students are more engaged when I use Notopy for lecture notes. The visual appeal and organized structure help them understand complex concepts better.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Product Manager",
      company: "InnovateLabs",
      content: "The AI-powered note generation saves me hours every week. I can quickly create professional-looking documentation that impresses stakeholders.",
      rating: 5
    },
    {
      name: "James Park",
      role: "Student",
      company: "MIT",
      content: "Taking notes has never been this enjoyable. The handwriting fonts and colorful layouts make studying feel less like work and more like art.",
      rating: 5
    }
  ];

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
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">{selectedPlan.name}</h3>
              <p className="text-gray-600 mb-4">${selectedPlan.amount}</p>

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

  if (showApp) {
    return (
      <div className="animate-fadeIn">
        <BeautifulNote />
      </div>
    );
  }

  // Navigation component
  const Navigation = () => (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 cursor-pointer group transition-all duration-200"
          >
            <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200">Notopy</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/features"
              className="text-sm font-medium transition-all duration-200 relative text-gray-600 hover:text-gray-900"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium transition-all duration-200 relative text-gray-600 hover:text-gray-900"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium transition-all duration-200 relative text-gray-600 hover:text-gray-900"
            >
              About
            </Link>
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <CoinDisplay className="mr-2" />
                  <button
                    onClick={handleShowApp}
                    className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Create Note
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
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
              <Link
                href="/features"
                className="block w-full text-left text-sm font-medium transition-all duration-200 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="block w-full text-left text-sm font-medium transition-all duration-200 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="block w-full text-left text-sm font-medium transition-all duration-200 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="border-t border-gray-100 pt-4 mt-4">
                {user ? (
                  <>
                    <div className="mb-4">
                      <CoinDisplay showDetails={true} />
                    </div>
                    <button
                      onClick={() => {
                        handleShowApp();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-all duration-200 text-center"
                    >
                      Create Note
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block w-full text-left text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 py-2"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="block w-full bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-all duration-200 mt-2 text-center"
                    >
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
              <button onClick={handleShowApp} className="block hover:text-gray-900 transition-colors duration-200 text-left bg-transparent p-0 text-sm text-gray-600">{user ? "Try Now" : "Sign in to try"}</button>
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
            Advanced AI-powered note generation
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6 leading-tight">
              Transform any topic into
              <span className="font-medium block"> beautiful notes</span>
              <span className="text-blue-600 font-medium">instantly</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Notopy uses advanced AI to generate visually stunning,
              well-structured notes for students, researchers, and professionals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleShowApp}
                className="bg-black text-white px-8 py-4 rounded-md font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                Try for free
              </button>
              <Link
                href="/features"
                className="border border-gray-300 text-gray-900 px-8 py-4 rounded-md font-medium hover:border-gray-400 transition-all duration-200 hover:shadow-md hover:bg-gray-50 text-center"
              >
                See how it works
              </Link>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>No credit card required</span>
              <span className="mx-2">•</span>
              <span>30 free notes</span>
            </div>
          </div>

          <div className="order-1 lg:order-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-sm">
            <div className="relative">
              <div className="bg-white rounded-lg shadow-md p-6 transform rotate-1 mb-4">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 text-lg">📝</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Study Notes</h3>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                  <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-100 rounded w-4/6"></div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 transform -rotate-1">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 text-lg">🧠</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Mind Map</h3>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                  <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                </div>
              </div>

              <div className="absolute top-1/2 right-0 transform translate-x-1/3 -translate-y-1/2 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full shadow-md">
                AI-Generated
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              Powerful <span className="font-medium">features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create beautiful, effective notes in seconds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Content Generation",
                description: "Generate comprehensive notes instantly using advanced AI. Just enter a topic and get structured, intelligent content.",
                icon: "M13 10V3L4 14h7v7l9-11h-7z"
              },
              {
                title: "Visual Enhancement",
                description: "Transform plain text into visually appealing notes with handwriting fonts, colors, and organic layouts.",
                icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              },
              {
                title: "Template Spaces",
                description: "Our templates include intentional spaces for your personal notes and additions, making customization easy.",
                icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/features" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors duration-200">
              <span>Explore all features</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              How <span className="font-medium">it works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create beautiful notes in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Enter your topic",
                description: "Type any subject you want to learn about or document"
              },
              {
                step: "2",
                title: "Choose a template",
                description: "Select from multiple note formats based on your needs"
              },
              {
                step: "3",
                title: "Generate notes",
                description: "Our AI creates beautiful, structured notes instantly"
              },
              {
                step: "4",
                title: "Export & share",
                description: "Download as PDF, PNG, or share directly with others"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-medium">
                  {item.step}
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>

                {index < 3 && (
                  <div className="hidden md:block absolute transform translate-x-1/2 translate-y-8">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={handleShowApp}
              className="bg-black text-white px-8 py-4 rounded-md font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              {user ? "Try it now" : "Sign in to try"}
            </button>
          </div>
        </div>
      </section>

      {/* AI-Powered Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              AI-Powered <span className="font-medium">Innovations</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced technology that transforms how you create and learn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3 text-center">Smart Content Analysis</h3>
              <p className="text-gray-600 text-center mb-4">
                Our AI analyzes your topic and automatically structures information in the most effective way for learning and retention.
              </p>
              <ul className="text-gray-600 space-y-2 mt-4">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Identifies key concepts automatically</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Creates logical information hierarchy</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Adapts to different learning styles</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3 text-center">Visual Learning Enhancement</h3>
              <p className="text-gray-600 text-center mb-4">
                Our technology transforms plain text into visually engaging formats that improve comprehension and memory retention by 40%.
              </p>
              <ul className="text-gray-600 space-y-2 mt-4">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Converts concepts to visual diagrams</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Uses color psychology for better recall</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Creates spatial relationships between ideas</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3 text-center">Customizable Spaces</h3>
              <p className="text-gray-600 text-center mb-4">
                Our templates include strategic spaces for your personal notes and additions, making it easy to customize content after generation.
              </p>
              <ul className="text-gray-600 space-y-2 mt-4">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Add your own insights and examples</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Highlight important information</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Personalize content for your needs</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleShowApp}
              className="bg-black text-white px-8 py-4 rounded-md font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              {user ? "Try these features" : "Sign in to experience"}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              Frequently asked <span className="font-medium">questions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about Notopy
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${expandedFaq === index ? 'rotate-180' : ''
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-gray-900 to-black text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-light mb-6">
              Ready to transform your <span className="font-medium">note-taking?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users who have already discovered the power of AI-generated notes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleShowApp}
                className="bg-white text-black px-8 py-4 rounded-md font-medium hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                {user ? "Try for free" : "Sign in to try"}
              </button>
              <Link
                href="/pricing"
                className="border border-white text-white px-8 py-4 rounded-md font-medium hover:bg-white/10 transition-all duration-200 hover:shadow-md"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <PaymentModal />
    </div>
  );
};