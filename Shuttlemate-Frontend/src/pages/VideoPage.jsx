import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';
import VideoTable from '../components/Video/videoTable';
import VideoUploadModal from '../components/Video/videoModel';
import EditVideoModal from '../components/Video/EditVideoModal';

const VideoPage = () => {
    const [videos, setVideos] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Fetch videos from the backend
    const fetchVideos = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/videos');
            console.log(response);
            setVideos(response.data.videos);
        } catch (error) {
            console.error("Error fetching videos:", error);
        }
    };

    useEffect(() => {
        fetchVideos(); // Call the function when the component mounts
    }, []);

    const toggleUploadModal = () => {
        setIsUploadModalOpen(!isUploadModalOpen);
    };

    const openEditModal = (video) => {
        setSelectedVideo(video);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedVideo(null);
    };

    const handleDeleteVideo = async (id) => {
        console.log("Deleting video with ID:", id);

        if (!videos.find(video => video._id === id)) {
            Swal.fire({
                title: "Error!",
                text: "Video not found.",
                icon: "error"
            });
            return;
        }

        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete it!"
            });

            if (result.isConfirmed) {
                await axios.delete(`http://localhost:5001/api/videos/${id}`);
                setVideos((prevVideos) => prevVideos.filter(video => video._id !== id)); // Update state
                Swal.fire({
                    title: "Deleted!",
                    text: "Video has been deleted.",
                    icon: "success"
                });
            }
        } catch (error) {
            console.error("Error deleting video:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to delete the video.",
                icon: "error"
            });
        }
    };

    return (
        <div className=''>
            <Navbar />
            <h1 className='text-4xl font-bold text-center pt-9 '>Videos</h1>

            <div className="flex justify-end mb-6 mr-20">
                <button
                    onClick={toggleUploadModal}
                    className="px-4 py-2 mb-4 text-white rounded bg-amber-500 hover:bg-yellow-400"
                >
                    Add New Video
                </button>
            </div>

            {/* Video Table Component */}
            <VideoTable 
                videos={videos} 
                onDeleteVideo={handleDeleteVideo} 
                onEditVideo={openEditModal}
            />

            {/* Video Upload Modal Component */}
            {isUploadModalOpen && (
                <VideoUploadModal 
                    isOpen={isUploadModalOpen}
                    onClose={toggleUploadModal}
                    onSuccess={fetchVideos}
                />
            )}

            {/* Video Edit Modal Component */}
            {isEditModalOpen && selectedVideo && (
                <EditVideoModal 
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    onSuccess={fetchVideos}
                    videoData={selectedVideo}
                />
            )}
        </div>
    );
};

export default VideoPage;