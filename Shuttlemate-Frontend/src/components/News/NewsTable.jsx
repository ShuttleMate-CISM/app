import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Pencil, Trash2, Eye } from 'lucide-react';
import DataTable from 'react-data-table-component';
import EditNewsModal from './EditNewsModel';
import { useAuth } from '../../context/AuthContext';
import NewsViewModal from './NewsModel';

const NewsTable = ({ news = [], onDelete, onUpdate }) => {
    const { user } = useAuth();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState(null);
    const [step, setStep] = useState(1);

    const safeOnDelete = typeof onDelete === 'function' ? onDelete : () => console.warn('onDelete is not a function');
    const safeOnUpdate = typeof onUpdate === 'function' ? onUpdate : () => console.warn('onUpdate is not a function');

    const truncateText = (text, maxLength = 50) => {
        if (!text) return '';
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

 
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const baseColumns = [
        
        {
            name: 'Title',
            selector: row => row.title,
            cell: row => (
                <div className="text-center" title={row.title}>
                    {truncateText(row.title, 30)}
                </div>
            ),
            center: true,
        },
        {
            name: 'Source',
            selector: row => row.source,
            center: true,
        },
        {
            name: 'Published Time',
            selector: row => formatDate(row.time),
            center: true,
        },
        {
            name: 'Body Preview',
            selector: row => row.body,
            cell: row => (
                <div className="text-center" title={row.body}>
                    {truncateText(row.body, 40)}
                </div>
            ),
            center: true,
        },
       
        {
            name: 'Edit',
            cell: (row) => (
                <div className="flex justify-center w-full">
                    <button
                        className="flex items-center justify-center w-10 h-10 font-bold text-blue-500 duration-300 ease-in-out transform rounded hover:bg-blue-100 hover:scale-105"
                        onClick={() => {
                            setSelectedNews(row);
                            setEditModalOpen(true);
                            setStep(1); // Reset to first step
                        }}
                        title="Edit News"
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
            <div className="flex justify-center w-full">
                <button
                    onClick={() => {
                        if (window.confirm('Are you sure you want to delete this news article?')) {
                            safeOnDelete(row._id);
                        }
                    }}
                    className="flex items-center justify-center w-10 h-10 font-bold text-red-500 duration-300 ease-in-out transform rounded hover:bg-red-100 hover:scale-105"
                    title="Delete News"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        ),
        center: true,
        ignoreRowClick: true,
        button: true,
    };

    const isAdmin = user?.role === 'admin';

    // Conditionally add delete column based on admin status
    const columns = isAdmin ? [...baseColumns, deleteColumn] : baseColumns;

    const closeEditModal = () => {
        setEditModalOpen(false);
        setSelectedNews(null);
        setStep(1);
    };

    const closeViewModal = () => {
        setViewModalOpen(false);
        setSelectedNews(null);
    };

    const handleFormSubmit = (updatedNews) => {
        safeOnUpdate(updatedNews);
        closeEditModal();
    };

    const handleEditChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setSelectedNews({ ...selectedNews, [name]: files[0] });
        } else {
            setSelectedNews({ ...selectedNews, [name]: value });
        }
    };

    return (
        <div className="mx-20">
            <div className="overflow-hidden rounded-lg shadow-xl">
                <DataTable
                    columns={columns}
                    data={news}
                    customStyles={{
                        headCells: {
                            style: {
                                backgroundColor: '#1e3a8a',
                                color: 'white',
                                justifyContent: 'center',
                                textAlign: 'center',
                                fontSize: '14px',
                            },
                        },
                        cells: {
                            style: {
                                padding: '0.5rem',
                                justifyContent: 'center',
                            },
                        },
                    }}
                    pagination
                    highlightOnHover
                    pointerOnHover
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 20, 30]}
                />

                {editModalOpen && selectedNews && (
                    <EditNewsModal
                        isOpen={editModalOpen}
                        step={step}
                        setStep={setStep}
                        formData={selectedNews}
                        handleChange={handleEditChange}
                        handleSubmit={(e) => {
                            e.preventDefault();
                            handleFormSubmit(selectedNews);
                        }}
                        toggleModal={closeEditModal}
                        uploadError={''}
                    />
                )}

                {viewModalOpen && selectedNews && (
                    <NewsViewModal
                        isOpen={viewModalOpen}
                        newsData={selectedNews}
                        onClose={closeViewModal}
                    />
                )}
            </div>
        </div>
    );
};

NewsTable.propTypes = {
    news: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string,
            title: PropTypes.string.isRequired,
            body: PropTypes.string.isRequired,
            source: PropTypes.string.isRequired,
            time: PropTypes.string.isRequired,
            newsImage: PropTypes.string,
        })
    ).isRequired,
    onDelete: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default NewsTable;