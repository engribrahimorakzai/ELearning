import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createDiscussion,
  getDiscussions,
  getDiscussion,
  replyToDiscussion,
  deleteDiscussion,
  deleteReply
} from '../controllers/forumController.js';

const router = express.Router();

router.post('/courses/:course_id/discussions', authenticate, createDiscussion);
router.get('/courses/:course_id/discussions', authenticate, getDiscussions);
router.get('/discussions/:id', authenticate, getDiscussion);
router.post('/discussions/:id/replies', authenticate, replyToDiscussion);
router.delete('/discussions/:id', authenticate, deleteDiscussion);
router.delete('/replies/:id', authenticate, deleteReply);

export default router;
