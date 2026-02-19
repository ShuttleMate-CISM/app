// src/index.js
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom"; // Import BrowserRouter
import App from "./App.jsx";
import "./index.css";
import "./App.css";

window.__API_BASE_URL__ =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      {" "}
      {/* Wrapping App with Router */}
      <App />
    </Router>
  </StrictMode>,
);
