import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { branchApi, menuApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, MapPin, Phone, Mail, Clock, Plus, Minus, Loader2, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { OrderDialog } from '@/components/OrderDialog';
import { BookingDialog } from '@/components/BookingDialog';
import { ReservationBookingForm } from '@/components/ReservationBookingForm';
import { motion } from 'framer-motion';
import { getThemeById } from '@/lib/themes';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderItem } from '@/store/orderStore';
import { BookingItem } from '@/store/bookingStore';

type MenuItemLite = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  available?: boolean;
  bestSeller?: boolean;
};

type ThemeColors = {
  pageBackground?: string;
  heroBackground?: string;
  heroText?: string;
  heroAccent?: string;
  cardBackground?: string;
  cardBorder?: string;
  buttonPrimary?: string;
  buttonPrimaryText?: string;
  buttonSecondary?: string;
  buttonSecondaryText?: string;
  headingColor?: string;
  bodyTextColor?: string;
};

type BranchLite = {
  id: string;
  brandName?: string;
  name?: string;
  logoUrl?: string;
  bannerUrl?: string;
  tagline?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  selectedThemeId?: string;
  themeColors?: ThemeColors;
  layout?: 'default' | 'masonry' | 'centered' | 'sidebar' | 'free';
  galleryImages?: string[];
  sliderImages?: string[];
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: string;
  aboutSection1Title?: string;
  aboutSection1Text?: string;
  aboutSection1Image?: string;
  aboutSection2Title?: string;
  aboutSection2Text?: string;
  aboutSection2Image?: string;
};

