import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { adminVideosApi } from "../../api/adminVideos";
import { AddVideoModal } from "../../components/admin/AddVideoModal";
import { StatCard } from "../../components/admin/StatCard";
import { Modal } from "../../components/common/Modal";
import { Pagination } from "../../components/common/Pagination";
import type {
    AdminVideoItem,
    Paginated,
    VideoSource,
    VideoStats,
} from "../../types/admin";

const PAGE_SIZE = 20;

function formatDuration(totalSeconds: number): string {
    const s = Math.floor(totalSeconds);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) {
        return `${h}:${String(m % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    }
    return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "green" | "amber" | "slate" | "red" }) {
    const tones = {
        green: "bg-emerald-500/15 text-emerald-400",
        amber: "bg-amber-500/15 text-amber-400",
        slate: "bg-white/10 text-white/60",
        red: "bg-red-500/15 text-red-400",
    };
    return (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
            {children}
        </span>
    );
}

function AdminVideosPage() {
    const [stats, setStats] = useState<VideoStats | null>(null);
    const [data, setData] = useState<Paginated<AdminVideoItem> | null>(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [source, setSource] = useState<VideoSource | "">("");
    const [isActive, setIsActive] = useState<"" | "true" | "false">("");
    const [page, setPage] = useState(1);

    const [showAdd, setShowAdd] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<AdminVideoItem | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    // Debounce the search box.
    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 350);
        return () => clearTimeout(t);
    }, [searchInput]);

    const params = useMemo(
        () => ({
            search: search || undefined,
            source: source || undefined,
            is_active: isActive === "" ? undefined : isActive === "true",
            page,
            page_size: PAGE_SIZE,
        }),
        [search, source, isActive, page],
    );

    const loadStats = () => {
        adminVideosApi.stats().then((res) => setStats(res.data)).catch(() => {});
    };

    const loadList = () => {
        setLoading(true);
        adminVideosApi
            .list(params)
            .then((res) => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    };

    useEffect(loadStats, []);
    useEffect(loadList, [params]);

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await adminVideosApi.remove(deleteTarget.id);
            setToast(`Removed "${deleteTarget.title}".`);
            loadList();
            loadStats();
        } catch {
            setToast("Failed to remove the video.");
        } finally {
            setDeleteTarget(null);
        }
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Video management</h1>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
                >
                    <Plus size={18} />
                    Add video
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <StatCard label="Total" value={stats.total} hint={`${stats.active} active · ${stats.inactive} inactive`} />
                    <StatCard label="Curated" value={stats.by_source.curated} hint={`${stats.by_source.user_submitted} user-submitted`} />
                    <StatCard label="Shadowing ready" value={stats.shadowing_ready} hint={`${stats.shadowing_not_ready} not ready`} />
                    <StatCard label="Added (30d)" value={stats.added_last_30_days} hint={`${stats.added_last_7_days} in last 7d`} />
                </div>
            )}

            {/* Filters */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by title…"
                    className="w-full rounded-lg border border-white/10 bg-[#0a1628] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500 sm:max-w-xs"
                />
                <select
                    value={source}
                    onChange={(e) => { setSource(e.target.value as VideoSource | ""); setPage(1); }}
                    className="rounded-lg border border-white/10 bg-[#0a1628] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                    <option value="">All sources</option>
                    <option value="curated">Curated</option>
                    <option value="user_submitted">User submitted</option>
                </select>
                <select
                    value={isActive}
                    onChange={(e) => { setIsActive(e.target.value as "" | "true" | "false"); setPage(1); }}
                    className="rounded-lg border border-white/10 bg-[#0a1628] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                    <option value="">Active + inactive</option>
                    <option value="true">Active only</option>
                    <option value="false">Inactive only</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#111c30]">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/10 bg-white/[0.06] text-xs uppercase tracking-wide text-white/60">
                        <tr>
                            <th className="px-4 py-3 font-medium">Video</th>
                            <th className="px-4 py-3 font-medium">Source</th>
                            <th className="px-4 py-3 font-medium">Shadowing</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Added</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {loading ? (
                            <tr><td colSpan={6} className="px-4 py-10 text-center text-white/40">Loading…</td></tr>
                        ) : !data || data.items.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-10 text-center text-white/40">No videos found.</td></tr>
                        ) : (
                            data.items.map((v) => (
                                <tr key={v.id} className="text-white/90 transition-colors hover:bg-white/[0.03]">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={v.thumbnail_url} alt="" className="h-10 w-16 flex-shrink-0 rounded object-cover" />
                                            <div className="min-w-0">
                                                <div className="truncate font-medium text-white">{v.title}</div>
                                                <div className="truncate text-xs text-white/40">
                                                    {v.channel_name} · {formatDuration(v.duration_seconds)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge tone={v.source === "curated" ? "green" : "slate"}>
                                            {v.source === "curated" ? "Curated" : "User"}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        {v.is_shadowing_ready
                                            ? <Badge tone="green">Ready</Badge>
                                            : <Badge tone="amber">Processing</Badge>}
                                    </td>
                                    <td className="px-4 py-3">
                                        {v.is_active
                                            ? <Badge tone="green">Active</Badge>
                                            : <Badge tone="red">Inactive</Badge>}
                                    </td>
                                    <td className="px-4 py-3 text-white/50">{formatDate(v.created_at)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => setDeleteTarget(v)}
                                            disabled={!v.is_active}
                                            title={v.is_active ? "Remove video" : "Already removed"}
                                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {data && data.total_pages > 1 && (
                <Pagination currentPage={data.page} totalPages={data.total_pages} onPageChange={setPage} />
            )}

            <AddVideoModal
                isOpen={showAdd}
                onClose={() => setShowAdd(false)}
                onAdded={(message) => { setToast(message); loadList(); loadStats(); }}
            />

            <Modal
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                title="Remove video?"
                message={
                    deleteTarget
                        ? `"${deleteTarget.title}" will be removed from the public feed. This can be reversed on the backend.`
                        : ""
                }
                variant="warning"
                confirmText="Remove"
                confirmTone="danger"
                cancelRequired
                closeOnConfirm={false}
                onConfirm={handleConfirmDelete}
            />

            <Modal
                isOpen={toast !== null}
                onClose={() => setToast(null)}
                message={toast ?? ""}
                variant="success"
            />
        </div>
    );
}

export default AdminVideosPage;
