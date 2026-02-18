import Coach from "../models/Coach.js";
import { Booking } from "../models/Coach.js";
import mongoose from "mongoose";
import { getRegisteredTokens } from "./notificationController.js";
import admin from "../firebase/firebaseAdmin.js";

// Get all bookings for a coach
export const getCoachBookings = async (req, res) => {
  try {
    const { coachId } = req.params;
    const { status, startDate, endDate } = req.query;

    const coach = await Coach.findById(coachId).populate({
      path: "bookings.userId",
      select: "name email phoneNumber profilePhoto ",
    });

    if (!coach) {
      return res
        .status(404)
        .json({ success: false, message: "Coach not found" });
    }

    let filteredBookings = coach.bookings;

    if (status) {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.status === status,
      );
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filteredBookings = filteredBookings.filter((booking) => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= start && bookingDate <= end;
      });
    } else if (startDate) {
      const start = new Date(startDate);
      filteredBookings = filteredBookings.filter((booking) => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= start;
      });
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filteredBookings = filteredBookings.filter((booking) => {
        const bookingDate = new Date(booking.date);
        return bookingDate <= end;
      });
    }

    res.status(200).json({
      success: true,
      count: filteredBookings.length,
      data: filteredBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching coach bookings",
      error: error.message,
    });
  }
};

// Get a specific booking
export const getBooking = async (req, res) => {
  try {
    const { coachId, bookingId } = req.params;

    const coach = await Coach.findById(coachId).populate({
      path: "bookings.userId",
      select: "name email phoneNumber profilePhoto ",
    });

    if (!coach) {
      return res
        .status(404)
        .json({ success: false, message: "Coach not found" });
    }

    const booking = coach.bookings.find((b) => b._id.toString() === bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // --- SECURITY FIX: IDOR Protection (vulnerability 02) ---
    // Authorization check: only allow users to view their own bookings (or admins)

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const bookingUserId = booking.userId._id
      ? booking.userId._id.toString()
      : booking.userId.toString();
    if (bookingUserId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    // --- END SECURITY FIX ---

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message,
    });
  }
};

// Create a new booking
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { coachId } = req.params;
    const { date, startTime, endTime, userId, courtId, notes } = req.body;

    if (!date || !startTime || !endTime || !userId) {
      return res.status(400).json({
        success: false,
        message: "Date, start time, end time, and user ID are required",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    const coach = await Coach.findById(coachId).session(session);
    if (!coach) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Coach not found" });
    }

    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay();

    const hasAvailability = coach.availability.some((slot) => {
      return (
        slot.dayOfWeek === dayOfWeek &&
        slot.startTime <= startTime &&
        slot.endTime >= endTime
      );
    });

    if (!hasAvailability) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Coach is not available at the requested time",
      });
    }

    // Check for conflicting bookings
    const conflictingBookings = coach.bookings.filter((booking) => {
      const existingBookingDate = new Date(booking.date);
      const existingDateStr = existingBookingDate.toISOString().split("T")[0];
      const newDateStr = bookingDate.toISOString().split("T")[0];

      return (
        existingDateStr === newDateStr &&
        booking.status !== "cancelled" &&
        ((booking.startTime <= startTime && booking.endTime > startTime) ||
          (booking.startTime < endTime && booking.endTime >= endTime) ||
          (booking.startTime >= startTime && booking.endTime <= endTime))
      );
    });

    if (conflictingBookings.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Coach already has a booking at the requested time",
        conflictingBookings,
      });
    }

    const newBooking = {
      date: bookingDate,
      startTime,
      endTime,
      userId,
      status: "pending",
      courtId,
      notes,
    };

    coach.bookings.push(newBooking);
    await coach.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: newBooking,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
    });
  }
};

// Update a booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { coachId, bookingId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const coach = await Coach.findById(coachId);
    if (!coach) {
      return res
        .status(404)
        .json({ success: false, message: "Coach not found" });
    }

    const bookingIndex = coach.bookings.findIndex(
      (b) => b._id.toString() === bookingId,
    );

    if (bookingIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

      // --- SECURITY FIX: IDOR Protection  (vulnerability 05 - part 1)---
      // Authorization: only allow booking owner or admin to update status
      const bookingOwnerId = coach.bookings[bookingIndex].userId.toString();
      if (bookingOwnerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
      }

      // --- END SECURITY FIX ---

    coach.bookings[bookingIndex].status = status;
    await coach.save();

    const tokens = getRegisteredTokens();
    if (tokens && tokens.length > 0) {
      const booking = coach.bookings[bookingIndex];

      const message = {
        notification: {
          title: "Booking Status Updated",
          body: `Your booking is now ${status}.`,
        },
        data: {
          screen: "booking",
          bookingId: booking._id.toString(),
          coachId: coach._id.toString(),
          type: "booking_status_update",
        },
      };

      const notifications = tokens.map(async (token) => {
        try {
          return await admin.messaging().send({
            ...message,
            token,
          });
        } catch (error) {
          console.error(
            `Failed to send notification to token ${token}:`,
            error,
          );
          return null;
        }
      });

      const results = await Promise.allSettled(notifications);
      const successful = results.filter(
        (r) => r.status === "fulfilled" && r.value,
      ).length;
      const failed = results.length - successful;
      console.log(`Push Notifications: ${successful} sent, ${failed} failed`);
    } else {
      console.log("No registered tokens found for notifications");
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: coach.bookings[bookingIndex],
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating booking status",
      error: error.message,
    });
  }
};

