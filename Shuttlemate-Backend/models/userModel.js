import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "coach", "courtowner", "shopowner"],
    },
    // Account Lockout Tracking (ISO/IEC 27001:2013 - A.9.4)
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const UserModel = mongoose.model("UserModel", userSchema);

export default UserModel;
