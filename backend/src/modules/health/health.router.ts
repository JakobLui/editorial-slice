import { Router } from 'express'
import * as handlers from './health.handlers'

export const healthRouter = Router()

healthRouter.get('/', handlers.getHealth)
