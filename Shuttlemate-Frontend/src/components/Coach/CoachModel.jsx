import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CoachModal = ({
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Only fetch courts if they aren't provided as props
  useEffect(() => {
    if (isOpen && courts.length === 0) {
      setLoading(true);
      setError(null);
      
      axios.get('http://localhost:5000/api/courts/')
        .then(response => {
       
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching courts:', error);
          setError('Failed to load courts. Please try again.');
          setLoading(false);
        });
    }
  }, [isOpen, courts.length]);

  if (!isOpen) return null;

  // Use the handler passed from parent component or the local one
  const handleCourtCheckboxChange = (courtId) => {
    if (handleCourtSelection) {
      
      const updatedCourts = Array.isArray(formData.Courts) ? [...formData.Courts] : [];
      
      const newCourts = updatedCourts.includes(courtId)
        ? updatedCourts.filter(id => id !== courtId)
        : [...updatedCourts, courtId];
      
      handleCourtSelection({
        target: {
          selectedOptions: newCourts.map(id => ({ value: id }))
        }
      });
    } else {
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

  // Use the handler passed from parent component or use local impl
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

  //console.log("Available courts:", courts);
  //console.log("Current formData:", formData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-center">
          {step === 1 ? 'Add New Coach' : 'Select Coach Courts'}
        </h2>
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
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Coach Name</label>
                <input
                  type="text"
                  name="CoachName"
                  value={formData.CoachName || ''}
                  onChange={handleChange}
                  required
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
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold">Experience</label>
                  <input
                    type="number"
                    name="Experiance" // Match the spelling in your schema
                    value={formData.Experiance || ''}
                    onChange={handleChange}
                    required
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
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows="3"
                ></textarea>
              </div>

              {uploadError && <p className="text-red-500">{uploadError}</p>}
              <div className="flex justify-between">
                <button type="button" onClick={toggleModal} className="px-4 py-2 text-white bg-gray-500 rounded">
                  Cancel
                </button>
                <button type="button" onClick={() => setStep(2)} className="px-4 py-2 text-white bg-blue-500 rounded">
                  Next
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="mb-2 font-semibold">Select Courts</h3>
              <div className="p-2 mb-4 overflow-y-scroll border border-gray-300 rounded max-h-96">
                {loading ? (
                  <p>Loading courts...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : courts.length > 0 ? (
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

export default CoachModal;