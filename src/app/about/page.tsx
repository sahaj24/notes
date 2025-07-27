'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import Link from 'next/link';
import { CoinDisplay } from '@/components/CoinDisplay';
import Logo from '@/components/Logo';

export default function AboutPage() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Navigation component
  const Navigation = () => (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo href="/" size="md" showText={true} />
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
              className="text-sm font-medium transition-all duration-200 relative text-gray-900"
            >
              About
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black rounded-full"></div>
            </Link>
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {profile && <CoinDisplay className="mr-2" />}
                  <Link
                    href="/notes"
                    className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Create Note
                  </Link>
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
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="block w-full text-left text-sm font-medium transition-all duration-200 py-2 text-gray-600 hover:text-gray-900"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="block w-full text-left text-sm font-medium transition-all duration-200 py-2 text-gray-900 font-semibold"
              >
                About
              </Link>
              <div className="border-t border-gray-100 pt-4 mt-4">
                {user ? (
                  <>
                    {profile && <div className="mb-4"><CoinDisplay showDetails={true} /></div>}
                    <Link
                      href="/notes"
                      className="block w-full bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-all duration-200 text-center"
                    >
                      Create Note
                    </Link>
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
              {user ? (
                <Link href="/notes" className="block hover:text-gray-900 transition-colors duration-200">Try Now</Link>
              ) : (
                <Link href="/login" className="block hover:text-gray-900 transition-colors duration-200">Sign in to try</Link>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Company</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <Link href="/about" className="block hover:text-gray-900 transition-colors duration-200">About</Link>
              <a href="#" className="block hover:text-gray-900 transition-colors duration-200">Blog</a>
              <Link href="/contact" className="block hover:text-gray-900 transition-colors duration-200">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Support</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <a href="mailto:support@notopy.com" className="block hover:text-gray-900 transition-colors duration-200">Help Center</a>
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
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navigation />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pt-16 md:py-24 md:pt-32">
        <div className="max-w-5xl mx-auto text-center mb-12 md:mb-20">
          <div className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            📚 Finals season? We're here to help
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 md:mb-8 leading-tight">
            Preparing for finals?
            <br />
            <span className="text-blue-600">Let us help you study smarter</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
            Save valuable study time with our AI-powered note generation. Simply paste any topic and receive beautiful, comprehensive study notes instantly.
            Perfect for reviewing, understanding, and mastering complex subjects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 hover:scale-105 text-lg">
              Try it free now
            </Link>
            <div className="text-sm text-gray-500">
              ⚡ Get your first notes in under 30 seconds
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="mb-12 md:mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4 md:mb-6">Why we built this</h2>
              <div className="space-y-4 text-base md:text-lg text-gray-600 leading-relaxed">
                <p>
                  <strong>The challenge:</strong> Many students spend 3-5 hours creating notes for each subject,
                  which can be time-consuming during busy academic periods.
                </p>
                <p>
                  <strong>Our approach:</strong> We've developed a tool that helps you generate comprehensive, well-organized notes in seconds.
                  This allows you to focus more time on understanding and reviewing the material.
                </p>
                <p>
                  <strong>The outcome:</strong> Thousands of students have found success using Notopy to study more efficiently with reduced stress.
                  From organic chemistry to European history, our platform supports learning across all subjects.
                </p>

              </div>
            </div>
            <div className="order-1 lg:order-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 md:p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">⚡</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Save 20+ hours per week</h3>
                <p className="text-sm md:text-base text-gray-600">Transform your study routine with comprehensive materials generated instantly.</p>
                <div className="mt-4 bg-white rounded-lg p-3 text-xs text-gray-500">
                  <div className="flex items-center justify-between mb-1">
                    <span>Manual notes:</span>
                    <span className="text-red-600 font-medium">4-5 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>With Notopy:</span>
                    <span className="text-green-600 font-medium">30 seconds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Students Love Notopy */}
        <div className="mb-12 md:mb-24">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              Why students <span className="text-blue-600">love Notopy</span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Real benefits that make a difference during finals season
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white rounded-lg border border-gray-100 p-6 md:p-8 hover:shadow-lg transition-all duration-300">
              <div className="text-4xl text-center mb-4">🚀</div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 text-center">Lightning Fast</h3>
              <p className="text-sm md:text-base text-gray-600 text-center">
                Get comprehensive notes in under 30 seconds. Perfect for last-minute cramming or quick reviews.
              </p>
              <div className="mt-4 text-center">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  Average: 15 seconds
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-6 md:p-8 hover:shadow-lg transition-all duration-300">
              <div className="text-4xl text-center mb-4">🎯</div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 text-center">Exam-Ready Format</h3>
              <p className="text-sm md:text-base text-gray-600 text-center">
                Notes structured exactly how you need them for studying - with key points, definitions, and examples.
              </p>
              <div className="mt-4 text-center">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  Study-optimized
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-6 md:p-8 hover:shadow-lg transition-all duration-300">
              <div className="text-4xl text-center mb-4">💰</div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 text-center">Student Budget</h3>
              <p className="text-sm md:text-base text-gray-600 text-center">
                Starting at just $4.99. Way cheaper than hiring a tutor or buying expensive study guides.
              </p>
              <div className="mt-4 text-center">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                  Less than a coffee
                </span>
              </div>
            </div>
          </div>
        </div>



        {/* How It Works */}
        <div className="mb-12 md:mb-24">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
                  How <span className="font-medium">it works</span>
                </h2>
                <p className="text-base md:text-lg text-gray-600">
                  Create beautiful notes in just a few simple steps
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm md:text-base">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">Enter your topic</h3>
                      <p className="text-sm md:text-base text-gray-600">
                        Simply type any subject you want to learn about or document. Our AI will analyze your topic and prepare to generate comprehensive notes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm md:text-base">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">Choose a template</h3>
                      <p className="text-sm md:text-base text-gray-600">
                        Select from multiple note formats based on your needs, from creative collages to academic study guides to mind maps.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm md:text-base">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">Generate your notes</h3>
                      <p className="text-sm md:text-base text-gray-600">
                        Our advanced AI creates beautiful, structured notes instantly, organizing information with proper hierarchy and visual elements.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm md:text-base">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">Export and share</h3>
                      <p className="text-sm md:text-base text-gray-600">
                        Download your notes as PDF, PNG, or HTML files to study offline or share with classmates and colleagues.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">
              Ready to enhance
              <br />
              <span className="text-blue-200">your study experience?</span>
            </h2>
            <p className="text-base md:text-lg text-blue-100 mb-6 md:mb-8">
              Join 10,000+ students who have discovered a more efficient way to create study materials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-50 transition-all duration-200 hover:scale-105 text-lg shadow-lg">
                Start studying smarter →
              </Link>
              <div className="text-blue-200 text-sm">
                ✨ Free trial • No credit card required
              </div>
            </div>
            <div className="mt-8 flex justify-center items-center space-x-8 text-blue-200 text-sm">
              <div>⚡ 30-second setup</div>
              <div>📚 Works for any subject</div>
              <div>🎯 Exam-focused format</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}