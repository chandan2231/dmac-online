import express from 'express'
import {
  googleAuthUrl,
  googleCallbackUrl
} from '../controllers/googleAuth.js'

const router = express.Router()

router.post('/url', googleAuthUrl)
router.post('/callback', googleCallbackUrl)

export default router
