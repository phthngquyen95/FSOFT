import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  Table2,
  Tag,
  Building2,
  UtensilsCrossed,
  LogOut,
  Receipt,
  ChefHat,
  Home,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const menuItems = [
  { 
    id: 'overview',
    path: '/dashboard/manager',
    icon: LayoutDashboard,
    label: 'Overview',
    description: 'Dashboard summary'
  },
  { 
    id: 'branch',
    path: '/dashboard/manager/branch',
    icon: Building2,
    label: 'Branch Info',
    description: 'Branch details'
  },
  { 
    id: 'tables',
    path: '/dashboard/manager/tables',
    icon: Table2,
    label: 'Tables',
    description: 'Table management'
  },
  { 
    id: 'menu',
    path: '/dashboard/manager/menu',
    icon: ChefHat,
    label: 'Menu',
    description: 'Menu management'
  },
  { 
    id: 'bills',
    path: '/dashboard/manager/bills',
    icon: Receipt,
    label: 'Bills',
    description: 'View bill history'
  },
  { 
    id: 'staff',
    path: '/dashboard/manager/staff',
    icon: Users,
    label: 'Staff',
    description: 'Staff management'
  },
  { 
    id: 'promotions',
    path: '/dashboard/manager/promotions',
    icon: Tag,
    label: 'Promotions',
    description: 'Manage promotions'
  },
];

export const ManagerSidebar = () => {
  const location = useLocation();
  const { user, logout, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [isOwnerView, setIsOwnerView] = React.useState(false);
  const [branchName, setBranchName] = React.useState('');

  React.useEffect(() => {
    const ownerViewMode = sessionStorage.getItem('owner_viewing_as_manager') === 'true';
    const storedBranchName = sessionStorage.getItem('manager_branch_name') || '';
    setIsOwnerView(ownerViewMode);
    setBranchName(storedBranchName);
  }, []);

  const handleLogout = () => {
    // If owner is viewing as manager, restore original user
    if (sessionStorage.getItem('owner_viewing_as_manager') === 'true') {
      const originalUserStr = sessionStorage.getItem('original_user');
      if (originalUserStr) {
        localStorage.setItem('mock_auth_user', originalUserStr);
        try {
          const originalUser = JSON.parse(originalUserStr);
          setUser(originalUser);
        } catch (e) {
          // Fallback: ensure at least auth store reloads from storage next mount
        }
      }
      sessionStorage.removeItem('owner_viewing_as_manager');
      sessionStorage.removeItem('manager_branch_id');
      sessionStorage.removeItem('manager_branch_name');
      sessionStorage.removeItem('original_user');
      navigate('/dashboard/owner');
      return;
    }

    logout();
    navigate('/login');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || (path === '/dashboard/manager' && location.pathname === '/dashboard/manager');
  };

  return (
    <aside className="w-72 border-r bg-card shadow-soft flex flex-col fixed h-screen">
      <div className="p-6 border-b">
        <Link to="/dashboard/manager" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <span className="text-xl font-bold block">HillDevilOS</span>
            <span className="text-xs text-muted-foreground">Manager Portal</span>
          </div>
        </Link>
      </div>

      {isOwnerView && (
        <div className="px-4 pt-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default" className="text-xs">Owner View</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Viewing as manager: {branchName}
            </p>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link key={item.id} to={item.path}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto py-3 px-4 transition-smooth",
                isActiveRoute(item.path)
                  ? "bg-primary/10 text-primary hover:bg-primary/15 border-l-4 border-primary"
                  : "hover:bg-accent"
              )}
            >
              <div className="flex items-start gap-3 w-full">
                <item.icon className={cn(
                  "h-5 w-5 mt-0.5 flex-shrink-0",
                  isActiveRoute(item.path) ? "text-primary" : ""
                )} />
                <div className="flex-1 text-left">
                  <div className={cn(
                    "font-medium text-sm",
                    isActiveRoute(item.path) ? "text-primary" : ""
                  )}>
                    {item.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>
            </Button>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-card">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="gradient-primary text-primary-foreground">
              {user?.name?.charAt(0) || 'M'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Manager'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {user?.role === 'branch_manager' ? 'Manager' : user?.role || 'Manager'}
              </Badge>
            </div>
            {branchName && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{branchName}</p>
            )}
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
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          {isOwnerView ? 'Return to Owner Dashboard' : 'Sign Out'}
        </Button>
      </div>
    </aside>
  );
};
