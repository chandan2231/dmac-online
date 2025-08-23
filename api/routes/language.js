import express from 'express'
import { getLanguageList, updateLanguage } from '../controllers/language.js'
import { authenticateUser } from '../utils/middleware.js'

const router = express.Router()

router.get('/language-list', getLanguageList)
router.post(
  '/language-update',
  //  authenticateUser,
  updateLanguage
)

export default router
