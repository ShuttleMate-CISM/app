import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Pencil, Trash2, Clock } from 'lucide-react';
import DataTable from 'react-data-table-component';
import EditCoachModal from './EditCoachModel';
import AvailableTimeModal from './AvailableTime';
import {useAuth} from '../../context/AuthContext';

const CoacherTable = ({ coachers = [], onDelete, onUpdate }) => {
         const { user } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
    const [selectedCoacher, setSelectedCoacher] = useState(null);
    const [step, setStep] = useState(1);

    const baseColumns = [
        {
            name: 'Coach Photo',
            selector: row => (
                <div className="flex justify-center w-full">
                    <img
                        src={row.CoachPhoto}
                        alt={row.CoachName}
                        className="object-cover w-12 h-12 rounded-full"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                    />
                </div>
            ),
            center: true,
        },
        {
            name: 'Name',
            selector: row => row.CoachName,
            center: true,
        },
        {
            name: 'Training Type',
            cell: row => (
                <div className="flex flex-col items-center justify-center w-full">
                    {row.TrainingType && row.TrainingType.map((type, index) => (
                        <div key={index}>{type}</div>
                    ))}
                </div>
            ),
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
                            setSelectedCoacher(row);
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
            cell: row => (
                <div className="flex justify-center w-full">
                    <button
                        className="flex items-center justify-center w-10 h-10 font-bold text-blue-500 duration-300 ease-in-out transform rounded hover:bg-blue-100 hover:scale-105"
                        onClick={() => {
                            setSelectedCoacher(row);
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
        // {
        //     name: 'Delete',
        //     cell: row => (
        //         <div className="flex justify-center w-full">
        //             <button
        //                 className="flex items-center justify-center w-10 h-10 font-bold text-red-500 transition duration-300 ease-in-out transform rounded hover:bg-red-100 hover:scale-105"
        //                 onClick={() => row._id && onDelete(row._id)}
        //             >
        //                 <Trash2 size={18} />
        //             </button>
        //         </div>
        //     ),
        //     ignoreRowClick: true,
        //     allowOverflow: true,
        //     button: true,
        //     center: true,
        // },
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
         const columns = isAdmin ? [...baseColumns, deleteColumn] : baseColumns;


    // Close the modals
    const closeModal = () => {
        setModalOpen(false);
        setSelectedCoacher(null);
    };

    const closeAvailabilityModal = () => {
        setAvailabilityModalOpen(false);
        setSelectedCoacher(null);
    };

    // Handle form submission
    const handleFormSubmit = (updatedCoacher) => {
        onUpdate(updatedCoacher);
        closeModal();
    };

    return (
        <div className="mx-20">
            <div className="overflow-hidden rounded-lg shadow-xl">
                <DataTable
                    columns={columns}
                    data={coachers}
                    customStyles={{
                        headCells: {
                            style: {
                                backgroundColor: '#1e3a8a',
                                color: 'white',
                                justifyContent: 'center',
                                textAlign: 'center',
                                fontSize:'14px'
                            },
                        },
                        cells: {
                            style: {
                                padding: '0.5rem',
                                justifyContent: 'center',
                            },
                        },
                        table: {
                            style: {
                                backgroundColor: '#1e293b', // slate-800 equivalent
                            },
                        },
                        rows: {
                            style: {
                                
                            },
                        },
                    }}
                    pagination
                    highlightOnHover
                    pointerOnHover
                />
            </div>

            {/* Edit Coach Modal */}
            {modalOpen && selectedCoacher && (
                <EditCoachModal
                    isOpen={modalOpen}
                    step={step}
                    formData={selectedCoacher}
                    handleChange={(e) => setSelectedCoacher({ ...selectedCoacher, [e.target.name]: e.target.value })}
                    handleSubmit={(e) => {
                        e.preventDefault();
                        handleFormSubmit(selectedCoacher);
                    }}
                    toggleModal={closeModal}
                    addTrainingArea={() => setSelectedCoacher({
                        ...selectedCoacher,
                        TrainingAreas: [...(selectedCoacher.TrainingAreas || []), { CourtName: '', Area: '' }]
                    })}
                    removeTrainingArea={(index) => {
                        const updatedAreas = [...(selectedCoacher.TrainingAreas || [])];
                        updatedAreas.splice(index, 1);
                        setSelectedCoacher({ ...selectedCoacher, TrainingAreas: updatedAreas });
                    }}
                    handleTrainingAreaChange={(index, e) => {
                        const updatedAreas = [...(selectedCoacher.TrainingAreas || [])];
                        updatedAreas[index][e.target.name] = e.target.value;
                        setSelectedCoacher({ ...selectedCoacher, TrainingAreas: updatedAreas });
                    }}
                    uploadError={''}
                    setStep={setStep}
                />
            )}

            {/* Available Times Modal */}
            {availabilityModalOpen && selectedCoacher && (
                <AvailableTimeModal
                    isOpen={availabilityModalOpen}
                    coachId={selectedCoacher._id}
                    coachName={selectedCoacher.CoachName}
                    onClose={closeAvailabilityModal}
                />
            )}
        </div>
    );
};

CoacherTable.propTypes = {
    coachers: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string,
            CoachName: PropTypes.string.isRequired,
            TrainingType: PropTypes.arrayOf(PropTypes.string).isRequired,
            Tel: PropTypes.string.isRequired,
            CoachPhoto: PropTypes.string,
            TrainingAreas: PropTypes.arrayOf(
                PropTypes.shape({
                    CourtName: PropTypes.string,
                    Area: PropTypes.string,
                })
            ).isRequired,
        })
    ).isRequired,
    onDelete: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default CoacherTable;