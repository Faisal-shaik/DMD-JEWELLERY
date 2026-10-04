import express from 'express';
import { createEnquiry, getEnquiries, updateEnquiryStatus, deleteEnquiry } from '../controllers/enquiryController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createEnquiry);
router.get('/', verifyToken, getEnquiries);
router.put('/:id', verifyToken, updateEnquiryStatus);
router.delete('/:id', verifyToken, deleteEnquiry);

export default router;
