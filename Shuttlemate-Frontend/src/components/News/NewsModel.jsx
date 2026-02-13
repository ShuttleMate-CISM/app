import React from 'react';

const NewsModal = ({
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
                <h2 className="mb-4 text-2xl font-bold text-center">Add New News</h2>
                <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                        <>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
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
                                    value={formData.source}
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
                                    value={formData.time}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={toggleModal}
                                    className="px-4 py-2 text-white bg-gray-500 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="px-4 py-2 text-white bg-blue-500 rounded"
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
                                    value={formData.body}
                                    onChange={handleChange}
                                    required
                                    rows={8}
                                    className="w-full px-3 py-2 border border-gray-300 rounded resize-vertical"
                                    placeholder="Enter the full news content here..."
                                />
                            </div>
                            
                            {uploadError && <p className="text-red-500">{uploadError}</p>}
                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-4 py-2 text-white bg-gray-500 rounded"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-500 rounded"
                                >
                                    Submit
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default NewsModal;