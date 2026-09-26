import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

// Shown only while the backend URL isn't configured (e.g. frontend deployed ahead of the API).
// Disappears automatically once VITE_API_URL is set and the app is rebuilt.
const API_CONFIGURED = Boolean(import.meta.env.VITE_API_URL);

export function DemoNotice() {
    const [open, setOpen] = useState(!API_CONFIGURED);

    if (!open) return null;

    return (
        <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 pointer-events-none">
            <div
                role="status"
                className="pointer-events-auto flex max-w-lg items-start gap-3 rounded-xl border border-teal-500/40 bg-[#12213b]/95 px-4 py-3 text-white shadow-lg shadow-black/40 backdrop-blur"
            >
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-teal-400" />
                <div className="text-sm">
                    <p className="font-semibold">Live demo coming soon</p>
                    <p className="text-white/70">
                        The full Immersio demo will be ready within 1 day. You can look around the interface in the meantime!
                    </p>
                </div>
                <button
                    onClick={() => setOpen(false)}
                    aria-label="Dismiss"
                    className="shrink-0 rounded p-1 text-white/60 hover:bg-white/10 hover:text-white"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
