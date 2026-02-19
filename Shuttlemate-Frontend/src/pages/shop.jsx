import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../components/Shop/shopModel";
import ShopTable from "../components/Shop/shopTable";
import EditShopModal from "../components/Shop/shopTable";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebaseconfig";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import ItemModal from "../components/Shop/ItemModel";

const Shop = () => {
  const [shops, setShops] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    ShopName: "",
    place: "",
    Tel: "",
    website: "",
    categories: [
      {
        categoryName: "",
        priceRange: "",
        items: [{ itemphoto: "", name: "", price: "", color: "" }],
      },
    ],
    ShopPhoto: null,
    brands: [],
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [step, setStep] = useState(1);

  // Edit shop state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    ShopName: "",
    place: "",
    Tel: "",
    website: "",
    ShopPhotoUrl: "",
    categories: [],
    brands: [],
  });
  const [editStep, setEditStep] = useState(1);

  const fetchShops = async () => {
    try {
      const response = await axios.get(`${window.__API_BASE_URL__}/api/shops`);
      setShops(response.data.shops);
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Updated handleCategoryChange to handle both categoryName and priceRange
  const handleCategoryChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedCategories = prev.categories.map((category, i) =>
        i === index ? { ...category, [name]: value } : category,
      );
      return { ...prev, categories: updatedCategories };
    });
  };

  const handleItemChange = (catIndex, itemIndex, e) => {
    const { name, value } = e.target;
    const updatedCategories = [...formData.categories];
    updatedCategories[catIndex].items[itemIndex][name] = value;
    setFormData((prev) => ({
      ...prev,
      categories: updatedCategories,
    }));
  };

  const addCategory = () => {
    setFormData((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          categoryName: "",
          priceRange: "",
          items: [{ itemphoto: "", name: "", price: "", color: "" }],
        },
      ],
    }));
  };

  const removeCategory = (index) => {
    const updatedCategories = [...formData.categories];
    updatedCategories.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      categories: updatedCategories,
    }));
  };

  const addItem = (catIndex) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[catIndex].items.push({
      itemphoto: "",
      name: "",
      price: "",
      color: "",
    });
    setFormData((prev) => ({
      ...prev,
      categories: updatedCategories,
    }));
  };

  const removeItem = (catIndex, itemIndex) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[catIndex].items.splice(itemIndex, 1);
    setFormData((prev) => ({
      ...prev,
      categories: updatedCategories,
    }));
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setStep(1);
  };

  // Open the item modal with a specific shop and category
  const openItemModal = (shop, category) => {
    console.log("Opening item modal for shop:", shop._id);
    console.log("Selected Category:", category);

    setSelectedShop(shop);
    setSelectedCategory(category);
    setIsItemModalOpen(true);
  };

  // Function to handle adding a new item via API
  const handleAddItem = async (newItem) => {
    try {
      console.log("Adding new item:", newItem);

      // After successful item addition, fetch fresh data
      await fetchShops();

      Swal.fire({
        title: "Success!",
        text: "Item added successfully.",
        icon: "success",
        confirmButtonText: "Okay",
      });
    } catch (error) {
      console.error("Error after adding item:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to refresh shop data.",
        icon: "error",
      });
    }
  };

  const addBrand = () => {
    setFormData((prev) => ({
      ...prev,
      brands: [...prev.brands, { name: "", images: null }],
    }));
  };

  const removeBrand = (index) => {
    const updatedBrands = [...formData.brands];
    updatedBrands.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      brands: updatedBrands,
    }));
  };

  const handleBrandChange = (index, e) => {
    const { name, value, files } = e.target;
    const updatedBrands = [...formData.brands];

    if (name === "images" && files && files[0]) {
      updatedBrands[index][name] = files[0];
    } else {
      updatedBrands[index][name] = value;
    }

    setFormData((prev) => ({
      ...prev,
      brands: updatedBrands,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3); // Add a step for brands
    } else {
      if (!formData.ShopPhoto) {
        setUploadError("Please upload a shop photo.");
        return;
      }

      setUploading(true);
      setUploadError("");

      try {
        // Upload shop photo
        const shopPhotoRef = ref(storage, `shops/${formData.ShopPhoto.name}`);
        const shopPhotoUpload = uploadBytesResumable(
          shopPhotoRef,
          formData.ShopPhoto,
        );

        const shopPhotoUrl = await new Promise((resolve, reject) => {
          shopPhotoUpload.on(
            "state_changed",
            () => {},
            reject,
            () => resolve(getDownloadURL(shopPhotoUpload.snapshot.ref)),
          );
        });

        // Upload brand images and gather their URLs
        const brandsWithImages = await Promise.all(
          formData.brands.map(async (brand) => {
            if (brand.images instanceof File) {
              const brandImageRef = ref(storage, `brands/${brand.images.name}`);
              const brandUpload = uploadBytesResumable(
                brandImageRef,
                brand.images,
              );

              const imageUrl = await new Promise((resolve, reject) => {
                brandUpload.on(
                  "state_changed",
                  () => {},
                  reject,
                  () => resolve(getDownloadURL(brandUpload.snapshot.ref)),
                );
              });

              return {
                name: brand.name,
                images: imageUrl,
              };
            }
            return brand;
          }),
        );

        // Include priceRange in the categories
        const categoriesWithFixedItems = formData.categories.map(
          (category) => ({
            categoryName: category.categoryName,
            priceRange: category.priceRange,
            items: category.items.map((item) => ({
              itemphoto: item.itemphoto,
              name: item.name,
              price: item.price,
              color: item.color,
            })),
          }),
        );

        const newShop = {
          ...formData,
          ShopPhoto: shopPhotoUrl,
          categories: categoriesWithFixedItems,
          brands: brandsWithImages,
        };

        await axios.post(`${window.__API_BASE_URL__}/api/shops`, newShop);
        fetchShops();
        setFormData({
          ShopName: "",
          place: "",
          Tel: "",
          website: "",
          categories: [
            {
              categoryName: "",
              priceRange: "",
              items: [{ itemphoto: "", name: "", price: "", color: "" }],
            },
          ],
          ShopPhoto: null,
          brands: [],
        });
        setIsModalOpen(false);
        setUploading(false);

        Swal.fire({
          title: "Success!",
          text: "Shop added successfully.",
          icon: "success",
          confirmButtonText: "Okay",
        });
      } catch (error) {
        console.error("Error adding shop:", error);
        setUploading(false);
        setUploadError("Failed to upload shop data.");
      }
    }
  };

  const handleDeleteShop = async (id) => {
    // Check if shop exists
    if (!shops.find((shop) => shop._id === id)) {
      Swal.fire({
        title: "Error!",
        text: "Shop not found.",
        icon: "error",
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await axios.delete(`${window.__API_BASE_URL__}/api/shops/shop/${id}`);
        setShops(shops.filter((shop) => shop._id !== id));

        Swal.fire({
          title: "Deleted!",
          text: "Shop has been deleted.",
          icon: "success",
        });
      }
    } catch (error) {
      console.error("Error deleting shop:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete the shop.",
        icon: "error",
      });
    }
  };

  // Edit shop handlers
  const handleEditClick = (shop) => {
    setSelectedShop(shop);
    setEditFormData({
      ShopName: shop.ShopName,
      Tel: shop.Tel,
      place: shop.place,
      website: shop.website || "",
      ShopPhotoUrl: shop.ShopPhoto,
      categories:
        shop.categories?.map((cat) => ({
          ...cat,
          priceRange: cat.priceRange || "", // Ensure priceRange is initialized
          items: cat.items || [],
        })) || [],
      brands: shop.brands || [],
    });
    setIsEditModalOpen(true);
    setEditStep(1);
  };

  const toggleEditModal = () => {
    setIsEditModalOpen(!isEditModalOpen);
    if (!isEditModalOpen) {
      setEditFormData({
        ShopName: "",
        place: "",
        Tel: "",
        website: "",
        ShopPhotoUrl: "",
        categories: [],
        brands: [],
      });
      setUploadError("");
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file" && files[0]) {
      // Handle file upload preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData((prev) => ({
          ...prev,
          ShopPhotoUrl: reader.result,
          ShopPhoto: files[0], // Store the actual file for upload
        }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Updated to handle all fields including priceRange
  const handleEditCategoryChange = (categoryIndex, e) => {
    const { name, value } = e.target;
    const updatedCategories = [...editFormData.categories];
    updatedCategories[categoryIndex] = {
      ...updatedCategories[categoryIndex],
      [name]: value,
    };
    setEditFormData((prev) => ({
      ...prev,
      categories: updatedCategories,
    }));
  };

  const handleEditItemChange = (categoryIndex, itemIndex, field, value) => {
    const updatedCategories = [...editFormData.categories];
    if (!updatedCategories[categoryIndex].items) {
      updatedCategories[categoryIndex].items = [];
    }
    updatedCategories[categoryIndex].items[itemIndex] = {
      ...updatedCategories[categoryIndex].items[itemIndex],
      [field]: value,
    };
    setEditFormData((prev) => ({
      ...prev,
      categories: updatedCategories,
    }));
  };

  const addEditCategory = () => {
    setEditFormData((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { categoryName: "", priceRange: "", items: [] },
      ],
    }));
  };

  const removeEditCategory = (index) => {
    const updatedCategories = [...editFormData.categories];
    updatedCategories.splice(index, 1);
    setEditFormData((prev) => ({
      ...prev,
      categories: updatedCategories,
    }));
  };

  const addEditItem = (categoryIndex) => {
    const updatedCategories = [...editFormData.categories];
    if (!updatedCategories[categoryIndex].items) {
      updatedCategories[categoryIndex].items = [];
    }
    updatedCategories[categoryIndex].items.push({
      name: "",
      price: "",
      color: "",
    });
    setEditFormData((prev) => ({
      ...prev,
      categories: updatedCategories,
    }));
  };

  const removeEditItem = (categoryIndex, itemIndex) => {
    const updatedCategories = [...editFormData.categories];
    updatedCategories[categoryIndex].items.splice(itemIndex, 1);
    setEditFormData((prev) => ({
      ...prev,
      categories: updatedCategories,
    }));
  };

  // Updated to include brand handling
  const handleEditBrandChange = (brandIndex, e) => {
    const { name, value, files } = e.target;
    const updatedBrands = [...editFormData.brands];

    if (name === "images" && files && files[0]) {
      // Handle file upload preview
      const reader = new FileReader();
      reader.onloadend = () => {
        updatedBrands[brandIndex] = {
          ...updatedBrands[brandIndex],
          imagePreview: reader.result,
          images: files[0], // store the file for upload
        };
        setEditFormData((prev) => ({
          ...prev,
          brands: updatedBrands,
        }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      updatedBrands[brandIndex] = {
        ...updatedBrands[brandIndex],
        [name]: value,
      };
      setEditFormData((prev) => ({
        ...prev,
        brands: updatedBrands,
      }));
    }
  };

  const addEditBrand = () => {
    setEditFormData((prev) => ({
      ...prev,
      brands: [...prev.brands, { name: "", images: null }],
    }));
  };

  const removeEditBrand = (index) => {
    const updatedBrands = [...editFormData.brands];
    updatedBrands.splice(index, 1);
    setEditFormData((prev) => ({
      ...prev,
      brands: updatedBrands,
    }));
  };

  const handleUpdateShop = async (shopId, updatedData) => {
    try {
      setUploading(true);
      setUploadError("");

      // Process brands if needed
      let updatedBrands = [...updatedData.brands];

      // Handle uploads for any new brand images
      for (let i = 0; i < updatedBrands.length; i++) {
        if (updatedBrands[i].images instanceof File) {
          const brandImageRef = ref(
            storage,
            `brands/${updatedBrands[i].images.name}`,
          );
          const brandUpload = uploadBytesResumable(
            brandImageRef,
            updatedBrands[i].images,
          );

          const imageUrl = await new Promise((resolve, reject) => {
            brandUpload.on(
              "state_changed",
              () => {},
              reject,
              () => resolve(getDownloadURL(brandUpload.snapshot.ref)),
            );
          });

          updatedBrands[i] = {
            name: updatedBrands[i].name,
            images: imageUrl,
          };
        }
      }

      // Check if there's a new photo to upload
      if (updatedData.ShopPhoto && updatedData.ShopPhoto instanceof File) {
        const storageRef = ref(storage, `shops/${updatedData.ShopPhoto.name}`);
        const uploadTask = uploadBytesResumable(
          storageRef,
          updatedData.ShopPhoto,
        );

        uploadTask.on(
          "state_changed",
          () => {},
          (error) => {
            setUploadError("Failed to upload the shop photo.");
            setUploading(false);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Update with new photo URL
            const updateData = {
              ShopName: updatedData.ShopName,
              Tel: updatedData.Tel,
              place: updatedData.place,
              website: updatedData.website,
              ShopPhoto: downloadURL,
              categories: updatedData.categories,
              brands: updatedBrands,
            };

            await axios.put(
              `${window.__API_BASE_URL__}/api/shops/shop/${shopId}`,
              updateData,
            );

            fetchShops();
            setIsEditModalOpen(false);
            setUploading(false);

            Swal.fire({
              title: "Success!",
              text: "Shop updated successfully.",
              icon: "success",
            });
          },
        );
      } else {
        // No new photo, just update other fields
        const updateData = {
          ShopName: updatedData.ShopName,
          Tel: updatedData.Tel,
          place: updatedData.place,
          website: updatedData.website,
          categories: updatedData.categories,
          brands: updatedBrands,
        };

        await axios.put(
          `${window.__API_BASE_URL__}/api/shops/shop/${shopId}`,
          updateData,
        );

        fetchShops();
        setIsEditModalOpen(false);
        setUploading(false);

        Swal.fire({
          title: "Success!",
          text: "Shop updated successfully.",
          icon: "success",
        });
      }
    } catch (error) {
      console.error("Error updating shop:", error);
      setUploading(false);

      Swal.fire({
        title: "Error!",
        text: "Failed to update shop.",
        icon: "error",
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (editStep === 1) {
      setEditStep(2);
    } else if (editStep === 2) {
      setEditStep(3); // Add step for brands
    } else {
      await handleUpdateShop(selectedShop._id, editFormData);
    }
  };

  return (
    <div className="">
      <Navbar />
      <h1 className="pt-5 text-4xl font-bold text-center">Shops</h1>
      <div className="flex justify-end mx-20">
        <button
          onClick={toggleModal}
          className="px-4 py-2 mb-4 text-white rounded bg-amber-500 hover:bg-yellow-400"
        >
          Add New Shop
        </button>
      </div>
      <ShopTable
        shops={shops}
        onDelete={handleDeleteShop}
        onAddItem={openItemModal}
        onEdit={handleEditClick}
      />

      {/* Add Shop Modal */}
      <Modal
        isOpen={isModalOpen}
        step={step}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        toggleModal={toggleModal}
        addCategory={addCategory}
        removeCategory={removeCategory}
        handleCategoryChange={handleCategoryChange}
        addItem={addItem}
        removeItem={removeItem}
        handleItemChange={handleItemChange}
        uploadError={uploadError}
        setStep={setStep}
        addBrand={addBrand}
        removeBrand={removeBrand}
        handleBrandChange={handleBrandChange}
      />

      {/* Edit Shop Modal */}
      <EditShopModal
        isOpen={isEditModalOpen}
        formData={editFormData}
        handleChange={handleEditChange}
        handleCategoryChange={handleEditCategoryChange}
        handleItemChange={handleEditItemChange}
        handleSubmit={handleEditSubmit}
        toggleModal={toggleEditModal}
        uploadError={uploadError}
        addCategory={addEditCategory}
        removeCategory={removeEditCategory}
        addItem={addEditItem}
        removeItem={removeEditItem}
        step={editStep}
        setStep={setEditStep}
        addBrand={addEditBrand}
        removeBrand={removeEditBrand}
        handleBrandChange={handleEditBrandChange}
      />

      {/* Add Item Modal */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onAddItem={handleAddItem}
        selectedShop={selectedShop}
        selectedCategory={selectedCategory}
      />
    </div>
  );
};

export default Shop;
