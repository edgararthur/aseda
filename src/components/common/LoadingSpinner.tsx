import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
    return (
        <div className="min-h-screen w-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
    );
} 