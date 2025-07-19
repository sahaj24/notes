'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import Link from 'next/link';
import { CoinDisplay } from '@/components/CoinDisplay';

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
      <section className="max-w-7xl mx-auto px-6 py-24 pt-32">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-6xl font-light text-gray-900 mb-8 leading-tight">
            About
            <br />
            <span className="font-medium">Notopy</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed font-light">
            We're revolutionizing note-taking with AI-powered tools that make learning more effective, engaging, and enjoyable.
          </p>
        </div>

        {/* Our Story */}
        <div className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-light text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  Notopy was born from a simple observation: despite all the technological advancements in education,
                  note-taking remains largely unchanged—tedious, time-consuming, and often ineffective.
                </p>
                <p>
                  Founded in 2024 by a team of educators, designers, and AI specialists, we set out to create a
                  platform that transforms how people capture and organize information. By combining advanced AI
                  with beautiful visual design, we've created a tool that generates notes that
                  are not just informative but also engaging and memorable.
                </p>
                <p>
                  Our mission is to make learning more accessible and enjoyable for everyone, from students
                  preparing for exams to professionals documenting complex projects.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Innovation in Education</h3>
                <p className="text-gray-600">Making learning more visual, engaging, and effective through AI technology.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              Our <span className="font-medium">Values</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at Notopy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg border border-gray-100 p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3 text-center">Innovation</h3>
              <p className="text-gray-600 text-center">
                We constantly push the boundaries of what's possible with AI and education technology.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3 text-center">Accessibility</h3>
              <p className="text-gray-600 text-center">
                We believe powerful learning tools should be available to everyone, regardless of background or resources.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3 text-center">Quality</h3>
              <p className="text-gray-600 text-center">
                We're committed to creating notes that are not just beautiful but also accurate, comprehensive, and useful.
              </p>
            </div>
          </div>
        </div>



        {/* How It Works */}
        <div className="mb-24">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-light text-gray-900 mb-4">
                  How <span className="font-medium">it works</span>
                </h2>
                <p className="text-lg text-gray-600">
                  Create beautiful notes in just a few simple steps
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium">1</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Enter your topic</h3>
                      <p className="text-gray-600">
                        Simply type any subject you want to learn about or document. Our AI will analyze your topic and prepare to generate comprehensive notes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium">2</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Choose a template</h3>
                      <p className="text-gray-600">
                        Select from multiple note formats based on your needs, from creative collages to academic study guides to mind maps.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium">3</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Generate your notes</h3>
                      <p className="text-gray-600">
                        Our advanced AI creates beautiful, structured notes instantly, organizing information with proper hierarchy and visual elements.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium">4</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Export and share</h3>
                      <p className="text-gray-600">
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
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-light text-gray-900 mb-6">
              Ready to transform
              <br />
              <span className="font-medium">your note-taking?</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of users who have already discovered the power of AI-generated notes.
            </p>
            <Link href="/signup" className="bg-black text-white px-8 py-4 rounded-md font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg">
              Get started today
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}