import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getStickyNotes,
  createStickyNote,
  updateStickyNote,
  deleteStickyNote,
  addAttachment,
  removeAttachment
} from '../controllers/stickyNotes';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/sticky-notes - Get all sticky notes for the authenticated user
router.get('/', getStickyNotes);

// POST /api/sticky-notes - Create a new sticky note
router.post('/', createStickyNote);

// PUT /api/sticky-notes/:id - Update a sticky note
router.put('/:id', updateStickyNote);

// DELETE /api/sticky-notes/:id - Delete a sticky note
router.delete('/:id', deleteStickyNote);

// POST /api/sticky-notes/:id/attachments - Add attachment to a sticky note
router.post('/:id/attachments', addAttachment);

// DELETE /api/sticky-notes/:noteId/attachments/:attachmentId - Remove attachment
router.delete('/:noteId/attachments/:attachmentId', removeAttachment);

export default router;
