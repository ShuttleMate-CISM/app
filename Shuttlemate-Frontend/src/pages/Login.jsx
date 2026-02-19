import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { googleSignIn, resetPassword } from "./FirebaseAuth";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import images from "../assets/Images/index.js";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { customLogin, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const handleSignUpClick = () => {
    navigate("/register");
  };

  const Back = () => {
    navigate("/splashscreen");
  };

  const handlePasswordReset = async () => {
    try {
      await resetPassword(resetEmail);
      Swal.fire({
        title: "Success!",
        text: "Password reset email sent successfully. Please check your inbox.",
        icon: "success",
        confirmButtonText: "Okay",
      });
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message,
        icon: "error",
        confirmButtonText: "Okay",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${window.__API_BASE_URL__}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const userData = {
          username: data.data.username || data.data.user.username,
          role: data.data.role || data.data.user.role,
          email: data.data.user?.email,
        };

        // Use the customLogin method from AuthContext
        customLogin(userData, data.data.token);

        Swal.fire({
          title: "Success!",
          text: data.message || "You have logged in successfully.",
          icon: "success",
          confirmButtonText: "Okay",
        });

        // Navigate based on role
        const userRole = userData.role;
        switch (userRole) {
          case "admin":
            navigate("/home");
            break;
          case "coach":
            navigate("/Coachers");
            break;
          case "courtowner":
            navigate("/Court");
            break;
          case "shopowner":
            navigate("/shop");
            break;
          default:
            navigate("/home");
        }
      } else {
        Swal.fire({
          title: "Error!",
          text: data.message || "Login failed. Please check your credentials.",
          icon: "error",
          confirmButtonText: "Okay",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Network error. Please try again.",
        icon: "error",
        confirmButtonText: "Okay",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleSignIn();
      Swal.fire({
        title: "Success!",
        text: "You have logged in successfully with Google.",
        icon: "success",
        confirmButtonText: "Okay",
      });
      navigate("/home");
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Google login failed. Please try again.",
        icon: "error",
        confirmButtonText: "Okay",
      });
    }
  };

  return (
    <div
      className="flex items-center justify-center h-screen bg-center bg-cover"
      style={{ backgroundImage: `url(${images.Bg})` }}
    >
      <div className="w-1/3">
        <div className="w-full p-8 bg-white rounded-lg shadow-md">
          <img
            src={images.BackArrow}
            className="w-5 h-5 cursor-pointer"
            onClick={Back}
            alt="Back"
          />
          <h2 className="mb-6 text-3xl font-bold text-center uppercase">
            Login
          </h2>
          <p className="ml-32">
            Don't have an account?
            <button
              className="ml-3 underline cursor-pointer hover:text-red-400"
              onClick={handleSignUpClick}
            >
              Sign Up
            </button>
          </p>

          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center w-full px-4 py-2 mt-6 mb-3 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-full hover:bg-gray-100"
          >
            <img src={images.Google} alt="Google" className="w-6 h-6 mr-2" />
            Login with Google
          </button>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-gray-500">OR</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <p className="text-gray-600">Your Username</p>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <p className="text-gray-600">Your Password</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <p
              className="mb-4 text-right text-blue-600 underline cursor-pointer"
              onClick={() =>
                Swal.fire({
                  title: "Reset Password",
                  input: "email",
                  inputLabel: "Enter your email to reset password",
                  inputValue: resetEmail,
                  inputPlaceholder: "Email",
                  showCancelButton: true,
                  confirmButtonText: "Send",
                  preConfirm: (email) => setResetEmail(email),
                  allowOutsideClick: false,
                }).then((result) => {
                  if (result.isConfirmed) {
                    handlePasswordReset();
                  }
                })
              }
            >
              Forgot Password?
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 text-white transition duration-200 bg-blue-500 rounded-3xl hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
