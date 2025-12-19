import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { addToWishlist, removeFromWishlist, getWishlist } from '../controllers/wishlistController.js';

const router = express.Router();

router.get('/', authenticate, authorize('student'), getWishlist);
router.post('/', authenticate, authorize('student'), addToWishlist);
router.delete('/:id', authenticate, authorize('student'), removeFromWishlist);

export default router;
