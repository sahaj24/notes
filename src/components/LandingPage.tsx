'use client';

import React, { useState, useEffect } from 'react';
import { BeautifulNote } from './BeautifulNote';

export const LandingPage: React.FC = () => {
  const [showApp, setShowApp] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePageChange = (page: string) => {
    if (page === currentPage) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 150);
  };

  const handleShowApp = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowApp(true);
    }, 300);
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

  const faqData = [
    {
      question: "How does the AI-powered note generation work?",
      answer: "Our AI uses Google's Gemini model to understand your requirements and generate beautifully formatted notes with hand-drawn elements, colorful layouts, and natural handwriting styles. Simply describe what you need, and our AI creates a visually stunning note for you."
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

  const integrations = [
    { name: "Google Drive", logo: "📁", description: "Sync your notes with Google Drive" },
    { name: "Notion", logo: "📝", description: "Export directly to Notion pages" },
    { name: "Slack", logo: "💬", description: "Share notes in Slack channels" },
    { name: "Dropbox", logo: "📦", description: "Backup to Dropbox automatically" },
    { name: "Microsoft Teams", logo: "🤝", description: "Collaborate via Teams integration" },
    { name: "Zoom", logo: "🎥", description: "Generate meeting notes from Zoom" }
  ];

  if (!mounted) return null;

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
          <div 
            className="flex items-center space-x-2 cursor-pointer group transition-all duration-200" 
            onClick={() => handlePageChange('home')}
          >
            <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200">Notopy</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handlePageChange('features')}
              className={`text-sm font-medium transition-all duration-200 relative ${
                currentPage === 'features' 
                  ? 'text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Features
              {currentPage === 'features' && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black rounded-full animate-slideIn"></div>
              )}
            </button>
            <button 
              onClick={() => handlePageChange('pricing')}
              className={`text-sm font-medium transition-all duration-200 relative ${
                currentPage === 'pricing' 
                  ? 'text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pricing
              {currentPage === 'pricing' && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black rounded-full animate-slideIn"></div>
              )}
            </button>
            <button 
              onClick={() => handlePageChange('about')}
              className={`text-sm font-medium transition-all duration-200 relative ${
                currentPage === 'about' 
                  ? 'text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              About
              {currentPage === 'about' && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black rounded-full animate-slideIn"></div>
              )}
            </button>
            <button 
              onClick={handleShowApp}
              className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Try Now
            </button>
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
          <div className="md:hidden bg-white border-t border-gray-100 animate-slideInUp">
            <div className="px-6 py-4 space-y-4">
              <button 
                onClick={() => {
                  handlePageChange('features');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left text-sm font-medium transition-all duration-200 py-2 ${
                  currentPage === 'features' 
                    ? 'text-gray-900 font-semibold' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Features
              </button>
              <button 
                onClick={() => {
                  handlePageChange('pricing');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left text-sm font-medium transition-all duration-200 py-2 ${
                  currentPage === 'pricing' 
                    ? 'text-gray-900 font-semibold' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pricing
              </button>
              <button 
                onClick={() => {
                  handlePageChange('about');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left text-sm font-medium transition-all duration-200 py-2 ${
                  currentPage === 'about' 
                    ? 'text-gray-900 font-semibold' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                About
              </button>
              <button 
                onClick={() => {
                  handleShowApp();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-all duration-200 mt-4"
              >
                Try Now
              </button>
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
          <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
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
          <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <h4 className="font-medium text-gray-900 mb-4">Product</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <button onClick={() => handlePageChange('features')} className="block hover:text-gray-900 transition-colors duration-200">Features</button>
              <button onClick={() => handlePageChange('pricing')} className="block hover:text-gray-900 transition-colors duration-200">Pricing</button>
              <button onClick={handleShowApp} className="block hover:text-gray-900 transition-colors duration-200">Try Now</button>
            </div>
          </div>
          <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <h4 className="font-medium text-gray-900 mb-4">Company</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <button onClick={() => handlePageChange('about')} className="block hover:text-gray-900 transition-colors duration-200">About</button>
              <a href="#" className="block hover:text-gray-900 transition-colors duration-200">Blog</a>
              <a href="#" className="block hover:text-gray-900 transition-colors duration-200">Contact</a>
            </div>
          </div>
          <div className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <h4 className="font-medium text-gray-900 mb-4">Support</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <a href="#" className="block hover:text-gray-900 transition-colors duration-200">Help Center</a>
              <a href="#" className="block hover:text-gray-900 transition-colors duration-200">Documentation</a>
              <a href="#" className="block hover:text-gray-900 transition-colors duration-200">API</a>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-8 border-t border-gray-100 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
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

  // Home page content
  const HomePage = () => (
    <div className="animate-fadeIn">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-7xl font-light text-gray-900 mb-8 leading-[1.1] tracking-tight animate-slideInUp">
            AI-powered note
            <br />
            <span className="font-medium">generation platform</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light animate-slideInUp" style={{ animationDelay: '0.2s' }}>
            Transform any topic into professionally structured, visually enhanced notes 
            using advanced AI technology. Built for researchers, students, and professionals.
          </p>

          <div className="flex items-center justify-center space-x-4 mb-16 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={handleShowApp}
              className="bg-black text-white px-8 py-4 rounded-md font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              Start generating notes
            </button>
            <button
              onClick={() => handlePageChange('features')}
              className="border border-gray-300 text-gray-900 px-8 py-4 rounded-md font-medium hover:border-gray-400 transition-all duration-200 hover:shadow-md hover:bg-gray-50"
            >
              View features
            </button>
          </div>

          <div className="text-sm text-gray-500 space-x-6 animate-slideInUp" style={{ animationDelay: '0.6s' }}>
            <span>No signup required</span>
            <span>•</span>
            <span>Free tier available</span>
            <span>•</span>
            <span>Enterprise ready</span>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8 animate-slideInLeft">
            <div>
              <h2 className="text-4xl font-light text-gray-900 mb-6">
                Intelligent content
                <br />
                <span className="font-medium">structuring</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our AI analyzes your topic and creates comprehensive, well-organized notes 
                with proper hierarchy, key concepts, and supporting details.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="transform hover:scale-105 transition-transform duration-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Multi-format output</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Study guides, mind maps, timelines, comparison charts, and more.
                </p>
              </div>
              <div className="transform hover:scale-105 transition-transform duration-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Visual enhancement</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Handwriting fonts, colors, and layouts that improve retention.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center animate-slideInRight hover:bg-gray-100 transition-colors duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">AI-generated note preview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-6 animate-slideInUp">
            Trusted by thousands
            <br />
            <span className="font-medium">of professionals</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed font-light animate-slideInUp" style={{ animationDelay: '0.2s' }}>
            See how NoteCraft is transforming the way people create and organize their notes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg p-8 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg transform hover:scale-105 animate-slideInUp"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.content}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-sm font-medium text-gray-600">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-6 animate-slideInUp">
            Works with your
            <br />
            <span className="font-medium">favorite tools</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed font-light animate-slideInUp" style={{ animationDelay: '0.2s' }}>
            Seamlessly integrate NoteCraft with the tools you already use every day.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {integrations.map((integration, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg p-6 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg transform hover:scale-105 animate-slideInUp text-center"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="text-3xl mb-4">{integration.logo}</div>
              <h3 className="font-medium text-gray-900 mb-2">{integration.name}</h3>
              <p className="text-sm text-gray-600">{integration.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-light text-gray-900 mb-6 animate-slideInUp">
              Stay updated with
              <br />
              <span className="font-medium">the latest features</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed font-light animate-slideInUp" style={{ animationDelay: '0.2s' }}>
              Get tips, updates, and exclusive content delivered to your inbox.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto animate-slideInUp" style={{ animationDelay: '0.4s' }}>
              <div className="flex space-x-4">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  required
                />
                <button
                  type="submit"
                  disabled={newsletterSubmitted}
                  className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {newsletterSubmitted ? 'Subscribed!' : 'Subscribe'}
                </button>
              </div>
            </form>
            
            {newsletterSubmitted && (
              <p className="text-green-600 mt-4 animate-fadeIn">
                Thank you for subscribing! Check your email for confirmation.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-6 animate-slideInUp">
              Frequently asked
              <br />
              <span className="font-medium">questions</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light animate-slideInUp" style={{ animationDelay: '0.2s' }}>
              Everything you need to know about Notopy and AI-powered note generation.
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-lg animate-slideInUp"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed animate-slideInUp">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center animate-fadeInUp">
            <h2 className="text-4xl font-light text-gray-900 mb-6">
              Ready to transform
              <br />
              <span className="font-medium">your learning?</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of students and professionals using AI-powered note generation.
            </p>
            <button
              onClick={handleShowApp}
              className="bg-black text-white px-8 py-4 rounded-md font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              Get started today
            </button>
          </div>
        </div>
      </section>
    </div>
  );

  // Features page content
  const FeaturesPage = () => (
    <>
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-6xl font-light text-gray-900 mb-8 leading-tight animate-slideInUp">
            Powerful features for
            <br />
            <span className="font-medium">modern learning</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed font-light animate-slideInUp" style={{ animationDelay: '0.2s' }}>
            Discover how Notopy's AI-powered features can transform your note-taking experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {[
            {
              title: "AI Content Generation",
              description: "Generate comprehensive notes instantly using Google's Gemini AI. Just enter a topic and get structured, intelligent content.",
              icon: "M13 10V3L4 14h7v7l9-11h-7z"
            },
            {
              title: "Multiple Note Formats",
              description: "Create study guides, mind maps, timelines, comparison charts, and more. Each format optimized for different learning styles.",
              icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            },
            {
              title: "Visual Enhancement",
              description: "Transform plain text into visually appealing notes with handwriting fonts, colors, and organic layouts.",
              icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            },
            {
              title: "Instant Export",
              description: "Download your notes as high-quality images or PDFs. Perfect for sharing or offline studying.",
              icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            },
            {
              title: "Smart Organization",
              description: "Automatically organize information with proper hierarchy, key concepts, and supporting details.",
              icon: "M19 11H5m14-7H3a2 2 0 00-2 2v9a2 2 0 002 2h11l5-5v-5a2 2 0 00-2-2z"
            },
            {
              title: "Collaborative Features",
              description: "Share notes with classmates or colleagues. Real-time collaboration for group projects.",
              icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="p-8 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-slideInUp"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center animate-fadeInUp">
            <h2 className="text-4xl font-light text-gray-900 mb-6">
              Experience the future
              <br />
              <span className="font-medium">of note-taking</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Try Notopy today and see how AI can transform your learning experience.
            </p>
            <button
              onClick={handleShowApp}
              className="bg-black text-white px-8 py-4 rounded-md font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              Start creating notes
            </button>
          </div>
        </div>
      </section>
    </>
  );

  // Pricing page content
  const PricingPage = () => (
    <>
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-6xl font-light text-gray-900 mb-8 leading-tight">
            Simple, transparent
            <br />
            <span className="font-medium">pricing</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed font-light">
            Choose the plan that's right for you. Start free, upgrade when you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 bg-white rounded-lg border border-gray-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-medium text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 mb-4">Perfect for getting started</p>
              <div className="text-4xl font-light text-gray-900">$0</div>
              <div className="text-gray-600">per month</div>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">10 notes per month</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Basic note formats</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Image export</span>
              </li>
            </ul>
            <button
              onClick={() => setShowApp(true)}
              className="w-full border border-gray-300 text-gray-900 px-6 py-3 rounded-md font-medium hover:border-gray-400 transition-colors"
            >
              Get started free
            </button>
          </div>

          <div className="p-8 bg-white rounded-lg border-2 border-black relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium">Popular</span>
            </div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-medium text-gray-900 mb-2">Pro</h3>
              <p className="text-gray-600 mb-4">For students and professionals</p>
              <div className="text-4xl font-light text-gray-900">$12</div>
              <div className="text-gray-600">per month</div>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Unlimited notes</span>
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
            <button
              onClick={() => setShowApp(true)}
              className="w-full bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Start free trial
            </button>
          </div>

          <div className="p-8 bg-white rounded-lg border border-gray-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-medium text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-4">For teams and organizations</p>
              <div className="text-4xl font-light text-gray-900">$49</div>
              <div className="text-gray-600">per month</div>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Everything in Pro</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Team collaboration</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">Custom branding</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">24/7 support</span>
              </li>
            </ul>
            <button className="w-full border border-gray-300 text-gray-900 px-6 py-3 rounded-md font-medium hover:border-gray-400 transition-colors">
              Contact sales
            </button>
          </div>
        </div>
      </section>
    </>
  );

  // About page content
  const AboutPage = () => (
    <>
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-6xl font-light text-gray-900 mb-8 leading-tight">
            About
            <br />
            <span className="font-medium">NoteCraft</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed font-light">
            We're building the future of note-taking with AI-powered tools that make learning more effective and enjoyable.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          <div>
            <h2 className="text-3xl font-light text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              We believe that learning should be beautiful, efficient, and accessible to everyone. 
              NoteCraft was born from the idea that AI can transform how we capture, organize, and engage with knowledge.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              By combining advanced AI technology with thoughtful design, we're creating tools that don't just help you take notes – 
              they help you understand and retain information better.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Learning reimagined</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-light text-gray-900 mb-2">10,000+</div>
            <div className="text-gray-600">Notes generated</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-light text-gray-900 mb-2">500+</div>
            <div className="text-gray-600">Happy users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-light text-gray-900 mb-2">50+</div>
            <div className="text-gray-600">Universities</div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-light text-gray-900 mb-6">
              Join our
              <br />
              <span className="font-medium">community</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Be part of the future of learning. Start creating beautiful notes today.
            </p>
            <button
              onClick={() => setShowApp(true)}
              className="bg-black text-white px-8 py-4 rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Get started now
            </button>
          </div>
        </div>
      </section>
    </>
  );

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'features':
        return (
          <div className="animate-fadeIn">
            <FeaturesPage />
          </div>
        );
      case 'pricing':
        return (
          <div className="animate-fadeIn">
            <PricingPage />
          </div>
        );
      case 'about':
        return (
          <div className="animate-fadeIn">
            <AboutPage />
          </div>
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {renderCurrentPage()}
      </div>
      <Footer />
    </div>
  );
};