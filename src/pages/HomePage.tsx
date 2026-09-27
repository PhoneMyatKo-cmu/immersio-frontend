import { useEffect, useState } from 'react';
import { getFeedVideos, getRecommendations, getVideosByDifficulty } from '../api/video';
import { useAuth } from '../authContext';
import { BrandLogo } from '../components/common/BrandLogo';
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
            try {
                const data = difficultyFilter
                    ? await getVideosByDifficulty(difficultyFilter, searchQuery, page, VIDEOS_PER_PAGE)
                    : await getFeedVideos(searchQuery, page, VIDEOS_PER_PAGE);

                // Guard against non-array responses (e.g. index.html when the API is unreachable)
                const [videos, total_pages] = Array.isArray(data) ? data : [[], 0];
                setVideos(Array.isArray(videos) ? videos : []);
                setTotalPages(typeof total_pages === 'number' ? total_pages : 0);
            } catch (error) {
                console.error('Failed to load feed:', error);
                setVideos([]);
                setTotalPages(0);
            }
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
const sections = data.is_cold_start
    ? data.sections.map((s) => ({
        ...s,
        // Cold start: the backend's ranking isn't personalized yet, so surface the
        // videos the learner is most likely to already understand first.
        items: [...s.items].sort(
            (a, b) => (b.may_know_percent ?? 0) - (a.may_know_percent ?? 0),
        ),
    }))
    : data.sections;
                setRecSections(sections);
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
        <div className="bg-[#0a1628] h-screen flex flex-col p-4 pb-20 md:pb-4 md:mx-6 text-white overflow-y-auto">
            {/* Mobile has no sidebar, so the brand mark lives in the feed header there */}
            <div className='mb-6 flex items-center gap-3'>
                <BrandLogo size={28} className='md:hidden' />
                <h1 className='text-3xl text-start font-bold'>Feed</h1>
            </div>

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
                        {recLoading || !recFetched ? (
                            <div className="mt-6 flex justify-center py-12">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-teal-500" />
                            </div>
                        ) : (
                            <RecommendedFeed
                                sections={recSections}
                                isColdStart={recColdStart}
                                isAuthenticated={isAuthenticated}
                                level={level}
                            />
                        )}
                    </>
            )}
        </div>
    )
}

export default HomePage
