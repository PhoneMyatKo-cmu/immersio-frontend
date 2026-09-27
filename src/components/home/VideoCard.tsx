import { Link } from "react-router-dom";
import type { Video } from "../../types/user";

export function VideoCard(video: Video) {
const isRecent = (createdAt: Date | string, daysThreshold = 10): boolean => {
    const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    // console.log(created)
  const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    // console.log(diffMs)
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    // console.log(diffDays)
  return diffDays <= daysThreshold;
};
    return (
        <Link
            to={`/video/${video.id}`}
            className="block overflow-hidden rounded-xl bg-gray-800 transition hover:bg-gray-700/80 md:rounded-lg md:p-4">
            {/* Mobile: thumbnail runs edge-to-edge inside the card; desktop keeps the inset frame */}
            <img className="w-full aspect-video object-cover md:rounded-md md:mb-4" src={video.thumbnail_url} alt="Video Thumbnail" />
            <div className="px-3 pt-3 pb-4 md:p-0">
            <h2 className="text-base font-semibold leading-snug mb-1.5 md:text-lg md:leading-normal md:mb-2">{video.title}</h2>
            <p className="text-sm text-gray-400">{video.channel_name}</p>
            <p className="text-sm text-gray-400">{new Date(video.created_at).toLocaleDateString()}</p>
{isRecent(video.created_at, 1) && (
  <span className=" top-2 right-2 bg-teal-500 text-xs px-2 py-1 rounded">New</span>
)}
            </div>
        </Link>
    );
}   