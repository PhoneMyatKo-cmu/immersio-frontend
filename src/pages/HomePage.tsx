import { useEffect, useState } from 'react';
import { getFeedVideos, getVideosByDifficulty } from '../api/video';
import { Pagination } from '../components/common/Pagination';
import { SearchBar } from '../components/common/SearchBar';
import { Feed } from '../components/home/Feed';
import type { Video } from '../types/user';

function HomePage() {
    
    const [videos, setVideos] = useState<Video[]>([]);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const VIDEOS_PER_PAGE = 6;

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

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
    };

    const handleFilter = async (level: string) => {
        setDifficultyFilter(level);
    }
    
    return (
        <div className="bg-[#0a1628] h-screen flex flex-col p-4 mx-6 text-white">
            <h1 className='text-3xl text-start w-full font-bold mb-8'>Your Feed</h1>
            <SearchBar onSearch={handleSearch} />
            <div className='flex flex-row gap-2 mt-4'>
                <button
                    className={`rounded-2xl m-2 px-2 py-1 ${!difficultyFilter ? 'bg-teal-600 text-white' : 'bg-teal-800/70 text-teal-500 hover:bg-teal-700/50'}`}
                    onClick={() => handleFilter('')}
                >All Levels</button>
                <button
                    className={`rounded-2xl m-2 px-2 py-1 ${difficultyFilter === 'beginner' ? 'bg-teal-600 text-white' : 'bg-teal-800/70 text-teal-500 hover:bg-teal-700/50'}`}
                    onClick={() => handleFilter('beginner')}
                >Beginner</button>
                <button
                    className={`rounded-2xl m-2 px-2 py-1 ${difficultyFilter === 'intermediate' ? 'bg-teal-600 text-white' : 'bg-teal-800/70 text-teal-500 hover:bg-teal-700/50'}`}
                    onClick={() => handleFilter('intermediate')}
                >Intermediate</button>
                <button
                    className={`rounded-2xl m-2 px-2 py-1 ${difficultyFilter === 'advanced' ? 'bg-teal-600 text-white' : 'bg-teal-800/70 text-teal-500 hover:bg-teal-700/50'}`}
                    onClick={() => handleFilter('advanced')}
                >Advanced</button>
            </div>
            <Feed videos={videos} searchQuery={searchQuery} difficultyFilter={difficultyFilter} />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    )

}

export default HomePage