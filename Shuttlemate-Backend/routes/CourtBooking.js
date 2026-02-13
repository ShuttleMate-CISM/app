import express from 'express';

import {
  getCourtBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  updateBooking,
  deleteBooking,
  getUserBookingsWithCourt
} from '../controllers/CourtBookingController.js';

const router = express.Router();

router.get('/:courtId/bookings',getCourtBookings);
router.get('/:courtId/bookings/:bookingId',  getBooking);
router.post('/:courtId/bookings', createBooking);
router.patch('/:courtId/bookings/:bookingId/status',  updateBookingStatus);
router.put('/:courtId/bookings/:bookingId',  updateBooking);
router.delete('/:courtId/bookings/:bookingId', deleteBooking);
router.get('/:courtId/users/:userId/bookings',getUserBookingsWithCourt);

export default router;