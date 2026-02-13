import React, { useState, useEffect } from 'react';
import UserTable from '../components/Users/UserTable';
import { Users as UsersIcon, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch users from API
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('http://localhost:5000/api/auth/users');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Handle different API response structures
            if (Array.isArray(data)) {
                setUsers(data);
            } else if (data.users && Array.isArray(data.users)) {
                setUsers(data.users);
            } else if (data.data && Array.isArray(data.data)) {
                setUsers(data.data);
            } else {
                console.log('API Response structure:', data);
                throw new Error('Invalid response format: Expected an array of users');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle delete user
    const handleDeleteUser = async (userId) => {
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
            const response = await fetch(`http://localhost:5000/api/auth/delete/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to delete user: ${response.status} ${response.statusText}`);
            }

            // Remove user from local state
            setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
            
            // Show success message
            Swal.fire({
                title: 'Deleted!',
                text: 'User has been deleted successfully.',
                icon: 'success',
                confirmButtonColor: '#3085d6'
            });
        } catch (err) {
            console.error('Error deleting user:', err);
            Swal.fire({
                title: 'Error!',
                text: `Failed to delete user: ${err.message}`,
                icon: 'error',
                confirmButtonColor: '#3085d6'
            });
        }
    };

    // Handle edit user (placeholder - you can implement edit modal/form)
    const handleEditUser = (user) => {
        console.log('Edit user:', user);
        // TODO: Implement edit functionality
        // This could open a modal, navigate to edit page, etc.
        Swal.fire({
            title: 'Edit User',
            text: `Edit functionality for ${user.firstName} ${user.lastName} - To be implemented`,
            icon: 'info',
            confirmButtonColor: '#3085d6'
        });
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchUsers();
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-600">Loading users...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Users</h2>
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
           <h1 className="pt-10 text-4xl font-bold text-center pb-7">Registered users</h1>
            {/* User Table */}
            <UserTable
                users={users}
                onDelete={handleDeleteUser}
                onEdit={handleEditUser}
            />
        </div>
    );
};

export default Users;