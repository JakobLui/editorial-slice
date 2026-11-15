import { Router } from 'express'
import * as handlers from './content.handlers'

export const contentRouter = Router()

// `/board` before `/:id`, or Express would read "board" as an id.
contentRouter.get('/board', handlers.getBoard)
contentRouter.get('/', handlers.list)
contentRouter.post('/', handlers.create)
contentRouter.get('/:id', handlers.get)
contentRouter.patch('/:id', handlers.update)
contentRouter.patch('/:id/status', handlers.changeStatus)
contentRouter.post('/:id/archive', handlers.archive)
contentRouter.post('/:id/restore', handlers.restore)
