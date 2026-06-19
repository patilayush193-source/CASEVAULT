'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        backgroundColor: scrolled
          ? 'rgba(3, 7, 18, 0.85)'
          : 'rgba(3, 7, 18, 0.4)',
        borderBottom: '1px solid rgba(30, 45, 74, 0.5)',
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5">
          <span className="font-syne text-xl font-extrabold tracking-tight text-textPrimary">
            CASEVAULT
          </span>
          <span className="text-accent text-xl font-bold">.</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-8">
          <Link
            href="/gallery"
            className="text-sm font-medium text-textSecondary transition-colors hover:text-textPrimary"
          >
            Gallery
          </Link>
          <Link
            href="/upload"
            className="text-sm font-medium text-textSecondary transition-colors hover:text-textPrimary"
          >
            Upload
          </Link>

          {/* Auth */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-textSecondary">
                    {user.email}
                  </span>
                  <button
                    onClick={() => void logout()}
                    className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-textSecondary transition-colors hover:border-borderHi hover:text-textPrimary"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-textSecondary transition-colors hover:border-borderHi hover:text-textPrimary"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-md bg-accent px-3 py-1.5 text-sm font-bold text-obsidian transition-colors hover:bg-accentDim"
                  >
                    Register
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
