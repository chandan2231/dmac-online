import express from 'express'
import { getQuestionWithFollowUps, getPageContent, getUiTexts, saveQuestionnaireAnswer, getUserQuestionnaireAnswers } from '../controllers/questionar.js'
import { authenticateUserWithBearer } from '../utils/middleware.js'

const router = express.Router()

router.get('/answers', authenticateUserWithBearer, getUserQuestionnaireAnswers);
router.get('/:sequenceNo', getQuestionWithFollowUps);
router.get('/page/:pageKey', getPageContent);
router.get('/ui/texts/', getUiTexts);
router.post('/answer', authenticateUserWithBearer, saveQuestionnaireAnswer);
router.get('/:sequenceNo', authenticateUser, getQuestionWithFollowUps);
router.get('/page/:pageKey', authenticateUser, getPageContent);
router.get('/ui/texts/', authenticateUser, getUiTexts);

export default router
