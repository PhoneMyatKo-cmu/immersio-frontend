import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { shadowingApi } from "../../api/shadowing";


export default function ShadowingProcessing({ videoId, onReady }: { videoId: number; onReady: () => void }) {
    useEffect(() => {
        const id = setInterval(async () => {
            const { data } = await shadowingApi.getShadowingStatus(videoId)
            if (data.is_shadowing_ready) {
                clearInterval(id)
                onReady()
            }
        }, 5000)
        return () => clearInterval(id)
    }, [videoId, onReady])

    return (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Loader2 className="h-5 w-5 animate-spin text-white/40" />
            <p className="text-sm text-white/50">Preparing shadowing…</p>
            <p className="text-xs text-white/30">This takes a couple of minutes for new videos.</p>
        </div>
    )
}