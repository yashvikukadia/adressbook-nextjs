'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Invalid credentials');
        setLoading(false);
        return;
      }

      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#FAFAFA]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#171717] font-outfit mb-2">
              Welcome Back
            </h1>
            <p className="text-base font-medium text-[#525252] font-dm">
              Sign in to manage your contacts
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div>
              <label className="block text-sm font-semibold tracking-wide uppercase text-[#171717] font-dm mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#171717]" strokeWidth={2} />
                <input
                  data-testid="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border-2 border-[#171717] p-3 pl-12 rounded-none focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/50 text-[#171717] font-medium placeholder:text-neutral-400"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold tracking-wide uppercase text-[#171717] font-dm mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#171717]" strokeWidth={2} />
                <input
                  data-testid="login-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border-2 border-[#171717] p-3 pl-12 rounded-none focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/50 text-[#171717] font-medium placeholder:text-neutral-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div data-testid="auth-error-message" className="bg-red-50 border-2 border-red-500 p-3 rounded-none">
                <p className="text-red-700 font-medium text-sm">{error}</p>
              </div>
            )}

            <button
              data-testid="login-submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-[#BAE6FD] text-[#171717] font-bold py-3 px-6 rounded-none border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#171717] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-outfit"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#525252] font-medium">
              Don&apos;t have an account?{' '}
              <Link
                data-testid="goto-register-link"
                href="/register"
                className="text-[#171717] font-bold underline hover:text-[#525252] transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#BAE6FD] via-[#E9D5FF] to-[#A7F3D0]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-6xl font-black text-[#171717] font-outfit mb-4"
            >
              Address Book
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl font-medium text-[#525252] font-dm"
            >
              Organize Your Contacts Beautifully
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 flex gap-4 justify-center"
            >
              <div className="w-16 h-16 bg-[#FDE047] border-2 border-[#171717] shadow-[4px_4px_0px_#171717] rounded-xl" />
              <div className="w-16 h-16 bg-[#FECDD3] border-2 border-[#171717] shadow-[4px_4px_0px_#171717] rounded-full" />
              <div className="w-16 h-16 bg-[#A7F3D0] border-2 border-[#171717] shadow-[4px_4px_0px_#171717]" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
