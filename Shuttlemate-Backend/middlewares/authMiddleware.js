// authMiddleware.js
// Authentication & Authorization Middleware (ISO/IEC 27001:2013 - A.9 Access Control)
// Implements JWT verification with security best practices

import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }

    try {
      // Verify token signature and expiration (HS256 algorithm)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Security Check: Ensure JWT payload contains required claims
      if (!decoded.id || !decoded.role) {
        return res.status(400).json({
          success: false,
          message: "Invalid token structure",
        });
      }

      // Attach user info to request object
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };

      next();
    } catch (err) {
      // Generic error message to prevent information disclosure
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired",
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing or invalid",
    });
  }
};

// Middleware to check for specific roles (RBAC - Role-Based Access Control)
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Insufficient permissions",
      });
    }
    next();
  };
};

export { verifyToken, checkRole };
