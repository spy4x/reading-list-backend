import * as express from 'express';
import { AuthService as Auth } from '../../auth/auth.service';
import { TagController as controller } from './tag.controller';

const router = express.Router();

router
  .get('/', Auth.isAuthenticated(), controller.getList)
  .post('/', Auth.isAuthenticated(), controller.create)
  .put('/:id', Auth.isAuthenticated(), controller.update)
  .delete('/:id', Auth.isAuthenticated(), controller.remove);

export const TagRouter = router;