const GuestLanding = () => {
  const { shortCode, tableId } = useParams<{ shortCode: string; tableId?: string }>();
  const [branch, setBranch] = useState<BranchLite | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'now' | 'booking'>('now');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [flowState, setFlowState] = useState<'selection' | 'menu' | 'reservation' | 'post-reservation'>('selection');
  const [showMenuAfterReservation, setShowMenuAfterReservation] = useState(false);

  useEffect(() => {
    const loadBranchData = async () => {
      try {
        setLoading(true);
        if (!shortCode) throw new Error('Branch code not provided');

        const branchResponse = await branchApi.getByShortCode(shortCode);
        setBranch(branchResponse.data);

        if (tableId) {
          const tables = JSON.parse(localStorage.getItem('mock_tables') || '[]') as Array<{ id: string; number: string }>;
          const table = tables.find((t) => t.id === tableId);
          if (table) {
            setTableNumber(table.number);
          }
        }

        const menuResponse = await menuApi.getAll(branchResponse.data.id);
        console.log('Branch ID:', branchResponse.data.id);
        console.log('Menu items loaded:', menuResponse.data);
        console.log('Menu items from localStorage:', JSON.parse(localStorage.getItem('menu_items') || '[]'));
        console.log('Mock menu items from localStorage:', JSON.parse(localStorage.getItem('mock_menu_items') || '[]'));

        // Debug: Check if any items have images
        const itemsWithImages = (menuResponse.data as MenuItemLite[]).filter((item) => item.imageUrl && item.imageUrl !== '/placeholder.svg');
        console.log('Items with images:', itemsWithImages);

        setMenuItems(menuResponse.data);
      } catch (error) {
        console.error('Error loading branch:', error);
        toast({
          variant: 'destructive',
          title: 'Branch not found',
          description: 'The requested branch could not be found.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadBranchData();

    // Set initial flow state based on tableId
    if (tableId) {
      setFlowState('menu');
    } else {
      setFlowState('selection');
    }

    // Listen for localStorage changes to reload branch data (both storage event and custom event)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'mock_branches') {
        loadBranchData();
      }
    };

    const handleLocalStorageChanged = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.key === 'mock_branches') {
        loadBranchData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChanged', handleLocalStorageChanged);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChanged', handleLocalStorageChanged);
    };
  }, [shortCode, tableId]);

  const addToCart = (item: MenuItemLite) => {
    const existingItem = selectedItems.find((i) => i.menuItemId === item.id);

    if (existingItem) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          id: `item_${Date.now()}_${Math.random()}`,
          menuItemId: item.id,
          name: item.name,
          quantity: 1,
          totalPrice: item.price,
          price: item.price,
        },
      ]);
    }

    toast({
      title: 'Added to Cart',
      description: `${item.name} added to your order.`,
    });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setSelectedItems((items) =>
      items
        .map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getItemQuantity = (menuItemId: string) => {
    return selectedItems.find((i) => i.menuItemId === menuItemId)?.quantity || 0;
  };

  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Branch Not Found</CardTitle>
            <CardDescription>
              The branch you're looking for doesn't exist or is no longer available.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Selection screen - shown when no tableId and user hasn't made a choice
  if (flowState === 'selection' && !tableId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full space-y-8"
        >
          {/* Logo and Header */}
          <div className="text-center space-y-4">
            {branch.logoUrl && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex justify-center"
              >
                <img
                  src={branch.logoUrl}
                  alt={branch.brandName}
                  className="h-24 w-24 object-contain rounded-2xl shadow-lg"
                />
              </motion.div>
            )}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{branch.brandName}</h1>
              {branch.tagline && (
                <p className="text-lg text-muted-foreground">{branch.tagline}</p>
              )}
            </div>
          </div>

          {/* Selection Buttons */}
          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button
                size="lg"
                className="w-full h-24 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                onClick={() => {
                  setFlowState('menu');
                  setOrderType('now');
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  <span>Order Now</span>
                </div>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full h-24 text-lg font-semibold border-2 shadow-lg hover:shadow-xl transition-all"
                onClick={() => {
                  setFlowState('reservation');
                  setOrderType('booking');
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  <span>Reserve Table</span>
                </div>
              </Button>
            </motion.div>
          </div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="bg-muted/50 border-muted-foreground/20">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  {tableId
                    ? '👉 You scanned a table QR code! Choose to order now or make a reservation.'
                    : '👉 Choose how you\'d like to proceed'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const menuCategories = [...new Set(menuItems.map((item) => item.category))];

  // Get theme configuration
  const selectedTheme = branch.selectedThemeId ? getThemeById(branch.selectedThemeId) : null;
  const themeColors = branch.themeColors || selectedTheme?.colors;

  const layout = branch.layout || 'default';
  const galleryImages = branch.galleryImages || [];
  const sliderImages = branch.sliderImages || [];

  const themeStyles = themeColors ? {
    '--page-bg': `hsl(${themeColors.pageBackground})`,
    '--hero-bg': `hsl(${themeColors.heroBackground})`,
    '--hero-text': `hsl(${themeColors.heroText})`,
    '--hero-accent': `hsl(${themeColors.heroAccent})`,
    '--card-bg': `hsl(${themeColors.cardBackground})`,
    '--card-border': `hsl(${themeColors.cardBorder})`,
    '--btn-primary': `hsl(${themeColors.buttonPrimary})`,
    '--btn-primary-text': `hsl(${themeColors.buttonPrimaryText})`,
    '--btn-secondary': `hsl(${themeColors.buttonSecondary})`,
    '--btn-secondary-text': `hsl(${themeColors.buttonSecondaryText})`,
    '--heading': `hsl(${themeColors.headingColor})`,
    '--body-text': `hsl(${themeColors.bodyTextColor})`,
  } as React.CSSProperties : {};

  const renderDefaultLayout = () => (
    <>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative min-h-[500px] flex items-center justify-center overflow-hidden"
        style={{
          background: branch.bannerUrl
            ? 'transparent'
            : `linear-gradient(135deg, hsl(var(--hero-bg, 240 5% 15%)), hsl(var(--hero-accent, 43 74% 66%)) 100%)`
        }}
      >
        {/* Chỉnh độ rõ mờ của  */}
        {branch.bannerUrl && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${branch.bannerUrl})`,
                opacity: 1,
                filter: 'blur(2px) brightness(0.9) contrast(1.05)',
                transform: 'scale(1.05)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 backdrop-blur-[1px]" />
          </>
        )}

        <div className="relative z-10 w-full px-4 max-w-7xl mx-auto py-20 text-left">
          {branch.logoUrl && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <img
                src={branch.logoUrl}
                alt={branch.brandName}
                className="h-24 w-24 sm:h-28 sm:w-28 object-contain mx-auto rounded-2xl shadow-large bg-card/80 p-4 backdrop-blur-sm"
              />
            </motion.div>
          )}
          <div className="inline-block max-w-2xl bg-black/35 dark:bg-black/45 rounded-xl p-8 md:p-10 shadow-large backdrop-blur-sm ring-1 ring-white/10">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="logo-text text-5xl md:text-6xl font-semibold leading-tight mb-4 text-white"
              style={{
                textShadow: 'none'
              }}
            >
              {branch.brandName}
            </motion.h1>
            <div className="h-1 w-20 rounded-full mb-4 bg-white/60" />
            {tableNumber && (
              <Badge className="mb-3 text-base px-4 py-1.5 shadow-soft">Table {tableNumber}</Badge>
            )}
            {branch.tagline && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.45 }}
                className="slogan text-white/90 text-base md:text-lg mb-6"
              >
                {branch.tagline}
              </motion.p>
            )}
            <div className="mt-4 flex items-center gap-3">
              <Button
                size="lg"
                className="px-6 bg-[hsl(25_85%_55%)] text-white hover:bg-[hsl(25_85%_50%)]"
                onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore More
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Branch Info */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card
            className="mb-8 border-2"
            style={{
              backgroundColor: themeColors ? `hsl(${themeColors.cardBackground})` : undefined,
              borderColor: themeColors ? `hsl(${themeColors.cardBorder})` : undefined,
            }}
          >
            <CardHeader>
              <CardTitle
                className="text-2xl"
                style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : undefined }}
              >
                {branch.name}
              </CardTitle>
              <CardDescription style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : undefined }}>
                Branch Information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : undefined }}
                    >
                      Address
                    </p><p
                      className="text-sm"
                      style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : undefined }}
                    >
                      {branch.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : undefined }}
                    >
                      Phone
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : undefined }}
                    >
                      {branch.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : undefined }}
                    >
                      Email
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : undefined }}
                    >
                      {branch.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : undefined }}
                    >
                      Hours
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : undefined }}
                    >
                      Mon-Sun: 10am - 10pm
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Menu Section */}
        <div id="menu-section" className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-3xl font-bold"
                style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : 'inherit' }}
              >
                Our Menu
              </h2>
              <p
                className="mt-1"
                style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : 'inherit' }}
              >
                Browse our delicious offerings
              </p>
            </div>
          </div>

          {menuCategories.map((category, catIndex) => (
            <motion.div
              key={category}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: catIndex * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <h3
                  className="text-2xl font-semibold"
                  style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : 'inherit' }}
                >
                  {category}
                </h3>
                <Separator className="flex-1" />
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {menuItems
                  .filter((item) => item.category === category)
                  .map((item, itemIndex) => {
                    const itemQuantity = getItemQuantity(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: itemIndex * 0.05, duration: 0.3 }}
                        viewport={{ once: true }}
                        className="h-full"
                      >
                        <Card
                          className="overflow-hidden hover:shadow-medium transition-smooth border-2 h-full flex flex-col"
                          style={{
                            backgroundColor: themeColors ? `hsl(${themeColors.cardBackground})` : undefined,
                            borderColor: themeColors ? `hsl(${themeColors.cardBorder})` : undefined,
                          }}
                        >
                          <div className="aspect-video bg-muted relative overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              style={{ imageRendering: 'auto' }}
                            />
                            {item.bestSeller && (
                              <Badge className="absolute top-2 right-2">
                                Best Seller
                              </Badge>
                            )}
                            {!item.available && (
                              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                <Badge variant="destructive">Unavailable</Badge>
                              </div>
                            )}
                          </div>
                          <CardHeader className="flex-shrink-0">
                            <CardTitle className="flex items-start justify-between">
                              <span style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : 'inherit' }}>
                                {item.name}
                              </span>
                              <span style={{ color: themeColors ? `hsl(${themeColors.heroAccent})` : 'inherit' }}>
                                ${item.price}
                              </span>
                            </CardTitle>
                            <CardDescription
                              className="min-h-[2.5rem]"
                              style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : 'inherit' }}
                            >
                              {item.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col justify-end">
                            {itemQuantity > 0 ? (
                              <div className="flex items-center gap-2 w-full">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="h-10 w-10"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="flex-1 text-center font-semibold text-lg">
                                  {itemQuantity}
                                </span>
                                <Button
                                  size="icon"
                                  onClick={() => updateQuantity(item.id, 1)}
                                  disabled={!item.available}
                                  className="h-10 w-10"
                                  style={{
                                    backgroundColor: themeColors ? `hsl(${themeColors.buttonPrimary})` : undefined,
                                    color: themeColors ? `hsl(${themeColors.buttonPrimaryText})` : undefined,
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                className="w-full"
                                onClick={() => addToCart(item)}
                                disabled={!item.available}
                                style={{
                                  backgroundColor: themeColors ? `hsl(${themeColors.buttonPrimary})` : undefined,
                                  color: themeColors ? `hsl(${themeColors.buttonPrimaryText})` : undefined,
                                }}
                              >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Order
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center" style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : 'inherit' }}>
        <p className="text-sm">© 2024 {branch.brandName}. All rights reserved.</p>
      </footer>
    </>
  );

  const renderMasonryLayout = () => (
    <>
      {galleryImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-12"
        >
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : 'inherit' }}>
            Gallery
          </h2>
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {galleryImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="break-inside-avoid mb-4"
              >
                <div className="rounded-xl overflow-hidden shadow-medium hover:shadow-large transition-all duration-300 hover:scale-[1.02]">
                  <img
                    src={img}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      {renderDefaultLayout()}
    </>
  );

  const renderCenteredLayout = () => (
    <>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative min-h-[600px] flex items-center justify-center overflow-hidden"
        style={{
          background: branch.bannerUrl
            ? 'transparent'
            : `linear-gradient(135deg, hsl(var(--hero-bg, 240 5% 15%)), hsl(var(--hero-accent, 43 74% 66%)) 100%)`
        }}
      >

        {/* Chỉnh rõ mờ của Centered Content */}
        {branch.bannerUrl && (
          <>
            {/* Ảnh nền rõ nhưng thêm hiệu ứng ảo */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${branch.bannerUrl})`,
                opacity: 1, // ảnh rõ 100%
                filter: 'blur(2px) brightness(0.9) contrast(1.05)', // tạo hiệu ứng "ảo" nhưng vẫn rõ
                transform: 'scale(1.05)', // phóng nhẹ để tránh viền mờ
              }}
            />

            {/* Lớp phủ mờ nhẹ để làm dịu tone */}
            <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-[1px]" />
          </>
        )}

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto py-20">
          {branch.logoUrl && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8 inline-block"
            >
              <img
                src={branch.logoUrl}
                alt={branch.brandName}
                className="h-32 w-32 object-contain mx-auto rounded-2xl shadow-large bg-card/90 p-4 backdrop-blur-sm"
              />
            </motion.div>
          )}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-6xl md:text-7xl font-bold mb-6"
            style={{
              color: themeColors ? `hsl(${themeColors.heroText})` : 'hsl(0 0% 100%)',
              textShadow: '0 2px 20px rgba(0,0,0,0.2)'
            }}
          >
            {branch.brandName}
          </motion.h1>
          {branch.tagline && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-2xl md:text-3xl font-medium mb-6"
              style={{ color: themeColors ? `hsl(${themeColors.heroText})` : 'hsl(0 0% 100%)' }}
            >
              {branch.tagline}
            </motion.p>
          )}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-lg md:text-xl leading-relaxed opacity-90"
            style={{ color: themeColors ? `hsl(${themeColors.heroText})` : 'hsl(0 0% 100%)' }}
          >
            {branch.description}
          </motion.p>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {renderDefaultLayout().props.children.slice(1)}
      </div>
    </>
  );

  const renderSidebarLayout = () => (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="lg:w-80 xl:w-96 lg:sticky lg:top-0 lg:h-screen p-6 lg:overflow-y-auto"
        style={{
          backgroundColor: themeColors ? `hsl(${themeColors.cardBackground})` : undefined,
          borderRight: themeColors ? `1px solid hsl(${themeColors.cardBorder})` : undefined,
        }}
      >
        {branch.logoUrl && (
          <div className="mb-6">
            <img
              src={branch.logoUrl}
              alt={branch.brandName}
              className="h-24 w-24 object-contain mx-auto lg:mx-0 rounded-xl shadow-medium bg-background/50 p-3"
            />
          </div>
        )}
        <h1
          className="text-3xl font-bold mb-3"
          style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : undefined }}
        >
          {branch.brandName}
        </h1>
        {branch.tagline && (
          <p
            className="text-lg font-medium mb-4"
            style={{ color: themeColors ? `hsl(${themeColors.heroAccent})` : undefined }}
          >
            {branch.tagline}
          </p>
        )}
        <p
          className="text-sm mb-6 leading-relaxed"
          style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : undefined }}
        >
          {branch.description}
        </p>

        <Separator className="my-6" />

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
            <p
              className="text-sm"
              style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : undefined }}
            >
              {branch.address}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-primary flex-shrink-0" />
            <p
              className="text-sm"
              style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : undefined }}
            >
              {branch.phone}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-primary flex-shrink-0" />
            <p
              className="text-sm break-all"
              style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : undefined }}
            >
              {branch.email}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
            <p
              className="text-sm"
              style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : undefined }}
            >
              Mon-Sun: 10am - 10pm
            </p>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {renderDefaultLayout().props.children[1]}
      </main>
    </div>
  );

  const renderFreeLayout = () => {
    // Get gradient settings
    const gradientFrom = branch.gradientFrom || '43 74% 66%';
    const gradientTo = branch.gradientTo || '346 77% 58%';
    const gradientDirection = branch.gradientDirection || 'to-r';

    // Convert to-r format to CSS direction
    const cssDirection = gradientDirection.replace('to-', '');

    return (
      <>
        {/* Hero Section with Gradient Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative min-h-[600px] flex items-center justify-center overflow-hidden"
          style={{
            background: branch.bannerUrl
              ? 'transparent'
              : themeColors ? `hsl(${themeColors.heroBackground})` : 'hsl(240 5% 15%)'
          }}
        >
          {/* Chỉnh rõ mờ của Free Layout */}
          {branch.bannerUrl && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${branch.bannerUrl})`,
                  opacity: 1,
                  filter: 'blur(2px) brightness(0.9) contrast(1.05)',
                  transform: 'scale(1.05)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 backdrop-blur-[1px]" />
            </>
          )}

          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-20">
            {/* Text contrast overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none" />
            {branch.logoUrl && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8"
              >
                <img
                  src={branch.logoUrl}
                  alt={branch.brandName}
                  className="h-28 w-28 sm:h-32 sm:w-32 object-contain mx-auto rounded-2xl shadow-large bg-card/80 p-4 backdrop-blur-sm"
                />
              </motion.div>
            )}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="logo-text text-5xl md:text-7xl font-bold mb-6"
              style={{ color: '#ffffff', textShadow: 'none' }}
            >
              {branch.brandName}
            </motion.h1>
            {branch.tagline && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-xl md:text-2xl font-medium mb-6"
                style={{
                  color: themeColors ? `hsl(${themeColors.heroText})` : 'hsl(0 0% 95%)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7), 0 0 4px rgba(0,0,0,0.5)',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                }}
              >
                {branch.tagline}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* About Block 1: Text Left, Image Right */}
        {(branch.aboutSection1Title || branch.aboutSection1Image) && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="py-12 px-4 sm:px-8"
            style={{ backgroundColor: themeColors ? `hsl(${themeColors.pageBackground})` : 'hsl(0 0% 98%)' }}
          >
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2
                  className="text-4xl font-bold"
                  style={{
                    background: `linear-gradient(${cssDirection}, hsl(${gradientFrom}), hsl(${gradientTo}))`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {branch.aboutSection1Title || 'Our Story'}
                </h2>
                <p
                  className="text-lg leading-relaxed"
                  style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : 'hsl(240 5% 40%)' }}
                >
                  {branch.aboutSection1Text || 'Discover the passion behind our cuisine.'}
                </p>
              </div>
              {branch.aboutSection1Image && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl overflow-hidden shadow-large"
                >
                  <img
                    src={branch.aboutSection1Image}
                    alt={branch.aboutSection1Title || 'About'}
                    className="w-full h-full object-cover aspect-[4/3]"
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* About Block 2: Image Left, Text Right */}
        {(branch.aboutSection2Title || branch.aboutSection2Image) && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="py-12 px-4 sm:px-8"
            style={{
              backgroundColor: themeColors ? `hsl(${themeColors.cardBackground})` : 'hsl(0 0% 100%)',
            }}
          >
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              {branch.aboutSection2Image && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl overflow-hidden shadow-large order-2 md:order-1"
                >
                  <img
                    src={branch.aboutSection2Image}
                    alt={branch.aboutSection2Title || 'About'}
                    className="w-full h-full object-cover aspect-[4/3]"
                  />
                </motion.div>
              )}
              <div className="space-y-4 order-1 md:order-2">
                <h2
                  className="text-4xl font-bold"
                  style={{
                    background: `linear-gradient(${cssDirection}, hsl(${gradientFrom}), hsl(${gradientTo}))`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {branch.aboutSection2Title || 'Our Philosophy'}
                </h2>
                <p
                  className="text-lg leading-relaxed"
                  style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : 'hsl(240 5% 40%)' }}
                >
                  {branch.aboutSection2Text || 'Quality ingredients, crafted with care.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Menu Section */}
        <div
          className="py-16 px-4 sm:px-8"
          style={{ backgroundColor: themeColors ? `hsl(${themeColors.pageBackground})` : 'hsl(0 0% 98%)' }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2
                className="text-5xl font-bold mb-4"
                style={{
                  background: `linear-gradient(${cssDirection}, hsl(${gradientFrom}), hsl(${gradientTo}))`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Our Menu
              </h2>
              <div
                className="h-1 w-24 mx-auto rounded-full"
                style={{
                  background: `linear-gradient(${cssDirection}, hsl(${gradientFrom}), hsl(${gradientTo}))`
                }}
              />
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
              {menuItems.map((item, index) => {
                const itemQuantity = getItemQuantity(item.id);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    viewport={{ once: true }}
                    className="h-full"
                  >
                    <Card
                      className="overflow-hidden hover:shadow-large transition-smooth border-2 h-full flex flex-col"
                      style={{
                        backgroundColor: themeColors ? `hsl(${themeColors.cardBackground})` : 'hsl(0 0% 100%)',
                        borderColor: themeColors ? `hsl(${themeColors.cardBorder})` : undefined,
                      }}
                    >
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                            style={{ imageRendering: 'auto' }}
                            onLoad={() => console.log('Image loaded successfully:', item.name, item.imageUrl)}
                            onError={(e) => {
                              console.log('Image failed to load:', item.name, item.imageUrl);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="flex items-center justify-center h-full text-muted-foreground">
                                    <div class="text-center">
                                      <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                      </svg>
                                      <span class="text-xs">No image</span>
                                    </div>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <div className="text-center">
                              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              <span className="text-xs">No image</span>
                            </div>
                          </div>
                        )}
                        {item.bestSeller && (
                          <Badge className="absolute top-2 right-2">
                            Best Seller
                          </Badge>
                        )}
                        {!item.available && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Badge variant="destructive">Unavailable</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 flex flex-col flex-1">
                        <div className="space-y-2 flex flex-col flex-1">
                          <h3
                            className="font-semibold text-lg"
                            style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : undefined }}
                          >
                            {item.name}
                          </h3>
                          {item.description && (
                            <p
                              className="text-sm line-clamp-2 flex-1 min-h-[2.5rem]"
                              style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : undefined }}
                            >
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-2 mt-auto">
                            <span
                              className="text-xl font-bold"
                              style={{
                                background: `linear-gradient(${cssDirection}, hsl(${gradientFrom}), hsl(${gradientTo}))`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                              }}
                            >
                              ${item.price}
                            </span>
                            {item.available && (
                              itemQuantity > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="font-semibold w-6 text-center">{itemQuantity}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(item)}
                                  className="gap-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderLayout = () => {
    switch (layout) {
      case 'free':
        return renderFreeLayout();
      case 'masonry':
        return renderMasonryLayout();
      case 'centered':
        return renderCenteredLayout();
      case 'sidebar':
        return renderSidebarLayout();
      default:
        return renderDefaultLayout();
    }
  };

  // Reservation screen - shown when user selects "Reserve Table"
  if (flowState === 'reservation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => setFlowState('selection')}
            >
              ← Back
            </Button>
            <h2 className="text-3xl font-bold mb-2">Reserve Your Table</h2>
            <p className="text-muted-foreground">Fill in your details to complete your reservation</p>
          </div>

          {/* Reservation Form Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>
                Reserve a table at {branch.brandName}. We'll confirm your reservation shortly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReservationBookingForm
                branchId={branch.id}
                branchName={branch.brandName || branch.name}
                selectedItems={selectedItems as BookingItem[]}
                onBookingComplete={() => {
                  setFlowState('post-reservation');
                  setShowMenuAfterReservation(true);
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Post-reservation menu offer
  if (flowState === 'post-reservation' && showMenuAfterReservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Reservation Confirmed!</h2>
            <p className="text-muted-foreground mb-6">Would you like to add items to your reservation?</p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={() => setFlowState('menu')}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Browse Menu
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  toast({
                    title: 'Reservation Complete',
                    description: 'Your table has been reserved. See you soon!',
                  });
                }}
              >
                Continue
              </Button>
            </div>
          </div>

          {/* Info Card */}
          <Card className="bg-muted/50 border-muted-foreground/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                ℹ️ You can add items now or just visit us and order at your table.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: themeColors ? `hsl(${themeColors.pageBackground})` : 'hsl(0 0% 98%)',
        ...themeStyles
      }}
    >
      {/* Header with back button for menu state */}
      {flowState === 'menu' && !tableId && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b py-4 px-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setFlowState('selection')}
              className="flex items-center gap-2"
            >
              ← Back
            </Button>
            <h2 className="text-lg font-semibold">{branch.brandName}</h2>
            <div className="w-12" />
          </div>
        </motion.div>
      )}

      {/* Floating Cart Button */}
      {totalItems > 0 && flowState === 'menu' && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px]">
          <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'now' | 'booking')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="now">Order Now</TabsTrigger>
              <TabsTrigger value="booking">Pre-Order</TabsTrigger>
            </TabsList>
            <TabsContent value="now">
              <OrderDialog
                branchId={branch.id}
                branchName={branch.brandName || branch.name}
                selectedItems={selectedItems}
                onOrderComplete={() => setSelectedItems([])}
              />
            </TabsContent>
            <TabsContent value="booking">
              <BookingDialog
                branchId={branch.id}
                branchName={branch.brandName || branch.name}
                selectedItems={selectedItems as BookingItem[]}
                onBookingComplete={() => setSelectedItems([])}
              />
            </TabsContent>
          </Tabs>
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center text-sm font-bold shadow-lg">
            {totalItems}
          </div>
        </div>
      )}

      {/* Continuous Horizontal Slider */}
      {sliderImages.length > 0 && flowState === 'menu' && (
        <div className="overflow-hidden py-8 border-b" style={{ borderColor: themeColors ? `hsl(${themeColors.cardBorder})` : 'inherit' }}>
          <motion.div
            className="flex gap-4"
            animate={{
              x: [0, -(sliderImages.length * 320)],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: sliderImages.length * 8,
                ease: [0.42, 0, 0.58, 1],
              },
            }}
            style={{ willChange: 'transform' }}
          >
            {[...sliderImages, ...sliderImages].map((img, index) => (
              <div key={index} className="flex-shrink-0 w-72 sm:w-80 lg:w-96">
                <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-medium hover:shadow-large transition-shadow">
                  <img
                    src={img}
                    alt={`Slider ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {flowState === 'menu' && renderLayout()}
    </div>
  );
};

export default GuestLanding;
