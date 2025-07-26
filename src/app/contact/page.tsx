'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import Link from 'next/link';
import { CoinDisplay } from '@/components/CoinDisplay';
import Logo from '@/components/Logo';

export default function ContactPage() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo href="/" size="md" showText={true} />
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium text-gray-900">
                Contact
              </Link>
              <div className="flex items-center space-x-3">
                {user ? (
                  <>
                    {profile && <CoinDisplay className="mr-2" />}
                    <Link href="/notes" className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
                      Create Note
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                      Sign In
                    </Link>
                    <Link href="/signup" className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Contact Content */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-gray-900 mb-6">
            Get in <span className="font-medium">touch</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            We're here to help with any questions about Notopy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-medium text-gray-900 mb-6">Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Email Support</h3>
                  <p className="text-gray-600 mb-2">Get help with your account, payments, or technical issues</p>
                  <a 
                    href="mailto:support@notopy.com" 
                    className="text-black hover:underline font-medium"
                  >
                    support@notopy.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Response Time</h3>
                  <p className="text-gray-600">We typically respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Website</h3>
                  <p className="text-gray-600 mb-2">Visit our website for more information</p>
                  <a 
                    href="https://notopy.com" 
                    className="text-black hover:underline font-medium"
                  >
                    notopy.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact Form */}
          <div>
            <h2 className="text-2xl font-medium text-gray-900 mb-6">Quick Contact</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                For the fastest response, please email us directly at:
              </p>
              <a 
                href="mailto:support@notopy.com?subject=Support Request&body=Hi Notopy team,%0D%0A%0D%0AI need help with:%0D%0A%0D%0A[Please describe your issue]%0D%0A%0D%0AThanks!"
                className="inline-flex items-center bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </a>
            </div>

            <div className="mt-8">
              <h3 className="font-medium text-gray-900 mb-4">Common Questions</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Payment Issues</p>
                  <p className="text-gray-600">Include your payment ID in your email</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Account Problems</p>
                  <p className="text-gray-600">Include your registered email address</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Technical Support</p>
                  <p className="text-gray-600">Describe the issue and steps to reproduce</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}