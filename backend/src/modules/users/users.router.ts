import { Router } from 'express'
import * as handlers from './users.handlers'

export const usersRouter = Router()

usersRouter.get('/', handlers.list)
usersRouter.get('/me', handlers.me)
