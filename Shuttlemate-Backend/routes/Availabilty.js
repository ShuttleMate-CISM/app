import express from 'express';
import {
  getCoachAvailability,
  addAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  checkAvailability
} from '../controllers/AvailbilityController.js';

const router = express.Router();

router.get('/:coachId/availability', getCoachAvailability);
router.post('/:coachId/availability', addAvailabilitySlot);
router.put('/:coachId/availability/:slotId', updateAvailabilitySlot);
router.delete('/:coachId/availability/:slotId', deleteAvailabilitySlot);
router.post('/:coachId/check-availability', checkAvailability);

export default router;