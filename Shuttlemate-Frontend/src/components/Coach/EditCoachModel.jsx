import React from 'react';

const EditCoachModal = ({ 
    isOpen, 
    step, 
    formData, 
    handleChange, 
    handleSubmit, 
    toggleModal, 
    uploadError, 
    setStep,
    courts = [],
    handleCourtSelection,
    handleTrainingTypeChange
}) => {
    if (!isOpen) return null;

    const handleNextStep = () => {
        console.log('Form Data:', formData);
        
        // Convert values to strings and then check if they're empty after trimming
        const coachName = String(formData.CoachName || '').trim();
        const tel = String(formData.Tel || '').trim();
        const trainingType = Array.isArray(formData.TrainingType) ? formData.TrainingType : [];
        const certifications = String(formData.Certifications || '').trim();
        const experience = String(formData.Experiance || '').trim();
        
        if (!coachName || !tel || trainingType.length === 0 || !certifications || !experience) {
            console.log('Validation failed');
            alert('Please fill in all required fields before proceeding.');
            return;
        }
        
        console.log('Moving to next step');
        setStep(2);
    };

    // Handle court checkbox changes
    const handleCourtCheckboxChange = (courtId) => {
        if (handleCourtSelection) {
            // If parent provides a handler, use it
            const updatedCourts = Array.isArray(formData.Courts) ? [...formData.Courts] : [];
            
            // Toggle court selection
            const newCourts = updatedCourts.includes(courtId)
                ? updatedCourts.filter(id => id !== courtId)
                : [...updatedCourts, courtId];
            
            handleCourtSelection({
                target: {
                    selectedOptions: newCourts.map(id => ({ value: id }))
                }
            });
        } else {
            // Fallback to local implementation
            const currentCourts = Array.isArray(formData.Courts) ? [...formData.Courts] : [];
            
            const updatedCourts = currentCourts.includes(courtId)
                ? currentCourts.filter(id => id !== courtId)
                : [...currentCourts, courtId];
            
            handleChange({
                target: {
                    name: 'Courts',
                    value: updatedCourts
                }
            });
        }
    };

    // Handle training type changes
    const localHandleTrainingTypeChange = (e) => {
        if (handleTrainingTypeChange) {
            handleTrainingTypeChange(e);
        } else {
            const { name, checked } = e.target;
            const updatedTypes = checked
                ? [...(formData.TrainingType || []), name]
                : (formData.TrainingType || []).filter(type => type !== name);

            handleChange({
                target: {
                    name: 'TrainingType',
                    value: updatedTypes
                }
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                <h2 className="mb-4 text-2xl font-bold text-center">Edit Coach</h2>
                <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                        <>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Coach Photo</label>
                                <input
                                    type="file"
                                    name="CoachPhoto"
                                    onChange={handleChange}
                                    accept="image/*"
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                                {/* Show current photo if it exists */}
                               
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Coach Name</label>
                                <input
                                    type="text"
                                    name="CoachName"
                                    value={formData.CoachName || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex flex-row gap-2">
                                <div className="mb-4">
                                    <label className="block mb-2 font-semibold">Tel</label>
                                    <input
                                        type="tel"
                                        name="Tel"
                                        value={formData.Tel || ''}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-2 font-semibold">Experience</label>
                                    <input
                                        type="number"
                                        name="Experiance"
                                        value={formData.Experiance || ''}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Training Type</label>
                                <div className="flex flex-row gap-10">
                                    {["Beginner", "Intermediate", "Professional"].map(type => (
                                        <label key={type} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name={type}
                                                checked={(formData.TrainingType || []).includes(type)}
                                                onChange={localHandleTrainingTypeChange}
                                                className="mr-2"
                                            />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Certifications</label>
                                <textarea
                                    name="Certifications"
                                    value={formData.Certifications || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                    rows="4"
                                />
                            </div>

                            {uploadError && <p className="text-red-500">{uploadError}</p>}
                            <div className="flex justify-between">
                                <button type="button" onClick={toggleModal} className="px-4 py-2 text-white bg-gray-500 rounded">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleNextStep} className="px-4 py-2 text-white bg-blue-500 rounded">
                                    Next
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="mb-2 font-semibold">Select Courts</h3>
                            <div className="p-2 mb-4 overflow-y-scroll border border-gray-300 rounded max-h-96">
                                {courts.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {courts.map((court) => (
                                            <label key={court._id} className="flex items-center p-2 rounded hover:bg-gray-100">
                                                <input
                                                    type="checkbox"
                                                    checked={(formData.Courts || []).includes(court._id)}
                                                    onChange={() => handleCourtCheckboxChange(court._id)}
                                                    className="mr-2"
                                                />
                                                <div>
                                                    <span className="font-medium">{court.CourtName}</span>
                                                    <span className="ml-2 text-sm text-gray-600">({court.place})</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No courts available. Please add courts first.</p>
                                )}
                            </div>
                            <div className="flex justify-between">
                                <button type="button" onClick={() => setStep(1)} className="px-4 py-2 text-white bg-gray-500 rounded">
                                    Back
                                </button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded">
                                    Update
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default EditCoachModal;