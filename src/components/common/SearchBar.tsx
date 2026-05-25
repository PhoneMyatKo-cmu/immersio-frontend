import { SearchIcon } from 'lucide-react';

export function SearchBar({onSearch }: {onSearch?: (query: string) => void}) {


    return (
        <div className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-white/60 focus-within:bg-gray-700 focus-within:text-white">
            <SearchIcon className="h-5 w-5" />
            <input
                type="text"
                placeholder="Search Videos..."
                className="w-full outline-none"
                onChange={(e) => onSearch?.(e.target.value)}
            />
        </div>
    );
}