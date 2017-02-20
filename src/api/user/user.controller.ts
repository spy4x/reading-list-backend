import { Request, Response } from 'express';

export class UserController {

  static me (req: Request, res: Response) {
    res.json(req.user.getPublic());
  }

}
