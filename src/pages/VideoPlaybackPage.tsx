import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getVideoMetaDataApi } from "../api/youtubeUrlSubmission"
import VideoPlayer from "../components/videoPlayer/VideoPlayer"
import { useMediaQuery } from "../hooks/useMediaQuery"


export interface VideoMetadata {
  channel_name: string;
  duration_seconds: number;
  thumbnail_url: string;
  title: string;
  youtube_video_id: string;
}

function VideoPlaybackPage() {
    
    const { videoId } = useParams()
    const [currentTime, setCurrentTime] = useState(0)
    const [ isLookupOpen, setLookupOpen ] = useState(false)
    const [ selectedToken, setSelectedToken ] = useState(null)
    const  isMobile =useMediaQuery("(max-width: 768px)")
    const [videoMetaData, setVideoMetaData] = useState<VideoMetadata | null>(null)
    const[isLoading,setIsLoading]=useState<boolean>(true)

    useEffect(() => {
        if (!videoId) {
            alert("No video Id.")
            return
        }

        getVideoMetaDataApi.get(videoId).then(response => {
            console.log(response.data)
            
            setVideoMetaData(response.data)
        }).catch(e => {
            console.log(e)
        }).finally(() => {
            console.log("Done")
            setIsLoading(false)
        })

    }, [videoId])
    
    if (isLoading) {
        return <>
            <h1>Is Still Loading</h1>
        </>
    }
    else {

        return <>
    
            <div className="flex flex-col md:flex-row h-screen overflow-hidden" >

                <div className="left  flex-col min-h-0 p-10 w-full md:basis-[70%] md:max-w-[70%] ">
                    <div className="w-full bg-black">
                        <VideoPlayer
                            videoId={videoMetaData.youtube_video_id}
                            onTimeUpdate={setCurrentTime}
                            onReady={() => console.log("Player ready")}
                        />
                    </div>
                    <div>
                        {/* {CaptionBar} */}
                    </div>

                </div>

                <div className="right w-full md:basis-[30%] md:max-w-[30%]">
                    {!isMobile  && (
                        <div className="w-80 xl:w-96 border-l border-white/10 overflow-y-auto">
                            {/* <LookupPanel
                                token={selectedToken}
                                onClose={() => setIsLookupOpen(false)}
                            /> */}
                            Something
                        </div>
                    )}
                </div>
                {/* Mobile: bottom sheet */}
                {isMobile && false
                    // (
                    // <BottomSheet
                    //     isOpen={isLookupOpen}
                    //     onClose={() => setIsLookupOpen(false)}
                    // >
                    //     <LookupPanel
                    //         token={selectedToken}
                    //         onClose={() => setIsLookupOpen(false)}
                    //     />
                    // </BottomSheet>
                    //    )
                }
 
            </div>
   
        </>
    }
}

export default VideoPlaybackPage