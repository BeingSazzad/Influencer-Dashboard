import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { loginAdmin } from '@/store/slices/authSlice';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('sazzad.uiuxdesign@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      dispatch(loginAdmin({ email }));
      setIsLoading(false);
      navigate(ROUTES.DASHBOARD.OVERVIEW);
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-neutral-900">Sign In</h2>
        <p className="text-xs text-neutral-500">
          Enter your admin credentials to access your dashboard.
        </p>
      </div>

      {error && (
        <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Email
          </label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@influverse.com"
              required
              className="w-full h-10 pl-10 pr-3.5 text-sm bg-white border border-neutral-200 hover:border-neutral-300 rounded-lg transition-colors placeholder:text-neutral-400 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-10 pl-10 pr-10 text-sm bg-white border border-neutral-200 hover:border-neutral-300 rounded-lg transition-colors placeholder:text-neutral-400 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-neutral-400 hover:text-neutral-600 p-1"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Remember me & Forgot Password */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-600 hover:text-neutral-900">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded text-brand-black border-neutral-300 focus:ring-brand-pink/20"
          />
          <span>Remember me</span>
        </label>

        <Link
          to={ROUTES.AUTH.FORGOT_PASSWORD}
          className="font-semibold text-brand-pink hover:text-pink-600 hover:underline transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full font-bold"
        isLoading={isLoading}
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        Sign In
      </Button>
    </form>
  );
};
export default LoginPage;
