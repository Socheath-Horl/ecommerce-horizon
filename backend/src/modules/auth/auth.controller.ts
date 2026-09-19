import { Router, type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { require_auth } from '@/common/middleware/auth';
import { AuthService } from '@/modules/auth/auth.service';

export class AuthController {
  constructor(private readonly auth_service: AuthService = new AuthService()) {}

  static routes(): Router {
    const controller = new AuthController();
    return Router()
      .get('/config', (req, res) => void controller.config(req, res))
      .post('/logout', require_auth, (req, res) => void controller.logout(req, res));
  }

  async config(_req: Request, res: Response): Promise<void> {
    res.status(StatusCodes.OK).json({ success: true, data: await this.auth_service.get_config() });
  }

  async logout(_req: Request, res: Response): Promise<void> {
    this.auth_service.logout();
    res.status(StatusCodes.OK).json({ success: true, message: 'Logged out successfully' });
  }
}