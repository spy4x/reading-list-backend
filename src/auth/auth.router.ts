import * as express from 'express';
import { AuthGoogleStrategy } from './google/google.passport';

const googleStrategy = new AuthGoogleStrategy();

const router = express.Router();

router.use('/google', googleStrategy.router);

export const AuthRouter = router;
