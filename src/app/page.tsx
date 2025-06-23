'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import NotionaryLogo from './components/NotionaryLogo';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session) {
      router.push('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [session, status, router]);

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <NotionaryLogo size="xl" showText={true} />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Notionary
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
              Organize your thoughts, manage your tasks, and boost your productivity with our intuitive notes application.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Rich Text Editing</h3>
              <p className="text-gray-600 dark:text-gray-300">Format your notes with advanced text editing tools and create beautiful, organized content.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Task Management</h3>
              <p className="text-gray-600 dark:text-gray-300">Create and manage todo lists with deadlines, priorities, and progress tracking.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Smart Organization</h3>
              <p className="text-gray-600 dark:text-gray-300">Drag and drop notes into groups, organize by projects, and find what you need quickly.</p>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link
              href="/auth/signup"
              className="inline-block w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/signin"
              className="inline-block w-full sm:w-auto px-8 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-600 hover:text-white dark:hover:text-white transition-all duration-200"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
            <p>No credit card required • Free forever • Start organizing today</p>
          </div>
        </div>
      </div>
    </div>
  );
}
