import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  Package,
  Tags,
  Boxes,
  AlertTriangle,
  Barcode,
  QrCode,
  Building2,
  ChevronLeft,
  Search,
  Bell,
  Mail,
  Settings2,
} from 'lucide-react';

interface SidebarItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  section?: string;
  submenu?: { title: string; href: string }[];
}

const sidebarItems: SidebarItem[] = [
  {
    section: 'Main',
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'Super Admin',
    icon: Users,
    href: '/super-admin',
  },
  {
    title: 'Application',
    icon: Settings2,
    href: '/application',
  },
  {
    title: 'Layouts',
    icon: LayoutDashboard,
    href: '/layouts',
  },
  {
    section: 'Inventory',
    title: 'Products',
    icon: Package,
    href: '/products',
  },
  {
    title: 'Create Product',
    icon: Package,
    href: '/products/create',
  },
  {
    title: 'Expired Products',
    icon: AlertTriangle,
    href: '/products/expired',
  },
  {
    title: 'Low Stocks',
    icon: Boxes,
    href: '/products/low-stock',
  },
  {
    title: 'Category',
    icon: Tags,
    href: '/categories',
  },
  {
    title: 'Sub Category',
    icon: Tags,
    href: '/subcategories',
  },
  {
    title: 'Brands',
    icon: Building2,
    href: '/brands',
  },
  {
    title: 'Units',
    icon: Package,
    href: '/units',
  },
  {
    title: 'Variant Attributes',
    icon: Tags,
    href: '/variants',
  },
  {
    title: 'Warranties',
    icon: Shield,
    href: '/warranties',
  },
  {
    title: 'Print Barcode',
    icon: Barcode,
    href: '/print-barcode',
  },
  {
    title: 'Print QR Code',
    icon: QrCode,
    href: '/print-qr',
  },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-white transition-all",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              <span className="font-semibold">Dreams POS</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded p-1 hover:bg-gray-100"
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform",
                isCollapsed && "rotate-180"
              )}
            />
          </button>
        </div>

        <nav className="space-y-1 p-2">
          {sidebarItems.map((item, index) => (
            <div key={index}>
              {item.section && (
                <div className={cn(
                  "px-3 py-2 text-xs font-semibold text-gray-500",
                  isCollapsed && "hidden"
                )}>
                  {item.section}
                </div>
              )}
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-colors",
                  location.pathname === item.href
                    ? "bg-gray-100 text-primary"
                    : "hover:bg-gray-50",
                  isCollapsed && "justify-center"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5",
                  location.pathname === item.href && "text-primary"
                )} />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 transition-all",
        isCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Header */}
        <header className="fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 transition-all"
          style={{ width: `calc(100% - ${isCollapsed ? '4rem' : '16rem'})` }}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search"
                className="h-10 rounded-lg border border-gray-200 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-gray-50 px-1.5 text-xs text-gray-500">
                K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-lg p-2 hover:bg-gray-50">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button className="relative rounded-lg p-2 hover:bg-gray-50">
              <Mail className="h-5 w-5 text-gray-600" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button className="rounded-lg p-2 hover:bg-gray-50">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
            <div className="h-8 w-px bg-gray-200" />
            <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-50">
              <img
                src="https://ui-avatars.com/api/?name=Admin"
                alt="Admin"
                className="h-8 w-8 rounded-lg"
              />
              {!isCollapsed && (
                <div className="text-left">
                  <div className="text-sm font-medium">Admin</div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen pt-16 transition-all">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 