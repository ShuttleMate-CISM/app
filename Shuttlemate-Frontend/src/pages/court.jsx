import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../components/Court/CourtModel';
import CourtTable from '../components/Court/CourtTable';
import EditCourtModal from '../components/Court/EditCourtModel';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/firebaseconfig';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';

const Courts = () => {
    const [courts, setCourts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        CourtName: '',
        Tel: '',
        place: '',
        Priceperhour: '',
        Openinghours: '',
        Directions: [{ latitude: '', longitude: '' }],
        CourtPhoto: null,
    });
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [step, setStep] = useState(1);
    const [editingCourtId, setEditingCourtId] = useState(null);

    // Fetch all courts from API
    const fetchCourts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/courts');
            console.error("Data:", response);

            setCourts(response.data.courts);
        } catch (error) {
            console.error("Error fetching courts:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to fetch courts.",
                icon: "error"
            });
        }
    };
    const fetchCoacherById = async (id) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/courts/${id}`);
            
            setFormData(response.data.court);
            setStep(2);
            setEditingCourtId(id);
            setIsEditModalOpen(true); // Open Edit Coach Modal
        } catch (error) {
            console.error('Error fetching coach:', error);
        }
    };
    useEffect(() => {
        fetchCourts();
    }, []);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    // Handle changes for court directions
    const handleDirectionsChange = (index, e) => {
        const { name, value } = e.target;
        const updatedDirections = [...formData.Directions];
        updatedDirections[index][name] = value;
        setFormData((prev) => ({
            ...prev,
            Directions: updatedDirections,
        }));
    };

    // Add new direction field
    const addDirection = () => {
        setFormData((prev) => ({
            ...prev,
            Directions: [...prev.Directions, { latitude: '', longitude: '' }],
        }));
    };

    // Remove direction field
    const removeDirection = (index) => {
        const updatedDirections = [...formData.Directions];
        updatedDirections.splice(index, 1);
        setFormData((prev) => ({
            ...prev,
            Directions: updatedDirections,
        }));
    };

    // Toggle Modal
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        setStep(1);
        setEditingCourtId(null);
        setFormData({
            CourtName: '',
            Tel: '',
            place: '',
            Priceperhour: '',
            Openinghours: '',
            Directions: [{ latitude: '', longitude: '' }],
            CourtPhoto: null,
        })
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 1) {
            setStep(2);
        } else {
            if (!formData.CourtPhoto) {
                setUploadError('Please upload a court photo.');
                return;
            }

            setUploading(true);
            setUploadError('');

            const storageRef = ref(storage, `courts/${formData.CourtPhoto.name}`);
            const uploadTask = uploadBytesResumable(storageRef, formData.CourtPhoto);

            uploadTask.on(
                'state_changed',
                (snapshot) => {},
                (error) => {
                    setUploadError('Failed to upload the court photo.');
                    setUploading(false);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        const updatedCourt = { ...formData, CourtPhoto: downloadURL };

                        if (editingCourtId) {
                            axios.put(`http://localhost:5000/api/courts/court/${editingCourtId}`, updatedCourt)
                                .then(() => {
                                    fetchCourts();
                                    toggleModal();
                                    setUploading(false);
                                    Swal.fire({
                                        title: 'Success!',
                                        text: 'Court updated successfully.',
                                        icon: 'success',
                                        confirmButtonText: 'Okay',
                                    });
                                })
                                .catch((error) => {
                                    console.error('Error updating court:', error);
                                    setUploading(false);
                                });
                        } else {
                            axios.post('http://localhost:5000/api/courts', updatedCourt)
                                .then(() => {
                                    fetchCourts();
                                    toggleModal();
                                    setUploading(false);
                                    Swal.fire({
                                        title: 'Success!',
                                        text: 'Court added successfully.',
                                        icon: 'success',
                                        confirmButtonText: 'Okay',
                                    });
                                })
                                .catch((error) => {
                                    console.error('Error adding court:', error);
                                    setUploading(false);
                                });
                        }
                    });
                }
            );
        }
    };

    // Delete court by ID
    const handleDeleteCourt = async (id) => {
        // Check if court exists
        if (!courts.find(court => court._id === id)) {
            Swal.fire({
                title: "Error!",
                text: "Court not found.",
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
                await axios.delete(`http://localhost:5000/api/courts/${id}`);
                setCourts(courts.filter(court => court._id !== id));

                Swal.fire({
                    title: "Deleted!",
                    text: "Court has been deleted.",
                    icon: "success"
                });
            }
        } catch (error) {
            console.error("Error deleting court:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to delete the court.",
                icon: "error"
            });
        }
    };
    
    const handleUpdateCourt = (updatedCourt) => {
        axios.put(`http://localhost:5000/api/courts/court/${updatedCourt._id}`, updatedCourt)
          .then((response) => {
            fetchCourts();
            Swal.fire({
              title: "Updated!",
              text: "Court has been updated.",
              icon: "success",
            });
          })
          .catch((error) => {
            console.error("Error updating court:", error);
            Swal.fire({
              title: "Error!",
              text: "Failed to update the court.",
              icon: "error",
            });
          });
      };
    
    return (
        <div className="">
            <Navbar />
            <h1 className="pt-10 text-4xl font-bold text-center ">Courts</h1>
            <div className="flex justify-end mx-20">
                <button
                    onClick={toggleModal}
                    className="px-4 py-2 mb-4 text-white rounded bg-amber-500 hover:bg-yellow-400"
                >
                    Add New Court
                </button>
            </div>
            <CourtTable 
                courts={courts} 
                onDelete={handleDeleteCourt} 
                onUpdate={handleUpdateCourt} 
                onEdit={fetchCoacherById}
            />
            <Modal
                isOpen={isModalOpen}
                step={step}
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                toggleModal={toggleModal}
                addDirection={addDirection}
                removeDirection={removeDirection}
                handleDirectionsChange={handleDirectionsChange}
                uploadError={uploadError}
                setStep={setStep}
            />
            <EditCourtModal
                isOpen={isEditModalOpen}
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                toggleModal={() => setIsEditModalOpen(false)}
                setStep={setStep}
            />
        </div>
    );
};

export default Courts;