import express from 'express'
import { 
    googleAuthUrl, 
    googleCallbackUrl,
} from '../controllers/googleAuth.js'

import { authenticateUserGoogle } from '../utils/middleware.js'

const router = express.Router()

console.log('Setting up Google Auth routes', authenticateUserGoogle)

router.get('/url', authenticateUserGoogle, googleAuthUrl)
router.get('/auth/callback', authenticateUserGoogle, googleCallbackUrl)

export default router
