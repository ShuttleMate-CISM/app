import express from 'express';

import {
  getCoachBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  updateBooking,
  deleteBooking,
  getUserBookingsWithCoach
} from '../controllers/BookingController.js';

const router = express.Router();

router.get('/:coachId/bookings',getCoachBookings);
router.get('/:coachId/bookings/:bookingId',  getBooking);
router.post('/:coachId/bookings', createBooking);
router.patch('/:coachId/bookings/:bookingId/status',  updateBookingStatus);
router.put('/:coachId/bookings/:bookingId',  updateBooking);
router.delete('/:coachId/bookings/:bookingId', deleteBooking);
router.get('/:coachId/users/:userId/bookings',getUserBookingsWithCoach);

export default router;