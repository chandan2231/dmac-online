import express from 'express'
import {
  login,
  register,
  logout,
  forgetPasswordVerifyEmail,
  resetPassword,
  emailVerification
} from '../controllers/auth.js'
const router = express.Router()
router.post('/login', login)
router.post('/register', register)
router.post('/logout', logout)
router.post('/verify/username', forgetPasswordVerifyEmail)
router.post('/password/reset/', resetPassword)
router.post('/email/verify/', emailVerification)

export default router
