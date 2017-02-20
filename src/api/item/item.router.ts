import * as express from 'express';
import { AuthService as Auth } from '../../auth/auth.service';
import { ItemController as controller } from './item.controller';

const router = express.Router();

router
  .get('/', Auth.isAuthenticated(), controller.getList)
  .post('/', Auth.isAuthenticated(), controller.create)
  .put('/:id', Auth.isAuthenticated(), controller.update)
  .delete('/:id', Auth.isAuthenticated(), controller.remove);

export const ItemRouter = router;
