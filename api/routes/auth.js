import express from 'express'
import {
  login,
  register,
  logout,
  forgetPasswordVerifyEmail,
  resetPassword,
  emailVerification,
  patinetRegistration,
  patientEmailVerification,
  createPatientPayment,
  capturePatientPayment,
  successPatientPayment,
  canclePatientPayment,
  patientLogin,
  getPatientProductByUserId
} from '../controllers/auth.js'
const router = express.Router()
router.post('/login', login)
router.post('/register', register)
router.post('/logout', logout)
router.post('/verify/username', forgetPasswordVerifyEmail)
router.post('/password/reset/', resetPassword)
router.post('/email/verify/', emailVerification)

// Customers registration and login journey
router.post('/patient/registration', patinetRegistration)
router.post('/patient/email/verify/', patientEmailVerification)
router.post('/patient/login', patientLogin)
router.post('/patient/createPayment', createPatientPayment)
router.post('/patient/capturePayment', capturePatientPayment)
router.post('/patient/successPayment', successPatientPayment)
router.post('/patient/cancelPayment', canclePatientPayment)
router.post('/patient/getProductByUserId', getPatientProductByUserId)

export default router
