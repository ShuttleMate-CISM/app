import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../components/Coach/CoachModel'; // Modal for adding new coach
import EditCoachModal from '../components/Coach/EditCoachModel'; // Modal for editing coach
import CoacherTable from '../components/Coach/CoachTable';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/firebaseconfig';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';

const Coachers = () => {
    const [coachers, setCoachers] = useState([]);
    const [courts, setCourts] = useState([]); // State to store available courts
    const [isModalOpen, setIsModalOpen] = useState(false); // For Add Coach Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // For Edit Coach Modal
    const [formData, setFormData] = useState({
        CoachName: '',
        Tel: '',
        TrainingType: [],
        Certifications: '',
        Experiance: '',
        Courts: [],
        CoachPhoto: null,
    });
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [step, setStep] = useState(1);
    const [editingCoachId, setEditingCoachId] = useState(null); // Track the coach being edited

    const fetchCoachers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/coachers');
            setCoachers(response.data.coachers || response.data); // Handle both formats
        } catch (error) {
            console.error("Error fetching coachers:", error);
        }
    };

    const fetchCourts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/courts');
            // Check the response format and handle both possibilities
            if (response.data && response.data.courts) {
                setCourts(response.data.courts);
            } else if (Array.isArray(response.data)) {
                setCourts(response.data);
            } else {
                console.error("Unexpected courts data format:", response.data);
                setCourts([]);
            }
            console.log("Fetched courts:", response.data);
        } catch (error) {
            console.error("Error fetching courts:", error);
        }
    };

   const fetchCoacherById = async (id) => {
    try {
        const response = await axios.get(`http://localhost:5000/api/Coachers/${id}`);
        // Handle potential different response formats
        const coacherData = response.data.coacher || response.data;
        setFormData(coacherData);
        setStep(1); // Start from step 1 for editing
        setEditingCoachId(id);
        setIsEditModalOpen(true); // Open Edit Coach Modal
    } catch (error) {
        console.error('Error fetching coach:', error);
    }
};
    useEffect(() => {
        fetchCoachers();
        fetchCourts(); // Fetch courts when component mounts
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        
        if (files) {
            // Handle file upload
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            // Handle other inputs
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Separate handler for TrainingType specifically
    const handleTrainingTypeChange = (e) => {
        const { name, checked } = e.target;
        const updatedTypes = checked
            ? [...(formData.TrainingType || []), name]
            : (formData.TrainingType || []).filter(type => type !== name);

        setFormData(prev => ({
            ...prev,
            TrainingType: updatedTypes
        }));
    };

    const handleCourtSelection = (e) => {
        const selectedCourts = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({
            ...prev,
            Courts: selectedCourts
        }));
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        setStep(1);
        setEditingCoachId(null);
        setFormData({
            CoachName: '',
            Tel: '',
            TrainingType: [],
            Certifications: '',
            Experiance: '',
            Courts: [],
            CoachPhoto: null,
        });
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
        setStep(2);
    } else {
        // For adding new coach, photo is required
        if (!editingCoachId && !formData.CoachPhoto) {
            setUploadError('Please upload a coach photo.');
            return;
        }

        setUploading(true);
        setUploadError('');

        // Check if we need to upload a new photo
        const needsPhotoUpload = formData.CoachPhoto && 
                                typeof formData.CoachPhoto === 'object' && 
                                formData.CoachPhoto instanceof File;

        if (needsPhotoUpload) {
            // Upload new photo to Firebase
            const storageRef = ref(storage, `coaches/${Date.now()}_${formData.CoachPhoto.name}`);
            const uploadTask = uploadBytesResumable(storageRef, formData.CoachPhoto);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Optional: Add progress tracking here
                },
                (error) => {
                    console.error('Upload error:', error);
                    setUploadError('Failed to upload the coach photo.');
                    setUploading(false);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        const updatedCoacher = { ...formData, CoachPhoto: downloadURL };
                        submitCoachData(updatedCoacher);
                    });
                }
            );
        } else {
            // Use existing photo URL or handle case where no photo is provided
            if (editingCoachId) {
                // For editing, keep existing photo if no new photo is uploaded
                submitCoachData(formData);
            } else {
                // For new coach, photo is required
                setUploadError('Please upload a coach photo.');
                setUploading(false);
                return;
            }
        }
    }
};

