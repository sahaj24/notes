'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import Link from 'next/link';

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
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200">
              Pricing
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-900 relative">
              About
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black rounded-full"></div>
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
              <Link href="/pricing" className="block w-full text-left text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200 py-2">
                Pricing
              </Link>
              <Link href="/about" className="block w-full text-left text-sm font-medium text-gray-900 font-semibold py-2">
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
            About
            <br />
            <span className="font-medium">Notopy</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed font-light">
            We're building the future of note-taking with AI-powered tools that make learning more effective and enjoyable.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          <div>
            <h2 className="text-3xl font-light text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              At Notopy, we believe that taking notes shouldn't be a chore. Our AI-powered platform transforms the way students, professionals, and researchers capture and organize information.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Using Google's advanced Gemini AI, we generate beautifully formatted notes with hand-drawn elements, colorful layouts, and natural handwriting styles that make learning more engaging and memorable.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">AI-Powered Generation</h4>
                  <p className="text-gray-600">Instantly create comprehensive notes from any topic using advanced AI technology.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Visual Excellence</h4>
                  <p className="text-gray-600">Beautiful, hand-drawn aesthetics that make notes engaging and memorable.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Multiple Formats</h4>
                  <p className="text-gray-600">Study guides, mind maps, timelines, and more - optimized for different learning styles.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="text-center p-8 bg-white rounded-lg border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">Fast & Efficient</h3>
            <p className="text-gray-600">Generate comprehensive notes in seconds, saving hours of manual work.</p>
          </div>
          <div className="text-center p-8 bg-white rounded-lg border border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">Beautiful Design</h3>
            <p className="text-gray-600">Hand-drawn aesthetics and colorful layouts that make studying enjoyable.</p>
          </div>
          <div className="text-center p-8 bg-white rounded-lg border border-gray-100">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">Learning Focused</h3>
            <p className="text-gray-600">Designed specifically for students, researchers, and professionals.</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-light text-gray-900 mb-6">Why Choose Notopy?</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Traditional note-taking is time-consuming and often results in bland, hard-to-review content. 
              Notopy changes that by combining the power of AI with beautiful visual design to create notes 
              that are not only informative but also engaging and memorable.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">For Students</h4>
                <p className="text-gray-600">Transform your study materials into visually appealing notes that improve retention and make studying more enjoyable.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">For Professionals</h4>
                <p className="text-gray-600">Create professional documentation and meeting notes that impress colleagues and stakeholders.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">For Researchers</h4>
                <p className="text-gray-600">Organize complex information into structured, easy-to-navigate notes that support your research workflow.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">For Educators</h4>
                <p className="text-gray-600">Generate engaging teaching materials and lesson plans that capture students' attention and improve learning outcomes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
