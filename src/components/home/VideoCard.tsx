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
            className="block rounded-lg bg-gray-800 p-4 transition hover:bg-gray-700/80">
            <img className="w-full aspect-video object-cover rounded-md mb-4" src={video.thumbnail_url} alt="Video Thumbnail" />
            <h2 className="text-lg font-semibold mb-2">{video.title}</h2>
            <p className="text-sm text-gray-400">{video.channel_name}</p>
{isRecent(video.created_at, 1) && (
  <span className=" top-2 right-2 bg-teal-500 text-xs px-2 py-1 rounded">New</span>
)}
        </Link>
    );
}   