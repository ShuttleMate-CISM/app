import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DataTable from "react-data-table-component";
import { Trash2, Pencil, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import {useAuth} from '../../context/AuthContext';


const ShopDataTable = ({ shops = [], onDelete, onAddItem, onEdit }) => {
     const { user } = useAuth();
    const [expandedShop, setExpandedShop] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [categoryItems, setCategoryItems] = useState({});

    const toggleExpand = (shopId) => {
        setExpandedShop(expandedShop === shopId ? null : shopId);
    };

    const fetchItemsForCategory = async (categoryId) => {
        if (categoryItems[categoryId]) return; // Avoid fetching again if data already exists

        try {
            const response = await fetch(`http://localhost:5001/api/items/category/${categoryId}`);
            const data = await response.json();
            setCategoryItems((prev) => ({
                ...prev,
                [categoryId]: data,
            }));
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const toggleCategoryExpand = (categoryId) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));

        if (!categoryItems[categoryId]) {
            fetchItemsForCategory(categoryId);
        }
    };

    const baseColumns = [
        {
            name: 'Shop Photo',
            cell: row => (
                <img
                    src={row.ShopPhoto}
                    alt={row.ShopName}
                    className="object-cover w-16 h-16 mx-auto rounded-md"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                />
            ),
            center: true,
        },
        {
            name: 'Shop Name',
            selector: row => row.ShopName,
            sortable: true,
            center: true,
        },
        {
            name: 'Place',
            selector: row => row.place,
            sortable: true,
            center: true,
        },
        {
            name: 'Contact',
            selector: row => row.Tel,
            sortable: true,
            center: true,
        },
        {
            name: 'View Items',
            cell: row => (
                <button
                    onClick={() => toggleExpand(row._id)}
                    className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                    {expandedShop === row._id ? 'Hide' : 'View'} Categories
                </button>
            ),
            center: true,
            ignoreRowClick: true,
            button: true,
        },
        {
            name: 'Edit',
            cell: row => (
                <button
                    onClick={() => onEdit(row)}
                    className="px-4 py-1 font-bold text-blue-500 rounded hover:bg-blue-100"
                >
                    <Pencil size={18} />
                </button>
            ),
            center: true,
            ignoreRowClick: true,
            button: true,
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
               // fontWeight: 'bold',
                padding: '16px',
                borderBottom: '1px solid #2d3748',
            },
        },
        rows: {
            style: {

            },
        },
        cells: {
            style: {
                padding: '12px',
            },
        },
    };

    // Custom component that renders nothing when there's no data
    const NoDataComponent = () => <div></div>;

    const ExpandedComponent = ({ data }) => (
        <div className="p-4 m-4 border rounded-lg ">
            <div className="overflow-hidden rounded-lg shadow-md">
                <h3 className="mb-3 text-lg font-semibold text-center">
                    Categories for {data.ShopName}
                </h3>
                {data.categories && data.categories.length > 0 ? (
                    <div className="space-y-4">
                        {data.categories.map(category => (
                            <div key={category._id} className="p-3 border rounded ">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">{category.categoryName}</h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleCategoryExpand(category._id)}
                                            className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                                        >
                                            {expandedCategories[category._id] ? 'Hide Items' : 'View Items'}
                                        </button>
                                        <button
                                            onClick={() => onAddItem(data, category)}
                                            className="px-3 py-1 text-white bg-green-500 rounded hover:bg-green-600"
                                        >
                                            <Plus size={16} className="inline mr-1" />
                                            Add Item
                                        </button>
                                    </div>
                                </div>

                            
                                {expandedCategories[category._id] && (
                                    <div className="mt-2 space-y-2">
                                        {categoryItems[category._id] ? (
                                            categoryItems[category._id].length > 0 ? (
                                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                                                    {categoryItems[category._id].map(item => (
                                                        <div key={item._id} className="flex items-center p-3 space-x-3 border rounded ">
                                                            <img
                                                                src={item.itemphoto}
                                                                alt={item.name}
                                                                className="object-cover w-16 h-16 rounded-md"
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                                                            />
                                                            <div>
                                                                <div className="font-medium">{item.name}</div>
                                                                <div className="text-sm ">Price: {item.price}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-400">No items found.</p>
                                            )
                                        ) : (
                                            <p className="text-gray-400">Loading items...</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No categories found.</p>
                )}
            </div>
        </div>
    );

    // Use expandOnRowClicked to show the expanded component when a row is clicked
    const conditionalRowStyles = [
        {
            when: row => expandedShop === row._id,
            style: {
                // Slate-800
            },
        },
    ];

    return (
        <div className="px-4 py-4 md:px-20">
            <div className="overflow-hidden rounded-lg shadow-xl">
                <DataTable
                    columns={columns}
                    data={shops}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[5, 10, 15, 20]}
                    expandableRows
                    expandableRowsComponent={ExpandedComponent}
                    expandableRowExpanded={row => row._id === expandedShop}
                    onRowExpandToggled={(expanded, row) => toggleExpand(row._id)}
                    customStyles={customStyles}
                    conditionalRowStyles={conditionalRowStyles}
                    sortIcon={<ChevronDown size={16} />}
                    defaultSortFieldId={1}
                    highlightOnHover
                    responsive
                    noDataComponent={<NoDataComponent />}
                />
            </div>
        </div>
    );
};

ShopDataTable.propTypes = {
    shops: PropTypes.array,
    onDelete: PropTypes.func.isRequired,
    onAddItem: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired
};

export default ShopDataTable;