import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { statsApi, staffApi, branchApi } from '@/lib/api';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  LogOut,
  Edit2,
  Eye,
  EyeOff,
  Shield,
  User,
  BarChart3,
  Users,
  Building,
  Check,
  X,
} from 'lucide-react';

interface ProfileFormData {
  name: string;
  email: string;
  phone?: string;
}

const Profile = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load stats on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setIsLoadingStats(true);

        // Load stats
        if (user.role === 'owner' || user.role === 'branch_manager') {
          const statsRes = await statsApi.getOwnerStats();
          setStats(statsRes.data);
        }

        // Load branches for relevant roles
        if (user.role === 'owner' || user.role === 'branch_manager') {
          const branchRes = await branchApi.getAll();
          setBranches(branchRes.data);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadData();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEditProfile = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveProfile = () => {
    if (!formData.name || !formData.email) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Name and email are required.',
      });
      return;
    }

    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.',
    });
    setIsEditDialogOpen(false);
  };

  const handleChangePassword = () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'All password fields are required.',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password Mismatch',
        description: 'New passwords do not match.',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Weak Password',
        description: 'Password must be at least 6 characters.',
      });
      return;
    }

    toast({
      title: 'Password Changed',
      description: 'Your password has been successfully updated.',
    });
    setIsChangePasswordOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      owner: 'default',
      admin: 'destructive',
      branch_manager: 'secondary',
      waiter: 'outline',
      receptionist: 'outline',
    };
    return variants[role] || 'secondary';
  };

  const getRoleName = (role: string) => {
    const names: Record<string, string> = {
      owner: 'Restaurant Owner',
      admin: 'Administrator',
      branch_manager: 'Branch Manager',
      waiter: 'Waiter',
      receptionist: 'Receptionist',
      customer: 'Customer',
    };
    return names[role] || role;
  };

  const getDashboardLink = (role: string) => {
    const links: Record<string, string> = {
      owner: '/dashboard/owner',
      admin: '/dashboard/admin',
      branch_manager: '/dashboard/manager',
      waiter: '/dashboard/waiter',
      receptionist: '/dashboard/receptionist',
    };
    return links[role] || '/dashboard';
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card with User Info */}
        <Card className="overflow-hidden border-2">
          <div className="h-24 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
          <CardContent className="pt-0">
            <div className="flex flex-col md:flex-row gap-6 -mt-12 relative z-10">
              <Avatar className="h-24 w-24 border-4 border-background ring-2 ring-primary/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-bold">
                  {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pt-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="text-sm">
                        {getRoleName(user.role)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">ID: {user.id}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={handleEditProfile}
                          variant="default"
                          size="sm"
                          className="gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                          <DialogDescription>
                            Update your profile information
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              placeholder="Enter your full name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone (Optional)</Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="Enter your phone number"
                              value={formData.phone || ''}
                              onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                              }
                            />
                          </div>
                          <Button onClick={handleSaveProfile} className="w-full">
                            Save Changes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <LogOut className="w-4 h-4" />
                          <span className="hidden sm:inline">Logout</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to logout? You will need to login again to access
                            your account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-2 justify-end">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                            Logout
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            {(user.role === 'owner' || user.role === 'branch_manager') && (
              <TabsTrigger value="stats" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
            )}
            {user.role === 'owner' && (
              <TabsTrigger value="branches" className="gap-2">
                <Building className="w-4 h-4" />
                <span className="hidden sm:inline">Branches</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Email Address
                    </Label>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      {user.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground">
                      User ID
                    </Label>
                    <p className="font-medium">{user.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => navigate(getDashboardLink(user.role))}
                  variant="default"
                  className="w-full justify-start gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Last changed 3 months ago
                      </p>
                    </div>
                    <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Change
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <DialogDescription>
                            Enter your current password and create a new one
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <div className="relative">
                              <Input
                                id="current-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter current password"
                                value={passwordData.currentPassword}
                                onChange={(e) =>
                                  setPasswordData({
                                    ...passwordData,
                                    currentPassword: e.target.value,
                                  })
                                }
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <div className="relative">
                              <Input
                                id="new-password"
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="Enter new password"
                                value={passwordData.newPassword}
                                onChange={(e) =>
                                  setPasswordData({
                                    ...passwordData,
                                    newPassword: e.target.value,
                                  })
                                }
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showNewPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              placeholder="Confirm new password"
                              value={passwordData.confirmPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  confirmPassword: e.target.value,
                                })
                              }
                            />
                          </div>
                          <Button onClick={handleChangePassword} className="w-full">
                            Update Password
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Not enabled</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Enable
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Login Activity</p>
                      <p className="text-sm text-muted-foreground">Last login: Today</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          {(user.role === 'owner' || user.role === 'branch_manager') && (
            <TabsContent value="stats" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Business Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="space-y-4">
                      <div className="h-12 bg-muted rounded animate-pulse"></div>
                      <div className="h-12 bg-muted rounded animate-pulse"></div>
                      <div className="h-12 bg-muted rounded animate-pulse"></div>
                    </div>
                  ) : stats ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold mt-2">
                          ${stats.totalRevenue?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold mt-2">{stats.totalOrders || 0}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Active Customers</p>
                        <p className="text-2xl font-bold mt-2">{stats.activeCustomers || 0}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Avg Order Value</p>
                        <p className="text-2xl font-bold mt-2">
                          ${stats.avgOrderValue?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No statistics available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Branches Tab */}
          {user.role === 'owner' && (
            <TabsContent value="branches" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Your Branches
                  </CardTitle>
                  <CardDescription>Manage your restaurant branches</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="space-y-3">
                      <div className="h-24 bg-muted rounded animate-pulse"></div>
                      <div className="h-24 bg-muted rounded animate-pulse"></div>
                    </div>
                  ) : branches.length > 0 ? (
                    <div className="space-y-3">
                      {branches.map((branch) => (
                        <div
                          key={branch.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition"
                        >
                          <div>
                            <p className="font-medium">{branch.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <MapPin className="w-4 h-4" />
                              {branch.location}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {branch.status}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                Tables: {branch.tables || 0}
                              </Badge>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No branches found
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;