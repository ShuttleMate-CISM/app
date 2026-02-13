import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import logAuthEvent from "../utils/authLogger.js";

// Register Controller
export const register = async (req, res) => {
  try {
    const { username, password, role, email } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";

    // Validate password complexity (NIST Guidelines - minimum 8 characters)
    if (!password || password.length < 8) {
      logAuthEvent(username, ipAddress, "FAIL", "REGISTER");
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      logAuthEvent(username, ipAddress, "FAIL", "REGISTER");
      return res.status(400).json({
        success: false,
        message: "Registration failed. Username may already be taken.",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashPassword, role, email });

    await newUser.save();
    logAuthEvent(username, ipAddress, "SUCCESS", "REGISTER");

    res.status(201).json({
      success: true,
      message: `User registered successfully`,
      data: { username, role },
    });
  } catch (error) {
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
    logAuthEvent(
      req.body.username || "unknown",
      ipAddress,
      "ERROR",
      "REGISTER",
    );
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";

    const user = await User.findOne({ username });

    // Security: Use generic error message to prevent user enumeration
    if (!user) {
      logAuthEvent(username, ipAddress, "FAIL", "LOGIN");
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Check if account is locked (Security Policy 3.2.2)
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      logAuthEvent(username, ipAddress, "LOCKOUT", "LOGIN");
      return res.status(401).json({
        success: false,
        message: "Invalid username or password", // Generic message to prevent account enumeration
      });
    }

    // Reset lockout if the lockout period has expired
    if (user.accountLockedUntil && user.accountLockedUntil <= new Date()) {
      user.accountLockedUntil = null;
      user.failedLoginAttempts = 0;
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      // Lock account after 5 failed attempts (Security Policy 3.2.1 & 3.2.2)
      if (user.failedLoginAttempts >= 5) {
        user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();
        logAuthEvent(username, ipAddress, "LOCKOUT", "LOGIN");
        return res.status(401).json({
          success: false,
          message: "Invalid username or password",
        });
      }

      await user.save();
      logAuthEvent(username, ipAddress, "FAIL", "LOGIN");
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    logAuthEvent(username, ipAddress, "SUCCESS", "LOGIN");

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        role: user.role,
        username: user.username,
      },
    });
  } catch (error) {
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
    logAuthEvent(req.body.username || "unknown", ipAddress, "ERROR", "LOGIN");
    res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving users",
      error: error.message,
    });
  }
};

// Delete User Controller
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `User with ID ${id} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};
