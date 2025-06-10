'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NotionaryLogo from './components/NotionaryLogo';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const keepSignedIn = localStorage.getItem('keepSignedIn');
    const authExpiration = localStorage.getItem('authExpiration');
    
    // Check if authentication has expired
    if (keepSignedIn === 'true' && authExpiration) {
      const expirationDate = new Date(authExpiration);
      const now = new Date();
      
      if (now > expirationDate) {
        // Authentication expired, clear all auth data
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('keepSignedIn');
        localStorage.removeItem('authExpiration');
        localStorage.removeItem('authProvider');
        setIsLoading(false);
        return;
      }
    }
    
    if (isAuthenticated === 'true') {
      router.push('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [router]);

        if (isLoading) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#EEF2FF] to-[#F3F4F6] dark:from-[#1E1B4B] dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
                      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4F46E5] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF2FF] to-[#F3F4F6] dark:from-[#1E1B4B] dark:to-gray-900">
      <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <NotionaryLogo size="xl" showText={true} />
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-[#1F2937] dark:text-[#E5E7EB] mb-6">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] bg-clip-text text-transparent">
                  Notionary
                </span>
              </h1>
                          <p className="text-xl md:text-2xl text-[#1F2937]/80 dark:text-[#E5E7EB]/80 mb-8">
                Organize your thoughts, manage your tasks, and boost your productivity with our intuitive notes application.
              </p>
          </div>

                      <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white dark:bg-[#1E1B4B] p-6 rounded-lg shadow-lg border border-[#A5B4FC]/20">
                <div className="text-3xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB] mb-2">Rich Text Editing</h3>
                <p className="text-[#1F2937]/70 dark:text-[#E5E7EB]/70">Format your notes with advanced text editing tools and create beautiful, organized content.</p>
              </div>
              
              <div className="bg-white dark:bg-[#1E1B4B] p-6 rounded-lg shadow-lg border border-[#A5B4FC]/20">
                <div className="text-3xl mb-4">✅</div>
                <h3 className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB] mb-2">Task Management</h3>
                <p className="text-[#1F2937]/70 dark:text-[#E5E7EB]/70">Create and manage todo lists with deadlines, priorities, and progress tracking.</p>
              </div>
              
              <div className="bg-white dark:bg-[#1E1B4B] p-6 rounded-lg shadow-lg border border-[#A5B4FC]/20">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB] mb-2">Smart Organization</h3>
                <p className="text-[#1F2937]/70 dark:text-[#E5E7EB]/70">Drag and drop notes into groups, organize by projects, and find what you need quickly.</p>
              </div>
            </div>

                      <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                href="/auth/signup"
                className="inline-block w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#4F46E5] to-[#FBBF24] text-white font-medium rounded-lg hover:from-[#3730A3] hover:to-[#F59E0B] transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/auth/signin"
                className="inline-block w-full sm:w-auto px-8 py-3 border-2 border-[#4F46E5] text-[#4F46E5] dark:text-[#A5B4FC] font-medium rounded-lg hover:bg-[#4F46E5] hover:text-white dark:hover:text-white transition-all duration-200"
              >
                Sign In
              </Link>
            </div>

          <div className="mt-12 text-sm text-gray-500 dark:text-gray-500">
            <p>No credit card required • Free forever • Start organizing today</p>
          </div>
        </div>
      </div>
    </div>
  );
}
