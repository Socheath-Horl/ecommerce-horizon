import { Router, type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HealthService } from '@/modules/health/health.service';

export class HealthController {
  constructor(private readonly health_service: HealthService = new HealthService()) {}

  static routes(): Router {
    const controller = new HealthController();
    return Router().get('/', (req, res) => controller.check(req, res));
  }

  check(_req: Request, res: Response): void {
    res.status(StatusCodes.OK).json({ success: true, data: this.health_service.check() });
  }
}