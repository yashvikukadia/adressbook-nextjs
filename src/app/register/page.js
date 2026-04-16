'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Registration failed');
        setLoading(false);
        return;
      }

      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="register-page">
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
              Create Account
            </h1>
            <p className="text-base font-medium text-[#525252] font-dm">
              Sign up to start organizing your contacts
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="register-form">
            <div>
              <label className="block text-sm font-semibold tracking-wide uppercase text-[#171717] font-dm mb-2">
                Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#171717]" strokeWidth={2} />
                <input
                  data-testid="register-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border-2 border-[#171717] p-3 pl-12 rounded-none focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/50 text-[#171717] font-medium placeholder:text-neutral-400"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold tracking-wide uppercase text-[#171717] font-dm mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#171717]" strokeWidth={2} />
                <input
                  data-testid="register-email-input"
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
                  data-testid="register-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border-2 border-[#171717] p-3 pl-12 rounded-none focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/50 text-[#171717] font-medium placeholder:text-neutral-400"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div data-testid="auth-error-message" className="bg-red-50 border-2 border-red-500 p-3 rounded-none">
                <p className="text-red-700 font-medium text-sm">{error}</p>
              </div>
            )}

            <button
              data-testid="register-submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-[#BAE6FD] text-[#171717] font-bold py-3 px-6 rounded-none border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#171717] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-outfit"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#525252] font-medium">
              Already have an account?{' '}
              <Link
                data-testid="goto-login-link"
                href="/login"
                className="text-[#171717] font-bold underline hover:text-[#525252] transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#E9D5FF] via-[#FECDD3] to-[#FDE047]">
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
              Your contacts, organized beautifully
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 flex gap-4 justify-center"
            >
              <div className="w-16 h-16 bg-[#BAE6FD] border-2 border-[#171717] shadow-[4px_4px_0px_#171717] rounded-xl" />
              <div className="w-16 h-16 bg-[#A7F3D0] border-2 border-[#171717] shadow-[4px_4px_0px_#171717] rounded-full" />
              <div className="w-16 h-16 bg-[#FDE047] border-2 border-[#171717] shadow-[4px_4px_0px_#171717]" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
