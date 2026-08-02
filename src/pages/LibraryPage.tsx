import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userVocabApi } from "../api/user_vocab";
import { useAuth } from "../authContext";
import { Modal } from "../components/common/Modal";
import Tab from "../components/common/Tab";
import { VocabList } from "../components/library/VocabList";
import type { SavedVocab, Vocab } from "../types/vocab";

function LibraryPage() {

    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    const tabs = [
        { title: 'Saved', id: 'vocab_saved', 'headers': {'Word': 'japanese_form', 'Definition': 'meanings', 'SRS State': 'srs_state', 'Next Review': 'next_review_date'}},
        { title: 'Seen', id: 'vocab_seen', 'headers': {'Word': 'japanese_form', 'Definition': 'meanings'}},
        { title: 'Known', id: 'vocab_known', 'headers': {'Word': 'japanese_form', 'Definition': 'meanings'}},
    ]
    const [activeTab, setActiveTab] = useState(tabs[0].id);
    const [vocabSeenData, setVocabSeenData] = useState<Vocab[] | null>(null);
    const [vocabKnownData, setVocabKnownData] = useState<Vocab[] | null>(null);
    const [savedVocabData, setSavedVocabData] = useState<SavedVocab[] | null>(null);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
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
        return         <>
            <Modal
                isOpen={true}
                onClose={() => navigate("/")}
                message="Log in to access this feature."
                title="Log In Required!"
                confirmText="Log In"
                onConfirm={() => {
                    navigate("/login")
                }}
                closeOnConfirm={false}
            />
        </>
    }
    console.log("Saved Vocab Data:", savedVocabData);
    return (
        <div className="p-4 flex flex-col items-center justify-start min-h-screen w-full">
            <div className="sticky top-0 z-100 h-25 p-4 bg-darkgrey rounded-lg shadow-md w-full">
                <h1 className=" sm:text-lg md:text-xl text-2xl font-bold mb-4 text-white">Vocabulary Library</h1>
                <Tab className="flex w-full" titles={tabs} activeTab={activeTab} onClick={handleTabChange} />
                
            </div>
            {activeTab === 'vocab_saved' && savedVocabData && <VocabList vocabItems={savedVocabData} headers={tabs[0].headers} />}
            {activeTab === 'vocab_seen' && vocabSeenData && <VocabList vocabItems={vocabSeenData} headers={tabs[1].headers} />}
            {activeTab === 'vocab_known' && vocabKnownData && <VocabList vocabItems={vocabKnownData} headers={tabs[2].headers} />}
        </div>
    );
}

export default LibraryPage;