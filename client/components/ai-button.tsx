'use client';

import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AIButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => Promise<void>;
  loading: boolean;
  disabled?: boolean;
}

export default function AIButton({ label, icon, onClick, loading, disabled }: AIButtonProps): JSX.Element {
  return (
    <Button variant="outline" size="sm" onClick={() => void onClick()} disabled={loading || disabled} className="gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {label}
    </Button>
  );
}
