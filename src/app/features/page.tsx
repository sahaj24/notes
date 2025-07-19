'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import Link from 'next/link';
import { CoinDisplay } from '@/components/CoinDisplay';

export default function FeaturesPage() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('students');

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
              className="text-sm font-medium transition-all duration-200 relative text-gray-900"
            >
              Features
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black rounded-full"></div>
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
                className="block w-full text-left text-sm font-medium transition-all duration-200 py-2 text-gray-900 font-semibold"
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
                className="block w-full text-left text-sm font-medium transition-all duration-200 py-2 text-gray-600 hover:text-gray-900"
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
            Powered by Google Gemini AI
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
            Powerful features for
            <br />
            <span className="font-medium">modern learning</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed font-light">
            Discover how Notopy's AI-powered features can transform your note-taking experience.
          </p>
        </div>

        {/* Main Feature Showcase */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 mb-20 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-light text-gray-900 mb-4">
                AI-powered <span className="font-medium">note generation</span>
              </h2>
              <p className="text-lg text-gray-600">
                Transform any topic into beautifully structured, visually enhanced notes in seconds
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <h3 className="text-2xl font-medium text-gray-900 mb-4">How it works</h3>
                <ol className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-white text-sm">1</span>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Enter your topic</p>
                      <p className="text-gray-600 text-sm">Type any subject you want to learn about</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-white text-sm">2</span>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Choose a template</p>
                      <p className="text-gray-600 text-sm">Select from multiple note formats</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-white text-sm">3</span>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Generate your notes</p>
                      <p className="text-gray-600 text-sm">Get beautiful, structured notes in seconds</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-white text-sm">4</span>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Export and share</p>
                      <p className="text-gray-600 text-sm">Download as PDF, PNG, or HTML</p>
                    </div>
                  </li>
                </ol>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Advanced AI Technology</h3>
                  <p className="text-gray-600">Powered by cutting-edge AI to create intelligent, well-structured notes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              Core <span className="font-medium">features</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Everything you need for effective note-taking and learning
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "AI Content Generation",
                description: "Generate comprehensive notes instantly using advanced AI. Just enter a topic and get structured, intelligent content.",
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
                title: "Template Spaces",
                description: "Our templates include intentional spaces for your personal notes and additions, making it easy to customize content after generation.",
                icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
              },
              {
                title: "Instant Export",
                description: "Download your notes as high-quality images or PDFs. Perfect for sharing or offline studying.",
                icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="p-8 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                {feature.title === "Template Spaces" && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                      </div>
                      <div className="ml-2">
                      </div>
                    </div>
                 
                )}
              </div>
            ))}
          </div>
        </div>

        {/* User-specific features */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              Features for <span className="font-medium">everyone</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Specialized tools for different user needs
            </p>
            
            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button 
                onClick={() => setActiveTab('students')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === 'students' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                For Students
              </button>
              <button 
                onClick={() => setActiveTab('professionals')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === 'professionals' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                For Professionals
              </button>
              <button 
                onClick={() => setActiveTab('researchers')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === 'researchers' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                For Researchers
              </button>
            </div>
          </div>
          
          {/* Tab content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeTab === 'students' && [
              {
                title: "Study Guide Generator",
                description: "Create comprehensive study guides for any subject with key concepts, definitions, and examples.",
                icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              },
              {
                title: "Exam Preparation",
                description: "Generate practice questions, flashcards, and summary notes to prepare for exams efficiently.",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              },
              {
                title: "Visual Learning",
                description: "Convert complex topics into visual diagrams, mind maps, and concept charts for better retention.",
                icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              },
              {
                title: "Time Management",
                description: "Create study schedules and organize notes by subject, priority, and exam dates.",
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="p-6 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg flex items-start space-x-4"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
            
            {activeTab === 'professionals' && [
              {
                title: "Meeting Notes",
                description: "Generate professional meeting summaries with action items, decisions, and follow-up tasks.",
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              },
              {
                title: "Project Documentation",
                description: "Create visually appealing project documentation, reports, and presentations.",
                icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              },
              {
                title: "Client Presentations",
                description: "Generate professional-looking handouts and presentation materials that impress clients.",
                icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              },
              {
                title: "Knowledge Management",
                description: "Organize company knowledge, processes, and procedures in a visually engaging format.",
                icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="p-6 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg flex items-start space-x-4"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
            
            {activeTab === 'researchers' && [
              {
                title: "Literature Review",
                description: "Organize research findings, citations, and key insights from academic papers.",
                icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              },
              {
                title: "Data Visualization",
                description: "Transform complex data and findings into clear visual representations and explanations.",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              },
              {
                title: "Methodology Documentation",
                description: "Create detailed, step-by-step documentation of research methodologies and procedures.",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              },
              {
                title: "Conference Materials",
                description: "Generate professional posters, handouts, and presentation materials for academic conferences.",
                icon: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="p-6 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg flex items-start space-x-4"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template Gallery */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              Note <span className="font-medium">templates</span>
            </h2>
            <p className="text-lg text-gray-600">
              Choose from a variety of templates designed for different learning styles
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Creative Collage",
                description: "Hand-drawn style with colorful elements and organic layouts",
                icon: "🎨",
                color: "bg-purple-500"
              },
              {
                name: "Academic Study",
                description: "Professional format perfect for research and academic work",
                icon: "🎓",
                color: "bg-blue-500"
              },
              {
                name: "Cheat Sheet",
                description: "Densely packed study reference with formulas and key facts",
                icon: "📝",
                color: "bg-green-500"
              },
              {
                name: "Timeline",
                description: "Chronological layout perfect for historical topics",
                icon: "📅",
                color: "bg-yellow-500"
              },
              {
                name: "Comparison",
                description: "Side-by-side analysis and comparison charts",
                icon: "⚖️",
                color: "bg-red-500"
              },
              {
                name: "Classic Notebook",
                description: "Traditional lined paper with handwritten aesthetics",
                icon: "📝",
                color: "bg-gray-500"
              }
            ].map((template, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className={`${template.color} h-3`}></div>
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">{template.icon}</span>
                    <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                  </div>
                  <p className="text-gray-600">{template.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-light text-gray-900 mb-6">
              Experience the future
              <br />
              <span className="font-medium">of note-taking</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Try Notopy today and see how AI can transform your learning experience.
            </p>
            {user ? (
              <Link href="/notes" className="bg-black text-white px-8 py-4 rounded-md font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg">
                Start creating notes
              </Link>
            ) : (
              <Link href="/login" className="bg-black text-white px-8 py-4 rounded-md font-medium hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg">
                Sign in to create notes
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}