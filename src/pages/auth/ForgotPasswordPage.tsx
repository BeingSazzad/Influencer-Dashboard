import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid admin email address.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 700);
  };

  const handleResend = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setError('');
    }, 600);
  };

  return (
    <div>
      {isSubmitted ? (
        <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-neutral-900">Check your email</h2>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
              We've sent a password reset link to{' '}
              <strong className="text-neutral-900 font-semibold">{email}</strong>.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full text-xs font-bold"
              onClick={handleResend}
              isLoading={isLoading}
            >
              Resend reset link
            </Button>

            <Link
              to={ROUTES.AUTH.LOGIN}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors w-full py-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-brand-pink flex items-center justify-center mb-3">
              <KeyRound className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Reset password</h2>
            <p className="text-xs text-neutral-500">
              Enter your admin email and we'll send you instructions to reset your password.
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@influverse.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoFocus
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold"
            isLoading={isLoading}
          >
            Send Reset Link
          </Button>

          <div className="text-center pt-1">
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
export default ForgotPasswordPage;
