import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { captionApi } from "../api/caption"
import { vocabApi } from "../api/vocab_context"
import BottomSheet from "../components/videoPlayer/BottomSheet"
import type { Caption } from "../components/videoPlayer/CaptionBar"
import CaptionBar from "../components/videoPlayer/CaptionBar"
import LookupPanel, { type LookupResult } from "../components/videoPlayer/LookUpPanel"
import ShadowingFeedbackPanel from "../components/videoPlayer/PronuciationFeedbackPanel"
import ShadowingControls from "../components/videoPlayer/ShadowingControls"
import ShadowingRecorder from "../components/videoPlayer/ShadowingRecorder"
import VideoPlayer, { type VideoPlayerHandle } from "../components/videoPlayer/VideoPlayer"
import { useMediaQuery } from "../hooks/useMediaQuery"


// temp
import { shadowingApi } from "../api/shadowing"
import { sentenceApi } from "../api/shadowingSentence"
import { getVideoMetaDataApi } from "../api/video"
import ShadowingProcessing from "../components/videoPlayer/ShadowingProcessing"
import type { ShadowingSentence } from "../types/shadowing"

export interface VideoMetadata {
  channel_name: string;
  duration_seconds: number;
  thumbnail_url: string;
  title: string;
  youtube_video_id: string;
}

type PlaybackMode = "lookup" | "shadowing"

function getCurrentCaptionIndex(captions: Caption[], currentTime: number): number | null {
    if (!captions.length || !Number.isFinite(currentTime)) return null

    for (let i = 0; i < captions.length; i++) {
        if (currentTime >= captions[i].start_time && currentTime < captions[i].end_time) {
            return i
        }
    }

    for (let i = 0; i < captions.length; i++) {
        if (captions[i].start_time > currentTime) {
            return Math.max(0, i - 1)
        }
    }

    return captions.length - 1
}

