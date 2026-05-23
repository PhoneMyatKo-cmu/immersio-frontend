import { SearchBar } from '../components/common/SearchBar'
import { Feed } from '../components/home/Feed'

function HomePage() {
    
    return (
        <div className="bg-[#0a1628] h-screen flex flex-col p-4 mx-6 text-white">
            <h1 className='text-3xl text-start w-full font-bold mb-8'>Your Feed</h1>
            <SearchBar />
            <Feed />
        </div>
    )

}

export default HomePage