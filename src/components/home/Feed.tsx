import type { Video } from '../../types/user';
import { VideoCard } from './VideoCard';

export function Feed({ videos }: { videos: Video[] }) {
    return (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
                <VideoCard key={video.id} {...video} />
            ))}
        </div>
    );
}