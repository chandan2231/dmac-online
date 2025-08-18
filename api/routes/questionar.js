import express from 'express'
import { getQuestionWithFollowUps, getPageContent, getUiTexts } from '../controllers/questionar.js'
import { authenticateUser } from '../utils/middleware.js'

const router = express.Router()

router.get('/:sequenceNo', getQuestionWithFollowUps);
router.get('/page/:pageKey', getPageContent);
router.get('/ui/texts/', getUiTexts);

export default router
