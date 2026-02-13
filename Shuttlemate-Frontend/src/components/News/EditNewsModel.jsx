import React from 'react';

const EditNewsModal = ({
    isOpen,
    formData,
    handleChange,
    handleSubmit,
    toggleModal,
    uploadError,
    step,
    setStep,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
                <h2 className="mb-4 text-2xl font-bold text-center">Edit News</h2>
                <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                        <>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title || ''}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                    placeholder="Enter news title"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Source</label>
                                <input
                                    type="text"
                                    name="source"
                                    value={formData.source || ''}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                    placeholder="Enter news source"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Time</label>
                                <input
                                    type="datetime-local"
                                    name="time"
                                    value={formData.time || ''}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={toggleModal}
                                    className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">News Body</label>
                                <textarea
                                    name="body"
                                    value={formData.body || ''}
                                    onChange={handleChange}
                                    required
                                    rows={8}
                                    className="w-full px-3 py-2 border border-gray-300 rounded resize-vertical"
                                    placeholder="Enter the full news content here..."
                                />
                            </div>
                            
                            {/* Current Image Display */}
                            {formData.newsImage && typeof formData.newsImage === 'string' && (
                                <div className="mb-4">
                                    <label className="block mb-2 font-semibold">Current Image</label>
                                    <div className="flex items-center gap-4 p-3 border border-gray-200 rounded">
                                        <img
                                            src={formData.newsImage}
                                            alt="Current news"
                                            className="object-cover w-20 h-20 rounded"
                                            onError={(e) => { 
                                                e.target.src = 'https://via.placeholder.com/80?text=No+Image'; 
                                            }}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600">Current news image</p>
                                            <p className="text-xs text-gray-500">Upload a new image below to replace this one</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">
                                    {formData.newsImage && typeof formData.newsImage === 'string' 
                                        ? 'Replace Image (Optional)' 
                                        : 'News Image (Optional)'
                                    }
                                </label>
                                <input
                                    type="file"
                                    name="newsImage"
                                    onChange={handleChange}
                                    accept="image/*"
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    {formData.newsImage && typeof formData.newsImage === 'string'
                                        ? 'Choose a new image to replace the current one, or leave empty to keep the existing image'
                                        : 'Upload an image to accompany the news article'
                                    }
                                </p>
                            </div>
                            
                            {uploadError && (
                                <div className="mb-4">
                                    <p className="text-red-500 text-sm">{uploadError}</p>
                                </div>
                            )}
                            
                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                                >
                                    Update News
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default EditNewsModal;