import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/firebaseconfig';

const ItemModal = ({ isOpen, onClose, onAddItem, selectedShop, selectedCategory }) => {
    const [itemDetails, setItemDetails] = useState({
        name: '',
        price: '',
        color: '',
        itemphoto: null,
        brand: '',
        features: '',
        availableqty: 0,
        shopName: ''
    });
    const [photoURL, setPhotoURL] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Set shopName when selectedShop changes
    React.useEffect(() => {
        if (selectedShop) {
            setItemDetails(prev => ({
                ...prev,
                shopName: selectedShop.ShopName
            }));
        }
    }, [selectedShop]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setItemDetails({ ...itemDetails, [name]: files[0] });
        } else {
            setItemDetails({ ...itemDetails, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedShop || !selectedCategory) {
            setError('Shop and category must be selected');
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            let finalItemData = {
                name: itemDetails.name,
                price: Number(itemDetails.price),
                color: itemDetails.color,
                brand: itemDetails.brand,
                features: itemDetails.features,
                availableqty: Number(itemDetails.availableqty),
                shopName: itemDetails.shopName,
                categoryId: selectedCategory._id
            };

            // If there's a photo to upload, handle it first
            if (itemDetails.itemphoto) {
                const storageRef = ref(storage, `items/${selectedShop._id}/${selectedCategory._id}/${Date.now()}_${itemDetails.itemphoto.name}`);
                const uploadTask = uploadBytesResumable(storageRef, itemDetails.itemphoto);
                
                // Monitor upload progress
                uploadTask.on(
                    'state_changed', 
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(progress);
                    },
                    (error) => {
                        setError('Failed to upload image: ' + error.message);
                        setLoading(false);
                    },
                    async () => {
                        // Get the download URL after upload completes
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        setPhotoURL(downloadURL);
                        
                        // Add the photo URL to the item data
                        finalItemData.itemphoto = downloadURL;
                        
                        // Now submit the item with the photo URL
                        submitItemToAPI(finalItemData);
                    }
                );
            } else {
                // No photo to upload, submit the item data directly
                submitItemToAPI(finalItemData);
            }
        } catch (err) {
            setError('An unexpected error occurred: ' + err.message);
            setLoading(false);
        }
    };

    const submitItemToAPI = async (itemData) => {
        try {
            console.log(itemData);
            console.log(selectedCategory._id);
            // Make the API call to add the item
            const response = await axios.post(
                `http://localhost:5000/api/shops/shop/${selectedShop._id}/categories/${selectedCategory._id}/items`,
                itemData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );  
            console.log(itemData);
            
            // Call the parent component's callback with the new item
            onAddItem(response.data);
            
            // Reset the form
            setItemDetails({
                name: '',
                price: '',
                color: '',
                brand: '',
                features: '',
                availableqty: 0,
                shopName: '',
                categoryId: '',
                itemphoto: null,
            });
            setPhotoURL('');
            setUploadProgress(0);
            
            // Close the modal
            onClose();
            
            // Refresh the page after a short delay to allow server processing
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add item');
            console.error('Error adding item:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="p-6 overflow-y-auto bg-white rounded-lg max-h-[90vh] w-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Add New Item</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>
                
                {error && (
                    <div className="p-2 mb-4 text-white bg-red-500 rounded">
                        {error}
                    </div>
                )}
                
                {selectedShop && selectedCategory && (
                    <div className="mb-4 text-sm text-gray-600">
                        Adding item to <span className="font-semibold">{selectedCategory.categoryName}</span> category in <span className="font-semibold">{selectedShop.ShopName}</span> shop.
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Item Name*</label>
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="Item Name" 
                            className="w-full p-2 border rounded" 
                            onChange={handleChange} 
                            value={itemDetails.name}
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block mb-1 text-sm font-medium">Price*</label>
                        <input 
                            type="number" 
                            name="price" 
                            placeholder="Price" 
                            className="w-full p-2 border rounded" 
                            onChange={handleChange} 
                            value={itemDetails.price}
                            min="0"
                            step="0.01"
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block mb-1 text-sm font-medium">Brand</label>
                        <input 
                            type="text" 
                            name="brand" 
                            placeholder="Brand (optional)" 
                            className="w-full p-2 border rounded" 
                            onChange={handleChange} 
                            value={itemDetails.brand}
                        />
                    </div>
                    
                    <div>
                        <label className="block mb-1 text-sm font-medium">Color</label>
                        <input 
                            type="text" 
                            name="color" 
                            placeholder="Color (optional)" 
                            className="w-full p-2 border rounded" 
                            onChange={handleChange} 
                            value={itemDetails.color}
                        />
                    </div>
                    
                    <div>
                        <label className="block mb-1 text-sm font-medium">Available Quantity</label>
                        <input 
                            type="number" 
                            name="availableqty" 
                            placeholder="Available Quantity" 
                            className="w-full p-2 border rounded" 
                            onChange={handleChange} 
                            value={itemDetails.availableqty}
                            min="0"
                        />
                    </div>
                    
                    <div>
                        <label className="block mb-1 text-sm font-medium">Features</label>
                        <textarea 
                            name="features" 
                            placeholder="Item features (optional)" 
                            className="w-full p-2 border rounded" 
                            onChange={handleChange} 
                            value={itemDetails.features}
                            rows="3"
                        />
                    </div>
                    
                    <div>
                        <label className="block mb-1 text-sm font-medium">Item Photo*</label>
                        <input 
                            type="file" 
                            name="itemphoto" 
                            accept="image/*"
                            className="w-full p-2 border rounded" 
                            onChange={handleChange}
                            required
                        />
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="w-full mt-1 bg-gray-200 rounded-full h-2.5">
                                <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                                <p className="mt-1 text-xs text-gray-500">{Math.round(uploadProgress)}% uploaded</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button 
                            type="button" 
                            className="p-2 mr-2 text-white bg-gray-500 rounded hover:bg-gray-600" 
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="p-2 text-white rounded bg-amber-500 hover:bg-yellow-400 disabled:bg-amber-300"
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

ItemModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onAddItem: PropTypes.func.isRequired,
    selectedShop: PropTypes.object,
    selectedCategory: PropTypes.object,
};

export default ItemModal;