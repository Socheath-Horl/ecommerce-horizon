import { Router, type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { require_auth } from '@/common/middleware/auth';
import { UsersService } from '@/modules/users/users.service';

export class UsersController {
  constructor(private readonly users_service: UsersService = new UsersService()) {}

  static routes(): Router {
    const controller = new UsersController();
    return Router().get('/me', require_auth, (req, res) => controller.profile(req, res));
  }

  async profile(req: Request, res: Response): Promise<void> {
    const { id, email, name } = req.user!;
    res.status(StatusCodes.OK).json({ success: true, data: await this.users_service.get_profile({ id, email, name }) });
  }
}