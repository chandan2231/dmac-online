import express from 'express';
import { getConsentSignatures, saveConsentSignatures } from '../controllers/patient.js';

const router = express.Router();

// POST /api/consent/status
router.post('/status', getConsentSignatures);

// POST /api/consent/sign
router.post('/sign', saveConsentSignatures);

export default router;
