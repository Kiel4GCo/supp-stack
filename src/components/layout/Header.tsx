import { Link, useLocation } from 'react-router-dom';
import { Pill, Beaker, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Supplements', icon: Pill },
  { path: '/stack-builder', label: 'Stack Builder', icon: Beaker },
  { path: '/deficiency-advisor', label: 'Deficiency Advisor', icon: AlertTriangle },
  { path: '/admin', label: 'Admin', icon: LayoutDashboard },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Pill className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl font-semibold">SupplementInfo</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === path
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile nav */}
        <nav className="flex md:hidden items-center gap-1">
          {navItems.slice(0, 3).map(({ path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                location.pathname === path
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
