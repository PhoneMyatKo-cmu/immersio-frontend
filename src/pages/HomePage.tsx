import { useEffect, useState } from 'react';
import { getFeedVideos, getRecommendations, getVideosByDifficulty } from '../api/video';
import { useAuth } from '../authContext';
import { Pagination } from '../components/common/Pagination';
import { SearchBar } from '../components/common/SearchBar';
import Tab from '../components/common/Tab';
import { Feed } from '../components/home/Feed';
import { RecommendedFeed } from '../components/home/RecommendedFeed';
import type { RecommendationSection } from '../types/recommendation';
import { EstimatedLevelValues, type EstimatedLevel, type Video } from '../types/user';

type HomeTab = 'feed' | 'recommended';

const TABS = [
    { id: 'feed', title: 'Explore' },
    { id: 'recommended', title: 'Recommended for You' },
];

function HomePage() {
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<HomeTab>('feed');

    // --- Your Feed ---
    const [videos, setVideos] = useState<Video[]>([]);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const VIDEOS_PER_PAGE = 6;

    // --- Recommended for You (sectioned, Netflix-style feed) ---
    const [recSections, setRecSections] = useState<RecommendationSection[]>([]);
    const [recColdStart, setRecColdStart] = useState(false);
    const [recLoading, setRecLoading] = useState(false);
    // Distinguishes "haven't fetched yet" from "fetched and got an empty feed",
    // so we can show a spinner until real data arrives instead of a stale empty state.
    const [recFetched, setRecFetched] = useState(false);
    const [level, setLevel] = useState<EstimatedLevel>(
        user?.estimated_level ?? EstimatedLevelValues.Beginner,
    );

    useEffect(() => {
        if (user?.estimated_level) setLevel(user.estimated_level);
    }, [user]);

    useEffect(() => {
        const fetchFeedVideos = async () => {
            let videos: Video[] = [];
            let total_pages = 0;

            if (difficultyFilter) {
                [videos, total_pages] = await getVideosByDifficulty(difficultyFilter, searchQuery, page, VIDEOS_PER_PAGE);
            } else {
                [videos, total_pages] = await getFeedVideos(searchQuery, page, VIDEOS_PER_PAGE);
            }

            setVideos(videos);
            setTotalPages(total_pages);
        };

        fetchFeedVideos();
    }, [page, searchQuery, difficultyFilter]);

    useEffect(() => {
        console.log('[rec] effect run — activeTab:', activeTab,
            '| isAuthenticated:', isAuthenticated,
            '| hasToken:', !!localStorage.getItem('accessToken'));
        if (activeTab !== 'recommended') return;
        let cancelled = false;
        const fetchRecommendations = async () => {
            console.log('[rec] → GET /video/recommendation');
            setRecLoading(true);
            try {
                const data = await getRecommendations();
                if (cancelled) return;
                console.log('[rec] ✓ success — sections:', data.sections?.length, '| cold:', data.is_cold_start);
                setRecSections(data.sections);
                setRecColdStart(data.is_cold_start);
                // Keep the header chip in sync with the level the backend scored against.
                if (data.user_level) setLevel(data.user_level);
            } catch (error) {
                if (cancelled) return;
                const status = (error as { response?: { status?: number } })?.response?.status;
                const message = (error as { message?: string })?.message;
                console.error('[rec] ✗ failed — status:', status, '| message:', message);
                setRecSections([]);
                setRecColdStart(false);
            } finally {
                if (!cancelled) {
                    setRecLoading(false);
                    setRecFetched(true);
                }
            }
        };
        fetchRecommendations();
        return () => {
            cancelled = true;
        };
    }, [activeTab, isAuthenticated]);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
    };

    return (
        <div className="bg-[#0a1628] h-screen flex flex-col p-4 mx-6 text-white overflow-y-auto">
            <h1 className='text-3xl text-start w-full font-bold mb-6'>Feed</h1>

            <Tab
                titles={TABS}
                activeTab={activeTab}
                onClick={(id) => { console.log('[rec] tab clicked:', id); setActiveTab(id as HomeTab); }}
                className="max-w-md"
            />

            {activeTab === 'feed' ? (
                <>
                    <SearchBar onSearch={handleSearch} />
                    <Feed videos={videos} searchQuery={searchQuery} difficultyFilter={difficultyFilter} />
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </>
            ) : (
                    <>
                        {/* Not necessary for now */}
                    {/* <div className="mb-2">
                        <LevelChip level={level} />
                    </div> */}
                    {recLoading || !recFetched ? (
                        <div className="mt-6 flex justify-center py-12">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-teal-500" />
                        </div>
                    ) : (
                        <RecommendedFeed sections={recSections} isColdStart={recColdStart} isAuthenticated={isAuthenticated} />
                    )}
                </>
            )}
        </div>
    )
}

export default HomePage
