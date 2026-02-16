import React, { useEffect, useState } from "react";
import axios from "axios";
import NewsModal from "../components/News/NewsModel";
import NewsTable from "../components/News/NewsTable";
import EditNewsModal from "../components/News/EditNewsModel";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebaseconfig";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";

const News = () => {
  const [news, setNews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    source: "",
    time: "",
    body: "",
    newsImage: null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [step, setStep] = useState(1);
  const [editingNewsId, setEditingNewsId] = useState(null);

  // Fetch all news from API
  const fetchNews = async () => {
    try {
      const response = await axios.get(`${window.__API_BASE_URL__}/api/news`);
      console.log("News Data:", response);
      setNews(response.data.news || response.data);
    } catch (error) {
      console.error("Error fetching news:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch news.",
        icon: "error",
      });
    }
  };

  // Fetch news by ID for editing
  const fetchNewsById = async (id) => {
    try {
      const response = await axios.get(
        `${window.__API_BASE_URL__}/api/news/${id}`,
      );
      const newsData = response.data.news || response.data;

      // Format time for datetime-local input
      const formattedTime = newsData.time
        ? new Date(newsData.time).toISOString().slice(0, 16)
        : "";

      setFormData({
        ...newsData,
        time: formattedTime,
        newsImage: null, // Reset file input
      });
      setStep(1); // Start from first step for editing
      setEditingNewsId(id);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Error fetching news:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch news details.",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Toggle Add Modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setStep(1);
    setEditingNewsId(null);
    setUploadError("");
    setFormData({
      title: "",
      source: "",
      time: "",
      body: "",
      newsImage: null,
    });
  };

  // Toggle Edit Modal
  const toggleEditModal = () => {
    setIsEditModalOpen(!isEditModalOpen);
    setStep(1);
    setEditingNewsId(null);
    setUploadError("");
    setFormData({
      title: "",
      source: "",
      time: "",
      body: "",
      newsImage: null,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      setStep(2);
    } else {
      setUploading(true);
      setUploadError("");

      try {
        let newsImageURL = formData.newsImage;

        // Upload image to Firebase if a new image is selected
        if (formData.newsImage && typeof formData.newsImage === "object") {
          const storageRef = ref(
            storage,
            `news/${Date.now()}_${formData.newsImage.name}`,
          );
          const uploadTask = uploadBytesResumable(
            storageRef,
            formData.newsImage,
          );

          await new Promise((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                // Progress tracking could be added here
              },
              (error) => {
                setUploadError("Failed to upload the news image.");
                setUploading(false);
                reject(error);
              },
              async () => {
                try {
                  newsImageURL = await getDownloadURL(uploadTask.snapshot.ref);
                  resolve();
                } catch (error) {
                  reject(error);
                }
              },
            );
          });
        }

        const newsData = {
          title: formData.title,
          source: formData.source,
          time: formData.time,
          body: formData.body,
          newsImage: newsImageURL,
        };

        if (editingNewsId) {
          // Update existing news
          await axios.put(
            `${window.__API_BASE_URL__}/api/news/${editingNewsId}`,
            newsData,
          );
          Swal.fire({
            title: "Success!",
            text: "News updated successfully.",
            icon: "success",
            confirmButtonText: "Okay",
          });
          setIsEditModalOpen(false);
        } else {
          // Create new news
          await axios.post(`${window.__API_BASE_URL__}/api/news`, newsData);
          Swal.fire({
            title: "Success!",
            text: "News added successfully.",
            icon: "success",
            confirmButtonText: "Okay",
          });
          setIsModalOpen(false);
        }

        fetchNews();
        setUploading(false);
        setStep(1);
        setEditingNewsId(null);
      } catch (error) {
        console.error("Error saving news:", error);
        setUploading(false);
        Swal.fire({
          title: "Error!",
          text: "Failed to save news.",
          icon: "error",
        });
      }
    }
  };

  // Handle edit form submission from table
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      setStep(2);
    } else {
      setUploading(true);
      setUploadError("");

      try {
        let newsImageURL = formData.newsImage;

        // Upload image to Firebase if a new image is selected
        if (formData.newsImage && typeof formData.newsImage === "object") {
          const storageRef = ref(
            storage,
            `news/${Date.now()}_${formData.newsImage.name}`,
          );
          const uploadTask = uploadBytesResumable(
            storageRef,
            formData.newsImage,
          );

          await new Promise((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              (snapshot) => {},
              (error) => {
                setUploadError("Failed to upload the news image.");
                setUploading(false);
                reject(error);
              },
              async () => {
                try {
                  newsImageURL = await getDownloadURL(uploadTask.snapshot.ref);
                  resolve();
                } catch (error) {
                  reject(error);
                }
              },
            );
          });
        }

        const newsData = {
          title: formData.title,
          source: formData.source,
          time: formData.time,
          body: formData.body,
          newsImage: newsImageURL,
        };

        await axios.put(
          `${window.__API_BASE_URL__}/api/news/${editingNewsId}`,
          newsData,
        );

        fetchNews();
        setIsEditModalOpen(false);
        setUploading(false);
        setStep(1);
        setEditingNewsId(null);

        Swal.fire({
          title: "Success!",
          text: "News updated successfully.",
          icon: "success",
          confirmButtonText: "Okay",
        });
      } catch (error) {
        console.error("Error updating news:", error);
        setUploading(false);
        Swal.fire({
          title: "Error!",
          text: "Failed to update news.",
          icon: "error",
        });
      }
    }
  };

  // Delete news by ID
  const handleDeleteNews = async (id) => {
    // Check if news exists
    if (!news.find((item) => item._id === id)) {
      Swal.fire({
        title: "Error!",
        text: "News not found.",
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
        await axios.delete(`${window.__API_BASE_URL__}/api/news/${id}`);
        setNews(news.filter((item) => item._id !== id));

        Swal.fire({
          title: "Deleted!",
          text: "News has been deleted.",
          icon: "success",
        });
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete the news.",
        icon: "error",
      });
    }
  };

  // Handle update news from table
  const handleUpdateNews = (updatedNews) => {
    axios
      .put(
        `${window.__API_BASE_URL__}/api/news/${updatedNews._id}`,
        updatedNews,
      )
      .then((response) => {
        fetchNews();
        Swal.fire({
          title: "Updated!",
          text: "News has been updated.",
          icon: "success",
        });
      })
      .catch((error) => {
        console.error("Error updating news:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to update the news.",
          icon: "error",
        });
      });
  };

  return (
    <div className="">
      <Navbar />
      <h1 className="pt-10 text-4xl font-bold text-center">News Management</h1>
      <div className="flex justify-end mx-20">
        <button
          onClick={toggleModal}
          className="px-4 py-2 mb-4 text-white rounded bg-amber-500 hover:bg-yellow-400"
        >
          Add New News
        </button>
      </div>

      <NewsTable
        news={news}
        onDelete={handleDeleteNews}
        onUpdate={handleUpdateNews}
        onEdit={fetchNewsById}
      />

      {/* Add News Modal */}
      <NewsModal
        isOpen={isModalOpen}
        step={step}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        toggleModal={toggleModal}
        uploadError={uploadError}
        setStep={setStep}
      />

      {/* Edit News Modal */}
      <EditNewsModal
        isOpen={isEditModalOpen}
        step={step}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleEditSubmit}
        toggleModal={toggleEditModal}
        uploadError={uploadError}
        setStep={setStep}
      />
    </div>
  );
};

export default News;
