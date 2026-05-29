import { useCallback, useRef } from "react";

export function useVideoPlayer() {
  const playerRef = useRef<any>(null);

  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const getCurrentTime = useCallback((): number => {
    return playerRef.current?.getCurrentTime() ?? 0;
  }, []);

  const getDuration = useCallback((): number => {
    return playerRef.current?.getDuration() ?? 0;
  }, []);

  return { playerRef, seekTo, pause, play, getCurrentTime, getDuration };
}
