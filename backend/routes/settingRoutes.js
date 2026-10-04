import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', verifyToken, upload.single('logo'), updateSettings);

export default router;
