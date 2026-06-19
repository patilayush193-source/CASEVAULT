'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        await login(email, password);
        router.push('/');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Login failed';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [email, password, login, router],
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <motion.div
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          background: 'rgba(13,20,36,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,245,212,0.15)',
        }}
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="display-lg text-textPrimary mb-2">Welcome back</h1>
        <p className="text-sm text-textSecondary mb-8">
          Sign in to access your vault.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error && error.toLowerCase().includes('email') ? error : undefined}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && !error.toLowerCase().includes('email') && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-textMuted">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-accent hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
