import express from 'express'
import { getQuestionWithFollowUps, getPageContent, getUiTexts } from '../controllers/questionar.js'
import { authenticateUser } from '../utils/middleware.js'

const router = express.Router()

router.get('/:sequenceNo', authenticateUser, getQuestionWithFollowUps);
router.get('/page/:pageKey', authenticateUser, getPageContent);
router.get('/ui/texts/', authenticateUser, getUiTexts);

export default router
