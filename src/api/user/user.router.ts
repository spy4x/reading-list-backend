import * as express from 'express';
import { AuthService as Auth } from '../../auth/auth.service';
import { UserController as controller } from './user.controller';

const router = express.Router();

router.get('/me', Auth.isAuthenticated(), controller.me);

export const UserRouter = router;
