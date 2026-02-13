import React, { useState, useEffect } from 'react';

const EditMatchModal = ({ match, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    MatchName: '',
    StartDate: '',
    EndDate: '',
    Weblink: '',
    MatchPhoto: ''
  });
  
  // Initialize form with match data when modal opens
  useEffect(() => {
    if (match) {
      setFormData({
        MatchName: match.MatchName || '',
        StartDate: match.StartDate ? new Date(match.StartDate).toISOString().split('T')[0] : '',
        EndDate: match.EndDate ? new Date(match.EndDate).toISOString().split('T')[0] : '',
        Weblink: match.Weblink || '',
        MatchPhoto: match.MatchPhoto || ''
      });
    }
  }, [match]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...match,
      ...formData,
    });
  };
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="justify-center mx-auto text-xl font-bold text-center">Edit Match</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="MatchName">
              Match Name 
            </label>
            <input
              type="text"
              id="MatchName"
              name="MatchName"
              value={formData.MatchName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="StartDate">
              Start Date 
            </label>
            <input
              type="date"
              id="StartDate"
              name="StartDate"
              value={formData.StartDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="EndDate">
              End Date
            </label>
            <input
              type="date"
              id="EndDate"
              name="EndDate"
              value={formData.EndDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
            <p className="mt-1 text-xs text-gray-500">Leave empty for ongoing matches</p>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="Weblink">
              Web Link
            </label>
            <input
              type="url"
              id="Weblink"
              name="Weblink"
              value={formData.Weblink}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="MatchPhoto">
              Match Photo URL
            </label>
            <input
              type="url"
              id="MatchPhoto"
              name="MatchPhoto"
              value={formData.MatchPhoto}
              onChange={handleChange}
            
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          
          
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMatchModal;