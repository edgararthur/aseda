import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigation, NavigationItem } from '@/config/navigation';
import { ChevronDown, ChevronRight, LogOut, Building2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  isCollapsed: boolean;
  isMobile: boolean;
  isOpen: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

interface SidebarNavigationItemProps {
  item: NavigationItem;
  isCollapsed: boolean;
  isMobile: boolean;
  isActive: (path?: string) => boolean;
  isExpanded: (title: string) => boolean;
  toggleExpand: (title: string) => void;
  onNavigate: () => void;
}

export function Sidebar({ 
  isCollapsed = false, 
  isMobile = false,
  isOpen = false,
  onToggleCollapse, 
  onClose 
}: SidebarProps) {
	const location = useLocation();
  const { signOut, user, profile } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Dashboard']);

  // Auto-expand parent categories based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    navigation.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          child.path && currentPath.startsWith(child.path)
        );
        if (hasActiveChild && !expandedItems.includes(item.title)) {
          setExpandedItems(prev => [...prev, item.title]);
        }
      }
    });
  }, [location.pathname]);

	const toggleExpand = (title: string) => {
		setExpandedItems(prev => 
			prev.includes(title) 
				? prev.filter(item => item !== title)
				: [...prev, title]
		);
	};

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
	};

	const isExpanded = (title: string) => {
		return expandedItems.includes(title);
	};

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigate = () => {
    if (isMobile) {
      onClose();
    }
  };

  // Calculate sidebar width
  const sidebarWidth = isCollapsed ? 'w-16' : 'w-72';
  const mobileClasses = isMobile 
    ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`
    : 'relative';

	return (
    <aside className={cn(
      'bg-card border-r border-border flex flex-col',
      sidebarWidth,
      mobileClasses,
      !isMobile && 'transition-all duration-300 ease-in-out'
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between p-4 border-b border-border',
        isCollapsed && !isMobile && 'px-2'
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">LedgerLink</span>
              <span className="text-xs text-muted-foreground">Accounting</span>
            </div>
          </div>
        )}
        
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
			</div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-2">
				{navigation.map((item) => (
          <SidebarNavigationItem
            key={item.title}
            item={item}
            isCollapsed={isCollapsed && !isMobile}
            isMobile={isMobile}
            isActive={isActive}
            isExpanded={isExpanded}
            toggleExpand={toggleExpand}
            onNavigate={handleNavigate}
          />
        ))}
      </div>

      {/* Connection Status */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border">
          <ConnectionStatus />
        </div>
      )}

      {/* User Section */}
      <div className={cn(
        'p-4 border-t border-border',
        isCollapsed && !isMobile && 'px-2'
      )}>
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user?.full_name?.[0] || user?.email?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.role || 'Member'}
                </p>
              </div>
            </div>

            {/* Sign Out Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full p-2"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Sign Out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </aside>
  );
}

function SidebarNavigationItem({ 
  item, 
  isCollapsed, 
  isMobile,
  isActive, 
  isExpanded, 
  toggleExpand,
  onNavigate
}: SidebarNavigationItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isItemExpanded = isExpanded(item.title);

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
								<button
									onClick={() => toggleExpand(item.title)}
									className={cn(
                  'flex items-center w-full gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                  'hover:bg-accent hover:text-accent-foreground',
                  isItemExpanded ? 'bg-accent/50 text-accent-foreground' : 'text-muted-foreground',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.title}</span>
                    {isItemExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </>
                )}
								</button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                <p>{item.title}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </p>
                )}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Submenu */}
        {isItemExpanded && !isCollapsed && (
          <div className="ml-8 space-y-1 animate-fade-in">
            {item.children?.map((child) => (
              <TooltipProvider key={child.title}>
                <Tooltip>
                  <TooltipTrigger asChild>
											<Link
                      to={child.path || '#'}
                      onClick={onNavigate}
												className={cn(
                        'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200',
                        isActive(child.path)
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <child.icon className="w-4 h-4 flex-shrink-0" />
												<span>{child.title}</span>
                      {child.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {child.badge}
                        </Badge>
                      )}
											</Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{child.title}</p>
                    {child.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {child.description}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
										))}
									</div>
								)}
							</div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
							<Link
            to={item.path || '#'}
            onClick={onNavigate}
								className={cn(
              'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
              isActive(item.path)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              isCollapsed && 'justify-center px-2'
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
							</Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right">
            <p>{item.title}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {item.description}
              </p>
            )}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}