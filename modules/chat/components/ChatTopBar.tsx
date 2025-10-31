"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/services/auth';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface ChatTopBarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function ChatTopBar({ onToggleSidebar, isSidebarOpen }: ChatTopBarProps) {
  const t = useTranslations('nav');
  const tSidebar = useTranslations('chat.sidebar.accessibility');
  const locale = useLocale();
  const { user, logout } = useAuth();

  const displayName = useMemo(() => user?.displayName || user?.email || user?.phone || 'User', [user]);
  const ToggleIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <div className="w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Hamburger + App name */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onToggleSidebar?.()}
            className="h-9 w-9"
            title={tSidebar('toggle')}
            aria-label={tSidebar('toggle')}
          >
            <ToggleIcon className="h-4 w-4" />
          </Button>
          <Link href={`/${locale}/chat`} className="text-base font-semibold">
            Qanounji
          </Link>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold">
                  {displayName?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="hidden sm:inline text-sm max-w-[140px] truncate" dir="auto">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs">{displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/settings`}>{t('settings')}</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>{t('logout')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}


