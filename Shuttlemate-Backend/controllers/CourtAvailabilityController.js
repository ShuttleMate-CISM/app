import Court from '../models/Courts.js';
import {CourtAvailabilitySlot} from '../models/Courts.js';

export const getCourtAvailability = async (req, res) => {
  try {
    const { courtId } = req.params;
    
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }
    
    res.status(200).json({
      success: true,
      data: court.availability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching court availability',
      error: error.message,
    });
  }
};

export const addAvailabilitySlot = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { dayOfWeek, startTime, endTime, isRecurring } = req.body;
    
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({
        success: false,
        message: 'Day of week must be between 0 and 6',
      });
    }  
    // Check if end time is after start time
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }
    
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }
    
    const newAvailabilitySlot = {
      dayOfWeek,
      startTime,
      endTime,
      isRecurring: isRecurring !== undefined ? isRecurring : true,
    };
    
    court.availability.push(newAvailabilitySlot);
    await court.save();
    
    res.status(201).json({
      success: true,
      message: 'Availability slot added successfully',
      data: newAvailabilitySlot,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding availability slot',
      error: error.message,
    });
  }
};

// Update an availability slot
export const updateAvailabilitySlot = async (req, res) => {
  try {
    const { courtId, slotId } = req.params;
    const { dayOfWeek, startTime, endTime, isRecurring } = req.body;
    
    if (dayOfWeek !== undefined && (dayOfWeek < 0 || dayOfWeek > 6)) {
      return res.status(400).json({
        success: false,
        message: 'Day of week must be between 0 and 6',
      });
    }
    

    
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }
    
    const slotIndex = court.availability.findIndex(slot => slot._id.toString() === slotId);
    
    if (slotIndex === -1) {
      return res.status(404).json({ success: false, message: 'Availability slot not found' });
    }
    
    if (dayOfWeek !== undefined) court.availability[slotIndex].dayOfWeek = dayOfWeek;
    if (startTime !== undefined) court.availability[slotIndex].startTime = startTime;
    if (endTime !== undefined) court.availability[slotIndex].endTime = endTime;
    if (isRecurring !== undefined) court.availability[slotIndex].isRecurring = isRecurring;
    
    if (court.availability[slotIndex].startTime >= court.availability[slotIndex].endTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }
    
    await court.save();
    
    res.status(200).json({
      success: true,
      message: 'Availability slot updated successfully',
      data: court.availability[slotIndex],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating availability slot',
      error: error.message,
    });
  }
};



// Delete an availability slot
export const deleteAvailabilitySlot = async (req, res) => {
  try {
    const { courtId, slotId } = req.params;
    
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }
    
    const slotIndex = court.availability.findIndex(slot => slot._id.toString() === slotId);
    
    if (slotIndex === -1) {
      return res.status(404).json({ success: false, message: 'Availability slot not found' });
    }
    
    court.availability.splice(slotIndex, 1);
    await court.save();
    
    res.status(200).json({
      success: true,
      message: 'Availability slot deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting availability slot',
      error: error.message,
    });
  }
};


export const checkAvailability = async (req, res) => {
  try {
    const { courtId } = req.params;
    const { date, startTime, endTime } = req.body;
    
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Date, start time and end time are required',
      });
    }
    
    
    
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }
    
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }
    
    
    const requestDate = new Date(date);
    const dayOfWeek = requestDate.getDay(); 
    
  
    const hasAvailability = court.availability.some(slot => {
      return slot.dayOfWeek === dayOfWeek && slot.startTime <= startTime && slot.endTime >= endTime;
    });
    
    const conflictingBookings = court.bookings.filter(booking => {
    
      const bookingDate = new Date(booking.date);
      const bookingDateStr = bookingDate.toISOString().split('T')[0];
      const requestDateStr = requestDate.toISOString().split('T')[0];
      
      return bookingDateStr === requestDateStr && 
        booking.status !== 'cancelled' &&
        ((booking.startTime <= startTime && booking.endTime > startTime) || 
         (booking.startTime < endTime && booking.endTime >= endTime) ||
         (booking.startTime >= startTime && booking.endTime <= endTime));
    });
    
    const isAvailable = hasAvailability && conflictingBookings.length === 0;
    
    res.status(200).json({
      success: true,
      isAvailable,
      conflictingBookings: isAvailable ? [] : conflictingBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking availability',
      error: error.message,
    });
  }
};