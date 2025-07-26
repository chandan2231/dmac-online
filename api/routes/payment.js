import express from 'express'
import {
  getPaymentAmountInfo,
  createPayment,
  capturePayment,
  successPayment,
  canclePayment,
  getTransactionListByType,
  capturePaymentAdditionClinicSite
} from '../controllers/payment.js'
import { authenticateUser } from '../utils/middleware.js'

const router = express.Router()

router.post('/getPaymentAmountInfo',authenticateUser, getPaymentAmountInfo)
router.post('/createPayment',authenticateUser, createPayment)
router.post('/capturePayment',authenticateUser, capturePayment)
router.post(
  '/capturePaymentAdditionClinicSite',authenticateUser,
  capturePaymentAdditionClinicSite
)
router.post('/successPayment',authenticateUser, successPayment)
router.post('/canclePayment',authenticateUser, canclePayment)
router.post('/transaction',authenticateUser, getTransactionListByType)

export default router
