import React, { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/firebaseconfig';
import axios from 'axios';

const EditVideoModal = ({ isOpen, onClose, onSuccess, videoData }) => {
    const [formData, setFormData] = useState({
        videoName: '',
        videoCreator: '',
        videoCreatorPhoto: null,
        videoFile: null,
        thumbnail: null,
    });
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [thumbnailProgress, setThumbnailProgress] = useState(0);
    const [creatorPhotoProgress, setCreatorPhotoProgress] = useState(0);
    const [changingVideo, setChangingVideo] = useState(false);
    const [changingThumbnail, setChangingThumbnail] = useState(false);
    const [changingCreatorPhoto, setChangingCreatorPhoto] = useState(false);

    // Initialize form data when videoData changes
    useEffect(() => {
        if (videoData) {
            setFormData({
                videoName: videoData.videoName || '',
                videoCreator: videoData.videoCreator || '',
                videoFile: null,
                thumbnail: null,
                videoCreatorPhoto: null,
                currentVideoUrl: videoData.videoUrl || '',
                currentImgUrl: videoData.imgUrl || '',
                currentCreatorPhotoUrl: videoData.videoCreatorPhotoUrl || ''
            });
        }
    }, [videoData]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        
        if (name === 'videoFile' && files) {
            setChangingVideo(true);
        }
        
        if (name === 'thumbnail' && files) {
            setChangingThumbnail(true);
        }
        
        if (name === 'videoCreatorPhoto' && files) {
            setChangingCreatorPhoto(true);
        }
        
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const uploadFile = async (file, folder, filetype) => {
        const storageRef = ref(storage, `${folder}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                    // Update the appropriate progress state based on file type
                    if (filetype === 'videoFile') {
                        setUploadProgress(Math.round(progress));
                    } else if (filetype === 'thumbnail') {
                        setThumbnailProgress(Math.round(progress));
                    } else if (filetype === 'creatorPhoto') {
                        setCreatorPhotoProgress(Math.round(progress));
                    }
                },
                (error) => {
                    console.error('Error uploading file:', error);
                    setUploadError('Failed to upload files. Please try again.');
                    reject(error);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        console.log(`${filetype} URL:`, downloadURL);

                        // Ensure progress shows as complete
                        if (filetype === 'videoFile') {
                            setUploadProgress(100);
                        } else if (filetype === 'thumbnail') {
                            setThumbnailProgress(100);
                        } else if (filetype === 'creatorPhoto') {
                            setCreatorPhotoProgress(100);
                        }

                        resolve(downloadURL);
                    } catch (error) {
                        console.error('Error getting download URL:', error);
                        setUploadError('Error getting file URL.');
                        reject(error);
                    }
                }
            );
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setUploadError('');
        
        if (changingVideo) setUploadProgress(0);
        if (changingThumbnail) setThumbnailProgress(0);
        if (changingCreatorPhoto) setCreatorPhotoProgress(0);

        try {
            let videoURL = formData.currentVideoUrl;
            let thumbnailURL = formData.currentImgUrl;
            let creatorPhotoURL = formData.currentCreatorPhotoUrl;

            // Only upload new video if provided
            if (changingVideo && formData.videoFile) {
                videoURL = await uploadFile(formData.videoFile, 'videos', 'videoFile');
            }

            // Only upload new thumbnail if provided
            if (changingThumbnail && formData.thumbnail) {
                thumbnailURL = await uploadFile(formData.thumbnail, 'thumbnails', 'thumbnail');
            }
            
            // Only upload new creator photo if provided
            if (changingCreatorPhoto && formData.videoCreatorPhoto) {
                creatorPhotoURL = await uploadFile(formData.videoCreatorPhoto, 'creatorPhotos', 'creatorPhoto');
            }

            // Send PUT request to update the video
            const response = await axios.put(`http://localhost:5001/api/videos/video/${videoData._id}`, {
                videoUrl: videoURL,
                imgUrl: thumbnailURL,
                videoName: formData.videoName,
                videoCreator: formData.videoCreator,
                videoCreatorPhotoUrl: creatorPhotoURL,
            });

            onSuccess(); // Refresh video list after update
            onClose(); // Close modal
        } catch (error) {
            console.error('Error updating video:', error);
            setUploadError('An error occurred while updating the video. Please try again.');
        } finally {
            setUploading(false);
            setChangingVideo(false);
            setChangingThumbnail(false);
            setChangingCreatorPhoto(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                <h2 className="mb-4 text-2xl font-bold text-center">Edit Video</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 text-lg font-medium">Video Name</label>
                        <input
                            type="text"
                            name="videoName"
                            value={formData.videoName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-lg font-medium">Video Creator</label>
                        <input
                            type="text"
                            name="videoCreator"
                            value={formData.videoCreator}
                            onChange={handleChange}
                            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-lg font-medium">Creator Photo</label>
                            {formData.videoCreatorPhoto && (
                                <img 
                                    src={formData.videoCreatorPhoto} 
                                    alt="Creator photo" 
                                    className="object-cover w-12 h-12 ml-2 border rounded-full"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Photo'; }}
                                />
                            )}
                        </div>
                        <label className="block mb-2 text-sm text-gray-600">Upload new creator photo (optional)</label>
                        <input
                            type="file"
                            name="videoCreatorPhoto"
                            accept="image/*"
                            onChange={handleChange}
                            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {uploading && changingCreatorPhoto && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">
                                        Uploading new creator photo...
                                    </span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {creatorPhotoProgress}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${creatorPhotoProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <div className="flex items-center mb-2">
                            <label className="text-lg font-medium">Current Video</label>
                            {formData.currentVideoUrl && (
                                <a 
                                    href={formData.currentVideoUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-2 text-sm text-blue-500 underline"
                                >
                                    View Current Video
                                </a>
                            )}
                        </div>
                        <label className="block mb-2 text-sm text-gray-600">Upload new video (optional)</label>
                        <input
                            type="file"
                            name="videoFile"
                            accept="video/*"
                            onChange={handleChange}
                            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {uploading && changingVideo && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">
                                        Uploading new video...
                                    </span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {uploadProgress}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-lg font-medium">Current Thumbnail</label>
                            {formData.currentImgUrl && (
                                <img 
                                    src={formData.currentImgUrl} 
                                    alt="Current thumbnail" 
                                    className="object-cover w-16 h-16 ml-2 border rounded"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                                />
                            )}
                        </div>
                        <label className="block mb-2 text-sm text-gray-600">Upload new thumbnail (optional)</label>
                        <input
                            type="file"
                            name="thumbnail"
                            accept="image/*"
                            onChange={handleChange}
                            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {uploading && changingThumbnail && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">
                                        Uploading new thumbnail...
                                    </span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {thumbnailProgress}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${thumbnailProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                    {uploadError && (
                        <div className="mb-4 text-red-500">{uploadError}</div>
                    )}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 mr-4 font-bold text-white bg-red-500 rounded hover:bg-red-600"
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-600"
                        >
                            {uploading ? 'Updating...' : 'Update Video'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditVideoModal;