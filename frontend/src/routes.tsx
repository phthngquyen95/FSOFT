import { RouteObject } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterPackage from './pages/auth/RegisterPackage';
import RegisterConfirm from './pages/auth/RegisterConfirm';
import BrandSelection from './pages/auth/BrandSelection';
import Dashboard from './pages/Dashboard';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import StaffDashboard from './pages/dashboard/StaffDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import WaiterDashboard from './pages/dashboard/WaiterDashboard';
import ReceptionistDashboard from './pages/dashboard/ReceptionistDashboard';
import GuestLanding from './pages/GuestLanding';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import StaffManagerLoginPage from './pages/auth/StaffManagerLogin';
import RestaurantLoginPage from './pages/auth/RestaurantLoginPage';

// Manager nested pages
import ManagerOverviewPage from './pages/dashboard/manager/OverviewPage';
import ManagerBranchInfoPage from './pages/dashboard/manager/BranchInfoPage';
import ManagerTablesPage from './pages/dashboard/manager/TablesPage';
import ManagerStaffPage from './pages/dashboard/manager/StaffPage';
import ManagerPromotionsPage from './pages/dashboard/manager/PromotionsPage';
import ManagerBillsPage from './pages/dashboard/manager/BillsPage';
import ManagerMenuPage from './pages/dashboard/manager/MenuPage';

// Owner nested pages
import OwnerOverviewPage from './pages/dashboard/owner/OverviewPage';
import OwnerMenuPage from './pages/dashboard/owner/MenuPage';
import OwnerTablesPage from './pages/dashboard/owner/TablesPage';
import OwnerStaffPage from './pages/dashboard/owner/StaffPage';

// import OwnerCategoriesPage from './pages/dashboard/owner/CategoriesPage';
// import OwnerCustomizationsPage from './pages/dashboard/owner/CustomizationsPage';
import OwnerReportsPage from './pages/dashboard/owner/ReportsPage';
import OwnerCustomizationPage from './pages/dashboard/owner/CustomizationPage';

// Waiter nested pages
import WaiterOrdersPage from './pages/dashboard/waiter/OrdersPage';
import WaiterTablesPage from './pages/dashboard/waiter/TablesPage';
import WaiterMenuPage from './pages/dashboard/waiter/MenuPage';

// Admin nested pages
import AdminOverviewPage from './pages/dashboard/admin/OverviewPage';
import AdminUsersPage from './pages/dashboard/admin/UsersPage';
import AdminPackagesPage from './pages/dashboard/admin/PackagesPage';

// Receptionist nested pages
import ReceptionistReservationsPage from './pages/dashboard/receptionist/ReservationsPage';
import ReceptionistTablesPage from './pages/dashboard/receptionist/TablesPage';
import ReceptionistCommunicationsPage from './pages/dashboard/receptionist/CommunicationsPage';
import ReceptionistBillingPage from './pages/dashboard/receptionist/BillingPage';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/register/package',
    element: <RegisterPackage />,
  },
  {
    path: '/register/confirm',
    element: <RegisterConfirm />,
  },
  {
    path: '/branch/:shortCode',
    element: <GuestLanding />,
  },
  {
    path: '/branch/:shortCode/table/:tableId',
    element: <GuestLanding />,
  },
  {
    path: '/brand-selection',
    element: (
      <ProtectedRoute>
        <BrandSelection />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/owner',
    element: (
      <ProtectedRoute>
        <OwnerDashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <OwnerOverviewPage />,
      },
      {
        path: 'overview',
        element: <OwnerOverviewPage />,
      },
      {
        path: 'menu',
        element: <OwnerMenuPage />,
      },
      {
        path: 'tables',
        element: <OwnerTablesPage />,
      },
      {
        path: 'staff',
        element: <OwnerStaffPage />,
      },
      // {
      //   path: 'categories',
      //   element: <OwnerCategoriesPage />,
      // },
      // {
      //   path: 'customizations',
      //   element: <OwnerCustomizationsPage />,
      // },
      {
        path: 'reports',
        element: <OwnerReportsPage />,
      },
      {
        path: 'customization',
        element: <OwnerCustomizationPage />,
      },
    ],
  },
  {
    path: '/dashboard/staff',
    element: (
      <ProtectedRoute>
        <StaffDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/manager',
    element: (
      <ProtectedRoute allowedRoles={['branch_manager']}>
        <ManagerDashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ManagerOverviewPage />,
      },
      {
        path: 'overview',
        element: <ManagerOverviewPage />,
      },
      {
        path: 'branch',
        element: <ManagerBranchInfoPage />,
      },
      {
        path: 'tables',
        element: <ManagerTablesPage />,
      },
      {
        path: 'staff',
        element: <ManagerStaffPage />,
      },
      {
        path: 'promotions',
        element: <ManagerPromotionsPage />,
      },
      {
        path: 'bills',
        element: <ManagerBillsPage />,
      },
      {
        path: 'menu',
        element: <ManagerMenuPage />,
      },
    ],
  },
  {
    path: '/dashboard/admin',
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminOverviewPage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'packages',
        element: <AdminPackagesPage />,
      },
    ],
  },
  {
    path: '/dashboard/waiter',
    element: (
      <ProtectedRoute allowedRoles={['waiter']}>
        <WaiterDashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <WaiterOrdersPage />,
      },
      {
        path: 'orders',
        element: <WaiterOrdersPage />,
      },
      {
        path: 'tables',
        element: <WaiterTablesPage />,
      },
      {
        path: 'menu',
        element: <WaiterMenuPage />,
      },
    ],
  },
  {
    path: '/dashboard/receptionist',
    element: (
      <ProtectedRoute allowedRoles={['receptionist']}>
        <ReceptionistDashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ReceptionistReservationsPage />,
      },
      {
        path: 'reservations',
        element: <ReceptionistReservationsPage />,
      },
      {
        path: 'tables',
        element: <ReceptionistTablesPage />,
      },
      {
        path: 'billing',
        element: <ReceptionistBillingPage />,
      },
      {
        path: 'communications',
        element: <ReceptionistCommunicationsPage />,
      },
    ],
  },
  {
    path: '/auth/staff-manager-login',
    element: <StaffManagerLoginPage />,
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/restaurant-login',
    element: <RestaurantLoginPage />,
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
];
