'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../../stores/auth.store';
import { ApiError } from '../../../lib/api-client';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      router.push('/news');
    } catch (err) {
      // Error is handled by the store, but we keep this for any additional error handling
    }
  };

  return (
    <div className="min-h-screen bg-light-blue flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-primary">IMS News Central</h1>
          </Link>
          <p className="text-mid-gray mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-text mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                autoComplete="email"
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-error flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-text mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  autoComplete="current-password"
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mid-gray hover:text-dark-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-error flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-mid-gray mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-accent hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
