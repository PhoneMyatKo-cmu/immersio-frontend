import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        YT: typeof YT;
        onYouTubeIframeAPIReady: () => void;
    }
}

interface YoutubeClipPlayerProps {
    videoId: string;
    startTime: number;
    endTime: number;
}

export function YoutubeClipPlayer({ videoId, startTime, endTime }: YoutubeClipPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YT.Player | null>(null);
    const [isAPILoaded, setIsAPILoaded] = useState(false);

    useEffect(() => {
        if (window.YT?.Player) { setIsAPILoaded(true); return; }

        if (document.getElementById("yt-api")) {
            const prev = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => { prev?.(); setIsAPILoaded(true); };
            return;
        }

        window.onYouTubeIframeAPIReady = () => setIsAPILoaded(true);
        const s = document.createElement("script");
        s.id = "yt-api";
        s.src = "https://www.youtube.com/iframe_api";
        s.async = true;
        document.body.appendChild(s);
    }, []);

    useEffect(() => {
        if (!isAPILoaded || !containerRef.current) return;

        playerRef.current?.destroy();
        // "end" is a standard player param — YouTube auto-pauses there on every play, not just the first time,
        // so seeking back to "start" and calling playVideo() again still stops at "end" without extra polling.
        playerRef.current = new window.YT.Player(containerRef.current, {
            videoId,
            width: "100%",
            height: "100%",
            playerVars: {
                start: Math.floor(startTime),
                end: Math.ceil(endTime),
                autoplay: 0,
                controls: 0,
                rel: 0,
                modestbranding: 1,
                iv_load_policy: 3,
                disablekb: 1,
                playsinline: 1,
                showinfo: 0,
            },
        });

        return () => {
            playerRef.current?.destroy();
            playerRef.current = null;
        };
    }, [isAPILoaded, videoId, startTime, endTime]);

    const play = () => {
        playerRef.current?.seekTo(startTime, true);
        playerRef.current?.playVideo();
    };

    return (
        <div className="w-full flex flex-col items-center gap-2">
            <div className="relative w-full aspect-video rounded-sm overflow-hidden bg-black">
                <div ref={containerRef} className="absolute inset-0" />
            </div>
            <button
                onClick={play}
                className="flex items-center gap-1 rounded-md bg-gray-600 px-3 py-1 text-xs font-medium text-white transition-all hover:bg-gray-500"
            >
                <RotateCcw size={14} /> Play
            </button>
        </div>
    );
}
