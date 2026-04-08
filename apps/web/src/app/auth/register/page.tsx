'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../../stores/auth.store';
import { Eye, EyeOff, Loader2, AlertCircle, Check, X } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(1, 'Full name is required').min(2, 'Name must be at least 2 characters'),
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-z0-9_-]+$/, 'Only lowercase letters, numbers, hyphens, underscores'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score <= 1) return { score, label: 'Weak', color: 'bg-error' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-warning' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-warning' };
  if (score <= 4) return { score, label: 'Strong', color: 'bg-success' };
  return { score: 5, label: 'Very Strong', color: 'bg-success' };
}

const passwordRequirements = [
  { key: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { key: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
  { key: 'special', label: 'One special character', test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuthStore();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');
  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
        username: data.username,
      });
      router.push('/news');
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen bg-light-blue flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-primary">IMS News Central</h1>
          </Link>
          <p className="text-mid-gray mt-2">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark-text mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                autoComplete="name"
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="Your name"
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-error flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-dark-text mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                {...register('username')}
                autoComplete="username"
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="your-username"
              />
              {errors.username && (
                <p className="mt-1.5 text-sm text-error flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.username.message}
                </p>
              )}
            </div>

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
                  autoComplete="new-password"
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
              
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-mid-gray">{passwordStrength.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {passwordRequirements.map((req) => (
                      <div
                        key={req.key}
                        className={`text-xs flex items-center gap-1 ${
                          req.test(password) ? 'text-success' : 'text-mid-gray'
                        }`}
                      >
                        {req.test(password) ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-text mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  autoComplete="new-password"
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mid-gray hover:text-dark-text transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-error flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword.message}
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-mid-gray mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
