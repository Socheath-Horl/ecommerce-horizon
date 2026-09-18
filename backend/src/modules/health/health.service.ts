export class HealthService {
  check(): { status: string } {
    return { status: 'ok' };
  }
}