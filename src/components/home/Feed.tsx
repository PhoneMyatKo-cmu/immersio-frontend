import type { Video } from '../../types/user';
import { VideoCard } from './VideoCard';

interface FeedProps {
    videos: Video[];
    searchQuery?: string;
    difficultyFilter?: string;
}

export function Feed({ videos, searchQuery, difficultyFilter }: FeedProps) {
    console.log(videos);

    if (videos.length === 0) {
        const getEmptyMessage = () => {
            if (searchQuery && difficultyFilter) {
                return `No videos found matching "${searchQuery}" at ${difficultyFilter} level.`;
            }
            if (searchQuery) {
                return `No videos found matching "${searchQuery}".`;
            }
            if (difficultyFilter) {
                return `No videos found at ${difficultyFilter} level.`;
            }
            return "No videos available. Check back later!";
        };

        return (
            <div className="mt-6 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <span className="text-3xl text-white/20">🎥</span>
                </div>
                <p className="text-white/40 text-sm">
                    {getEmptyMessage()}
                </p>
            </div>
        );
    }

    return (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
                <VideoCard key={video.id} {...video} />
            ))}
        </div>
    );
}