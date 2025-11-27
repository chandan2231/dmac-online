import express from 'express'
import {
  googleAuthUrl,
  googleCallbackUrl
} from '../controllers/googleAuth.js'

const router = express.Router()

router.get('/url', googleAuthUrl)
router.get('/auth/callback', googleCallbackUrl)

export default router
