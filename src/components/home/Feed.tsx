

export function Feed() {
    return (
        // Feed is 3 cards each row
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card */}
            <div className="rounded-lg bg-gray-800 p-4">
                <div className="h-40 bg-gray-700 rounded-md mb-4"></div>
                <h2 className="text-lg font-semibold mb-2">Video Title</h2>
                <p className="text-sm text-gray-400">Channel Name</p>
            </div>
             {/* Card */}
             <div className="rounded-lg bg-gray-800 p-4">
                <div className="h-40 bg-gray-700 rounded-md mb-4"></div>
                <h2 className="text-lg font-semibold mb-2">Video Title</h2>
                <p className="text-sm text-gray-400">Channel Name</p>
            </div>
             {/* Card */}
             <div className="rounded-lg bg-gray-800 p-4">
                <div className="h-40 bg-gray-700 rounded-md mb-4"></div>
                <h2 className="text-lg font-semibold mb-2">Video Title</h2>
                <p className="text-sm text-gray-400">Channel Name</p>
            </div>
             {/* Card */}
             <div className="rounded-lg bg-gray-800 p-4">
                <div className="h-40 bg-gray-700 rounded-md mb-4"></div>
                <h2 className="text-lg font-semibold mb-2">Video Title</h2>
                <p className="text-sm text-gray-400">Channel Name</p>
            </div>
            
        </div>
    );
}