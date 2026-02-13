import express from 'express';
import {
  getCourtAvailability,
  addAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  checkAvailability
} from '../controllers/CourtAvailabilityController.js';

const router = express.Router();

router.get('/:courtId/availability', getCourtAvailability);
router.post('/:courtId/availability', addAvailabilitySlot);
router.put('/:courtId/availability/:slotId', updateAvailabilitySlot);
router.delete('/:courtId/availability/:slotId', deleteAvailabilitySlot);
router.post('/:courtId/check-availability', checkAvailability);

export default router;