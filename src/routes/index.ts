import { Router } from 'express'
import GameStatusController from '../controllers/GameStatusController'
const router = Router()

router.get('/status', GameStatusController.GetGameStatus)
router.get('/log', GameStatusController.GetGameLog)

export default router