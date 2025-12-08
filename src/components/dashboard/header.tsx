'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserNav } from './user-nav';
import { NotificationsDropdown } from './notifications-dropdown';
import { useDashboardStore } from '@/lib/stores/dashboardStore';
import { useEffect } from 'react';
import { Menu } from 'lucide-react';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { data: session } = useSession();
  const { stats, fetchStats } = useDashboardStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base sm:text-xl font-semibold truncate max-w-[150px] sm:max-w-none">
          Welcome, {session?.user?.name || 'User'}
        </h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="hidden sm:flex items-center space-x-2 rounded-lg bg-muted px-3 sm:px-4 py-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {(stats as any)?.credits?.remaining ?? session?.user?.credits ?? 0} credits
          </span>
        </div>
        {/* Show compact credits on mobile */}
        <div className="sm:hidden flex items-center space-x-1 rounded-lg bg-muted px-2 py-1.5">
          <CreditCard className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium">
            {(stats as any)?.credits?.remaining ?? session?.user?.credits ?? 0}
          </span>
        </div>
        <ThemeToggle />
        <NotificationsDropdown />
        <UserNav />
      </div>
    </header>
  );
}

function CreditCard({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
