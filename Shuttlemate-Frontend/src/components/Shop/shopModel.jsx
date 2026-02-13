import React from 'react';

const ShopModal = ({
    isOpen,
    formData,
    handleChange,
    handleCategoryChange,
    handleBrandChange,
    handleSubmit,
    toggleModal,
    uploadError,
    addCategory,
    removeCategory,
    addBrand,
    removeBrand,
    step,
    setStep,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
                <h2 className="mb-4 text-2xl font-bold text-center">Add New Shop</h2>
                <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                        // Step 1: Basic Shop Info
                        <>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Shop Name</label>
                                <input
                                    type="text"
                                    name="ShopName"
                                    value={formData.ShopName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Tel</label>
                                <input
                                    type="tel"
                                    name="Tel"
                                    value={formData.Tel}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Place</label>
                                <input
                                    type="text"
                                    name="place"
                                    value={formData.place}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Web Site</label>
                                <input
                                    type="text"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Shop Photo</label>
                                <input
                                    type="file"
                                    name="ShopPhoto"
                                    onChange={handleChange}
                                    accept="image/*"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex justify-between">
                                <button type="button" onClick={toggleModal} className="px-4 py-2 text-white bg-gray-500 rounded">Cancel</button>
                                <button type="button" onClick={() => setStep(2)} className="px-4 py-2 text-white bg-blue-500 rounded">Next</button>
                            </div>
                        </>
                    ) : step === 2 ? (
                        // Step 2: Categories
                        <>
                            <h3 className="mb-2 font-semibold">Shop Categories</h3>
                            <div className="p-2 mb-4 overflow-y-auto border border-gray-300 rounded max-h-96">
                                {formData.categories.map((category, catIndex) => (
                                    <div key={catIndex} className="p-2 mb-4 border rounded">
                                        <label className="block mb-2 font-semibold">Category Name</label>
                                        <input
                                            type="text"
                                            name="categoryName"
                                            value={category.categoryName}
                                            onChange={(e) => handleCategoryChange(catIndex, e)}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                        />
                                        <label className="block mt-3 mb-2 font-semibold">Price Range</label>
                                         <input
                                            type="text"
                                            name="priceRange"
                                            value={category.priceRange || ''}
                                            onChange={(e) => handleCategoryChange(catIndex, e)}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removeCategory(catIndex)} 
                                            className="px-2 py-1 mt-3 text-sm text-red-500 border border-red-300 rounded hover:bg-red-50"
                                        >
                                            Remove Category
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    type="button" 
                                    onClick={addCategory} 
                                    className="px-4 py-2 text-white bg-blue-500 rounded"
                                >
                                    Add Category
                                </button>
                            </div>
                            <div className="flex justify-between">
                                <button type="button" onClick={() => setStep(1)} className="px-4 py-2 text-white bg-gray-500 rounded">Back</button>
                                <button type="button" onClick={() => setStep(3)} className="px-4 py-2 text-white bg-blue-500 rounded">Next</button>
                            </div>
                        </>
                    ) : (
                        // Step 3: Brands
                        <>
                            <h3 className="mb-2 font-semibold">Shop Brands</h3>
                            <div className="p-2 mb-4 overflow-y-auto rounded max-h-96">
                                {formData.brands && formData.brands.map((brand, brandIndex) => (
                                    <div key={brandIndex} className="p-2 mb-4 border rounded">
                                        <div className="mb-4">
                                            <label className="block mb-2 font-semibold">Brand Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={brand.name}
                                                onChange={(e) => handleBrandChange(brandIndex, e)}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block mb-2 font-semibold">Brand Image</label>
                                            <input
                                                type="file"
                                                name="images"
                                                onChange={(e) => handleBrandChange(brandIndex, e)}
                                                accept="image/*"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => removeBrand(brandIndex)} 
                                                className="px-2 py-1 mt-3 text-sm text-red-500 border border-red-300 rounded hover:bg-red-50"
                                            >
                                                Remove Brand
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    type="button" 
                                    onClick={addBrand} 
                                    className="px-4 py-2 text-white bg-blue-500 rounded"
                                >
                                    Add Brand
                                </button>
                            </div>
                           
                            {uploadError && <p className="text-red-500">{uploadError}</p>}
                            <div className="flex justify-between">
                                <button type="button" onClick={() => setStep(2)} className="px-4 py-2 text-white bg-gray-500 rounded">Back</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded">Submit</button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ShopModal;