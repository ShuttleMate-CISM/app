import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';

const MatchesModal = ({ isOpen, onClose, match, onSave, uploading }) => {
  const [formData, setFormData] = useState({
    MatchPhoto: '',
    MatchName: '',
    StartDate: '',
    EndDate: '',
    Weblink: '',
  });
  
  // For file preview
  const [filePreview, setFilePreview] = useState(null);
  // To store the actual file object
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (match) {
      setFormData({
        MatchPhoto: match.MatchPhoto || '',
        MatchName: match.MatchName || '',
        StartDate: match.StartDate ? match.StartDate.substring(0, 10) : '',
        EndDate: match.EndDate ? match.EndDate.substring(0, 10) : '',
        Weblink: match.Weblink || '',
      });
      setFilePreview(match.MatchPhoto || null);
      setSelectedFile(null);
    } else {
      resetForm();
    }
  }, [match, isOpen]);

  const resetForm = () => {
    setFormData({
      MatchPhoto: '',
      MatchName: '',
      StartDate: '',
      EndDate: '',
      Weblink: '',
    });
    setFilePreview(null);
    setSelectedFile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create a preview URL for the selected file
      const previewURL = URL.createObjectURL(file);
      setFilePreview(previewURL);
    }
  };
  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5001/api/matches/');
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array before setting it
        setMatches(Array.isArray(data) ? data : []);
        
        // Debug log to see what's coming from the API
        console.log('API response data:', data);
      } else {
        throw new Error('Failed to fetch matches');
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      // Initialize as empty array on error
      setMatches([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load matches. Please try again!',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a data object with the form data and the file if present
    const dataToSave = {
      ...formData,
      // If there's a new file selected, pass it for upload
      MatchPhotoFile: selectedFile
    };
    
    onSave(dataToSave);
  };

  return (
    <Dialog open={isOpen} onClose={uploading ? () => {} : onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md p-6 bg-white rounded-lg">
          <Dialog.Title className="text-xl font-medium text-gray-900">
            {match ? 'Edit Match' : 'Add New Match'}
          </Dialog.Title>
          
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Match Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Match Photo
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              {/* Preview Image */}
             
            </div>
            
            {/* Match Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Match Name
              </label>
              <input
                type="text"
                name="MatchName"
                value={formData.MatchName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                name="StartDate"
                value={formData.StartDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                name="EndDate"
                value={formData.EndDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* Web Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Web Link
              </label>
              <input
                type="url"
                name="Weblink"
                value={formData.Weblink}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end pt-4 space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 text-white rounded bg-amber-500 hover:bg-yellow-400 disabled:opacity-50"
              >
                {uploading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default MatchesModal;