function VideoPlaybackPage() {
    
    const  videoId  = Number(useParams().videoId)
    const [currentTime, setCurrentTime] = useState(0)
    const [ selectedToken, setSelectedToken ] = useState(null)
    const  isMobile =useMediaQuery("(max-width: 768px)")
    const [videoMetaData, setVideoMetaData] = useState<VideoMetadata | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [captions, setCaptions] = useState<Caption[]>([])
    const [clickedTimestamp, setClickTimestamp] = useState<number>(0)
    const [lookupResult,  setLookupResult]  = useState<LookupResult | null>(null)
    const [isLookupLoading, setIsLookupLoading] = useState(false)
    const [isLookupOpen, setIsLookupOpen] = useState(false)
    const [mode, setMode] = useState<PlaybackMode>("lookup")
    const [isVideoPlaying, setIsVideoPlaying] = useState(false)
    const [currentShadowingIndex, setCurrentShadowingIndex] = useState(0)
    const [pausedAtIndex, setPausedAtIndex] = useState<number | null>(null)
    const videoPlayerRef = useRef<VideoPlayerHandle | null>(null)
    const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false)
    const [feedbackResult, setFeedbackResult] = useState(null)
    const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false)
    const [sentences, setSentences] = useState<ShadowingSentence[]>([])
    const [isShadowingReady, setIsShadowingReady] = useState<boolean>(false)
    const [selectedCaption,setSelectedCaption]=useState<Caption | null>(null)


    const sortedCaptions = useMemo(
        () => [...captions].sort((a, b) => a.start_time - b.start_time),
        [captions]
    )

    const sortedSentences = useMemo(
        () => [...sentences].sort((a, b) => a.start_time - b.start_time),
        [sentences]
    )

    const currentCaptionIndex = useMemo(
        () => getCurrentCaptionIndex(sortedCaptions, currentTime),
        [sortedCaptions, currentTime]
    )

    // In shadowing mode, use explicit index tracking
    const currentSentence = sortedSentences[currentShadowingIndex]

    // In lookup mode, use time-based caption
    const currentCaption = currentCaptionIndex === null
        ? null
        : sortedCaptions[currentCaptionIndex] ?? null

    function seekToCaption(index: number) {
        const caption = sortedCaptions[index]
        if (!caption) return
        videoPlayerRef.current?.seekTo(caption.start_time)
    }

    function seekToSentence(index: number) {
        const sentence = sortedSentences[index]
        if (!sentence) return
        videoPlayerRef.current?.seekTo(sentence.start_time)
    }

    function handlePlayPause() {
        const sentence = sortedSentences[currentShadowingIndex]
        // If we're at or past the end of current sentence, seek to start before playing
        if (sentence && currentTime >= sentence.end_time ) {
            videoPlayerRef.current?.seekTo(sentence.start_time)
            videoPlayerRef.current?.play()
        } else {
            videoPlayerRef.current?.togglePlay()
        }
    }

    function handlePreviousSentence() {
        const prevIndex = Math.max(0, currentShadowingIndex - 1)
        setFeedbackResult(null)
        setCurrentShadowingIndex(prevIndex)
        seekToSentence(prevIndex)
    }

    function handleNextSentence() {
        const nextIndex = Math.min(sortedSentences.length - 1, currentShadowingIndex + 1)
        setFeedbackResult(null)
        setCurrentShadowingIndex(nextIndex)
        seekToSentence(nextIndex)
    }

    // Initialize shadowing mode: start at index 0 and seek
    useEffect(() => {
        if (mode === "shadowing" && sortedSentences.length > 0) {
            setCurrentShadowingIndex(0)
            setPausedAtIndex(null)
            seekToSentence(0)
        }
    }, [mode])

    // Auto-pause at end of current sentence in shadowing mode
    useEffect(() => {
    if (mode !== "shadowing") return
    const sentence = sortedSentences[currentShadowingIndex]
    if (!sentence) return

    // Playhead is back inside this sentence → the seek landed, re-arm the guard.
    if (currentTime < sentence.end_time) {
        if (pausedAtIndex === currentShadowingIndex) setPausedAtIndex(null)
        return
    }

    // Reached the end while playing → pause once.
    if (
        isVideoPlaying &&
        pausedAtIndex !== currentShadowingIndex &&
        currentTime >= sentence.end_time
    ) {
        videoPlayerRef.current?.pause()
        setPausedAtIndex(currentShadowingIndex)
    }
}, [currentTime, currentShadowingIndex, sortedSentences, mode, isVideoPlaying, pausedAtIndex])
    useEffect(() => {
        if (!videoId) {
            alert("No video Id.")//implement Error component
            return
        }

        getVideoMetaDataApi.get(videoId).then(response => {
            console.log(response.data)
            
            setVideoMetaData(response.data)
        }).catch(e => {
            // implement Error componenet
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
        sentenceApi.get(videoId).then(response => {
            console.log(response.data)
            setSentences(response.data)
        }
        )

    }, [videoId])

    useEffect(() => {
        if (!selectedToken || clickedTimestamp==null || !videoId) { return }
        
        setIsLookupLoading(true)
        setIsLookupOpen(true)

        vocabApi.getVocabAndContextSentence(selectedToken, videoId, selectedCaption.id,selectedCaption?.text)
            .then(response => {
                console.log(response.data)
                setLookupResult(response.data)
            }).catch(e => console.log(e))
            .finally(() => {
            setIsLookupLoading(false)
        })

    }, [selectedToken, clickedTimestamp, videoId,selectedCaption])
    
    useEffect(() => {
        shadowingApi.getShadowingStatus(videoId).then(res => {
            setIsShadowingReady(res.data.is_shadowing_ready)
        })
sentenceApi.get(videoId).then(response => {
            console.log(response.data)
            setSentences(response.data)
}
)
    },[mode,videoId])
    
    if (isLoading) {
        return <>
            <h1>Is Still Loading</h1>
        </>
    }
    else {

        return <>
    
            <div className="flex flex-col md:flex-row h-screen overflow-hidden" >

                <div className="left  flex-col min-h-0 p-10 w-full md:basis-[70%] md:max-w-[70%] ">
                    <div className="mb-4 inline-flex rounded-lg border border-white/10 bg-darkgrey p-1 text-sm">
                        <button
                            type="button"
                            onClick={() => setMode("lookup")}
                            className={`rounded-md px-3 py-1.5 transition-colors ${
                                mode === "lookup"
                                    ? "bg-teal text-white"
                                    : "text-white/50 hover:text-white"
                            }`}
                        >
                            Lookup
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("shadowing")}
                            className={`rounded-md px-3 py-1.5 transition-colors ${
                                mode === "shadowing"
                                    ? "bg-teal text-white"
                                    : "text-white/50 hover:text-white"
                            }`}
                        >
                            Shadowing
                        </button>
                    </div>
                    
                    <div className={`w-full bg-black ${mode === "shadowing" ? "max-w-2xl mx-auto" : ""} `}>
                        <VideoPlayer
                            ref={videoPlayerRef}
                            videoId={videoMetaData!.youtube_video_id}
                            onTimeUpdate={setCurrentTime}
                            onReady={() => console.log("Player ready")}
                            onPlayingChange={setIsVideoPlaying}
                            showControls={mode === "lookup"}
                            enableOverlayClick={mode === "lookup"}
                            disableOverlayClick={mode === "shadowing"}
                        />
                    </div>
                    {mode === "shadowing" && ( isShadowingReady ?
                        <>
                        <ShadowingControls
                            currentSentence={currentSentence}
                            isPlaying={isVideoPlaying}
                            onPlayPause={handlePlayPause}
                            onPreviousSentence={handlePreviousSentence}
                            onNextSentence={handleNextSentence}
                            currentSentenceIndex={currentShadowingIndex}
                            totalSentences={sortedSentences.length}
                        />
<div className="mt-3 flex justify-center">
            <ShadowingRecorder
                captionKey={currentShadowingIndex}
                disabled={isVideoPlaying}
                                    submitRecording={async (audio, meta) => {
                    console.log(`[noise] ${meta.noiseDb?.toFixed(1)} dBFS — noisy=${meta.noisy}`)
                    const form = new FormData()
                    form.append("file", audio, "take.webm")
                    form.append("caption", currentSentence.text)
                    form.append("start_time", (currentSentence.start_time).toString())
                    form.append("end_time",(currentSentence.end_time).toString())
                    form.append("video_id", String(videoMetaData?.youtube_video_id))
                    // return mockFeedbackMid
                    const res = await shadowingApi.sendAudioForScore(form)   // your endpoint
                    return res.data
                }}  
                onScoringStart={() => {
                    setIsFeedbackOpen(true)      // opens the panel / bottom sheet
                    setFeedbackLoading(true)
                }}
                onScoringComplete={(result) => {
                    setFeedbackResult(result)
                    setFeedbackLoading(false)
                }}
                onError={(e) => {
                    setFeedbackLoading(false)
                    console.error(e)
                }}
            />
                            </div>
                        </>
                        :
 <ShadowingProcessing videoId={videoId} onReady={() => setIsShadowingReady(true)} />

                    )}
                    {mode === "lookup" && (
                        <div>
                            <CaptionBar
                                captions={captions}
                                currentTime={currentTime}
                                onWordClick={(token, caption) => {
                                    setIsLookupOpen(true)
                                    setSelectedToken(token)    
                                    setSelectedCaption(caption)
                                    console.log("Selected Caption:",caption)
                                }}
                            />
                        </div>
                    )}

                </div>

                <div className="right w-full md:basis-[30%] md:max-w-[30%]  min-h-0 flex flex-col ">
                    {!isMobile  && (
                        <div className=" flex-1 border-l min-h-0 border-white/10 overflow-y-auto  scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-black">
                           
                            <div className="p-6">
                    {mode === "shadowing" ? (
                        <ShadowingFeedbackPanel
                            result={feedbackResult}
                            isLoading={feedbackLoading}
                        />
                                                    ) :
                                                    (
                            <LookupPanel
                                    result={lookupResult}
                                    isLoading={isLookupLoading}
                                            video_id={videoId}
                                            selectedCaption={selectedCaption}
                                    onExplain={() => { /* implement next */ }}
                                        onClose={() => setIsLookupOpen(false) }
                                />
    
                            )}
                                
                            </div>
                            
                        </div>
                    )}
                </div>
                {/* Mobile: bottom sheet */}
                {isMobile && mode==='lookup' &&
                    (
                    <div className=" flex-1 border-l min-h-0 border-white/10 ">
                         <BottomSheet
                            isOpen={isLookupOpen}
                            onClose={() => setIsLookupOpen(false)}
                             >
                                    <LookupPanel
                                    result={lookupResult}
                                isLoading={isLookupLoading}
                                video_id={videoId}
                                                onExplain={() => { /* implement next */ }}
                                onClose={() => setIsLookupOpen(false)}
                                selectedCaption={selectedCaption}

                                    />
                         </BottomSheet>


                    </div>
                   
                       )
                }
{isMobile && mode==='shadowing' &&
                    (
                    <div className=" flex-1 border-l min-h-0 border-white/10 ">
                         <BottomSheet
                            isOpen={isFeedbackOpen}
                            onClose={() => setIsFeedbackOpen(false)}
                             >
                                    <ShadowingFeedbackPanel
                                    result={feedbackResult}
                                isLoading={feedbackLoading}
                                                    onClose={() => setIsFeedbackOpen(false) }

                                    />
                         </BottomSheet>


                    </div>
                   
                       )
                }
 
            </div>

   
        </>
    }
}

export default VideoPlaybackPage
