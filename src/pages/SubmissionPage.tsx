import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { youtubeUrlSubmissionApi } from "../api/youtubeUrlSubmission";
import { useAuth } from "../authContext";
import { Modal } from "../components/common/Modal";
import Spinner from "../components/common/Spinner";

function SubmissionPage() {
    const [formData, setFormData] = useState({
        youtube_url:"",
    })
    const [loading, setLoading] = useState(false)

    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        message: string;
        variant: 'info' | 'success' | 'warning' | 'error';
        title?: string;
        confirmText?: string;
        onConfirm?: () => void
        cancelRequired?:boolean
    }>({
        isOpen: false,
        message: '',
        variant: 'info',
        
    });
    const navigate = useNavigate()

    const { isAuthenticated }=useAuth()

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }

    function handleSubmit(e) {
        setLoading(true)
        e.preventDefault()

        youtubeUrlSubmissionApi.submit(formData.youtube_url)
            .then(response => {
                console.log(response.data)
               setModalState({
                    isOpen: true,
                    title:  response.data.message.startsWith("Successful")? "Success" : "Duplicate",
                    message: response.data.message,
                   variant: response.data.message.startsWith("Successful") ? "success" : "info",
                   confirmText: "Proceed to playback interface.",
                   onConfirm: () => {
                        navigate("/video/"+response.data.video_id)
                   },
                   cancelRequired:true,
                });
             }
        ).catch(error => {
            const apiMessage = error.response?.data?.detail || 'An unexpected error occurred';
            const status = error.response?.status;
            
            setModalState({
                isOpen: true,
                title: status === 503 ? 'Service Temporarily Unavailable' : 'Error',
                message: apiMessage,
                variant: status === 503 ? 'warning' : 'error',
                confirmText:"Try again.",
            });
        }
                
        ).finally(() => {

            setFormData({ youtube_url: "" })
            setLoading(false)
            })

    }
    
    if (!isAuthenticated) {
        return         <>
            <Modal
                isOpen={true}
                onClose={() => navigate("/")}
                message="Log in to use this feature!"
                title="Log In?"
                confirmText="Log In"
                onConfirm={() => {
                    navigate("/login")
                }}
                closeOnConfirm={false}
            />
        </>
    }
    return <>
        

        <div className="w-[92%] max-w-2xl mx-auto mt-16 sm:mt-24 md:mt-32 p-4 sm:p-6 md:p-8 text-white bg-greygreen rounded-lg">
            

            <Link
                to="/"
                className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors mb-4"
            >
                ← Back to Home
            </Link>

            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-tight">
                    Submit a Japanese YouTube Video
                </h1>
                <p className="mt-2 text-sm sm:text-base text-white/70 leading-relaxed">
                    Share a public YouTube link with Japanese captions so we can process it for playback.
                </p>
            </div>
            <form onSubmit={handleSubmit}>

                <input type="text"
                    name="youtube_url"
                    placeholder="Enter valid youtube url link..."
                    value={formData.youtube_url} onChange={handleChange}
                    className="block my-4 sm:my-5 p-3 text-sm sm:text-base text-white bg-darkgrey w-full rounded-md "
                    required
                />
                <button type="submit" className="hover:cursor-pointer w-full bg-button text-white py-2.5 sm:py-3 px-4 rounded-xl text-sm sm:text-base ">Submit</button>

            </form>
            {loading && <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4">

                <Spinner />
            </div>
             }
           
 <div className="mt-3 p-3 bg-darkgrey rounded-md border border-white/10">
    <p className="text-s font-medium text-white/50 mb-2">Video requirements</p>
    <ul className="space-y-1.5">
      {[
        { icon: "🎬", text: "YouTube videos only" },
        { icon: "🇯🇵", text: "Must have Japanese captions" },
        { icon: "🔓", text: "Must be publicly accessible" },
      ].map(({ icon, text }) => (
        <li key={text} className="flex items-start text-xs text-white/60">
          <span className="inline-flex w-5 justify-center mr-1 shrink-0 leading-none">{icon}</span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  </div>
        </div>
    <Modal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                title={modalState.title}
                message={modalState.message}
            variant={modalState.variant}
            confirmText={modalState.confirmText}
            onConfirm={modalState.onConfirm}
            cancelRequired={modalState.cancelRequired}
            />
    </>
}

export default SubmissionPage