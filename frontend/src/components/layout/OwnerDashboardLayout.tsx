import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import {
  UtensilsCrossed,
  LogOut,
  LayoutDashboard,
  Menu as MenuIcon,
  Table,
  UsersRound,
  BarChart3,
  Palette,
  ChevronRight,
  Sparkles,
  Home
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface OwnerDashboardLayoutProps {
  children: ReactNode;
}

const OwnerDashboardLayout = ({ children }: OwnerDashboardLayoutProps) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { 
      id: 'overview', 
      path: '/dashboard/owner/overview',
      icon: LayoutDashboard, 
      label: 'Overview',
      description: 'Dashboard summary and KPIs',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'menu',
      path: '/dashboard/owner/menu',
      icon: MenuIcon, 
      label: 'Menu Management',
      description: 'Manage menu items',
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'tables',
      path: '/dashboard/owner/tables',
      icon: Table, 
      label: 'Table Management',
      description: 'Manage tables and QR codes',
      gradient: 'from-orange-500 to-red-500'
    },
    { 
      id: 'staff',
      path: '/dashboard/owner/staff',
      icon: UsersRound, 
      label: 'Staff Management',
      description: 'Manage staff accounts',
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      id: 'customization',
      path: '/dashboard/owner/customization',
      icon: Palette, 
      label: 'Branding',
      description: 'Customize branch appearance',
      gradient: 'from-pink-500 to-rose-500'
    },
    { 
      id: 'reports',
      path: '/dashboard/owner/reports',
      icon: BarChart3, 
      label: 'Reports & Analytics',
      description: 'View performance metrics',
      gradient: 'from-indigo-500 to-purple-500'
    },
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path || (path.includes('overview') && location.pathname === '/dashboard/owner');
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/30">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Sidebar */}
      <aside className="w-72 border-r bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col fixed h-screen z-10">
        {/* Header with animated gradient */}
        <div className="p-6 border-b relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <Link to="/dashboard/owner" className="flex items-center gap-3 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-lg blur-sm opacity-50 animate-pulse" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 transform transition-transform hover:scale-110 hover:rotate-3">
                <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div className="transform transition-all group-hover:translate-x-1">
              <span className="text-xl font-bold block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                HillDevilOS
              </span>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-xs text-muted-foreground">Owner Portal</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation with staggered animations */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isActive = isActiveRoute(item.path);
            const isHovered = hoveredItem === item.id;
            
            return (
              <Link 
                key={item.id} 
                to={item.path}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                className="block animate-slide-in-left"
              >
                <div className="relative group">
                  {/* Animated background */}
                  <div className={cn(
                    "absolute inset-0 rounded-lg transition-all duration-500",
                    isActive 
                      ? `bg-gradient-to-r ${item.gradient} opacity-10` 
                      : isHovered 
                        ? "bg-accent opacity-100" 
                        : "opacity-0"
                  )} />
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full",
                      `bg-gradient-to-b ${item.gradient}`,
                      "animate-scale-in"
                    )} />
                  )}

                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto py-3 px-4 relative bg-transparent hover:bg-transparent",
                      "transition-all duration-300",
                      isActive && "pl-6",
                      isHovered && "translate-x-1"
                    )}
                  >
                    <div className="flex items-start gap-3 w-full">
                      {/* Icon with gradient on active */}
                      <div className={cn(
                        "relative transition-all duration-300",
                        isActive && "scale-110",
                        isHovered && "rotate-3"
                      )}>
                        {isActive && (
                          <div className={cn(
                            "absolute inset-0 rounded-lg blur-md opacity-50",
                            `bg-gradient-to-br ${item.gradient}`
                          )} />
                        )}
                        <item.icon className={cn(
                          "h-5 w-5 mt-0.5 flex-shrink-0 relative z-10 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className={cn(
                          "font-medium text-sm transition-all duration-300",
                          isActive && "text-primary font-semibold"
                        )}>
                          {item.label}
                        </div>
                        <div className={cn(
                          "text-xs text-muted-foreground mt-0.5 transition-all duration-300",
                          isActive && "text-primary/70"
                        )}>
                          {item.description}
                        </div>
                      </div>

                      {/* Chevron indicator */}
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-all duration-300",
                        isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
                        "text-primary"
                      )} />
                    </div>
                  </Button>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User section with hover effects */}
        <div className="p-4 border-t bg-gradient-to-t from-muted/50 to-transparent">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
            {/* Animated background on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              <Avatar className="h-10 w-10 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300 relative">
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-primary-foreground">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate capitalize">
                {user?.role || 'Owner'}
              </p>
            </div>
          </div>
          
          <Link to="/" className="block mb-3">
            <Button
              variant="outline"
              className="w-full justify-start"
            >
              <Home className="mr-3 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full justify-start group hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-300 relative overflow-hidden"
            onClick={handleLogout}
          >
            <div className="absolute inset-0 bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <LogOut className="mr-3 h-4 w-4 relative z-10 transition-transform group-hover:rotate-12" />
            <span className="relative z-10">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content with smooth transitions */}
      <main className="flex-1 overflow-auto ml-72 relative">
        <div className="p-6 md:p-8 lg:p-10 animate-fade-in">
          {children}
        </div>
      </main>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(20px) rotate(-5deg);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scale-in {
          from {
            transform: translateY(-50%) scaleY(0);
          }
          to {
            transform: translateY(-50%) scaleY(1);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        /* Smooth scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.3);
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.5);
        }
      `}</style>
    </div>
  );
};

export default OwnerDashboardLayout;
