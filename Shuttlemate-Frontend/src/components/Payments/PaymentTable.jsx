import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DataTable from "react-data-table-component";
import { Trash2, Eye, DollarSign, CreditCard, Calendar, User, Package, AlertCircle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PaymentTable = ({ payments = [], onDelete, onUpdateStatus, loading = false }) => {
    const { user } = useAuth();
    const [expandedPayment, setExpandedPayment] = useState(null);

    const toggleExpand = (paymentId) => {
        setExpandedPayment(expandedPayment === paymentId ? null : paymentId);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'succeeded':
                return <CheckCircle size={16} className="text-green-600" />;
            case 'failed':
                return <XCircle size={16} className="text-red-600" />;
            case 'pending':
                return <Clock size={16} className="text-yellow-600" />;
            case 'canceled':
                return <XCircle size={16} className="text-gray-600" />;
            case 'refunded':
                return <RefreshCw size={16} className="text-blue-600" />;
            default:
                return <AlertCircle size={16} className="text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'succeeded':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'canceled':
                return 'bg-gray-100 text-gray-800';
            case 'refunded':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const baseColumns = [
        {
            name: 'Payment ID',
            selector: row => row.PaymentID || row._id,
            sortable: true,
            center: true,
            cell: row => (
                <span className="font-mono text-sm text-gray-700">
                    {(row.PaymentID || row._id).substring(0, 8)}...
                </span>
            ),
        },
        {
            name: 'Customer',
            selector: row => row.userName || 'Unknown User',
            sortable: true,
            cell: row => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900"> {row.userId ? row.userId : 'N/A'}</span>
                    
                </div>
            ),
        },
        {
            name: 'Item',
            selector: row => row.itemName || 'Unknown Item',
            sortable: true,
            cell: row => (
                <div className="flex items-center space-x-3">
                   
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900"> {row.itemId ? row.itemId.toString() : 'N/A'}</span>
                        {row.quantity && (
                            <span className="text-xs text-blue-600">Qty: {row.quantity}</span>
                        )}
                       
                    </div>
                </div>
            ),
        },
        {
            name: 'Amount',
            selector: row => row.amount,
            sortable: true,
            center: true,
            cell: row => (
                <span className="font-semibold text-gray-900">
                    {formatCurrency(row.amount, row.currency)}
                </span>
            ),
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            center: true,
            cell: row => (
                <div className="flex items-center justify-center space-x-2">
                    {getStatusIcon(row.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                </div>
            ),
        },
       
        {
            name: 'View Details',
            cell: row => (
                <button
                    onClick={() => toggleExpand(row._id)}
                    className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                >
                    {expandedPayment === row._id ? 'Hide' : 'View'} Details
                </button>
            ),
            center: true,
            ignoreRowClick: true,
            button: true,
        },
    ];

    const deleteColumn = {
        name: 'Actions',
        cell: row => (
            <div className="flex space-x-2">
                {row.status === 'pending' && onUpdateStatus && (
                    <>
                        <button
                            onClick={() => onUpdateStatus(row._id, 'succeeded')}
                            className="px-2 py-1 text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
                            title="Mark as Succeeded"
                        >
                            <CheckCircle size={16} />
                        </button>
                        <button
                            onClick={() => onUpdateStatus(row._id, 'failed')}
                            className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                            title="Mark as Failed"
                        >
                            <XCircle size={16} />
                        </button>
                    </>
                )}
                <button
                    onClick={() => onDelete(row._id)}
                    className="px-2 py-1 font-bold text-red-500 transition duration-300 ease-in-out transform rounded hover:bg-red-100 hover:scale-105"
                    title="Delete Payment"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        ),
        center: true,
        ignoreRowClick: true,
        button: true,
    };

    const isAdmin = user?.role === 'admin';
    
    // Conditionally add actions column based on admin status
    const columns = isAdmin ? [...baseColumns, deleteColumn] : baseColumns;

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#1e3a8a', 
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
                minHeight: '60px', // Increased height for better display of user/item info
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
            <CreditCard size={48} className="text-gray-400 mb-4" />
            <p className="text-gray-500">No payments found</p>
        </div>
    );

    // Loading component
    const LoadingComponent = () => (
        <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw size={48} className="text-gray-400 mb-4 animate-spin" />
            <p className="text-gray-500">Loading payments...</p>
        </div>
    );

    const ExpandedComponent = ({ data }) => (
        <div className="p-4 m-4 border rounded-lg bg-gray-50">
            <div className="overflow-hidden rounded-lg shadow-md bg-white">
                <h3 className="mb-4 text-lg font-semibold text-center bg-gray-100 py-3">
                    Payment Details: {data.PaymentID || data._id}
                </h3>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                            <CreditCard size={20} className="text-blue-500" />
                            <div>
                                <span className="font-medium">Payment ID:</span>
                                <p className="text-gray-600 font-mono text-sm">{data.PaymentID || data._id}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <User size={20} className="text-green-500" />
                            <div>
                                <span className="font-medium">Customer:</span>
                                <p className="text-gray-800 font-semibold">{data.userId || 'N/A'}</p>
                               
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Package size={20} className="text-purple-500 mt-1" />
                            <div>
                                <span className="font-medium">Item:</span>
                                <div className="flex items-center space-x-2 mt-1">
                                    
                                    <div>
                                        <p className="text-gray-800 font-semibold">ID: {data.itemId || 'N/A'}</p>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <DollarSign size={20} className="text-yellow-500" />
                            <div>
                                <span className="font-medium">Amount:</span>
                                <p className="text-gray-600 font-semibold text-lg">
                                    {formatCurrency(data.amount, data.currency)}
                                </p>
                                {data.itemPrice && (
                                    <p className="text-gray-500 text-sm">
                                        Item Price: {formatCurrency(data.itemPrice, data.currency)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {getStatusIcon(data.status)}
                            <div>
                                <span className="font-medium">Status:</span>
                                <p className={`inline-block ml-2 px-2 py-1 rounded text-sm font-medium ${getStatusColor(data.status)}`}>
                                    {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Calendar size={20} className="text-red-500" />
                            <div>
                                <span className="font-medium">Created:</span>
                                <p className="text-gray-600">
                                    {new Date(data.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {data.metadata && Object.keys(data.metadata).length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                            <span className="font-medium">Metadata:</span>
                            <div className="mt-2 space-y-1">
                                {Object.entries(data.metadata).map(([key, value]) => (
                                    <div key={key} className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-700">{key}:</span>
                                        <span className="text-gray-600">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status-specific information */}
                    {data.status === 'failed' && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                            <div className="flex items-center space-x-2">
                                <XCircle size={16} className="text-red-600" />
                                <span className="font-medium text-red-800">Payment Failed</span>
                            </div>
                            <p className="text-red-700 text-sm mt-1">
                                This payment has failed and may require attention.
                            </p>
                        </div>
                    )}

                    {data.status === 'refunded' && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                            <div className="flex items-center space-x-2">
                                <RefreshCw size={16} className="text-blue-600" />
                                <span className="font-medium text-blue-800">Payment Refunded</span>
                            </div>
                            <p className="text-blue-700 text-sm mt-1">
                                This payment has been refunded to the customer.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Conditional row styles for expanded rows
    const conditionalRowStyles = [
        {
            when: row => expandedPayment === row._id,
            style: {
                backgroundColor: '#f1f5f9',
            },
        },
        // Different colors based on payment status
        {
            when: row => row.status === 'failed',
            style: {
                borderLeft: '4px solid #ef4444',
            },
        },
        {
            when: row => row.status === 'succeeded',
            style: {
                borderLeft: '4px solid #22c55e',
            },
        },
        {
            when: row => row.status === 'pending',
            style: {
                borderLeft: '4px solid #eab308',
            },
        },
    ];

    if (loading) {
        return (
            <div className="px-4 py-4 md:px-20">
                <div className="overflow-hidden rounded-lg shadow-xl">
                    <LoadingComponent />
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-4 md:px-20">
            <div className="overflow-hidden rounded-lg shadow-xl">
                <DataTable
                    columns={columns}
                    data={payments}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[5, 10, 15, 20]}
                    expandableRows
                    expandableRowsComponent={ExpandedComponent}
                    expandableRowExpanded={row => row._id === expandedPayment}
                    onRowExpandToggled={(expanded, row) => toggleExpand(row._id)}
                    customStyles={customStyles}
                    conditionalRowStyles={conditionalRowStyles}
                    defaultSortFieldId={6} // Sort by date by default (most recent first)
                    defaultSortAsc={false}
                    highlightOnHover
                    responsive
                    noDataComponent={<NoDataComponent />}
                />
            </div>
        </div>
    );
};

PaymentTable.propTypes = {
    payments: PropTypes.array,
    onDelete: PropTypes.func.isRequired,
    onUpdateStatus: PropTypes.func, // Optional function to update payment status
    loading: PropTypes.bool
};

export default PaymentTable;