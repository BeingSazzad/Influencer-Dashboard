import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { loginAdmin } from '@/store/slices/authSlice';
import { ROUTES } from '@/constants/routes';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('sazzad.uiuxdesign@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide valid administrator credentials.');
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
      <div>
        <h2 className="text-xl font-bold text-neutral-900">Sign in to Back-Office</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Enter your administrative email and password to manage Influverse.
        </p>
      </div>

      {error && (
        <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Corporate Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@influverse.com"
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-600">
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 rounded text-brand-black border-neutral-300 focus:ring-brand-pink/20"
          />
          <span>Remember session (14 days)</span>
        </label>
        <span className="text-neutral-400 font-medium cursor-not-allowed">
          2FA Active
        </span>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full font-bold"
        isLoading={isLoading}
        rightIcon={<KeyRound className="w-4 h-4" />}
      >
        Authenticate Session
      </Button>

      <div className="pt-2 text-center">
        <p className="text-[11px] text-neutral-400">
          Default Super Admin preset loaded for staging review.
        </p>
      </div>
    </form>
  );
};
