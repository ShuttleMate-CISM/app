import Court from '../models/Courts.js';
import { CourtBooking } from '../models/Courts.js';
import mongoose from 'mongoose';
import { getRegisteredTokens } from './notificationController.js';
import admin from '../firebase/firebaseAdmin.js';

// Get all bookings for a court
export const getCourtBookings = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { status, startDate, endDate } = req.query;

    const court = await Court.findById(courtId)
      .populate({
        path: 'bookings.userId',
        select: 'name email phoneNumber profilePhoto ' 
      });

    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }

    let filteredBookings = court.bookings;

    if (status) {
      filteredBookings = filteredBookings.filter(booking => booking.status === status);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); 

      filteredBookings = filteredBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= start && bookingDate <= end;
      });
    } else if (startDate) {
      const start = new Date(startDate);
      filteredBookings = filteredBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= start;
      });
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); 

      filteredBookings = filteredBookings.filter(booking => {
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
      message: 'Error fetching court bookings',
      error: error.message,
    });
  }
};


// Get a specific booking
export const getBooking = async (req, res) => {
  try {
    const { courtId, bookingId } = req.params;

    const court = await Court.findById(courtId)
      .populate({
        path: 'bookings.userId',
        select: 'name email phone profilePhoto'  
      });

    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }

    const booking = court.bookings.find(b => b._id.toString() === bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // --- SECURITY FIX: IDOR Protection ---
    // Check if the requester is the owner OR an admin
    if (req.user && booking.userId) {
      const bookingUserId = booking.userId._id ? booking.userId._id.toString() : booking.userId.toString();
      if (bookingUserId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Security Alert: You are not authorized to view this booking.',
        });
      }
    }
    // --- END SECURITY FIX ---

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message,
    });
  }
};


// Create a new booking
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { courtId } = req.params;
    const { date, startTime, endTime, userId, notes } = req.body;

    if (!date || !startTime || !endTime || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Date, start time, end time, and user ID are required',
      });
    }


  
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    const court = await Court.findById(courtId).session(session);
    if (!court) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Court not found' });
    }

    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay();

    const hasAvailability = court.availability.some(slot => {
      return slot.dayOfWeek === dayOfWeek &&
        slot.startTime <= startTime &&
        slot.endTime >= endTime;
    });

    if (!hasAvailability) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Court is not available at the requested time',
      });
    }

    const conflictingBookings = court.bookings.filter(booking => {
      const existingBookingDate = new Date(booking.date);
      const existingDateStr = existingBookingDate.toISOString().split('T')[0];
      const newDateStr = bookingDate.toISOString().split('T')[0];

      return existingDateStr === newDateStr &&
        booking.status !== 'cancelled' &&
        ((booking.startTime <= startTime && booking.endTime > startTime) ||
          (booking.startTime < endTime && booking.endTime >= endTime) ||
          (booking.startTime >= startTime && booking.endTime <= endTime));
    });

    if (conflictingBookings.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Court already has a booking at the requested time',
        conflictingBookings,
      });
    }

    const newBooking = {
      date: bookingDate,
      startTime,
      endTime,
      userId,
      status: 'pending',
      courtId,
      notes,
    };

    court.bookings.push(newBooking);
    await court.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message,
    });
  }
};



