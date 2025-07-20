import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className='min-h-screen flex flex-col bg-white'>
      {/* Header */}
      <header className='flex items-center justify-between px-8 py-6 border-b border-gray-100' style={{ backgroundColor: '#1a2b44' }}>
        <div className='flex items-center gap-2'>
          {/* ConstructBMS Logo SVG - Building/Construction Theme */}
          <svg
            width='36'
            height='36'
            viewBox='0 0 36 36'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
              <rect width='36' height='36' rx='8' fill='#3B82F6' />
              {/* Building base */}
              <rect x='8' y='20' width='20' height='8' fill='#1a2b44' />
              {/* Building structure */}
              <rect x='10' y='12' width='16' height='8' fill='#1a2b44' />
              {/* Windows */}
              <rect x='12' y='14' width='3' height='3' fill='#FFFFFF' />
              <rect x='17' y='14' width='3' height='3' fill='#FFFFFF' />
              <rect x='22' y='14' width='3' height='3' fill='#FFFFFF' />
              <rect x='12' y='22' width='3' height='3' fill='#FFFFFF' />
              <rect x='17' y='22' width='3' height='3' fill='#FFFFFF' />
              <rect x='22' y='22' width='3' height='3' fill='#FFFFFF' />
              {/* Crane arm */}
              <rect x='6' y='8' width='24' height='2' fill='#1a2b44' />
              <rect x='16' y='6' width='4' height='4' fill='#1a2b44' />
              {/* Crane hook */}
              <rect x='17' y='10' width='2' height='2' fill='#1E40AF' />
          </svg>
          <span className='text-2xl font-extrabold text-white tracking-tight'>
            ConstructBMS
          </span>
        </div>
        <div className='flex gap-4'>
          <Link
            to='/login'
            className='px-5 py-2 rounded-lg font-semibold text-black bg-constructbms-blue hover:bg-white hover:text-black border border-constructbms-blue transition-colors'
          >
            Log In
          </Link>
          <Link
            to='/signup'
            className='px-5 py-2 rounded-lg font-semibold text-white bg-constructbms-blue hover:bg-white hover:text-black border border-constructbms-blue transition-colors'
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className='flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-white to-gray-50'>
        <h1 className='text-4xl md:text-5xl font-extrabold text-black text-center mb-4 leading-tight'>
          Build. Manage. Succeed.
          <br />
          <span className='text-constructbms-blue'>The Modern Business Platform</span>
        </h1>
        <p className='text-lg md:text-xl text-gray-700 text-center max-w-2xl mb-8'>
          ConstructBMS empowers construction and business teams with powerful project
          management, collaboration, and analytics tools—all in one place.
        </p>
        <div className='flex gap-6 mt-4'>
          <Link
            to='/signup'
            className='px-8 py-3 rounded-lg font-bold text-white bg-black hover:bg-constructbms-blue hover:text-black text-lg transition-colors shadow-lg'
          >
            Get Started
          </Link>
          <Link
            to='/login'
            className='px-8 py-3 rounded-lg font-bold text-black bg-constructbms-blue hover:bg-black hover:text-white text-lg border border-constructbms-blue transition-colors shadow-lg'
          >
            Log In
          </Link>
        </div>
      </main>

      {/* Features Section (optional, can be expanded) */}
      <section className='py-12 bg-white border-t border-gray-100'>
        <div className='max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4'>
          <div className='flex flex-col items-center text-center'>
            <span className='text-3xl font-bold text-constructbms-blue mb-2'>
              &#128736;
            </span>
            <h3 className='font-semibold text-lg mb-1'>Project Management</h3>
            <p className='text-gray-600 text-sm'>
              Plan, track, and deliver projects with ease and precision.
            </p>
          </div>
          <div className='flex flex-col items-center text-center'>
            <span className='text-3xl font-bold text-constructbms-blue mb-2'>
              &#128101;
            </span>
            <h3 className='font-semibold text-lg mb-1'>Team Collaboration</h3>
            <p className='text-gray-600 text-sm'>
              Connect your team, share files, and communicate in real time.
            </p>
          </div>
          <div className='flex flex-col items-center text-center'>
            <span className='text-3xl font-bold text-constructbms-blue mb-2'>
              &#128200;
            </span>
            <h3 className='font-semibold text-lg mb-1'>Business Insights</h3>
            <p className='text-gray-600 text-sm'>
              Gain actionable insights with dashboards and analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='py-6 px-8 border-t border-gray-100 text-center text-gray-500 text-sm' style={{ backgroundColor: '#1a2b44' }}>
                  &copy; {new Date().getFullYear()} ConstructBMS. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
