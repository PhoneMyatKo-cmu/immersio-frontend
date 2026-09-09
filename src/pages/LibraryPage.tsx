import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userVocabApi } from "../api/user_vocab";
import { useAuth } from "../authContext";
import { Modal } from "../components/common/Modal";
import Tab from "../components/common/Tab";
import { VocabList } from "../components/library/VocabList";
import type { SavedVocab, Vocab } from "../types/vocab";

const TABS = [
    { title: "Saved", id: "vocab_saved" },
    { title: "Seen", id: "vocab_seen" },
    { title: "Known", id: "vocab_known" },
];

const EMPTY_MESSAGES: Record<string, string> = {
    vocab_saved: "No saved words yet — tap the bookmark on words while watching to save them.",
    vocab_seen: "No words seen yet — start watching to build your vocabulary.",
    vocab_known: "No known words yet — words you've mastered will show up here.",
};

function LibraryPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState(TABS[0].id);
    const [vocabSeenData, setVocabSeenData] = useState<Vocab[] | null>(null);
    const [vocabKnownData, setVocabKnownData] = useState<Vocab[] | null>(null);
    const [savedVocabData, setSavedVocabData] = useState<SavedVocab[] | null>(null);
    const [removeTarget, setRemoveTarget] = useState<number | null>(null);

    const handleRemoveSaved = (vocabId: number) => {
        if (!user) return;
        userVocabApi.removeSavedVocab(user.id, vocabId).then(() => {
            setSavedVocabData((prev) => prev && prev.filter((vocab) => vocab.vocab_id !== vocabId));
        }).catch((error) => {
            console.error("Error removing saved vocab:", error);
        });
    };

    useEffect(() => {
        if (!user) return;
        userVocabApi.get(user.id).then((response) => {
            const data = response.data;
            setVocabSeenData(data.filter((item: any) => item.status === 'SEEN')); // eslint-disable-line @typescript-eslint/no-explicit-any
            setVocabKnownData(data.filter((item: any) => item.status === 'KNOW')); // eslint-disable-line @typescript-eslint/no-explicit-any
        }).catch((error) => {
            console.error("Error fetching user vocab data:", error);
        });

        userVocabApi.getSavedVocab(user.id).then((response) => {
            setSavedVocabData(response.data['saved_vocab']);
        }).catch((error) => {
            console.error("Error fetching saved vocab data:", error);
        });
    }, [user]);

    if (loading) {
        return null;
    }

    if (!isAuthenticated) {
        return (
            <Modal
                isOpen={true}
                onClose={() => navigate("/")}
                message="Log in to access this feature."
                title="Log In Required!"
                confirmText="Log In"
                onConfirm={() => navigate("/login")}
                closeOnConfirm={false}
            />
        );
    }

    const counts: Record<string, number | undefined> = {
        vocab_saved: savedVocabData?.length,
        vocab_seen: vocabSeenData?.length,
        vocab_known: vocabKnownData?.length,
    };
    const tabTitles = TABS.map((t) => ({
        id: t.id,
        title: counts[t.id] != null ? `${t.title} (${counts[t.id]})` : t.title,
    }));

    const removeWord = savedVocabData?.find((v) => v.vocab_id === removeTarget);

    return (
        <div className="min-h-screen w-full p-4 md:p-6">
            <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-white/5 bg-[#0a1628]/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
                <h1 className="mb-3 text-2xl font-bold text-white">Vocabulary Library</h1>
                <Tab className="max-w-md" titles={tabTitles} activeTab={activeTab} onClick={setActiveTab} />
            </div>

            {activeTab === "vocab_saved" && savedVocabData && (
                <VocabList
                    vocabItems={savedVocabData}
                    showRemove
                    onRemove={(id) => setRemoveTarget(id)}
                    emptyMessage={EMPTY_MESSAGES.vocab_saved}
                />
            )}
            {activeTab === "vocab_seen" && vocabSeenData && (
                <VocabList vocabItems={vocabSeenData} emptyMessage={EMPTY_MESSAGES.vocab_seen} />
            )}
            {activeTab === "vocab_known" && vocabKnownData && (
                <VocabList vocabItems={vocabKnownData} emptyMessage={EMPTY_MESSAGES.vocab_known} />
            )}

            <Modal
                isOpen={removeTarget !== null}
                onClose={() => setRemoveTarget(null)}
                title="Remove word?"
                message={
                    removeWord
                        ? `Remove "${removeWord.japanese_form}" from your saved words?`
                        : "Remove this word from your saved words?"
                }
                variant="warning"
                confirmText="Remove"
                confirmTone="danger"
                cancelRequired
                closeOnConfirm={false}
                onConfirm={() => {
                    if (removeTarget !== null) handleRemoveSaved(removeTarget);
                    setRemoveTarget(null);
                }}
            />
        </div>
    );
}

export default LibraryPage;