const submitCoachData = (coachData) => {
    console.log('Submitting coach data:', coachData);
    
    if (editingCoachId) {
        // Update existing coach
        axios.put(`http://localhost:5000/api/Coachers/${editingCoachId}`, coachData)
            .then(() => {
                fetchCoachers();
                setIsEditModalOpen(false);
                setUploading(false);
                setStep(1);
                setEditingCoachId(null);
                setFormData({
                    CoachName: '',
                    Tel: '',
                    TrainingType: [],
                    Certifications: '',
                    Experiance: '',
                    Courts: [],
                    CoachPhoto: null,
                });
                Swal.fire({
                    title: 'Success!',
                    text: 'Coach updated successfully.',
                    icon: 'success',
                    confirmButtonText: 'Okay',
                });
            })
            .catch((error) => {
                console.error('Error updating coach:', error);
                setUploading(false);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to update the coach.',
                    icon: 'error',
                });
            });
    } else {
        // Add new coach
        axios.post('http://localhost:5000/api/coachers', coachData)
            .then(() => {
                fetchCoachers();
                toggleModal();
                setUploading(false);
                console.log('Coach added:', coachData);
                Swal.fire({
                    title: 'Success!',
                    text: 'Coach added successfully.',
                    icon: 'success',
                    confirmButtonText: 'Okay',
                });
            })
            .catch((error) => {
                console.error('Error adding coach:', error);
                setUploading(false);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to add the coach.',
                    icon: 'error',
                });
            });
    }
};

    const handleDeleteCoacher = async (id) => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete it!",
            });

            if (result.isConfirmed) {
                await axios.delete(`http://localhost:5000/api/Coachers/coach/${id}`);
                setCoachers(coachers.filter(coach => coach._id !== id));
                Swal.fire({
                    title: "Deleted!",
                    text: "Coacher has been deleted.",
                    icon: "success",
                });
            }
        } catch (error) {
            console.error("Error deleting coacher:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to delete the coacher.",
                icon: "error",
            });
        }
    };
    
    const handleUpdateCoacher = (updatedCoacher) => {
        axios.put(`http://localhost:5000/api/Coachers/${updatedCoacher._id}`, updatedCoacher)
            .then((response) => {
                fetchCoachers();
                Swal.fire({
                    title: "Updated!",
                    text: "Coacher has been updated.",
                    icon: "success",
                });
            })
            .catch((error) => {
                console.error("Error updating coacher:", error);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to update the coacher.",
                    icon: "error",
                });
            });
    };
    
    return (
        <div className="">
            <Navbar />
            <h1 className='pt-10 text-4xl font-bold text-center '>Coachers</h1>
            <div className="flex justify-end mx-20">
                <button onClick={toggleModal} className="px-4 py-2 mb-4 text-white rounded bg-amber-500 hover:bg-yellow-400">
                    Add New Coacher
                </button>
            </div>
            <CoacherTable
                coachers={coachers}
                onDelete={handleDeleteCoacher}
                onEdit={fetchCoacherById}
                onUpdate={handleUpdateCoacher} 
            />
            <Modal
                isOpen={isModalOpen}
                step={step}
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                toggleModal={toggleModal}
                uploadError={uploadError}
                setStep={setStep}
                courts={courts}
                handleCourtSelection={handleCourtSelection}
                handleTrainingTypeChange={handleTrainingTypeChange}
            />
         <EditCoachModal
    isOpen={isEditModalOpen}
    step={step}
    formData={formData}
    handleChange={handleChange}
    handleSubmit={handleSubmit}
    toggleModal={() => {
        setIsEditModalOpen(false);
        setStep(1);
        setEditingCoachId(null);
        setFormData({
            CoachName: '',
            Tel: '',
            TrainingType: [],
            Certifications: '',
            Experiance: '',
            Courts: [],
            CoachPhoto: null,
        });
    }}
    uploadError={uploadError}
    setStep={setStep}
    courts={courts}
    handleCourtSelection={handleCourtSelection}
    handleTrainingTypeChange={handleTrainingTypeChange}
/>
        </div>
    );
};

export default Coachers;