import { useState, useEffect } from 'react';
import { BranchCustomization } from '@/components/owner/BranchThemeEditor';
import { BranchLandingCustomizer } from '@/components/owner/BranchLandingEditor';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PREDEFINED_THEMES } from '@/lib/themes';

const CustomizationPage = () => {
  // Get active branch from localStorage
  const selectedBrand = localStorage.getItem('selected_brand');
  const allBranches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
  const brandBranches = allBranches.filter((b: any) => b.brandName === selectedBrand);
  const activeBranch = brandBranches[0] || null;

  // Initialize with fresh data from localStorage
  const getInitialThemeData = () => ({
    logoUrl: activeBranch?.logoUrl || '',
    bannerUrl: activeBranch?.bannerUrl || '',
    selectedThemeId: activeBranch?.selectedThemeId || 'midnight',
    layout: activeBranch?.layout || (activeBranch?.packageType === 'free' ? 'free' : 'default'),
    galleryImages: activeBranch?.galleryImages || [],
    sliderImages: activeBranch?.sliderImages || [],
  });

  const getInitialLandingData = () => ({
    brandName: activeBranch?.brandName || '',
    description: activeBranch?.description || '',
    phone: activeBranch?.phone || '',
    email: activeBranch?.email || '',
    address: activeBranch?.address || '',
    tagline: activeBranch?.tagline || '',
    gradientFrom: activeBranch?.gradientFrom || '43 74% 66%',
    gradientTo: activeBranch?.gradientTo || '346 77% 58%',
    gradientDirection: activeBranch?.gradientDirection || 'to-r',
    aboutSection1Title: activeBranch?.aboutSection1Title || 'Our Story',
    aboutSection1Text: activeBranch?.aboutSection1Text || 'Discover the passion behind our cuisine.',
    aboutSection1Image: activeBranch?.aboutSection1Image || '',
    aboutSection2Title: activeBranch?.aboutSection2Title || 'Our Philosophy',
    aboutSection2Text: activeBranch?.aboutSection2Text || 'Quality ingredients, crafted with care.',
    aboutSection2Image: activeBranch?.aboutSection2Image || '',
  });

  // Shared state for both components
  const [themeData, setThemeData] = useState(getInitialThemeData());
  const [landingData, setLandingData] = useState(getInitialLandingData());

  // Refresh data when activeBranch changes
  useEffect(() => {
    if (activeBranch) {
      setThemeData(getInitialThemeData());
      setLandingData(getInitialLandingData());
    }
  }, [activeBranch?.id]);

  const handleSaveAll = () => {
    const branches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
    const theme = PREDEFINED_THEMES.find(t => t.id === themeData.selectedThemeId);

    const updatedBranches = branches.map((b: any) =>
      b.id === activeBranch.id
        ? {
            ...b,
            ...themeData,
            ...landingData,
            themeColors: theme?.colors,
          }
        : b
    );
    localStorage.setItem('mock_branches', JSON.stringify(updatedBranches));

    toast({
      title: 'All Changes Saved',
      description: 'Your customization has been saved successfully.',
    });
  };

  if (!activeBranch) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No branch found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Branch Customization</h2>
        <p className="text-muted-foreground mt-2">
          Customize your branch appearance and landing page
        </p>
      </div>

      <BranchCustomization 
        branch={activeBranch} 
        themeData={themeData}
        setThemeData={setThemeData}
        hideSaveButton
      />
      <BranchLandingCustomizer 
        branch={activeBranch}
        landingData={landingData}
        setLandingData={setLandingData}
        hideSaveButton
      />

      <div className="flex justify-end pt-6 border-t">
        <Button onClick={handleSaveAll} size="lg">
          <Save className="mr-2 h-4 w-4" />
          Save All Changes
        </Button>
      </div>
    </div>
  );
};

export default CustomizationPage;
