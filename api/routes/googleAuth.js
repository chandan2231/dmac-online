import express from 'express'
import { 
    googleAuthUrl, 
    googleCallbackUrl,
} from '../controllers/googleAuth.js'

import { authenticateUserGoogle } from '../utils/middleware.js'

const router = express.Router()

router.get('/url', authenticateUserGoogle, googleAuthUrl)
router.get('/auth/callback', googleCallbackUrl)

export default router
