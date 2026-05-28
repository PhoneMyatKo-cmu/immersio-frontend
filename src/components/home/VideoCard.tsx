import type { Video } from "../../types/user";

export function VideoCard(video: Video) {
    return (
        <div className="rounded-lg bg-gray-800 p-4">
            <img className="w-full aspect-video object-cover rounded-md mb-4" src={video.thumbnail_url} alt="Video Thumbnail" />
            <h2 className="text-lg font-semibold mb-2">{video.title}</h2>
            <p className="text-sm text-gray-400">{video.channel_name}</p>
        </div>
    );
}