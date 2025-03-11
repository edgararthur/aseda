import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigation } from '@/config/navigation';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function Sidebar() {
	const location = useLocation();
	const { signOut } = useAuth();
	const [expandedItems, setExpandedItems] = useState<string[]>([]);

	const toggleExpand = (title: string) => {
		setExpandedItems(prev => 
			prev.includes(title) 
				? prev.filter(item => item !== title)
				: [...prev, title]
		);
	};

	const isActive = (path: string) => {
		return location.pathname === path;
	};

	const isExpanded = (title: string) => {
		return expandedItems.includes(title);
	};

	return (
		<aside className="w-64 bg-[#047aeb] text-white min-h-screen p-4">
			<div className="flex items-center gap-2 mb-8">
				<img src="/logo.svg" alt="Aseda Accounting" className="h-8 w-8" />
				<h1 className="text-lg font-semibold">Aseda Accounting</h1>
			</div>

			<nav className="space-y-2">
				{navigation.map((item) => (
					<div key={item.title} className="text-sm">
						{item.children ? (
							<div>
								<button
									onClick={() => toggleExpand(item.title)}
									className={cn(
										"flex items-center justify-between w-full px-4 py-2 rounded-lg hover:bg-white/10",
										isExpanded(item.title) && "bg-white/5"
									)}
								>
									<div className="flex items-center gap-3">
										{item.icon && <item.icon size={18} />}
										<span>{item.title}</span>
									</div>
									<ChevronDown
										size={16}
										className={cn(
											"transition-transform",
											isExpanded(item.title) && "rotate-180"
										)}
									/>
								</button>
								{isExpanded(item.title) && (
									<div className="mt-1 ml-4 space-y-1">
										{item.children.map((child) => (
											<Link
												key={child.path}
												to={child.path}
												className={cn(
													"flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10",
													isActive(child.path) && "bg-white/20"
												)}
											>
												{child.icon && <child.icon size={16} />}
												<span>{child.title}</span>
											</Link>
										))}
									</div>
								)}
							</div>
						) : (
							<Link
								to={item.path}
								className={cn(
									"flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10",
									isActive(item.path) && "bg-white/20"
								)}
							>
								{item.icon && <item.icon size={18} />}
								<span>{item.title}</span>
							</Link>
						)}
					</div>
				))}
			</nav>

			<button
				onClick={signOut}
				className="flex items-center gap-3 px-4 py-2 text-sm mt-8 w-full rounded-lg hover:bg-white/10"
			>
				<LogOut size={18} />
				<span>Logout</span>
			</button>
		</aside>
	);
}
