import express from 'express';
import { logPWAInstallation, getPWAInstallStats } from '../controllers/analyticsController.js';

const router = express.Router();

// Public endpoint to record PWA installation
router.post('/pwa-install', logPWAInstallation);

// Endpoint for PWA statistics
router.get('/pwa-stats', getPWAInstallStats);

export default router;
