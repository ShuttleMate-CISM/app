// src/components/Register.js
import { useState } from "react";
import { register, signInWithGoogle } from "./FirebaseAuth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import images from "../assets/Images/index.js";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const Back = () => {
    navigate("/splashscreen");
  };

  const handleloginclick = () => {
    navigate("/login");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${window.__API_BASE_URL__}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        Swal.fire({
          title: "Success!",
          text: data.message || "Account created successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
        // Reset form
        setFormData({
          username: "",
          email: "",
          password: "",
          role: "",
        });
        navigate("/login"); // Navigate to login after successful registration
      } else {
        const errorMessage = data.message || "Registration failed";
        setError(errorMessage);
        Swal.fire({
          title: "Error!",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      setError("Network error. Please try again.");
      Swal.fire({
        title: "Error!",
        text: "Network error. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await signInWithGoogle();
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="flex items-center justify-center h-screen bg-center bg-cover"
      style={{ backgroundImage: `url(${images.Bg})` }}
    >
      <div className="w-full max-w-md p-8 bg-white rounded-md shadow-xl">
        <img
          src={images.BackArrow}
          className="w-5 h-5 cursor-pointer"
          onClick={Back}
        />
        <h2 className="mb-6 text-3xl font-bold text-center uppercase">
          Create an account
        </h2>
        <p className="ml-20">
          Already have an account?
          <button
            className="ml-1 underline cursor-pointer hover:text-red-400"
            onClick={handleloginclick}
          >
            Sign In
          </button>
        </p>

        <button
          onClick={handleGoogleRegister}
          className="flex items-center justify-center w-full px-4 py-2 mt-12 mb-6 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-full hover:bg-gray-100"
        >
          <img src={images.Google} alt="Google" className="w-6 h-6 mr-2" />
          Sign Up with Google
        </button>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-4 text-gray-500">OR</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p>Enter your details to create an account</p>

          {error && (
            <div className="p-3 text-red-700 bg-red-100 border border-red-300 rounded">
              {error}
            </div>
          )}

          <div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Username"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Role</option>
              <option value="coach">Coach</option>
              <option value="courtowner">Court Owner</option>
              <option value="shopowner">Shop Owner</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white transition-colors bg-blue-500 rounded-2xl hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
