import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { captionApi } from "../api/caption"
import { vocabApi } from "../api/vocab_context"
import { getVideoMetaDataApi } from "../api/youtubeUrlSubmission"
import type { Caption } from "../components/videoPlayer/CaptionBar"
import CaptionBar from "../components/videoPlayer/CaptionBar"
import LookupPanel, { type LookupResult } from "../components/videoPlayer/LookUpPanel"
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
    const [ selectedToken, setSelectedToken ] = useState(null)
    const  isMobile =useMediaQuery("(max-width: 768px)")
    const [videoMetaData, setVideoMetaData] = useState<VideoMetadata | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [captions, setCaptions] = useState<Caption[]>([])
    const [clickedTimestamp, setClickTimestamp] = useState<number>(0)
    const [lookupResult,  setLookupResult]  = useState<LookupResult | null>(null)
    const [isLookupLoading, setIsLookupLoading] = useState(false)
    const [isSaved,       setIsSaved]       = useState(false)
    const [isLookupOpen, setIsLookupOpen] = useState(false)
    
async function handleSave() {
    if (!lookupResult || isSaved) return
    // await api.post("/vocabulary/save", {
    //     vocab_id:    lookupResult.vocab_id,
    //     sentence_id: lookupResult.sentence_id,
    //     video_id:    videoId,
    // })
    setIsSaved(true)
}
    
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

        captionApi.get(videoId).then(response => {
            console.log(response.data)
            setCaptions(response.data)
        }
        )

    }, [videoId])

    useEffect(() => {
        if (!selectedToken || clickedTimestamp==null || !videoId) { return }
        
        setIsLookupLoading(true)
        setIsLookupOpen(true)
        setIsSaved(false)

        vocabApi.getVocabAndContextSentence(selectedToken, videoId, clickedTimestamp)
            .then(response => {
                console.log(response.data)
                setLookupResult(response.data)
            }).catch(e => console.log(e))
            .finally(() => {
            setIsLookupLoading(false)
        })

    },[selectedToken,clickedTimestamp,videoId])
    
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
                        <CaptionBar
    captions={captions}
    currentTime={currentTime}
    // onWordClick={(token, timestamp) => {
    //     setSelectedToken(token)
    //     setClickTimestamp(timestamp)
                            // }}
                            
    onWordClick={(token, timestamp) => {
        setSelectedToken(token)    
        setClickTimestamp(timestamp)
    }}
/>
                    </div>

                </div>

                <div className="right w-full md:basis-[30%] md:max-w-[30%]  min-h-0 flex flex-col ">
                    {!isMobile  && (
                        <div className=" flex-1 border-l min-h-0 border-white/10 overflow-y-auto  scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-black">
                            {/* <LookupPanel
                                token={selectedToken}
                                onClose={() => setIsLookupOpen(false)}
                            /> */}
                            <div className="p-6">
<LookupPanel
                                result={lookupResult}
                                isLoading={isLookupLoading}
                                isSaved={isSaved}
                                onSave={handleSave}
                                onExplain={() => { /* implement next */ }}
                                onClose={() => setIsLookupOpen(false)}
                            />
                            </div>
                            
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