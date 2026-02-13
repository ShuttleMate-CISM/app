import React from 'react';
import DataTable from 'react-data-table-component';
import { Pencil, Trash2 } from 'lucide-react';
import {useAuth} from '../../context/AuthContext';


const VideoTable = ({ videos, onDeleteVideo, onEditVideo }) => {
    const { user } = useAuth();
    
    const baseColumns = [
        {
            name: 'Thumbnail',
            selector: row => (
                <div className="flex justify-center w-full">
                    <img
                        src={row.imgUrl}
                        alt={row.videoName}
                        className="object-cover w-16 h-16 rounded-md"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                    />
                </div>
            ),
            center: true,
        },
        {
            name: 'Name of Video',
            selector: row => row.videoName,
            center: true,
        },
        {
            name: 'Video By',
            selector: row => row.videoCreator,
            center: true,
        },
        {
            name: 'Created',
            selector: row => row.createdAt,
            center: true,
        },
        {
            name: 'Edit',
            cell: (row) => (
                <div className="flex justify-center w-full">
                    <button 
                        onClick={() => onEditVideo(row)} 
                        className="flex items-center justify-center w-10 h-10 font-bold text-blue-500 duration-300 ease-in-out transform rounded hover:bg-blue-100 hover:scale-105"
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
        //     cell: (row) => (
        //         <div className="flex justify-center w-full">
        //             <button
        //                 onClick={() => onDeleteVideo(row._id)}
        //                 className="flex items-center justify-center w-10 h-10 font-bold text-red-500 transition duration-300 ease-in-out transform rounded hover:bg-red-100 hover:scale-105"
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
        
        // Conditionally add delete column based on admin status
        const columns = isAdmin ? [...baseColumns, deleteColumn] : baseColumns;
    return (
        <div className="mx-20">
            <div className="overflow-hidden rounded-lg shadow-xl">
            <DataTable
                columns={columns}
                data={videos}
                customStyles={{
                    headCells: {
                        style: {
                            backgroundColor: '#1e3a8a',
                            color: 'white',
                          //  fontWeight: 'bold',
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
            </div>
        </div>
    );
};

export default VideoTable;