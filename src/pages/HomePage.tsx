import { useEffect, useState } from 'react';
import { getFeedVideos, getVideosByDifficulty } from '../api/video';
import { SearchBar } from '../components/common/SearchBar';
import { Feed } from '../components/home/Feed';
import type { Video } from '../types/user';

function HomePage() {
    
    const [videos, setVideos] = useState<Video[]>([]);

    useEffect(() => {
        const fetchFeedVideos = async () => {
            const videos = await getFeedVideos();
            setVideos(videos);
        };

        fetchFeedVideos();
    }, []);

    const handleSearch = async (query: string) => {
        const videos = await getFeedVideos(query);
        setVideos(videos);
    };

    const handleFilter = async (level: string) => {
        const videos = await getVideosByDifficulty(level);
        setVideos(videos);
    }
    
    return (
        <div className="bg-[#0a1628] h-screen flex flex-col p-4 mx-6 text-white">
            <h1 className='text-3xl text-start w-full font-bold mb-8'>Your Feed</h1>
            <SearchBar onSearch={handleSearch} />
            <div className='flex flex-row gap-2 mt-4'>
                <button className='rounded-2xl m-2 px-2 py-1 bg-teal-800 text-white hover:bg-teal-600' onClick={() => handleFilter('beginner')}>Beginner</button>
                <button className='rounded-2xl m-2 px-2 py-1 bg-teal-800 text-white hover:bg-teal-600' onClick={() => handleFilter('intermediate')}>Intermediate</button>
                <button className='rounded-2xl m-2 px-2 py-1 bg-teal-800 text-white hover:bg-teal-600' onClick={() => handleFilter('advanced')}>Advanced</button>
            </div>
            <Feed videos={videos} />

        </div>
    )

}

export default HomePage