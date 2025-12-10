import express from 'express'
import { getGameInstructions } from '../controllers/game.js'

const router = express.Router()

router.get('/instructions', getGameInstructions)

export default router

