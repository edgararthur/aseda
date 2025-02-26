import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
	const { user, profile } = useAuth();
	// console.log(user);

	return (
		<div className=''>
			<header className="bg-white shadow-md">
				<div className="flex items-center justify-end px-8 py-2">
					<div className="flex items-center gap-4">
						<button className="relative p-2 bg-transparent text-gray-400 hover:text-gray-600">
							<Bell size={19} className="bg-transparent" />
							<span className="absolute top-1 right-2  h-2 w-2 bg-red-500 rounded-full"></span>
						</button>
						<div className="flex items-center gap-3 cursor-pointer">
							<img
							src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
							alt="Profile"
							className="h-8 w-8 rounded-full"
							/>
							<div>
								<p className="text-xs font-medium text-gray-600">{user?.email || 'Guest'}</p>
								<p className="text-xs text-gray-500">{profile?.role || 'Unauthenticated'}</p>
							</div>
						</div>
					</div>
				</div>
			</header>
		</div>
	);
};