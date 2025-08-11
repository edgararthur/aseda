import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import Header from './Header';
import { GlobalConnectionIndicator } from '@/components/common/ConnectionStatus';
import { offlineStorage } from '@/lib/offline-storage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function Layout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        // Initialize offline storage
        const initializeOfflineStorage = async () => {
            try {
                await offlineStorage.init();
            } catch (error) {
                console.error('Failed to initialize offline storage:', error);
            } finally {
                setIsInitializing(false);
            }
        };

        initializeOfflineStorage();

        // Handle responsive design
        const checkIsMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(false);
            }
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => {
            window.removeEventListener('resize', checkIsMobile);
        };
    }, []);

    const handleToggleCollapse = () => {
        if (isMobile) {
            setSidebarOpen(!sidebarOpen);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    const handleCloseMobileSidebar = () => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    if (isInitializing) {
        return (
            <div className="h-screen w-full bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-muted-foreground">Initializing application...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-background flex overflow-hidden">
            {/* Global Connection Indicator */}
            <GlobalConnectionIndicator />

            {/* Mobile Sidebar Overlay */}
            {isMobile && sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={handleCloseMobileSidebar}
                />
            )}

            {/* Sidebar */}
            <Sidebar 
                isCollapsed={isCollapsed}
                isMobile={isMobile}
                isOpen={sidebarOpen}
                onToggleCollapse={handleToggleCollapse}
                onClose={handleCloseMobileSidebar}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <Header 
                    isCollapsed={isCollapsed}
                    isMobile={isMobile}
                    onToggleCollapse={handleToggleCollapse}
                />

                {/* Main Content */}
                <main className="flex-1 overflow-hidden bg-muted/30">
                    <div className="h-full overflow-auto">
                        <div className="container mx-auto p-4 lg:p-6 h-full">
                            <div className="h-full animate-fade-in">
                                <Outlet />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}