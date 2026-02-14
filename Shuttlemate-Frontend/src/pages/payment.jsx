import React, { useState, useEffect } from 'react';
import PaymentTable from '../components/Payments/PaymentTable';
import { CreditCard, AlertCircle, RefreshCw, Filter, DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [enrichedPayments, setEnrichedPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPayments, setTotalPayments] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        succeeded: 0,
        pending: 0,
        failed: 0,
        canceled: 0,
        refunded: 0,
        totalRevenue: 0
    });

    // Enrich payment data with user and item information
    const enrichPaymentData = async (payments) => {
        try {
            const enrichedData = await Promise.all(
                payments.map(async (payment) => {
                    try {
                        // Get user information
                        let userName = 'Unknown User';
                        let userEmail = 'No email';
                        
                        if (payment.userId) {
                            try {
                                const userResponse = await fetch(`http://localhost:5001/api/users/${payment.userId}`);
                                if (userResponse.ok) {
                                    const userData = await userResponse.json();
                                    userName = userData.name || userData.displayName || 'Unknown User';
                                    userEmail = userData.email || 'No email';
                                }
                            } catch (userErr) {
                                console.log(`Could not fetch user data for ${payment.userId}`);
                            }
                        }

                        // Get item information
                        let itemName = 'Unknown Item';
                        let itemPhoto = null;
                        let shopName = 'Unknown Shop';
                        let itemPrice = null;

                        if (payment.itemId) {
                            try {
                                const itemResponse = await fetch(`http://localhost:5001/api/shops/item/${payment.itemId}`);
                                if (itemResponse.ok) {
                                    const itemData = await itemResponse.json();
                                    itemName = itemData.name || 'Unknown Item';
                                    itemPhoto = itemData.photo;
                                    shopName = itemData.shopName || 'Unknown Shop';
                                    itemPrice = itemData.price;
                                }
                            } catch (itemErr) {
                                console.log(`Could not fetch item data for ${payment.itemId}`);
                            }
                        }

                        return {
                            ...payment,
                            userName,
                            userEmail,
                            itemName,
                            itemPhoto,
                            shopName,
                            itemPrice
                        };
                    } catch (enrichErr) {
                        console.error('Error enriching payment:', enrichErr);
                        return {
                            ...payment,
                            userName: 'Unknown User',
                            userEmail: 'No email',
                            itemName: 'Unknown Item',
                            itemPhoto: null,
                            shopName: 'Unknown Shop',
                            itemPrice: null
                        };
                    }
                })
            );
            
            return enrichedData;
        } catch (error) {
            console.error('Error in enrichPaymentData:', error);
            return payments.map(payment => ({
                ...payment,
                userName: 'Unknown User',
                userEmail: 'No email',
                itemName: 'Unknown Item',
                itemPhoto: null,
                shopName: 'Unknown Shop',
                itemPrice: null
            }));
        }
    };

    // Fetch payments from API
    const fetchPayments = async (status = '') => {
        try {
            setLoading(true);
            setError(null);
            
            const queryParams = new URLSearchParams({
                limit: '100',
                skip: '0'
            });
            
            if (status) {
                queryParams.append('status', status);
            }
            
            console.log('Fetching payments with URL:', `http://localhost:5001/api/payment/payments?${queryParams}`);
            
            const response = await fetch(`http://localhost:5001/api/payment/payments?${queryParams}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch payments: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            
            // Handle the API response structure
            if (data.payments && Array.isArray(data.payments)) {
                setPayments(data.payments);
                setTotalPayments(data.total || data.payments.length);
                
                // Enrich payment data
                const enriched = await enrichPaymentData(data.payments);
                setEnrichedPayments(enriched);
            } else if (Array.isArray(data)) {
                setPayments(data);
                setTotalPayments(data.length);
                
                // Enrich payment data
                const enriched = await enrichPaymentData(data);
                setEnrichedPayments(enriched);
            } else {
                console.error('Unexpected API Response structure:', data);
                throw new Error('Invalid response format: Expected payments array');
            }
        } catch (err) {
            console.error('Error fetching payments:', err);
            setError(err.message);
            setEnrichedPayments([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch payment statistics
    const fetchPaymentStats = async () => {
        try {
            console.log('Fetching payment stats...');
            
            // Try the dedicated stats endpoint first
            try {
                const statsResponse = await fetch('http://localhost:5001/api/payment/payments/stats');
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    console.log('Stats API Response:', statsData);
                    
                    if (statsData.statusStats) {
                        const newStats = {
                            total: statsData.totalPayments || 0,
                            totalRevenue: statsData.totalRevenue || 0,
                            succeeded: 0,
                            pending: 0,
                            failed: 0,
                            canceled: 0,
                            refunded: 0
                        };
                        
                        // Process status stats
                        statsData.statusStats.forEach(stat => {
                            if (stat.status in newStats) {
                                newStats[stat.status] = stat.count;
                            }
                        });
                        
                        setStats(newStats);
                        return;
                    }
                }
            } catch (statsErr) {
                console.log('Stats endpoint not available, calculating from payments list');
            }
            
            // Fallback: calculate from payments list
            const response = await fetch('http://localhost:5001/api/payment/payments?limit=1000');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch payment stats: ${response.status}`);
            }
            
            const data = await response.json();
            const allPayments = data.payments || data;
            
            if (Array.isArray(allPayments)) {
                const newStats = {
                    total: allPayments.length,
                    succeeded: allPayments.filter(p => p.status === 'succeeded').length,
                    pending: allPayments.filter(p => p.status === 'pending').length,
                    failed: allPayments.filter(p => p.status === 'failed').length,
                    canceled: allPayments.filter(p => p.status === 'canceled' || p.status === 'cancelled').length,
                    refunded: allPayments.filter(p => p.status === 'refunded').length,
                    totalRevenue: allPayments
                        .filter(p => p.status === 'succeeded')
                        .reduce((sum, p) => sum + (p.amount || 0), 0)
                };
                console.log('Calculated stats:', newStats);
                setStats(newStats);
            } else {
                console.error('Stats: Expected array of payments, got:', typeof allPayments);
            }
        } catch (err) {
            console.error('Error fetching payment stats:', err);
        }
    };

    // Fetch payments on component mount and when filter changes
    useEffect(() => {
        fetchPayments(statusFilter);
        fetchPaymentStats();
    }, [statusFilter]);

    // Handle delete payment - Fixed endpoint
    const handleDeletePayment = async (paymentId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/payment/payment/${paymentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to delete payment: ${response.status} ${response.statusText}`);
            }

            setPayments(prevPayments => prevPayments.filter(payment => payment._id !== paymentId));
            setEnrichedPayments(prevPayments => prevPayments.filter(payment => payment._id !== paymentId));
            setTotalPayments(prev => prev - 1);
            
            // Refresh stats
            fetchPaymentStats();
            
            // Show success message
            Swal.fire({
                title: 'Deleted!',
                text: 'Payment has been deleted successfully.',
                icon: 'success',
                confirmButtonColor: '#3085d6'
            });
        } catch (err) {
            console.error('Error deleting payment:', err);
            Swal.fire({
                title: 'Error!',
                text: `Failed to delete payment: ${err.message}`,
                icon: 'error',
                confirmButtonColor: '#3085d6'
            });
        }
    };

    // Handle payment status update - Fixed endpoint
    const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
        try {
            // Fixed endpoint to match your backend route
            const response = await fetch(`http://localhost:5001/api/payment/payment/${paymentId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update payment status: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            // Update payment in both states
            const updatePaymentStatus = (payments) => 
                payments.map(payment => 
                    payment._id === paymentId 
                        ? { ...payment, status: newStatus, updatedAt: new Date().toISOString() }
                        : payment
                );
            
            setPayments(updatePaymentStatus);
            setEnrichedPayments(updatePaymentStatus);
            
            // Refresh stats
            fetchPaymentStats();
            
            // Show success message
            Swal.fire({
                title: 'Updated!',
                text: `Payment status has been updated to ${newStatus}.`,
                icon: 'success',
                confirmButtonColor: '#3085d6',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Error updating payment status:', err);
            Swal.fire({
                title: 'Error!',
                text: `Failed to update payment status: ${err.message}`,
                icon: 'error',
                confirmButtonColor: '#3085d6'
            });
        }
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchPayments(statusFilter);
        fetchPaymentStats();
    };

    // Handle status filter change
    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
    };

    // Format currency
    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-600">Loading payments...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Payments</h2>
                <p className="text-gray-600 mb-4 text-center max-w-md">{error}</p>
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                >
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            {/* Header Section */}
            <div className="pt-10 pb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Management</h1>
                       
                    </div>
                  
                </div>
            </div>

            {/* Payment Table */}
            <PaymentTable
                payments={enrichedPayments}
                onDelete={handleDeletePayment}
                onUpdateStatus={handleUpdatePaymentStatus}
                loading={loading}
            />
        </div>
    );
};

export default Payments;