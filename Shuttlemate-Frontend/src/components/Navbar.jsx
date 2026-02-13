import React from 'react';
import Video from '../pages/VideoPage';
import images from '../assets/Images';
import { useAuth } from '../context/AuthContext';
import { useLogout } from '../hooks/useLogout';
import Swal from 'sweetalert2';

const Navbar = () => {
    const { user, isAuthenticated } = useAuth();
    const handleLogout = useLogout();

    if (!isAuthenticated) return null;

    const navigationItems = [
        {
            href: "Home",
            label:"Home",
            roles:["admin","coach","courtowner","shopowner"]
        },
        {
            href:"VideoPage",
            label:"Training Videos",
            roles: ["admin","coach"]
        },
        {
            href:"Users",
            label:"Users",
            roles:["admin"]
        },
        {
            href:"Coachers",
            label:"Coaches",
            roles: ["admin","coach"]
        },
        {
            href:"Court",
            label:"Courts",
            roles: ["admin","courtowner"]
        },
        {
            href:"shop",
            label:"Shop",
            roles: ["admin","shopowner"]
        },
        {
            href:"Matchtimeline",
            label:"Match Timeline",
            roles: ["admin","coach","courtowner","shopowner"]
        },
        {
            href:"News",
            label:"News",
            roles: ["admin","coach","courtowner","shopowner"]
        },
         {
            href:"payment",
            label:"Payments",
            roles: ["admin","shopowner"]
        },
    ]

     const getVisibleNavItems = () => {
        if (user?.role === "admin") {
            return navigationItems; // Admin sees everything
        }
        
        return navigationItems.filter(item => 
            item.roles.includes(user?.role)
        );
    };

    const handleLogoutClick = async () => {
        const result = await Swal.fire({
            title: 'Confirm Sign Out',
            text: 'Are you sure you want to sign out of your account?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Sign Out',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            handleLogout();
        }
    };

    const visibleNavItems = getVisibleNavItems();
    
    return (
        <nav className="bg-blue shadow-lg border-b border-gray-200">
            <div className="container mx-auto px-6 py-3">
                <div className="flex items-center justify-between">
            
                    <div className="flex items-center space-x-4">
                        <img 
                            src={images.logo} 
                            alt="Shuttlemate Logo"
                            className="h-10 w-auto"
                        />
                        <div className="text-2xl font-bold text-gray-800 tracking-tight">
                            Shuttlemate
                        </div>
                    </div>

                  <div className="hidden md:flex items-center space-x-8">
                        {visibleNavItems.map((item, index) => (
                            <a 
                                key={index}
                                href={item.href} 
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-1 py-2 rounded-md hover:bg-gray-50"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
            
                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-semibold text-gray-800">
                                {user?.username}
                            </span>
                            <span className="text-xs text-gray-500  tracking-wide">
                                {user?.role}
                            </span>
                        </div>
                        <div className="h-8 w-px bg-gray-300"></div>
                        <button
                            onClick={handleLogoutClick}
                            className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Button (you can expand this later) */}
          <div className="md:hidden px-6 pb-3">
                <div className="flex flex-col space-y-2">
                    <button className="text-gray-700 hover:text-blue-600 font-medium text-left">
                        Menu
                    </button>
                    {/* Mobile menu items can be expanded here with same role filtering */}
                    <div className="hidden flex-col space-y-2 pl-4" id="mobile-menu">
                        {visibleNavItems.map((item, index) => (
                            <a
                                key={index}
                                href={item.href}
                                className="text-gray-600 hover:text-blue-600 text-sm py-1"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>
                </div>
        </nav>
    );
};

export default Navbar;