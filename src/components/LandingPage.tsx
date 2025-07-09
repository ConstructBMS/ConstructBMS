import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className='min-h-screen flex flex-col bg-white'>
      {/* Header */}
      <header className='flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white'>
        <div className='flex items-center gap-2'>
          {/* Archer Logo SVG */}
          <svg
            width='36'
            height='36'
            viewBox='0 0 36 36'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <rect width='36' height='36' rx='8' fill='#00FF85' />
            <path
              d='M10 26L18 10L26 26H22.5L18 17.5L13.5 26H10Z'
              fill='black'
            />
          </svg>
          <span className='text-2xl font-extrabold text-black tracking-tight'>
            Archer
          </span>
        </div>
        <div className='flex gap-4'>
          <Link
            to='/login'
            className='px-5 py-2 rounded-lg font-semibold text-black bg-archer-neon hover:bg-black hover:text-white border border-archer-neon transition-colors'
          >
            Log In
          </Link>
          <Link
            to='/signup'
            className='px-5 py-2 rounded-lg font-semibold text-white bg-black hover:bg-archer-neon hover:text-black border border-black transition-colors'
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
          <span className='text-archer-neon'>The Modern Business Platform</span>
        </h1>
        <p className='text-lg md:text-xl text-gray-700 text-center max-w-2xl mb-8'>
          Archer empowers construction and business teams with powerful project
          management, collaboration, and analytics tools—all in one place.
        </p>
        <div className='flex gap-6 mt-4'>
          <Link
            to='/signup'
            className='px-8 py-3 rounded-lg font-bold text-white bg-black hover:bg-archer-neon hover:text-black text-lg transition-colors shadow-lg'
          >
            Get Started
          </Link>
          <Link
            to='/login'
            className='px-8 py-3 rounded-lg font-bold text-black bg-archer-neon hover:bg-black hover:text-white text-lg border border-archer-neon transition-colors shadow-lg'
          >
            Log In
          </Link>
        </div>
      </main>

      {/* Features Section (optional, can be expanded) */}
      <section className='py-12 bg-white border-t border-gray-100'>
        <div className='max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4'>
          <div className='flex flex-col items-center text-center'>
            <span className='text-3xl font-bold text-archer-neon mb-2'>
              &#128736;
            </span>
            <h3 className='font-semibold text-lg mb-1'>Project Management</h3>
            <p className='text-gray-600 text-sm'>
              Plan, track, and deliver projects with ease and precision.
            </p>
          </div>
          <div className='flex flex-col items-center text-center'>
            <span className='text-3xl font-bold text-archer-neon mb-2'>
              &#128101;
            </span>
            <h3 className='font-semibold text-lg mb-1'>Team Collaboration</h3>
            <p className='text-gray-600 text-sm'>
              Connect your team, share files, and communicate in real time.
            </p>
          </div>
          <div className='flex flex-col items-center text-center'>
            <span className='text-3xl font-bold text-archer-neon mb-2'>
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
      <footer className='py-6 px-8 bg-gray-50 border-t border-gray-100 text-center text-gray-500 text-sm'>
        &copy; {new Date().getFullYear()} Archer. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
