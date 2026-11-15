import { Router } from 'express'
import * as handlers from './auth.handlers'
import { requireUser } from './auth.middleware'

export const authRouter = Router()

authRouter.post('/login', handlers.login)
authRouter.post('/logout', handlers.logout)
authRouter.get('/me', requireUser, handlers.me)
