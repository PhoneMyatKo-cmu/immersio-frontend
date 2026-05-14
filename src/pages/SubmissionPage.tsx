import { useState } from "react";
import { youtubeUrlSubmissionApi } from "../api/youtubeUrlSubmission";
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
    }>({
        isOpen: false,
        message: '',
        variant: 'info',
    });
    
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
                    title: 'Success',
                    message: response.data.message,
                    variant: 'success',
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
            });
        }
                
        ).finally(() => {

            setFormData({ youtube_url: "" })
            setLoading(false)
            })

    }

    return <>
        <div className="p-5 w-[50%] mx-auto mt-[20%] text-white bg-greygreen">
            <div className="text-2xl">Submit your favorite Japanese Youtube video url here..</div>
            <form onSubmit={handleSubmit}>

                <input type="text"
                    name="youtube_url"
                    placeholder="Enter valid youtube url link..."
                    value={formData.youtube_url} onChange={handleChange}
                    className="block  my-5 p-3 text-white bg-darkgrey   w-full "
                    required
                />
                <button type="submit" className="hover:cursor-pointer w-full bg-button text-white p-2 rounded-2xl ">Submit</button>

            </form>
            {loading && <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">

                <Spinner />
            </div>
             }
           
        </div>
    <Modal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                title={modalState.title}
                message={modalState.message}
                variant={modalState.variant}
            />
    </>
}

export default SubmissionPage