import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-8xl font-black text-primary-100 mb-4">404</div>
          <h1 className="text-2xl font-bold text-primary-900 mb-2">Page Not Found</h1>
          <p className="text-primary-500 mb-8">The page you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    </div>
  );
}
