import express from 'express';
import { subscribe, sendNotification } from '../controllers/notification.controller.js';

const router = express.Router();

router.post('/subscribe', subscribe);

router.post('/send', sendNotification);

export default router;
