export function StatCard({
    label,
    value,
    hint,
}: {
    label: string;
    value: string | number;
    hint?: string;
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-[#0a1628] p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-white/40">
                {label}
            </div>
            <div className="mt-1 text-2xl font-bold text-white">{value}</div>
            {hint && <div className="mt-1 text-xs text-white/40">{hint}</div>}
        </div>
    );
}
