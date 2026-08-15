import { Check, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { updateProfile } from "../../api/auth";
import { EstimatedLevelValues, type EstimatedLevel } from "../../types/user";

const levelLabels: Record<EstimatedLevel, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
};

interface LevelChipProps {
    level: EstimatedLevel;
    // Called after a successful profile update so the parent can refetch recommendations.
    onLevelChange: (level: EstimatedLevel) => void;
}

export function LevelChip({ level, onLevelChange }: LevelChipProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState<EstimatedLevel>(level);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        setError(false);
        try {
            const updated = await updateProfile({ estimated_level: draft });
            localStorage.setItem("user", JSON.stringify(updated));
            setIsEditing(false);
            onLevelChange(draft);
        } catch {
            setError(true);
        } finally {
            setSaving(false);
        }
    };

    if (!isEditing) {
        return (
            <button
                type="button"
                onClick={() => {
                    setDraft(level);
                    setIsEditing(true);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-teal-500/15 px-3 py-1.5 text-sm text-teal-300 transition hover:bg-teal-500/25"
            >
                <Sparkles size={14} />
                Recommendations tuned for: <span className="font-semibold">{levelLabels[level]}</span>
                <span className="text-teal-400/70 underline underline-offset-2">edit</span>
            </button>
        );
    }

    return (
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm">
            <select
                title="Estimated level"
                value={draft}
                onChange={(e) => setDraft(e.target.value as EstimatedLevel)}
                disabled={saving}
                className="rounded-md bg-[#1a2330] px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
                <option value={EstimatedLevelValues.Beginner}>Beginner</option>
                <option value={EstimatedLevelValues.Intermediate}>Intermediate</option>
                <option value={EstimatedLevelValues.Advanced}>Advanced</option>
            </select>
            <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                title="Save level"
                className="rounded-full p-1 text-green-400 hover:bg-green-500/15 disabled:opacity-50"
            >
                <Check size={16} />
            </button>
            <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={saving}
                title="Cancel"
                className="rounded-full p-1 text-white/50 hover:bg-white/10 disabled:opacity-50"
            >
                <X size={16} />
            </button>
            {error && <span className="text-xs text-red-400">Failed to update</span>}
        </div>
    );
}
