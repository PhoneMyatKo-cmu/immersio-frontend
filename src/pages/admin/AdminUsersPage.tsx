import { ShieldOff, UserX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { adminUsersApi } from "../../api/adminUsers";
import { useAuth } from "../../authContext";
import { LevelBreakdownCard } from "../../components/admin/LevelBreakdownCard";
import { StatCard } from "../../components/admin/StatCard";
import { Modal } from "../../components/common/Modal";
import { Pagination } from "../../components/common/Pagination";
import type { Paginated, UserAdminRead, UserStats } from "../../types/admin";
import type { EstimatedLevel, Role } from "../../types/user";

const PAGE_SIZE = 20;

function formatDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "green" | "teal" | "slate" | "red" }) {
    const tones = {
        green: "bg-emerald-500/15 text-emerald-400",
        teal: "bg-teal-500/15 text-teal-400",
        slate: "bg-white/10 text-white/60",
        red: "bg-red-500/15 text-red-400",
    };
    return (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
            {children}
        </span>
    );
}

type PendingAction =
    | { type: "role"; user: UserAdminRead; nextRole: Role }
    | { type: "deactivate"; user: UserAdminRead };

function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [data, setData] = useState<Paginated<UserAdminRead> | null>(null);
    const [loading, setLoading] = useState(true);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [role, setRole] = useState<Role | "">("");
    const [level, setLevel] = useState<EstimatedLevel | "">("");
    const [isActive, setIsActive] = useState<"" | "true" | "false">("");
    const [page, setPage] = useState(1);

    const [pending, setPending] = useState<PendingAction | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 350);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Level is a learner-only lens: selecting a level scopes the query to
    // LEARNER so admins (whose level is treated as N/A) can't leak in.
    const params = useMemo(
        () => ({
            search: search || undefined,
            role: level ? ("LEARNER" as Role) : role || undefined,
            estimated_level: level || undefined,
            is_active: isActive === "" ? undefined : isActive === "true",
            page,
            page_size: PAGE_SIZE,
        }),
        [search, role, level, isActive, page],
    );

    const loadStats = () => {
        adminUsersApi.stats().then((res) => setStats(res.data)).catch(() => {});
    };

    const loadList = () => {
        setLoading(true);
        adminUsersApi
            .list(params)
            .then((res) => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    };

    useEffect(loadStats, []);
    useEffect(loadList, [params]);

    const handleConfirm = async () => {
        if (!pending) return;
        try {
            if (pending.type === "role") {
                await adminUsersApi.changeRole(pending.user.id, pending.nextRole);
                setToast(
                    `${pending.user.first_name} ${pending.user.last_name} is now ${pending.nextRole === "ADMIN" ? "an admin" : "a learner"}.`,
                );
            } else {
                await adminUsersApi.deactivate(pending.user.id);
                setToast(`${pending.user.first_name} ${pending.user.last_name} was deactivated.`);
            }
            loadList();
            loadStats();
        } catch (err: any) {
            setToast(err?.response?.data?.detail ?? "Action failed. Please try again.");
        } finally {
            setPending(null);
        }
    };

    const confirmMessage = pending
        ? pending.type === "role"
            ? `Change ${pending.user.first_name} ${pending.user.last_name}'s role to ${pending.nextRole}?`
            : `Deactivate ${pending.user.first_name} ${pending.user.last_name}? They will be blocked from logging in.`
        : "";

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-white">User management</h1>

            {stats && (
                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
                    <StatCard label="Total Learners" value={stats.total} hint={`${stats.active} active · ${stats.inactive} inactive`} />
                    <StatCard label="Signups (30d)" value={stats.signups_last_30_days} hint={`${stats.signups_last_7_days} in last 7d`} />
                    <StatCard label="Active (30d)" value={stats.active_last_30_days} hint={`${stats.active_last_7_days} in last 7d`} />
                    <LevelBreakdownCard byLevel={stats.by_level} />
                </div>
            )}

            {/* Filters */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by name or email…"
                    className="w-full rounded-lg border border-white/10 bg-[#0a1628] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500 sm:max-w-xs"
                />
                <select
                    value={level ? "LEARNER" : role}
                    disabled={level !== ""}
                    title={level !== "" ? "Level filter applies to learners only" : undefined}
                    onChange={(e) => { setRole(e.target.value as Role | ""); setPage(1); }}
                    className="rounded-lg border border-white/10 bg-[#0a1628] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">All roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="LEARNER">Learner</option>
                </select>
                <select
                    value={level}
                    onChange={(e) => { setLevel(e.target.value as EstimatedLevel | ""); setPage(1); }}
                    className="rounded-lg border border-white/10 bg-[#0a1628] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                    <option value="">All levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
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
                            <th className="px-4 py-3 font-medium">User</th>
                            <th className="px-4 py-3 font-medium">Level</th>
                            <th className="px-4 py-3 font-medium">Role</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Last login</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {loading ? (
                            <tr><td colSpan={6} className="px-4 py-10 text-center text-white/40">Loading…</td></tr>
                        ) : !data || data.items.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-10 text-center text-white/40">No users found.</td></tr>
                        ) : (
                            data.items.map((u) => {
                                const isSelf = currentUser?.id === u.id;
                                return (
                                    <tr key={u.id} className="text-white/90 transition-colors hover:bg-white/[0.03]">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-white">
                                                {u.first_name} {u.last_name}
                                                {isSelf && <span className="ml-2 text-xs text-white/40">(you)</span>}
                                            </div>
                                            <div className="text-xs text-white/40">{u.email}</div>
                                        </td>
                                        <td className="px-4 py-3 capitalize text-white/60">
                                            {u.role === "ADMIN" ? <span className="text-white/30">—</span> : u.estimated_level}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge tone={u.role === "ADMIN" ? "teal" : "slate"}>{u.role}</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            {u.is_active
                                                ? <Badge tone="green">Enabled</Badge>
                                                : <Badge tone="red">Disabled</Badge>}
                                        </td>
                                        <td className="px-4 py-3 text-white/50">{formatDate(u.last_login_at)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {u.role === "ADMIN" && !isSelf && (
                                                    <button
                                                        onClick={() => setPending({ type: "role", user: u, nextRole: "LEARNER" })}
                                                        title="Demote to learner"
                                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/60 transition-colors hover:bg-white/5"
                                                    >
                                                        <ShieldOff size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setPending({ type: "deactivate", user: u })}
                                                    disabled={isSelf || !u.is_active}
                                                    title={isSelf ? "You can't deactivate yourself" : !u.is_active ? "Already inactive" : "Deactivate"}
                                                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30"
                                                >
                                                    <UserX size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {data && data.total_pages > 1 && (
                <Pagination currentPage={data.page} totalPages={data.total_pages} onPageChange={setPage} />
            )}

            <Modal
                isOpen={pending !== null}
                onClose={() => setPending(null)}
                title={pending?.type === "deactivate" ? "Deactivate user?" : "Change role?"}
                message={confirmMessage}
                variant="warning"
                confirmText={pending?.type === "deactivate" ? "Deactivate" : "Confirm"}
                confirmTone={pending?.type === "deactivate" ? "danger" : "primary"}
                cancelRequired
                closeOnConfirm={false}
                onConfirm={handleConfirm}
            />

            <Modal
                isOpen={toast !== null}
                onClose={() => setToast(null)}
                message={toast ?? ""}
                variant="info"
            />
        </div>
    );
}

export default AdminUsersPage;
