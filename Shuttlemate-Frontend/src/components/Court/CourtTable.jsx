import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Pencil, Trash2, Clock } from 'lucide-react';
import DataTable from 'react-data-table-component';
import EditCourtModal from './EditCourtModel';
import {useAuth} from '../../context/AuthContext';
import AvailableTime from './AvailableTime';

const CourtTable = ({ courts = [], onDelete, onUpdate }) => {
    const { user } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
    const [selectedCourt, setSelectedCourt] = useState(null);
    const [step, setStep] = useState(1);

    // Ensure onDelete and onUpdate are functions to prevent errors
    const safeOnDelete = typeof onDelete === 'function' ? onDelete : () => console.warn('onDelete is not a function');
    const safeOnUpdate = typeof onUpdate === 'function' ? onUpdate : () => console.warn('onUpdate is not a function');

    const baseColumns = [
        {
            name: 'Court Photo',
            selector: row => (
                <div className="flex justify-center w-full">
                    <img
                        src={row.CourtPhoto}
                        alt={row.CourtName}
                        className="object-cover w-16 h-16 rounded-md"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                    />
                </div>
            ),
            center: true,
        },
        {
            name: 'Name Of the Court',
            selector: row => row.CourtName,
            center: true,
        },
        {
            name: 'Place',
            selector: row => row.place,
            center: true,
        },
        {
            name: 'Tel',
            selector: row => row.Tel,
            center: true,
        },
        {
            name: 'Available Times',
            cell: row => (
                <div className="flex justify-center w-full">
                    <button
                        className="flex items-center justify-center w-10 h-10 font-bold text-green-500 duration-300 ease-in-out transform rounded hover:bg-green-100 hover:scale-105"
                        onClick={() => {
                            setSelectedCourt(row);
                            setAvailabilityModalOpen(true);
                        }}
                        title="Manage Available Times"
                    >
                        <Clock size={18} />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            center: true,
        },
        {
            name: 'Edit',
            cell: (row) => (
                <div className="flex justify-center w-full">
                    <button
                        className="flex items-center justify-center w-10 h-10 font-bold text-blue-500 duration-300 ease-in-out transform rounded hover:bg-blue-100 hover:scale-105"
                        onClick={() => {
                            setSelectedCourt(row);
                            setModalOpen(true);
                        }}
                    >
                        <Pencil size={18} />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            center: true,
        },
       
    ];

     const deleteColumn = {
            name: 'Delete',
            cell: row => (
                <button
                    onClick={() => onDelete(row._id)}
                    className="px-4 py-1 font-bold text-red-500 transition duration-300 ease-in-out transform rounded hover:bg-red-100 hover:scale-105"
                >
                    <Trash2 size={18} />
                </button>
            ),
            center: true,
            ignoreRowClick: true,
            button: true,
        };
    
         const isAdmin = user?.role === 'admin';
        
        // Conditionally add delete column based on admin status
        const columns = isAdmin ? [...baseColumns, deleteColumn] : baseColumns;
    const closeModal = () => {
        setModalOpen(false);
        setSelectedCourt(null);
    };

    const closeAvailabilityModal = () => {
        setAvailabilityModalOpen(false);
        setSelectedCourt(null);
    };

    const handleFormSubmit = (updatedCourt) => {
        safeOnUpdate(updatedCourt);
        closeModal();
    };

    return (
        <div className="mx-20">
            <div className="overflow-hidden rounded-lg shadow-xl">
            <DataTable
                columns={columns}
                data={courts}
                customStyles={{
                    headCells: {
                        style: {
                            backgroundColor: '#1e3a8a',
                            color: 'white',
                           // fontWeight: 'bold',
                            justifyContent: 'center', // Center header text
                            textAlign: 'center',
                            fontSize: '14px',
                        },
                    },
                    cells: {
                        style: {
                            padding: '0.5rem',
                            justifyContent: 'center', // Center cell content
                        },
                    },
                }}
                pagination
                highlightOnHover
                pointerOnHover
            />

            {modalOpen && selectedCourt && (
                <EditCourtModal
                    isOpen={modalOpen}
                    step={step}
                    setStep={setStep}
                    formData={selectedCourt}
                    handleChange={(e) => setSelectedCourt({ ...selectedCourt, [e.target.name]: e.target.value })}
                    handleSubmit={(e) => {
                        e.preventDefault();
                        handleFormSubmit(selectedCourt);
                    }}
                    toggleModal={closeModal}
                    addDirection={() => setSelectedCourt({
                        ...selectedCourt,
                        Directions: [...(selectedCourt.Directions || []), { latitude: '', longitude: '' }]
                    })}
                    removeDirection={(index) => {
                        const updatedDirections = [...(selectedCourt.Directions || [])];
                        updatedDirections.splice(index, 1);
                        setSelectedCourt({ ...selectedCourt, Directions: updatedDirections });
                    }}
                    handleDirectionsChange={(index, e) => {
                        const updatedDirections = [...(selectedCourt.Directions || [])];
                        updatedDirections[index][e.target.name] = e.target.value;
                        setSelectedCourt({ ...selectedCourt, Directions: updatedDirections });
                    }}
                    uploadError={''}
                />
            )}

            {
                availabilityModalOpen && selectedCourt && (
                    <AvailableTime
                     isOpen = {availabilityModalOpen}
                     courtId={selectedCourt._id}
                     courtName={selectedCourt.CourtName}
                     onClose={closeAvailabilityModal}
                    />
                )
            }
            </div>
        </div>
    );
};

CourtTable.propTypes = {
    courts: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string,
            CourtName: PropTypes.string.isRequired,
            Tel: PropTypes.string.isRequired,
            place: PropTypes.string.isRequired,
            Directions: PropTypes.arrayOf(
                PropTypes.shape({
                    latitude: PropTypes.string,
                    longitude: PropTypes.string,
                })
            ), // Made optional to prevent warnings
        })
    ).isRequired,
    onDelete: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default CourtTable;