// Update booking details
export const updateBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { coachId, bookingId } = req.params;
    const { date, startTime, endTime, courtId, notes } = req.body;

    const coach = await Coach.findById(coachId).session(session);
    if (!coach) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Coach not found" });
    }

    const bookingIndex = coach.bookings.findIndex(
      (b) => b._id.toString() === bookingId,
    );

    if (bookingIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const currentBooking = coach.bookings[bookingIndex];

    // --- SECURITY FIX: IDOR Protection  (vulnerability 05 - part 2)---
    // Authorization: only allow booking owner or admin to update booking
    if (currentBooking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
    }

    // --- END SECURITY FIX ---

    if (currentBooking.status === "cancelled") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Cannot update a cancelled booking",
      });
    }

    const updatedBooking = { ...currentBooking.toObject() };

    if (date) updatedBooking.date = new Date(date);
    if (startTime) updatedBooking.startTime = startTime;
    if (endTime) updatedBooking.endTime = endTime;
    if (courtId) updatedBooking.courtId = courtId;
    if (notes !== undefined) updatedBooking.notes = notes;

    const finalStartTime = startTime || currentBooking.startTime;
    const finalEndTime = endTime || currentBooking.endTime;

    if (finalStartTime >= finalEndTime) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // If date or time is changed, check availability
    if (date || startTime || endTime) {
      const bookingDate = date ? new Date(date) : new Date(currentBooking.date);
      const dayOfWeek = bookingDate.getDay();

      const hasAvailability = coach.availability.some((slot) => {
        return (
          slot.dayOfWeek === dayOfWeek &&
          slot.startTime <= finalStartTime &&
          slot.endTime >= finalEndTime
        );
      });

      if (!hasAvailability) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Coach is not available at the requested time",
        });
      }

      const conflictingBookings = coach.bookings.filter((booking) => {
        if (booking._id.toString() === bookingId) {
          return false;
        }

        const existingBookingDate = new Date(booking.date);
        const existingDateStr = existingBookingDate.toISOString().split("T")[0];
        const newDateStr = bookingDate.toISOString().split("T")[0];

        return (
          existingDateStr === newDateStr &&
          booking.status !== "cancelled" &&
          ((booking.startTime <= finalStartTime &&
            booking.endTime > finalStartTime) ||
            (booking.startTime < finalEndTime &&
              booking.endTime >= finalEndTime) ||
            (booking.startTime >= finalStartTime &&
              booking.endTime <= finalEndTime))
        );
      });

      if (conflictingBookings.length > 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Coach already has a booking at the requested time",
          conflictingBookings,
        });
      }
    }

    // Update the booking
    Object.assign(coach.bookings[bookingIndex], updatedBooking);
    await coach.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: coach.bookings[bookingIndex],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: "Error updating booking",
      error: error.message,
    });
  }
};

// Delete a booking
export const deleteBooking = async (req, res) => {
  try {
    const { coachId, bookingId } = req.params;

    const coach = await Coach.findById(coachId);
    if (!coach) {
      return res
        .status(404)
        .json({ success: false, message: "Coach not found" });
    }

    const bookingIndex = coach.bookings.findIndex(
      (b) => b._id.toString() === bookingId,
    );

    if (bookingIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // --- SECURITY FIX: IDOR Protection  (vulnerability 05 - part 3)---
    // Authorization: only allow booking owner or admin to delete booking
    const bookingOwnerId = coach.bookings[bookingIndex].userId.toString();
    if (bookingOwnerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this booking' });
    }

    // --- END SECURITY FIX ---

    coach.bookings.splice(bookingIndex, 1);
    await coach.save();

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting booking",
      error: error.message,
    });
  }
};

// Get user's bookings with a specific coach
export const getUserBookingsWithCoach = async (req, res) => {
  try {
    const { coachId, userId } = req.params;
    const { status } = req.query;

    // --- SECURITY FIX: IDOR Protection (Vulnerability 01)---

    // Authorization check: only allow users to view their own bookings (or admins)
    if (userId !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to view these bookings",
        });
    }

    // --- END SECURITY FIX ---

    const coach = await Coach.findById(coachId);
    if (!coach) {
      return res
        .status(404)
        .json({ success: false, message: "Coach not found" });
    }

    let userBookings = coach.bookings.filter(
      (booking) => booking.userId.toString() === userId,
    );

    if (status) {
      userBookings = userBookings.filter(
        (booking) => booking.status === status,
      );
    }

    res.status(200).json({
      success: true,
      count: userBookings.length,
      data: userBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user bookings",
      error: error.message,
    });
  }
};
