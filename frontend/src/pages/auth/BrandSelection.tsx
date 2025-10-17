import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { seedBranchData } from '@/lib/mockDataInit';

interface Brand {
  name: string;
  branches: any[];
  logoUrl?: string;
  tagline?: string;
}

// Helper to get brands for a multi-branch owner
function getOwnerBrands(user: any, allBranches: any[]) {
  // Get branches owned by this user
  const userBranches = allBranches.filter((b: any) => b.ownerId === user.id);
  
  if (userBranches.length === 0) {
    return [];
  }

  // Group branches by brandName
  const brandMap = new Map<string, any[]>();
  userBranches.forEach((branch: any) => {
    const brandName = branch.brandName || 'Unnamed Brand';
    if (!brandMap.has(brandName)) {
      brandMap.set(brandName, []);
    }
    brandMap.get(brandName)?.push(branch);
  });

  // Convert to array of brand objects
  return Array.from(brandMap.entries()).map(([name, branches]) => ({
    name,
    branches,
    logoUrl: branches[0]?.logoUrl,
    tagline: branches[0]?.tagline,
  }));
}

const BrandSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load all branches from localStorage
    const storedBranches = localStorage.getItem('mock_branches');
    const allBranches = storedBranches ? JSON.parse(storedBranches) : [];

    // Use helper to get brands for this owner
    const userBrands = getOwnerBrands(user, allBranches);
    if (userBrands.length === 0) {
      navigate('/register/package');
      return;
    }
    setBrands(userBrands);
  }, [user, navigate]);

  const handleBrandSelect = (brandName: string) => {
    const brand = brands.find(b => b.name === brandName);
    if (!brand) return;
    localStorage.setItem('selected_brand', brandName);
    // Seed all branches for this brand
    brand.branches.forEach((branch: any) => {
      seedBranchData(branch.id);
    });
    // Remove old mock_* keys to avoid confusion
    localStorage.removeItem('mock_menu_items');
    localStorage.removeItem('mock_tables');
    localStorage.removeItem('mock_staff');
    toast({
      title: 'Brand Selected',
      description: `You've selected ${brandName}`,
    });
    navigate('/dashboard/owner');
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container max-w-5xl">
        <div className="mb-6 flex justify-start">
          <Button
            type="button"
            variant="ghost"
            className="gap-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Select Your Brand</h1>
          <p className="text-lg text-muted-foreground">
            Choose which restaurant brand you want to manage
          </p>
        </div>

        {brands.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>No Brands Yet</CardTitle>
              <CardDescription>
                You haven't created any restaurant brands yet. Create your first one to get started!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/register/package')} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create First Restaurant
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {brands.map((brand) => (
                <Card
                  key={brand.name}
                  className="cursor-pointer transition-smooth hover:shadow-medium hover:border-primary border-border/50"
                  onClick={() => handleBrandSelect(brand.name)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt={brand.name} className="h-8 w-8 object-contain" />
                        ) : (
                          <Building2 className="h-8 w-8 text-primary" />
                        )}
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                        Active
                      </span>
                    </div>
                    <CardTitle className="text-2xl">{brand.name}</CardTitle>
                    <CardDescription className="text-base">
                      {brand.branches.length} {brand.branches.length === 1 ? 'Branch' : 'Branches'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {brand.tagline && (
                      <p className="text-sm text-muted-foreground italic mb-6">
                        {brand.tagline}
                      </p>
                    )}
                    <Button className="w-full" variant="outline">
                      Manage Brand
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button variant="ghost" onClick={() => navigate('/register/package')}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Restaurant
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BrandSelection;
