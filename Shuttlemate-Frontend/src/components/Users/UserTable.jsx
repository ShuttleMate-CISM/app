import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DataTable from "react-data-table-component";
import { Trash2, Pencil, Plus, ChevronDown, ChevronUp, User, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserTable = ({ users = [], onDelete, onEdit }) => {
    const { user } = useAuth();
    const [expandedUser, setExpandedUser] = useState(null);

    const toggleExpand = (userId) => {
        setExpandedUser(expandedUser === userId ? null : userId);
    };

    const baseColumns = [
        
        {
            name: 'Name',
            selector: row => row.username,
            sortable: true,
            center: true,
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: false, // Removed sorting to eliminate dropdown icon
            center: true,
        },
        {
            name: 'Role',
            selector: row => row.role,
            sortable: true,
            center: true,
            cell: row => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    row.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : row.role === 'shopowner'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                }`}>
                    {row.role}
                </span>
            ),
        },
        
        {
            name: 'View Details',
            cell: row => (
                <button
                    onClick={() => toggleExpand(row._id)}
                    className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                    {expandedUser === row._id ? 'Hide' : 'View'} Details
                </button>
            ),
            center: true,
            ignoreRowClick: true,
            button: true,
        },
         {
            name: 'Status',
            selector: row => row.status ? 'Active' : 'Inactive',
            sortable: false,
            center: true,
            cell: row => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    row.status 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }`}>
                    {row.status ? 'Active' : 'Inactive'}
                </span>
            ),
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

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#1e3a8a', // Blue-900
                color: 'white',
            },
        },
        headCells: {
            style: {
                justifyContent: 'center',
                fontSize: '14px',
                padding: '16px',
                borderBottom: '1px solid #2d3748',
            },
        },
        rows: {
            style: {
                '&:hover': {
                    backgroundColor: '#f8fafc',
                },
            },
        },
        cells: {
            style: {
                padding: '12px',
            },
        },
    };

    // Custom component that renders nothing when there's no data
    const NoDataComponent = () => (
        <div className="flex flex-col items-center justify-center py-8">
            <User size={48} className="text-gray-400 mb-4" />
            <p className="text-gray-500">No users found</p>
        </div>
    );

    const ExpandedComponent = ({ data }) => (
        <div className="p-4 m-4 border rounded-lg bg-gray-50">
            <div className="overflow-hidden rounded-lg shadow-md bg-white">
                <h3 className="mb-4 text-lg font-semibold text-center bg-gray-100 py-3">
                    User Details: {data.firstName} {data.lastName}
                </h3>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                            <Mail size={20} className="text-blue-500" />
                            <div>
                                <span className="font-medium">Email:</span>
                                <p className="text-gray-600">{data.email}</p>
                            </div>
                        </div>
                        
                        {data.phone && (
                            <div className="flex items-center space-x-3">
                                <Phone size={20} className="text-green-500" />
                                <div>
                                    <span className="font-medium">Phone:</span>
                                    <p className="text-gray-600">{data.phone}</p>
                                </div>
                            </div>
                        )}

                        {data.address && (
                            <div className="flex items-center space-x-3">
                                <MapPin size={20} className="text-red-500" />
                                <div>
                                    <span className="font-medium">Address:</span>
                                    <p className="text-gray-600">{data.address}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center space-x-3">
                            <User size={20} className="text-purple-500" />
                            <div>
                                <span className="font-medium">User ID:</span>
                                <p className="text-gray-600 font-mono text-sm">{data._id}</p>
                            </div>
                        </div>

                        {data.createdAt && (
                            <div className="flex items-center space-x-3">
                                <div>
                                    <span className="font-medium">Joined:</span>
                                    <p className="text-gray-600">
                                        {new Date(data.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}

                        {data.lastLogin && (
                            <div className="flex items-center space-x-3">
                                <div>
                                    <span className="font-medium">Last Login:</span>
                                    <p className="text-gray-600">
                                        {new Date(data.lastLogin).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {data.bio && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                            <span className="font-medium">Bio:</span>
                            <p className="text-gray-600 mt-1">{data.bio}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Conditional row styles for expanded rows
    const conditionalRowStyles = [
        {
            when: row => expandedUser === row._id,
            style: {
                backgroundColor: '#f1f5f9',
            },
        },
    ];

    return (
        <div className="px-4 py-4 md:px-20">
            <div className="overflow-hidden rounded-lg shadow-xl">
                <DataTable
                    columns={columns}
                    data={users}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[5, 10, 15, 20]}
                    expandableRows
                    expandableRowsComponent={ExpandedComponent}
                    expandableRowExpanded={row => row._id === expandedUser}
                    onRowExpandToggled={(expanded, row) => toggleExpand(row._id)}
                    customStyles={customStyles}
                    conditionalRowStyles={conditionalRowStyles}
                    defaultSortFieldId={2} // Sort by name by default
                    highlightOnHover
                    responsive
                    noDataComponent={<NoDataComponent />}
                />
            </div>
        </div>
    );
};

UserTable.propTypes = {
    users: PropTypes.array,
    onDelete: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired
};

export default UserTable;