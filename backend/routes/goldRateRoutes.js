import express from 'express';
import { getGoldRates, updateGoldRates, syncLiveGoldRates } from '../controllers/goldRateController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getGoldRates);
router.post('/sync', verifyToken, syncLiveGoldRates);
router.put('/', verifyToken, updateGoldRates);

export default router;
