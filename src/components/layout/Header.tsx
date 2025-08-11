import React, { useState } from 'react';
import { 
	Bell, 
	Search, 
	Settings, 
	HelpCircle, 
	ChevronDown, 
	User, 
	LogOut,
	Menu,
	Sun,
	Moon,
	Maximize2,
	Minimize2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface HeaderProps {
	isCollapsed?: boolean;
	isMobile?: boolean;
	onToggleCollapse?: () => void;
}

export default function Header({ isCollapsed, isMobile, onToggleCollapse }: HeaderProps) {
	const { user, profile, signOut } = useAuth();
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [notifications] = useState(3); // Mock notification count

	const handleSignOut = async () => {
		try {
			await signOut();
		} catch (error) {
			console.error('Sign out error:', error);
		}
	};

	const toggleFullscreen = () => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
			setIsFullscreen(true);
		} else {
			document.exitFullscreen();
			setIsFullscreen(false);
		}
	};

	const userInitials = user?.full_name
		? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
		: user?.email?.[0]?.toUpperCase() || 'U';

	return (
		<header className="bg-card border-b border-border px-4 lg:px-6 py-4 shadow-sm z-10 shrink-0">
			<div className="flex items-center justify-between min-w-0">
				{/* Left Section */}
					<div className="flex items-center gap-4">
					{/* Sidebar Toggle */}
					<Button
						variant="ghost"
						size="sm"
						onClick={onToggleCollapse}
						className="shrink-0"
					>
						<Menu className="w-4 h-4" />
					</Button>

					{/* Search Bar */}
					<div className="relative hidden md:block">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
						<Input
							placeholder="Search transactions, invoices..."
							className="pl-10 pr-4 w-64 lg:w-80 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>

				{/* Right Section */}
				<div className="flex items-center gap-3">
					{/* Search Button - Mobile */}
					<Button variant="ghost" size="sm" className="md:hidden">
						<Search className="w-5 h-5" />
					</Button>

					{/* Fullscreen Toggle */}
					<Button variant="ghost" size="sm" onClick={toggleFullscreen}>
						{isFullscreen ? (
							<Minimize2 className="w-5 h-5" />
						) : (
							<Maximize2 className="w-5 h-5" />
						)}
					</Button>

					{/* Help */}
					<Button variant="ghost" size="sm">
						<HelpCircle className="w-5 h-5" />
					</Button>

					{/* Notifications */}
					<Button variant="ghost" size="sm" className="relative">
						<Bell className="w-5 h-5" />
						{notifications > 0 && (
							<Badge 
								variant="destructive" 
								className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
							>
								{notifications > 9 ? '9+' : notifications}
							</Badge>
						)}
					</Button>

					{/* User Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="flex items-center gap-3 px-3 py-2">
								<Avatar className="w-8 h-8">
									<AvatarImage src="" alt={user?.full_name || 'User'} />
									<AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
										{userInitials}
									</AvatarFallback>
								</Avatar>
								<div className="hidden md:block text-left">
									<p className="text-sm font-medium text-gray-900 truncate max-w-32">
										{user?.full_name || 'User'}
									</p>
									<p className="text-xs text-gray-500 capitalize">
										{profile?.role || 'Accountant'}
									</p>
								</div>
								<ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuLabel>
								<div className="flex flex-col">
									<span className="font-medium">{user?.full_name || 'User'}</span>
									<span className="text-xs text-gray-500 font-normal">{user?.email}</span>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<User className="w-4 h-4 mr-2" />
								Profile Settings
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Settings className="w-4 h-4 mr-2" />
								Account Settings
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleSignOut} className="text-red-600">
								<LogOut className="w-4 h-4 mr-2" />
								Sign Out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
							</div>
						</div>

			{/* Mobile Search Bar */}
			<div className="mt-3 md:hidden">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
					<Input
						placeholder="Search..."
						className="pl-10 pr-4 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500"
					/>
					</div>
				</div>
			</header>
	);
};