export const updateBookingStatus = async (req, res) => {
  try {
    const { courtId, bookingId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }

    const bookingIndex = court.bookings.findIndex(b => b._id.toString() === bookingId);
    if (bookingIndex === -1) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = court.bookings[bookingIndex];
    const previousStatus = booking.status;

    court.bookings[bookingIndex].status = status;

    if ((status === 'completed' && previousStatus !== 'completed') || status === 'cancelled') {
      const bookingDate = new Date(booking.date);
      const dayOfWeek = bookingDate.getDay();

      const availabilityIndex = court.availability.findIndex(slot =>
        slot.dayOfWeek === dayOfWeek &&
        slot.startTime === booking.startTime &&
        slot.endTime === booking.endTime
      );

      if (availabilityIndex !== -1) {
        court.availability.splice(availabilityIndex, 1);
      } else {
        console.log('No matching availability slot found to remove');
      }
    }

    await court.save();

   
    const tokens = getRegisteredTokens();
    if (tokens && tokens.length > 0) {
      const message = {
        notification: {
          title: 'Booking Status Updated',
          body: `Your booking is now ${status}.`,
        },
        data: {
          screen: 'booking',
          bookingId: booking._id.toString(),
          courtId: court._id.toString(),
          type: 'booking_status_update',
        },
      };

      const notifications = tokens.map(async (token) => {
        try {
          return await admin.messaging().send({
            ...message,
            token,
          });
        } catch (error) {
          console.error(`Failed to send notification to token ${token}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(notifications);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
      const failed = results.length - successful;
      console.log(`Push Notifications: ${successful} sent, ${failed} failed`);
    } else {
      console.log('No registered tokens found for notifications');
    }
  

    res.status(200).json({
      success: true,
      message: status === 'completed'
        ? 'Booking marked as completed and availability slot removed'
        : 'Booking status updated successfully',
      data: court.bookings[bookingIndex],
    });

  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message,
    });
  }
};

  export const updateBooking = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { courtId, bookingId } = req.params;
      const { date, startTime, endTime, notes } = req.body;

      const court = await Court.findById(courtId).session(session);
      if (!court) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: 'court not found' });
      }

      const bookingIndex = court.bookings.findIndex(b => b._id.toString() === bookingId);

      if (bookingIndex === -1) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      const currentBooking = court.bookings[bookingIndex];

      if (currentBooking.status === 'cancelled') {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Cannot update a cancelled booking',
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
          message: 'End time must be after start time',
        });
      }

      if (date || startTime || endTime) {
        const bookingDate = date ? new Date(date) : new Date(currentBooking.date);
        const dayOfWeek = bookingDate.getDay();

        const hasAvailability = court.availability.some(slot => {
          return slot.dayOfWeek === dayOfWeek &&
            slot.startTime <= finalStartTime &&
            slot.endTime >= finalEndTime;
        });

        if (!hasAvailability) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: 'court is not available at the requested time',
          });
        }

        const conflictingBookings = court.bookings.filter(booking => {
          if (booking._id.toString() === bookingId) {
            return false;
          }

          const existingBookingDate = new Date(booking.date);
          const existingDateStr = existingBookingDate.toISOString().split('T')[0];
          const newDateStr = bookingDate.toISOString().split('T')[0];

          return existingDateStr === newDateStr &&
            booking.status !== 'cancelled' &&
            ((booking.startTime <= finalStartTime && booking.endTime > finalStartTime) ||
              (booking.startTime < finalEndTime && booking.endTime >= finalEndTime) ||
              (booking.startTime >= finalStartTime && booking.endTime <= finalEndTime));
        });

        if (conflictingBookings.length > 0) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: 'court already has a booking at the requested time',
            conflictingBookings,
          });
        }
      }

      // Update the booking
      Object.assign(court.bookings[bookingIndex], updatedBooking);
      await court.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: 'Booking updated successfully',
        data: court.bookings[bookingIndex],
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      res.status(500).json({
        success: false,
        message: 'Error updating booking',
        error: error.message,
      });
    }
  };

  // Delete a booking
  export const deleteBooking = async (req, res) => {
    try {
      const { courtId, bookingId } = req.params;

      const court = await Court.findById(courtId);
      if (!court) {
        return res.status(404).json({ success: false, message: 'Court not found' });
      }

      const bookingIndex = court.bookings.findIndex(b => b._id.toString() === bookingId);

      if (bookingIndex === -1) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      court.bookings.splice(bookingIndex, 1);
      await court.save();

      res.status(200).json({
        success: true,
        message: 'Booking deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting booking',
        error: error.message,
      });
    }
  };

  // Get user's bookings with a specific court
  export const getUserBookingsWithCourt = async (req, res) => {
    try {
      const { courtId, userId } = req.params;
      const { status } = req.query;


      // --- SECURITY FIX: IDOR Protection  (vulnerability 04)---
      // Authorization: only allow users to view their own bookings (or admins)
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to view these bookings' });
      }
      // --- END SECURITY FIX ---


      const court = await Court.findById(courtId);
      if (!court) {
        return res.status(404).json({ success: false, message: 'Court not found' });
      }

      let userBookings = court.bookings.filter(booking =>
        booking.userId.toString() === userId
      );


      if (status) {
        userBookings = userBookings.filter(booking => booking.status === status);
      }

      res.status(200).json({
        success: true,
        count: userBookings.length,
        data: userBookings,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user bookings',
        error: error.message,
      });
    }
  };
