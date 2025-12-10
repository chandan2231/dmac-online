import express from 'express'
import {
  createCountryAdmin,
  getCountryAdmins,
  updateCountryAdmin,
  changeCountryAdminStatus,
  changeCountryAdminPassword
} from '../controllers/countryAdmin.js'

import { authenticateUser } from '../utils/middleware.js'

const router = express.Router()

router.post('/create', authenticateUser, createCountryAdmin)
router.post('/list', authenticateUser, getCountryAdmins)
router.post('/update', authenticateUser, updateCountryAdmin)
router.post('/status/change', authenticateUser, changeCountryAdminStatus)
router.post('/reset/password', authenticateUser, changeCountryAdminPassword)

export default router
