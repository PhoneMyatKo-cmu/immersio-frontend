import { X } from "lucide-react";
import { useState } from "react";
import { adminVideosApi } from "../../api/adminVideos";

// Modal for adding a curated video by YouTube URL. Reports the resulting
// message back so the parent can refresh the list + stats.
export function AddVideoModal({
    isOpen,
    onClose,
    onAdded,
}: {
    isOpen: boolean;
    onClose: () => void;
    onAdded: (message: string) => void;
}) {
    const [url, setUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!url.trim()) return;
        setSubmitting(true);
        setError(null);
        try {
            const res = await adminVideosApi.create(url.trim());
            const title = res.data.video_title;
            onAdded(`${res.data.message}${title ? `: ${title}` : ""}`);
            setUrl("");
            onClose();
        } catch (err: any) {
            setError(
                err?.response?.data?.detail ??
                    "Failed to add the video. Please check the URL and try again.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#0a1628] p-6 text-white shadow-2xl">
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md text-white/50 transition-all hover:bg-white/5 hover:text-white/90"
                >
                    <X size={18} />
                </button>

                <h2 className="mb-4 pr-8 text-lg font-semibold">Add curated video</h2>

                <form onSubmit={handleSubmit}>
                    <label className="mb-2 block text-sm font-medium text-white/70" htmlFor="youtube_url">
                        YouTube URL
                    </label>
                    <input
                        id="youtube_url"
                        type="url"
                        required
                        autoFocus
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full rounded-md border border-white/10 bg-[#1a2330] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />

                    {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-teal-700 disabled:opacity-50"
                        >
                            {submitting ? "Adding…" : "Add video"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
