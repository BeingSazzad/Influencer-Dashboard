import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';
import { Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-black text-white flex items-center justify-center mb-4 shadow-md">
        <Compass className="w-7 h-7 text-brand-pink" />
      </div>
      <h1 className="text-3xl font-black text-neutral-900 tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-neutral-800 mt-1">
        Back-Office Route Not Found
      </h2>
      <p className="text-xs text-neutral-500 max-w-sm mt-2 mb-6">
        The requested administrative dossier or route does not exist or has been archived.
      </p>
      <Button
        variant="primary"
        size="md"
        onClick={() => navigate(ROUTES.DASHBOARD.OVERVIEW)}
      >
        Return to Overview
      </Button>
    </div>
  );
};
